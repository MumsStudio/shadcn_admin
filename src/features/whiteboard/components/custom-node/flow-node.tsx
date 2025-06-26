import { useCallback } from 'react'
import {
  IconPlayerPlay,
  IconSortDescendingShapes,
  IconRepeat,
  IconProgress,
} from '@tabler/icons-react'
import { NodeProps, Handle, Position } from '@xyflow/react'

type FlowNodeData = {
  id: string
  type: string
  data: any
  position: any
  label?: string
  fill?: string
  borderColor?: string
  width?: number
  height?: number
}

type FlowNodeProps = NodeProps<FlowNodeData> & {
  onCreateNode: (
    nodeType: string,
    position: { x: number; y: number },
    sourceHandle: string,
    sourceNodeId: string
  ) => void
}

const FlowNode = ({ data, id, selected, onCreateNode }: FlowNodeProps) => {
  const getNodeIcon = () => {
    switch (data.type) {
      case 'start':
        return <IconPlayerPlay className='text-green-500' />
      case 'end':
        return <IconSortDescendingShapes className='text-red-500' />
      case 'process':
        return <IconProgress className='text-blue-500' />
      case 'decision':
        return <IconRepeat className='text-yellow-500' />
      default:
        return null
    }
  }

  const handleHandleClick = useCallback(
    (position: Position, handleId: string, event: React.MouseEvent) => {
      event.stopPropagation()

      // 计算新节点的位置
      const offsetX =
        position === Position.Left
          ? -150
          : position === Position.Right
            ? 150
            : 0
      const offsetY =
        position === Position.Top
          ? -100
          : position === Position.Bottom
            ? 100
            : 0

      const newNodePosition = {
        x: data.position.x + offsetX,
        y: data.position.y + offsetY,
      }

      onCreateNode(data.type, newNodePosition, handleId, id)
    },
    [data.position.x, data.position.y, data.type, id, onCreateNode]
  )

  const getNodeStyle = () => {
    const baseStyle = {
      width: data.width || 120,
      height: data.height || 60,
      border: `2px solid ${data.borderColor || '#64748b'}`,
      backgroundColor: data.fill || '#f8fafc',
    }

    if (data.type === 'decision') {
      return {
        ...baseStyle,
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      }
    }

    if (data.type === 'start' || data.type === 'end') {
      return {
        ...baseStyle,
        borderRadius: '50%',
      }
    }

    return baseStyle
  }

  return (
    <div className='relative'>
      <Handle
        type='source'
        position={Position.Bottom}
        id='bottom'
        onClick={(event) => handleHandleClick(Position.Bottom, 'bottom', event)}
        className='h-3 w-3 cursor-pointer border-2 border-blue-500 bg-white hover:bg-blue-200'
      />
      <Handle
        type='target'
        position={Position.Top}
        id='top'
        onClick={(event) => handleHandleClick(Position.Top, 'top', event)}
        className='h-3 w-3 cursor-pointer border-2 border-blue-500 bg-white hover:bg-blue-200'
      />
      {data.type === 'decision' && (
        <>
          <Handle
            type='source'
            position={Position.Left}
            id='left'
            onClick={(event) => handleHandleClick(Position.Left, 'left', event)}
            className='h-3 w-3 cursor-pointer border-2 border-blue-500 bg-white hover:bg-blue-200'
          />
          <Handle
            type='source'
            position={Position.Right}
            id='right'
            onClick={(event) =>
              handleHandleClick(Position.Right, 'right', event)
            }
            className='h-3 w-3 cursor-pointer border-2 border-blue-500 bg-white hover:bg-blue-200'
          />
        </>
      )}

      <div
        className={`flex items-center justify-center ${selected ? 'ring-2 ring-blue-500' : ''}`}
        style={getNodeStyle()}
      >
        <div className='flex flex-col items-center'>
          {getNodeIcon()}
          <span className='mt-1 text-sm'>{data.label || data.type}</span>
        </div>
      </div>
    </div>
  )
}

export default FlowNode
