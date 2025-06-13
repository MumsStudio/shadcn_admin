import React, { useEffect, useRef, useState } from 'react'
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBackground,
  IconTypography,
} from '@tabler/icons-react'
import { Graph, Shape } from '@antv/x6'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { History } from '@antv/x6-plugin-history'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Stencil } from '@antv/x6-plugin-stencil'
import { Transform } from '@antv/x6-plugin-transform'
import '@antv/x6-react-components/es/context-menu/style/index.css'
import '@antv/x6-react-components/es/dropdown/style/index.css'
import '@antv/x6-react-components/es/menu/style/index.css'
import { ChromePicker } from 'react-color'
import { createPortal } from 'react-dom'
import { setupCellHandlers } from '../listener/CellHandlers'
// 导入封装的事件处理函数
import { setupHistoryHandlers } from '../listener/HistoryHandlers'
import { setupKeyboardShortcuts } from '../listener/KeyboardShortcuts'
import { setupPortHandlers } from '../listener/PortHandlers'
import { setupPortVisibility } from '../listener/PortVisibility'
import { setupSelectionHandlers } from '../listener/SelectionHandlers'
import { addDefaultShapes } from './DefaultShapes'
import { FlowchartContainer } from './FlowchartContainer'
import { LabelEditModal } from './LabelEditModal'
import { registerCustomNodes } from './NodeRegistry'
import { CustomContextMenu } from './customContextMenu'

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
  const [currentShape, setCurrentShape] = useState<any>('')
  const [currentAttr, setCurrentAttr] = useState<any>({})

  const [showColorPicker, setShowColorPicker] = useState(false)
  const [currentColor, setCurrentColor] = useState('#EFF4FF')
  const [selectedNodes, setSelectedNodes] = useState<any[]>([])
  // 在组件状态中添加字体颜色相关状态
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [currentTextColor, setCurrentTextColor] = useState('#000000')

  // 添加字体颜色处理函数
  const handleTextColorChange = (color: any) => {
    setCurrentTextColor(color.hex)
    selectedNodes.forEach((node) => {
      node.attr('text/fill', color.hex)
      // 如果节点有标签属性也更新
      if (node.attr('label')) {
        node.attr('label/fill', color.hex)
      }
    })
  }

  const toggleTextColorPicker = () => {
    setShowTextColorPicker(!showTextColorPicker)
  }

  // 添加颜色处理函数
  const handleColorChange = (color: any) => {
    setCurrentColor(color.hex)
    selectedNodes.forEach((node) => {
      node.attr('body/fill', color.hex)
    })
  }

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker)
  }

  // 点击外部关闭逻辑
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        (showColorPicker || showTextColorPicker) &&
        !event.target?.closest('.color-picker-container') &&
        !event.target?.closest('.color-picker-button') &&
        !event.target?.closest('.text-color-picker-container') &&
        !event.target?.closest('.text-color-picker-button')
      ) {
        setShowColorPicker(false)
        setShowTextColorPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker, showTextColorPicker])

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

  const currentShapeRef = useRef('')
  const currentAttrRef = useRef({} as any)

  const handleShapeChange = (shape: string, attr: any) => {
    setCurrentShape(shape)
    setCurrentAttr(attr)
    currentAttrRef.current = attr
    currentShapeRef.current = shape
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
    setupKeyboardShortcuts(graph)

    // 初始化历史处理
    setupHistoryHandlers(graph, setCanUndo, setCanRedo, handleUndo, handleRedo)

    // 初始化选择处理
    setupSelectionHandlers(
      graph,
      setSelectedNodes,
      setCurrentColor,
      setCurrentTextColor
    )

    // 初始化端口处理
    setupPortHandlers(
      graph,
      setMenuPosition,
      setIsContextMenuVisible,
      currentShapeRef,
      currentAttrRef
    )

    // 初始化单元格处理
    setupCellHandlers(
      graph,
      editor,
      getPos,
      node,
      setCurrentEditingNode,
      setCurrentLabel,
      setIsLabelModalOpen
    )

    // 初始化端口可见性
    setupPortVisibility(graph)

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
            // graphHeight: 250,
          },
          {
            title: '特殊图形',
            name: 'group3',
            graphHeight: 200,
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
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }

      if (stencilRef.current && stencilContainerRef.current) {
        stencilRef.current.dispose()
        stencilRef.current = null
        stencilContainerRef.current.innerHTML = ''
      }

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
                  <IconArrowBackUp />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title='重做 (Ctrl+Shift+Z)'
                  className='rounded bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <IconArrowForwardUp />
                </button>
                <div className='relative'>
                  <button
                    onClick={toggleColorPicker}
                    className='rounded bg-gray-100 px-3 py-1 hover:bg-gray-200'
                    title='修改背景色'
                  >
                    <div className='flex items-center'>
                      <span>
                        <IconBackground />
                      </span>
                      <div
                        className='ml-2 h-4 w-4 rounded border border-gray-300'
                        style={{ backgroundColor: currentColor }}
                      />
                    </div>
                  </button>

                  {/* 颜色选择器面板 */}
                  {showColorPicker && (
                    <div className='absolute z-50 mt-1'>
                      <div className='relative'>
                        <ChromePicker
                          color={currentColor}
                          onChange={handleColorChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {/* 字体颜色选择器 */}
                <div className='relative'>
                  <button
                    onClick={toggleTextColorPicker}
                    className='text-color-picker-button rounded bg-gray-100 px-3 py-1 hover:bg-gray-200'
                    title='修改字体颜色'
                  >
                    <div className='flex items-center'>
                      <IconTypography />
                      <div
                        className='ml-2 h-4 w-4 rounded border border-gray-300'
                        style={{ backgroundColor: currentTextColor }}
                      />
                    </div>
                  </button>

                  {showTextColorPicker && (
                    <div className='text-color-picker-container absolute z-50 mt-1'>
                      <div className='relative'>
                        <ChromePicker
                          color={currentTextColor}
                          onChange={handleTextColorChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
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
                  <CustomContextMenu
                    currentShape={currentShape}
                    onChange={handleShapeChange}
                  />
                </div>
              )}
              {isLabelModalOpen && (
                <LabelEditModal
                  initialValue={currentLabel}
                  onSave={(newValue) => {
                    if (currentEditingNode) {
                      currentEditingNode.attr('text/text', newValue)
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
