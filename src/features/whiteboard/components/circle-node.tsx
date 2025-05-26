import React from 'react'
import { Handle, Position } from '@xyflow/react'

const CircleNode = ({ data }: any) => {
  return (
    <div
      style={{
        width: data.width || 100,
        height: data.height || 100,
        borderRadius: '50%',
        backgroundColor: data.fill || '#e2e8f0',
        border: `1px solid ${data.borderColor || '#94a3b8'}`,
      }}
    >
      <Handle type='target' position={Position.Left} id={'left'} />
      <Handle type='source' position={Position.Right} id={'right'}/>
    </div>
  )
}

export default CircleNode
