import {
 IconPlayerPlay,
  IconSortDescendingShapes,
  IconRepeat,
  IconProgress,
} from '@tabler/icons-react'
import { NodeProps, Handle, Position } from '@xyflow/react';


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

const FlowNode = ({ data, id, selected }: NodeProps<FlowNodeData>) => {
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
      <Handle type='source' position={Position.Bottom} id='bottom' />
      <Handle type='target' position={Position.Top} id='top' />
      {data.type === 'decision' && (
        <>
          <Handle type='source' position={Position.Left} id='left' />
          <Handle type='source' position={Position.Right} id='right' />
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