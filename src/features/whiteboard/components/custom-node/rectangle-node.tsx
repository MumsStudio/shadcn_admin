import { NodeProps, Handle, Position } from '@xyflow/react'

const RectangleNode = ({ data, selected }: NodeProps<any>) => (
  <div
    className={`flex items-center justify-center border-2 ${selected ? 'ring-2 ring-blue-500' : ''}`}
    style={{
      width: data.width || 150,
      height: data.height || 100,
      backgroundColor: data.fill || '#fff',
      borderColor: data.borderColor || '#000',
    }}
  >
    <Handle type='source' position={Position.Right} id='right' />
    <Handle type='target' position={Position.Left} id='left' />
    {data.label}
  </div>
)

export default RectangleNode
