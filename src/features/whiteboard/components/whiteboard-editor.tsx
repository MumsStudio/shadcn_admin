import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  IconPointer,
  IconRectangle,
  IconTextCaption,
  IconLink,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
  IconLetterT,
  IconNote,
  IconVectorSpline,
  IconHandClick,
  IconCircle,
  IconPencil,
  IconArrowUp,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconTrash,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconLock,
  IconReload,
  IconLayersSelected,
  IconBoxMultipleFilled,
  IconBoxMultiple,
  IconArrowUpRight,
  IconBackslash,
  IconTriangle,
  IconSquare,
  IconPhoto,
  IconVideo,
  IconTable,
  IconCopy,
  IconClipboard,
  IconCut,
  IconMath,
  IconSortDescendingShapes,
  IconRepeat,
  IconProgress,
  IconPlayerPlay,
  IconHistory,
  IconShare,
  IconDeviceFloppy,
} from '@tabler/icons-react'
import { Route } from '@/routes/whiteboard/detail.$id'
import {
  ReactFlow,
  Controls,
  Background,
  Panel,
  useReactFlow,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  addEdge,
  BackgroundVariant,
  Node,
  Edge,
  NodeTypes,
  NodeProps,
  ConnectionMode,
  MarkerType,
  useViewport,
  Handle,
  Position,
  ConnectionLineType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { showSuccessData } from '@/utils/show-submitted-data'
import Request from '../request'
import { HistoryPanel } from './HistoryPanel'
import ArrowNode from './arrow-node'
import CircleNode from './circle-node'
import FlowNode from './flow-node'
import FormulaNode from './formula-node'
import ImageNode from './image-node'
import LineNode from './line-node'
import PolygonNode from './ploygon-node'
import RectangleNode from './rectangle-node'
import StickyNode from './sticky-node'
import TableNode from './table-node'
import TextNode from './text-node'
import TriangleNode from './triangle-node'
import VideoNode from './video-node'

// 定义类型
type WhiteboardNodeData = {
  width?: number
  height?: number
  label?: string
  fill?: string
  borderColor?: string
  content?: string
  color?: string
  title?: string
  locked?: boolean // 新增锁定状态
  group?: string
  type?: string // 新增节点类型 propert
  src?: string
  rows?: number
  cols?: number
  cellPadding?: number
  cellSpacing?: number
  controls?: boolean
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  alt?: string
}

// 修改 WhiteboardNode 类型定义如下：
type WhiteboardNode = Node<WhiteboardNodeData> & {
  type:
    | 'rectangle'
    | 'text'
    | 'sticky'
    | 'group'
    | 'line'
    | 'circle'
    | 'freeDraw'
    | 'arrow'
    | 'image'
    | 'table'
    | 'video'
    | 'formula'
    | 'start'
    | 'end'
    | 'process'
    | 'decision'
}

type WhiteboardEdge = Edge

// 自定义节点组件

const nodeTypes: any = {
  text: TextNode,
  rectangle: RectangleNode,
  sticky: StickyNode,
  line: LineNode,
  circle: CircleNode,
  arrow: ArrowNode,
  polygon: PolygonNode,
  triangle: TriangleNode,
  image: ImageNode,
  table: TableNode,
  video: VideoNode,
  formula: FormulaNode,
  start: FlowNode,
  end: FlowNode,
  process: FlowNode,
  decision: FlowNode,
}
function WhiteboardFlow() {
  const { id } = Route.useParams()
  const { zoomIn, zoomOut, setCenter, getZoom, screenToFlowPosition, fitView } =
    useReactFlow()
  const { zoom } = useViewport()

  const [nodes, setNodes, onNodesChange] = useNodesState<WhiteboardNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<WhiteboardEdge>([])
  const [copiedNodes, setCopiedNodes] = useState<WhiteboardNode[]>([])

  const [whiteboardName, setWhiteboardName] = useState('未命名白板')
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [historyVersions, setHistoryVersions] = useState<any[]>([])
  useEffect(() => {
    if (showHistoryPanel === true) {
      getWhiteboardHistory()
    }
  }, [showHistoryPanel])
  const getWhiteboardHistory = async () => {
    Request._GetWhiteboardHistory(id).then((res: any) => {
      if (res) {
        setHistoryVersions(res.data || [])
      }
    })
  }

  const restoreVersion = (version: any) => {
    setNodes(version.nodes)
    setEdges(version.edges)
    setShowHistoryPanel(false)
  }
  const [selectedTool, setSelectedTool] = useState<
    | 'select'
    | 'rectangle'
    | 'text'
    | 'connection'
    | 'sticky'
    | 'pointer'
    | 'line'
    | 'circle'
    | 'freeDraw'
    | 'arrow'
    | 'image'
    | 'table'
    | 'video'
    | 'formula'
  >('pointer')
  const [isDragging, setIsDragging] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Array<[number, number]>>([])
  const [paths, setPaths] = useState<Array<Array<[number, number]>>>([])
  const svgRef = useRef<SVGSVGElement>(null)

  const onPaneMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (selectedTool !== 'freeDraw') return

      setIsDrawing(true)
      const point = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })
      setCurrentPath([[point.x, point.y]])
    },
    [selectedTool, screenToFlowPosition]
  )

  // 修改后的onPaneMouseMove函数
  const onPaneMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || selectedTool !== 'freeDraw') return

      const point = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })
      setCurrentPath((prev) => [...prev, [point.x, point.y]])
    },
    [isDrawing, selectedTool, screenToFlowPosition]
  )

  // 结束绘制
  const onPaneMouseUp = useCallback(() => {
    if (!isDrawing || selectedTool !== 'freeDraw') return

    setIsDrawing(false)
    if (currentPath.length > 1) {
      setPaths((prev) => [...prev, currentPath])
    }
    setCurrentPath([])
  }, [isDrawing, selectedTool, currentPath])

  // 清除绘制
  const clearDrawing = useCallback(() => {
    setPaths([])
  }, [])

  // 渲染绘制的路径
  const renderDrawing = useCallback(() => {
    return (
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
        viewBox={`0 0 ${svgRef.current?.clientWidth || 0} ${svgRef.current?.clientHeight || 0}`}
        preserveAspectRatio='none'
      >
        {/* 已完成的路径 */}
        {paths.map((path, i) => (
          <path
            key={`path-${i}`}
            d={`M ${path.map(([x, y]) => `${x} ${y}`).join(' L ')}`}
            fill='none'
            stroke='#64748b'
            strokeWidth='2'
          />
        ))}
        {/* 当前正在绘制的路径 */}
        {currentPath.length > 0 && (
          <path
            d={`M ${currentPath.map(([x, y]) => `${x} ${y}`).join(' L ')}`}
            fill='none'
            stroke='#64748b'
            strokeWidth='2'
          />
        )}
      </svg>
    )
  }, [paths, currentPath])

  // 新增撤销和重做功能
  const [history, setHistory] = useState<
    { nodes: WhiteboardNode[]; edges: WhiteboardEdge[] }[]
  >([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)

  const saveHistory = useCallback(() => {
    // 只在节点或边发生变化时保存历史记录
    const lastState = history[currentHistoryIndex]
    if (
      lastState &&
      JSON.stringify(lastState.nodes) === JSON.stringify(nodes) &&
      JSON.stringify(lastState.edges) === JSON.stringify(edges)
    ) {
      return
    }

    // 如果当前不是历史记录的末尾，截断后续记录
    if (currentHistoryIndex < history.length - 1) {
      setHistory(history.slice(0, currentHistoryIndex + 1))
    }

    // 添加新记录并更新索引
    setHistory((prev) => [...prev, { nodes: [...nodes], edges: [...edges] }])
    setCurrentHistoryIndex((prev) => prev + 1)
  }, [nodes, edges, history, currentHistoryIndex])

  useEffect(() => {
    saveHistory()
    console.log('saveHistory', nodes, edges)
  }, [nodes, edges])

  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const { nodes: prevNodes, edges: prevEdges } =
        history[currentHistoryIndex - 1]
      setNodes(prevNodes)
      setEdges(prevEdges)
      setCurrentHistoryIndex((prev) => prev - 1)
    }
  }, [history, currentHistoryIndex])

  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const { nodes: nextNodes, edges: nextEdges } =
        history[currentHistoryIndex + 1]
      setNodes(nextNodes)
      setEdges(nextEdges)
      setCurrentHistoryIndex((prev) => prev + 1)
    }
  }, [history, currentHistoryIndex])

  // 新增清除画布功能
  const clearCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
  }, [])

  // 新增对齐功能
  const alignNodes = useCallback(
    (alignType: 'left' | 'center' | 'right') => {
      const selectedNodes = nodes.filter((node) => node.selected)
      if (selectedNodes.length === 0) return

      const minX = Math.min(...selectedNodes.map((node) => node.position.x))
      const maxX = Math.max(...selectedNodes.map((node) => node.position.x))
      const centerX = (minX + maxX) / 2

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (!node.selected) return node
          switch (alignType) {
            case 'left':
              return { ...node, position: { ...node.position, x: minX } }
            case 'center':
              return { ...node, position: { ...node.position, x: centerX } }
            case 'right':
              return { ...node, position: { ...node.position, x: maxX } }
            default:
              return node
          }
        })
      )
    },
    [nodes]
  )

  // 新增锁定节点功能
  const toggleLockNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, locked: !node.data.locked } }
          : node
      )
    )
  }, [])

  // 新增分组和解组功能
  const groupNodes = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected)
    if (selectedNodes.length < 2) return

    const groupNode: WhiteboardNode = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { x: 0, y: 0 },
      data: { title: '分组', content: '' },
      style: { width: 200, height: 200 },
    }

    setNodes((prevNodes) => [...prevNodes, groupNode])
  }, [nodes])

  const ungroupNodes = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected)
    if (selectedNodes.length === 0) return

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.type === 'group') {
          return {
            ...node,
            type: 'rectangle',
            data: { ...node.data, title: '矩形' },
          }
        }
        return node
      })
    )
  }, [nodes])

  // 加载白板数据
  useEffect(() => {
    const loadWhiteboard = async () => {
      try {
        const res = await Request._GetWhiteboardDetail(id)
        if (res.data) {
          console.log(res.data, 'res.data')
          const data = res.data
          setWhiteboardName(data.name)
          setNodes(data.nodes)
          setEdges(data.edges)
        }
      } catch (error) {
        console.error('加载白板失败:', error)
      }
    }

    loadWhiteboard()
  }, [id, setNodes, setEdges])

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `${params.source}-${params.sourceHandle || 'source'}-${params.target}-${params.targetHandle || 'target'}-${Date.now()}`,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#64748b', strokeWidth: 2 },
        sourceHandle: params.sourceHandle || 'right',
        targetHandle: params.targetHandle || 'left',
      }
      setEdges((eds: any) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (selectedTool === 'connection') {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id))
      }
    },
    [setEdges, selectedTool]
  )

  // 复制节点
  const copyNodes = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected)
    setCopiedNodes(selectedNodes)
  }, [nodes])

  // 删除节点
  const deleteNodes = useCallback(() => {
    setNodes((prevNodes) => prevNodes.filter((node) => !node.selected))
  }, [setNodes])

  // 粘贴节点
  const pasteNodes = useCallback(() => {
    if (copiedNodes.length === 0) return

    const newNodes = copiedNodes.map((node) => ({
      ...node,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20,
      },
      selected: false,
    }))

    setNodes((prevNodes) => [...prevNodes, ...newNodes])
  }, [copiedNodes, setNodes])

  // 添加新节点
  const addNode = useCallback(
    (
      type:
        | 'rectangle'
        | 'text'
        | 'sticky'
        | 'line'
        | 'circle'
        | 'freeDraw'
        | 'arrow'
        | 'image'
        | 'video'
        | 'formula'
        | 'table',
      position: { x: number; y: number }
    ) => {
      const newNode: WhiteboardNode = {
        id: `${Date.now()}`,
        type,
        position,
        data: {},
      }

      switch (type) {
        case 'text':
          newNode.data = {
            content: '双击编辑文本',
            color: '#f0fdf4',
          }
          newNode.style = { width: 200, height: 100 }
          break
        case 'rectangle':
          newNode.data = {
            label: '矩形',
            fill: '#e2e8f0',
            borderColor: '#94a3b8',
            width: 150,
            height: 100,
          }
          break
        case 'sticky':
          newNode.data = {
            title: '便签',
            content: '双击编辑内容',
            color: '#fef08a',
            width: 200,
            height: 150,
          }
          break
        case 'line':
          newNode.data = {
            label: '线条',
            color: '#64748b',
          }
          break
        case 'circle':
          newNode.data = {
            label: '圆形',
            fill: '#e2e8f0',
          }
          break
        case 'image':
          newNode.data = {
            src: '',
            alt: '图片',
            width: 200,
            height: 150,
            borderColor: '#94a3b8',
          }
          break
        case 'table':
          newNode.data = {
            rows: 3,
            cols: 3,
            borderColor: '#94a3b8',
            cellPadding: 8,
          }
          break
        case 'video':
          newNode.data = {
            src: '',
            width: 300,
            height: 200,
            controls: true,
            borderColor: '#94a3b8',
          }
          break
        case 'freeDraw':
          newNode.data = {
            label: '自由绘图',
            color: '#64748b',
          }
          break
        case 'arrow':
          newNode.data = {
            label: '箭头',
            color: '#64748b',
          }
          break
      }

      setNodes((nds) => [...nds, newNode])
      if (type !== 'freeDraw') {
        setSelectedTool('select')
      }
    },
    [setNodes]
  )

  // 处理画布点击
  const onPaneClick = useCallback(
    (e: React.MouseEvent) => {
      if (
        selectedTool !== 'select' &&
        selectedTool !== 'connection' &&
        selectedTool !== 'pointer' &&
        selectedTool !== 'freeDraw'
      ) {
        const position = screenToFlowPosition({
          x: e.clientX,
          y: e.clientY,
        })
        addNode(selectedTool, position)
      }
    },
    [selectedTool, screenToFlowPosition, addNode]
  )

  // 处理节点拖拽开始
  const onNodeDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  // 处理节点拖拽结束
  const onNodeDragStop = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 工具栏按钮
  const toolbarButtons = useMemo(
    () => [
      { id: 'pointer', title: '指针工具', icon: <IconHandClick /> },
      { id: 'select', title: '选择工具', icon: <IconPointer /> },
      { id: 'rectangle', title: '矩形', icon: <IconRectangle /> },
      { id: 'text', title: '文本', icon: <IconLetterT /> },
      { id: 'sticky', title: '便签', icon: <IconNote /> },
      { id: 'connection', title: '连接线', icon: <IconVectorSpline /> },
      { id: 'line', title: '线条', icon: <IconBackslash /> },
      { id: 'circle', title: '圆形', icon: <IconCircle /> },
      { id: 'triangle', title: '三角形', icon: <IconTriangle /> },
      { id: 'polygon', title: '多边形', icon: <IconSquare /> },
      { id: 'freeDraw', title: '自由绘图', icon: <IconPencil /> },
      { id: 'arrow', title: '箭头', icon: <IconArrowUpRight /> },
      { id: 'image', title: '图片', icon: <IconPhoto /> },
      { id: 'video', title: '视频', icon: <IconVideo /> },
      { id: 'table', title: '表格', icon: <IconTable /> },
      { id: 'formula', title: '公式', icon: <IconMath /> },
      // { id: 'start', title: '开始', icon: <IconPlayerPlay /> },
      // { id: 'end', title: '结束', icon: <IconSortDescendingShapes /> },
      // { id: 'process', title: '处理', icon: <IconProgress /> },
      // { id: 'decision', title: '判断', icon: <IconRepeat /> },
    ],
    []
  )
  const operationButtons = useMemo(
    () => [
      { id: 'undo', title: '撤销', icon: <IconArrowBackUp /> },
      { id: 'redo', title: '重做', icon: <IconArrowForwardUp /> },
      { id: 'clear', title: '清除画布', icon: <IconTrash /> },
      // { id: 'alignLeft', title: '左对齐', icon: <IconAlignLeft /> },
      // { id: 'alignCenter', title: '居中对齐', icon: <IconAlignCenter /> },
      // { id: 'alignRight', title: '右对齐', icon: <IconAlignRight /> },
      { id: 'lock', title: '锁定节点', icon: <IconLock /> },
      { id: 'group', title: '分组', icon: <IconBoxMultipleFilled /> },
      { id: 'ungroup', title: '解组', icon: <IconBoxMultiple /> },
    ],
    []
  )

  // 缩放控制
  const zoomControls = useMemo(
    () => [
      {
        id: 'zoomIn',
        title: '放大',
        icon: <IconZoomIn />,
        action: () => zoomIn({ duration: 300 }),
      },
      {
        id: 'zoomOut',
        title: '缩小',
        icon: <IconZoomOut />,
        action: () => zoomOut({ duration: 300 }),
      },
      {
        id: 'zoomReset',
        title: '重置缩放',
        icon: <IconZoomReset />,
        action: () => fitView({ duration: 300 }),
      },
    ],
    [zoomIn, zoomOut, fitView]
  )

  // 保存和分享
  const handleSave = useCallback(() => {
    console.log('保存白板:', { nodes, edges })
    Request._UpdateWhiteboardDetail(id, { nodes, edges }).then((res: any) => {
      if (res.data) {
        showSuccessData('save success')
      }
    })
  }, [nodes, edges])

  const handleShare = useCallback(() => {
    console.log('分享白板')
  }, [])

  // 气泡菜单组件
  const cutNodes = useCallback(() => {
    copyNodes()
    deleteNodes()
  }, [copyNodes, deleteNodes])

  type BubbleMenuItemProps = {
    icon: React.ReactNode
    label: string
    onClick?: () => void
    disabled?: boolean
  }

  const BubbleMenuItem = ({
    icon,
    label,
    onClick,
    disabled,
  }: BubbleMenuItemProps) => (
    <button
      className='text-4 flex h-12 w-17 items-center gap-1 rounded px-2 py-1 hover:bg-gray-100'
      onClick={onClick}
      disabled={disabled}
    >
      <span>{icon}</span>
      {label}
    </button>
  )

  const BubbleMenu = ({ x, y }: { x: number; y: number }) => (
    <div
      className='absolute z-50 flex gap-1 rounded-md bg-white p-1 shadow-md'
      style={{ left: x, top: y }}
    >
      <BubbleMenuItem
        icon={<IconCopy size={16} />}
        label='复制'
        onClick={copyNodes}
      />
      <BubbleMenuItem
        icon={<IconCut size={16} />}
        label='剪切'
        onClick={cutNodes}
      />
      <BubbleMenuItem
        icon={<IconTrash size={16} />}
        label='删除'
        onClick={deleteNodes}
      />
      <BubbleMenuItem
        icon={<IconClipboard size={16} />}
        label='粘贴'
        onClick={pasteNodes}
        disabled={copiedNodes.length === 0}
      />
    </div>
  )

  return (
    <div className='relative h-screen w-full'>
      {showHistoryPanel && (
        <HistoryPanel
          versions={historyVersions}
          onClose={() => setShowHistoryPanel(false)}
          onRestore={restoreVersion}
        />
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        onEdgeClick={onEdgeClick}
        minZoom={0.1}
        maxZoom={2}
        connectionMode={
          selectedTool === 'connection' ? ConnectionMode.Strict : undefined
        }
        connectionRadius={20}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        nodesDraggable={selectedTool === 'select'}
        nodesConnectable={selectedTool === 'connection'}
        panOnDrag={selectedTool === 'pointer'}
        zoomOnScroll
        zoomOnPinch
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'default',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#64748b', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: '#64748b', strokeWidth: 2 }}
        connectionLineType={ConnectionLineType.SimpleBezier}
        snapToGrid={true}
        snapGrid={[15, 15]}
        onMouseDown={onPaneMouseDown} // ✅ 修改此处
        onMouseMove={onPaneMouseMove} // ✅ 修改此处
        onMouseUp={onPaneMouseUp}
      >
        {/* 顶部导航栏 */}
        <Panel position='top-center' className='bg-white p-2 shadow-md'>
          <h2 className='my-2 text-center text-lg font-bold text-gray-800'>
            {whiteboardName}
          </h2>
          <div className='flex items-center gap-2'>
            <button
              className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
              onClick={handleSave}
            >
              <IconDeviceFloppy className='mr-1 inline' />
              保存
            </button>
            <button
              className='rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50'
              onClick={handleShare}
            >
              <IconShare className='mr-1 inline' />
              分享
            </button>
            <button
              className='ml-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50'
              onClick={() => setShowHistoryPanel(true)}
            >
              <IconHistory className='mr-1 inline' />
              历史
            </button>
          </div>
          {nodes.some((node) => node.selected) && (
            <div className='absolute top-10 left-80 ml-2'>
              <BubbleMenu x={0} y={0} />
            </div>
          )}
        </Panel>
        {renderDrawing()}
        {/* 左侧工具栏 */}
        <Panel
          position='top-left'
          className='grid grid-cols-2 gap-2 rounded-md bg-white p-2 shadow-md'
        >
          {toolbarButtons.map((button) => (
            <button
              key={button.id}
              className={`rounded-md p-2 hover:bg-gray-100 ${
                selectedTool === button.id ? 'bg-blue-100 text-blue-600' : ''
              }`}
              onClick={() => {
                if (button.id === 'undo') undo()
                else if (button.id === 'redo') redo()
                else if (button.id === 'clear') clearCanvas()
                else if (button.id === 'alignLeft') alignNodes('left')
                else if (button.id === 'alignCenter') alignNodes('center')
                else if (button.id === 'alignRight') alignNodes('right')
                else if (button.id === 'group') groupNodes()
                else if (button.id === 'ungroup') ungroupNodes()
                else setSelectedTool(button.id as any)
              }}
              title={button.title}
            >
              {button.icon}
            </button>
          ))}
        </Panel>

        <Panel position='top-right'>
          <div className='flex flex-col gap-2 rounded-md bg-white p-2 shadow-md'>
            {operationButtons.map((button) => (
              <button
                key={button.id}
                className='rounded-md p-2 hover:bg-gray-100'
                onClick={() => {
                  if (button.id === 'undo') undo()
                  else if (button.id === 'redo') redo()
                  else if (button.id === 'clear') clearCanvas()
                  else if (button.id === 'alignLeft') alignNodes('left')
                  else if (button.id === 'alignCenter') alignNodes('center')
                  else if (button.id === 'alignRight') alignNodes('right')
                  // else if (button.id === 'lock') lockNodes()
                  else if (button.id === 'group') groupNodes()
                  else if (button.id === 'ungroup') ungroupNodes()
                }}
                title={button.title}
              >
                {button.icon}
              </button>
            ))}
          </div>
        </Panel>
        {/* 缩放控制 */}
        <Panel
          position='bottom-right'
          className='flex flex-col gap-2 rounded-md bg-white p-2 shadow-md'
        >
          {zoomControls.map((control) => (
            <button
              key={control.id}
              className='rounded-md p-2 hover:bg-gray-100'
              onClick={control.action}
              title={control.title}
            >
              {control.icon}
            </button>
          ))}
          <div className='text-center text-sm text-gray-500'>
            {Math.round(zoom * 100)}%
          </div>
        </Panel>

        <Controls position='bottom-left' />
        <Background
          variant={BackgroundVariant.Lines}
          gap={20}
          size={1}
          color='#e2e8f0'
        />
      </ReactFlow>
    </div>
  )
}

export default function WhiteboardEditor() {
  return (
    <ReactFlowProvider>
      <WhiteboardFlow />
    </ReactFlowProvider>
  )
}
