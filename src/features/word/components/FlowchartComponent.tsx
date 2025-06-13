import React, { useEffect, useRef, useState } from 'react';
import { IconArrowsMaximize, IconArrowsMinimize } from '@tabler/icons-react';
import { Graph, Shape } from '@antv/x6';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { History } from '@antv/x6-plugin-history';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Stencil } from '@antv/x6-plugin-stencil';
import { Transform } from '@antv/x6-plugin-transform';
import { Menu, ContextMenu } from '@antv/x6-react-components';
import '@antv/x6-react-components/es/context-menu/style/index.css';
import '@antv/x6-react-components/es/dropdown/style/index.css';
import '@antv/x6-react-components/es/menu/style/index.css';
import { createPortal } from 'react-dom';
import { addDefaultShapes } from './DefaultShapes';
import { FlowchartContainer } from './FlowchartContainer';
import { LabelEditModal } from './LabelEditModal';
import { registerCustomNodes } from './NodeRegistry';
import { setupPortVisibility } from './PortVisibility';
import { CustomContextMenu } from './customContextMenu';


interface FlowchartComponentProps {
  node: any
  editor: any
  getPos: () => number
}

export const FlowchartComponent: React.FC<FlowchartComponentProps> = ({
  node,
  editor,
  getPos,
}) => {
  const stencilContainerRef = useRef<HTMLDivElement>(null)
  const graphContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)
  const stencilRef = useRef<Stencil | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const isFirstRender = useRef(true)

  const [showStencil, setShowStencil] = useState(
    node.attrs.showStencil !== false
  )
  const [stencilWidth, setStencilWidth] = useState(
    node.attrs.stencilWidth || '180px'
  )

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [stencilLoaded, setStencilLoaded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false)
  const [currentEditingNode, setCurrentEditingNode] = useState<any>(null)
  const [currentLabel, setCurrentLabel] = useState('')
  const [currentNode, setCurrentNode] = useState<any>(null)
  const [currentPort, setCurrentPort] = useState<any>(null)

  const handleUndo = () => {
    if (graphRef.current) {
      graphRef.current.undo()
    }
  }

  const handleRedo = () => {
    if (graphRef.current) {
      graphRef.current.redo()
    }
  }

  useEffect(() => {
    if (!graphContainerRef.current) return

    // 确保在添加新的 stencil 前清空容器
    if (stencilContainerRef.current) {
      stencilContainerRef.current.innerHTML = ''
    }

    const graph = new Graph({
      container: graphContainerRef.current,
      async: true,
      width: graphContainerRef.current.clientWidth,
      height: graphContainerRef.current.clientHeight,
      grid: true,
      background: {
        color: '#f5f5f5',
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
      autoResize: true,
      panning: {
        enabled: true,
        modifiers: 'ctrl',
      },
      connecting: {
        allowLoop: false,
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#A2B1C3',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          })
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#5F95FF',
              stroke: '#5F95FF',
            },
          },
        },
      },
    })

    // Use plugins
    graph
      .use(
        new Transform({
          resizing: true,
          rotating: true,
        })
      )
      .use(
        new Selection({
          rubberband: true,
          showNodeSelectionBox: true,
        })
      )
      .use(new Snapline())
      .use(new Clipboard())
      .use(new History())
      .use(
        new Keyboard({
          enabled: true,
          global: true,
        })
      )

    // 绑定键盘快捷键
    graph.bindKey('ctrl+c', () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.copy(cells)
      }
      return false
    })
    graph.bindKey('ctrl+v', () => {
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 32 })
        graph.cleanSelection()
        graph.select(cells)
      }
      return false
    })
    graph.bindKey('ctrl+x', () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.cut(cells)
      }
      return false
    })
    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.removeCells(cells)
      }
      return false
    })
    graph.bindKey('ctrl+z', () => {
      handleUndo()
      return false
    })
    graph.bindKey('ctrl+shift+z', () => {
      handleRedo()
      return false
    })

    // 监听历史状态变化
    graph.on('history:change', () => {
      setCanUndo(graph.canUndo())
      setCanRedo(graph.canRedo())
    })

    // Initialize stencil
    if (stencilContainerRef.current) {
      // 如果之前有 stencil，先销毁它
      if (stencilRef.current) {
        stencilRef.current.dispose()
      }

      const stencil = new Stencil({
        target: graph,
        title: '流程图',
        stencilGraphWidth: 200,
        stencilGraphHeight: 180,
        collapsable: true,
        groups: [
          {
            title: '基础流程图',
            name: 'group1',
          },
          {
            title: '系统设计图',
            name: 'group2',
            graphHeight: 250,
            layoutOptions: {
              rowHeight: 70,
            },
          },
        ],
        layoutOptions: {
          columns: 2,
          columnWidth: 80,
          rowHeight: 55,
        },
      })

      // 监听 stencil 加载完成事件
      stencil.on('ready', () => {
        setStencilLoaded(true)
      })

      stencilContainerRef.current.appendChild(stencil.container)
      stencilRef.current = stencil

      // 注册节点和添加形状
      registerCustomNodes(graph)
      addDefaultShapes(graph, stencil)
    }

    // Load saved data if exists
    if (node.attrs.data) {
      graph.fromJSON(node.attrs.data)
    }

    // Setup port visibility
    setupPortVisibility(graph)

    // Save data on changes
    const saveData = () => {
      const data = graph.toJSON()
      editor.commands.command(({ tr }: any) => {
        const pos = getPos()
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          data,
        })
        return true
      })
    }

    graph.on('cell:changed', saveData)
    graph.on('cell:added', saveData)
    graph.on('cell:removed', saveData)

    graph.on('node:port:contextmenu', ({ e, node, port }) => {
      const { clientX, clientY } = e

      setCurrentNode(node)
      setMenuPosition({ x: clientX, y: clientY })
      setIsContextMenuVisible(true)

      const hideMenu = () => {
        setIsContextMenuVisible(false)
        document.removeEventListener('click', hideMenu)
      }

      document.addEventListener('click', hideMenu)
    })

    // 鼠标悬停显示节点虚影
    graph.on('node:port:mouseenter', ({ node, port }) => {
      const nodeData = node.getData()
      const portPosition = node.getPorts().find((p) => p.id === port)?.group
      // 根据端口位置决定虚影节点方向
      let x = node.position().x
      let y = node.position().y

      if (portPosition === 'left') {
        x -= 150
      } else if (portPosition === 'right') {
        x += 150
      } else if (portPosition === 'top') {
        y -= 150
      } else if (portPosition === 'bottom') {
        y += 150
      } else {
        // 默认右侧
        x += 150
      }

      const ghostNode = graph.addNode({
        shape: currentNode?.shape || node.shape,
        x,
        y,
        width: node.size().width,
        height: node.size().height,
        attrs: {
          body: {
            rx: node.attrs?.body.rx || 0,
            ry: node.attrs?.body.ry || 0,
            refPoints: node.attrs?.body.refPoints || '',
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: 'rgba(95, 149, 255, 0.2)',
            strokeDasharray: '5,5',
          },
          label: {
            text: '新节点',
            fill: '#5F95FF',
          },
        },
        data: nodeData,
      })
      node.setData({ ghostNodeId: ghostNode.id })
    })

    // 鼠标离开移除虚影
    graph.on('node:port:mouseleave', ({ node }) => {
      const ghostNodeId = node.getData().ghostNodeId
      if (ghostNodeId) {
        graph.removeNode(ghostNodeId)
        node.setData({ ghostNodeId: null })
      }
    })

    // 点击端口创建相同图形
    graph.on('node:port:click', ({ node, port }) => {
      const nodeData = node.getData()
      const portPosition = node.getPorts().find((p) => p.id === port)?.group

      // 创建新节点
      // 根据端口位置决定新节点方向
      let x = node.position().x
      let y = node.position().y

      if (portPosition === 'left') {
        x -= 150
      } else if (portPosition === 'right') {
        x += 150
      } else if (portPosition === 'top') {
        y -= 150
      } else if (portPosition === 'bottom') {
        y += 150
      } else {
        // 默认右侧
        x += 150
      }

      const newNode = graph.addNode({
        shape: currentNode?.shape || node.shape,
        x,
        y,
        width: node.size().width,
        height: node.size().height,
        attrs: {
          body: {
            rx: node.attrs?.body.rx || 0,
            ry: node.attrs?.body.ry || 0,
            refPoints: node.attrs?.body.refPoints || '',
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#EFF4FF',
          },
        },
        data: nodeData,
      })
      const newPortPosition =
        portPosition === 'left'
          ? 'right'
          : portPosition === 'right'
            ? 'left'
            : portPosition === 'top'
              ? 'bottom'
              : 'top'
      const newPort = newNode
        .getPorts()
        .find((p) => p.group === newPortPosition)?.id
      // 自动连接新节点
      graph.addEdge({
        source: { cell: node.id, port },
        target: {
          cell: newNode.id,
          port: newPort,
        },
        attrs: {
          line: {
            stroke: '#A2B1C3',
            strokeWidth: 2,
          },
        },
      })
    })

    graph.on('node:dblclick', ({ node }: any) => {
      setCurrentEditingNode(node)
      setCurrentLabel(node.label || node.attrs.text.text)
      setIsLabelModalOpen(true)
    })

    graphRef.current = graph

    // Setup resize observer
    resizeObserverRef.current = new ResizeObserver(() => {
      if (graphContainerRef.current) {
        graph.resize(
          graphContainerRef.current.clientWidth,
          graphContainerRef.current.clientHeight
        )
      }
    })
    resizeObserverRef.current.observe(graphContainerRef.current)

    // 标记首次渲染已完成
    isFirstRender.current = false

    return () => {
      // 清理资源
      // if (graphRef.current) {
      //   graphRef.current.dispose()
      //   graphRef.current = null
      // }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }

      if (stencilRef.current && stencilContainerRef.current) {
        stencilRef.current.dispose()
        stencilRef.current = null
        stencilContainerRef.current.innerHTML = ''
      }

      // if (graphContainerRef.current && graphRef.current) {
      //   graphContainerRef.current.remove()
      //   graphContainerRef.current.innerHTML = ''
      // }

      setStencilLoaded(false)
    }
  }, [showPreview])

  useEffect(() => {
    if (!graphContainerRef.current || !stencilContainerRef.current) return

    const graphWidth = showStencil ? `calc(100% - ${stencilWidth})` : '100%'

    graphContainerRef.current.style.width = graphWidth
    stencilContainerRef.current.style.width = showStencil ? stencilWidth : '0px'
  }, [showStencil, stencilWidth])

  const toggleStencil = () => {
    setShowStencil(!showStencil)
  }

  const handlePreviewClick = () => {
    setShowPreview(true)
  }

  return (
    <div
      className='flowchart-container'
      style={{
        width: `600px`,
        height: '500px',
        border: '1px dashed #dfe3e8',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        margin: '2rem auto',
        alignItems: 'center',
      }}
      onClick={handlePreviewClick}
    >
      {graphRef.current && !showPreview ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: 'scale(0.5)',
            transformOrigin: 'top left',
          }}
          ref={(el) => {
            if (el && graphRef.current && !el.hasChildNodes()) {
              // 创建预览用的图形容器
              const previewContainer = document.createElement('div')
              previewContainer.style.width = '100%'
              previewContainer.style.height = '100%'

              // 计算自适应缩放比例
              const graphBounds = graphRef.current.getContentBBox()
              const containerRatio = el.clientWidth / el.clientHeight
              const graphRatio = graphBounds.width / graphBounds.height
              const scale =
                containerRatio > graphRatio
                  ? (el.clientHeight / graphBounds.height) * 0.9
                  : (el.clientWidth / graphBounds.width) * 0.9

              previewContainer.style.transform = `scale(${scale})`
              previewContainer.style.transformOrigin = 'top left'
              el.appendChild(previewContainer)

              // 复制图形数据并渲染到预览容器
              const previewGraph = new Graph({
                container: previewContainer,
                width: graphRef.current.options.width,
                height: graphRef.current.options.height,
              })

              // 复制所有单元格
              const cells = graphRef.current.getCells()
              previewGraph.fromJSON(cells.map((cell) => cell.toJSON()))
            }
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          点击编辑流程图
        </div>
      )}
      {showPreview &&
        createPortal(
          <div className='bg-opacity-50 fixed inset-0 z-100000000 flex items-center justify-center'>
            <div className='h-[100vh] w-[100vw] bg-white p-4'>
              <div className='mb-2 flex gap-2'>
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title='撤销 (Ctrl+Z)'
                  className='rounded bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  撤销
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title='重做 (Ctrl+Shift+Z)'
                  className='rounded bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  重做
                </button>
              </div>
              <FlowchartContainer
                width='100%'
                height='calc(100% - 40px)'
                showStencil={showStencil}
                stencilWidth={stencilWidth}
                toggleStencil={toggleStencil}
                containerRef={containerRef as React.RefObject<HTMLDivElement>}
                stencilContainerRef={
                  stencilContainerRef as React.RefObject<HTMLDivElement>
                }
                graphContainerRef={
                  graphContainerRef as React.RefObject<HTMLDivElement>
                }
              />
              {isContextMenuVisible && (
                <div
                  className='absolute z-50 bg-white shadow-md'
                  style={{
                    left: `${menuPosition.x}px`,
                    top: `${menuPosition.y}px`,
                  }}
                >
                  <CustomContextMenu currentNode={currentNode} />
                </div>
              )}
              {isLabelModalOpen && (
                <LabelEditModal
                  initialValue={currentLabel}
                  onSave={(newValue) => {
                    if (currentEditingNode) {
                      currentEditingNode.attr('text/text', newValue)

                      // saveData() // Make sure to define this function if it's not already
                    }
                    setIsLabelModalOpen(false)
                  }}
                  onCancel={() => setIsLabelModalOpen(false)}
                />
              )}
              <button
                className='absolute top-4 right-4 z-100 text-gray-500 hover:text-gray-700'
                onClick={(e) => {
                  setShowPreview(false), e.stopPropagation()
                }}
              >
                关闭
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}