import React from 'react'
import { Handle, Position } from '@xyflow/react'

const SimpleArrowNode = ({ data, selected }: any) => {
  // 默认长度100px，可通过data.length自定义
  const length = data?.length || 100
  const strokeColor = data?.strokeColor || '#000'
  const strokeWidth = data?.strokeWidth || 2

  return (
    <div style={{ position: 'relative', width: `${length}px`, height: '20px' }}>
      {/* 直线部分 */}
      <div
        style={{
          position: 'absolute',
          top: '9px',
          left: '0',
          width: `${length - 15}px`,
          height: `${strokeWidth}px`,
          backgroundColor: strokeColor,
        }}
      />

      {/* 三角形箭头部分 */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: `${length - 20}px`,
          width: '0',
          height: '0',
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderLeft: `15px solid ${strokeColor}`,
        }}
      />

      {/* 手柄 */}
      {/* <Handle
        type='target'
        position={Position.Left}
        id={'left-handle'}
        style={{
          backgroundColor: strokeColor,
          width: 8,
          height: 8,
          border: '1px solid white',
        }}
      />
      <Handle
        type='source'
        id={'right-handle'}
        position={Position.Right}
        style={{
          backgroundColor: strokeColor,
          width: 8,
          height: 8,
          border: '1px solid white',
        }}
      /> */}
    </div>
  )
}

export default SimpleArrowNode
