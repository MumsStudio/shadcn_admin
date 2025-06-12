import React, { useEffect, useRef, useState } from 'react';
import { IconArrowsMaximize, IconArrowsMinimize } from '@tabler/icons-react';
import { Graph, Shape } from '@antv/x6';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { History } from '@antv/x6-plugin-history';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Stencil } from '@antv/x6-plugin-stencil';
import { Transform } from '@antv/x6-plugin-transform';
import { createPortal } from 'react-dom';
import { addDefaultShapes } from './DefaultShapes';
import { FlowchartContainer } from './FlowchartContainer';
import { registerCustomNodes } from './NodeRegistry';
import { setupPortVisibility } from './PortVisibility';


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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [originalStyles, setOriginalStyles] = useState({
    width: '',
    height: '',
    position: '',
    zIndex: '',
  })
  const [stencilLoaded, setStencilLoaded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
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
      connecting: {
        snap: true,
        allowLoop: false,
        allowBlank: true,
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
      editor.commands.command(({ tr }) => {
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
    graph.on('edge:mouseenter', ({ edge }) => {
      // 显示预览节点
      console.log( '111111')
      // showPreviewNode(edge)
    })

    graph.on('edge:mouseleave', ({ edge }) => {
      // 隐藏预览节点
      console.log('22222')
      // hidePreviewNode(edge)
    })
    // graph.on('node:mousedown', ({ node }) => {
    //   if (node === previewNode) {
    //     // 移除预览节点的半透明效果
    //     node.attr('body/opacity', 1)
    //     previewNode = null

    //     // 触发保存
    //     saveData()
    //   }
    // })
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
      if (graphRef.current) {
        graphRef.current.dispose()
        graphRef.current = null
      }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }

      if (stencilRef.current && stencilContainerRef.current) {
        stencilRef.current.dispose()
        stencilRef.current = null
        stencilContainerRef.current.innerHTML = ''
      }

      if (graphContainerRef.current) {
        graphContainerRef.current.innerHTML = ''
      }

      setStencilLoaded(false)
    }
  }, [showPreview]) // 添加依赖，当数据变化时重新加载

  useEffect(() => {
    if (!graphContainerRef.current || !stencilContainerRef.current) return

    const graphWidth = showStencil ? `calc(100% - ${stencilWidth})` : '100%'

    graphContainerRef.current.style.width = graphWidth
    stencilContainerRef.current.style.width = showStencil ? stencilWidth : '0px'
  }, [showStencil, stencilWidth])

  const toggleStencil = () => {
    setShowStencil(!showStencil)
  }

  const updateFullscreenContainers = () => {
    if (!graphContainerRef.current || !stencilContainerRef.current) return

    const currentStencilWidth = showStencil ? stencilWidth : '0px'
    const graphWidth = showStencil ? `calc(100% - ${stencilWidth})` : '100%'

    // 设置容器尺寸为视口高度
    graphContainerRef.current.style.width = graphWidth
    graphContainerRef.current.style.height = '100vh'
    stencilContainerRef.current.style.width = currentStencilWidth
    stencilContainerRef.current.style.height = '100vh'

    // 触发图表 resize
    if (graphRef.current && graphContainerRef.current) {
      graphRef.current.resize(
        graphContainerRef.current.clientWidth,
        graphContainerRef.current.clientHeight
      )
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      // Save original styles
      setOriginalStyles({
        width: containerRef.current.style.width,
        height: containerRef.current.style.height,
        position: containerRef.current.style.position,
        zIndex: containerRef.current.style.zIndex,
      })
      updateFullscreenContainers()
      // Apply fullscreen styles
      containerRef.current.style.width = '100vw'
      containerRef.current.style.height = '100vh'
      containerRef.current.style.position = 'fixed'
      containerRef.current.style.zIndex = '9999'
      containerRef.current.style.top = '0'
      containerRef.current.style.left = '0'
      containerRef.current.style.backgroundColor = 'white'
    } else {
      // Restore original styles
      containerRef.current.style.width = originalStyles.width
      containerRef.current.style.height = originalStyles.height
      containerRef.current.style.position = originalStyles.position
      containerRef.current.style.zIndex = originalStyles.zIndex
      containerRef.current.style.top = ''
      containerRef.current.style.left = ''
      containerRef.current.style.backgroundColor = ''
    }

    setIsFullscreen(!isFullscreen)
  }

  const handlePreviewClick = () => {
    setShowPreview(true)
  }

  return (
    <div
      className='flowchart-preview'
      style={{
        width: node.attrs.width,
        height: '200px',
        border: '1px dashed #dfe3e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={handlePreviewClick}
    >
      <div>点击查看流程图</div>
      <div>
        {showPreview &&
          createPortal(
            <div className='bg-opacity-50 fixed inset-0 z-100000000 flex items-center justify-center'>
              <div className='h-[100vh] w-[100vw] bg-white p-4'>
                <FlowchartContainer
                  width='100%'
                  height='100%'
                  showStencil={showStencil}
                  stencilWidth={stencilWidth}
                  toggleStencil={toggleStencil}
                  toggleFullscreen={toggleFullscreen}
                  containerRef={containerRef as React.RefObject<HTMLDivElement>}
                  stencilContainerRef={
                    stencilContainerRef as React.RefObject<HTMLDivElement>
                  }
                  graphContainerRef={
                    graphContainerRef as React.RefObject<HTMLDivElement>
                  }
                />
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
    </div>
  )
}