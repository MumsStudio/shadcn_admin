import React from 'react'
import { Handle, Position } from '@xyflow/react'

const LineNode = ({ data, selected }: any) => {
  // 使用与白板连接线一致的样式
  const lineColor = data?.length ? data?.length : '#000' // 线颜色
  const lineWidth = data?.width ? data?.width : 2 // 线宽

  return (
    <div
      style={{
        position: 'relative',
        height: `${lineWidth}px`,
        width: '100px', // 默认长度
        backgroundColor: lineColor,
        margin: '20px 0', // 上下留出空间
        // 选中状态效果
        boxShadow: selected ? `0 0 0 2px rgba(59, 130, 246, 0.5)` : 'none',
      }}
    >
      {/* 左侧手柄 */}
      <Handle
        type='target'
        position={Position.Left}
        id={'left'}
        style={{
          backgroundColor: lineColor,
          width: '8px',
          height: '8px',
          border: '1px solid white',
        }}
      />

      {/* 右侧手柄 */}
      <Handle
        type='source'
        id={'right'}
        position={Position.Right}
        style={{
          backgroundColor: lineColor,
          width: '8px',
          height: '8px',
          border: '1px solid white',
        }}
      />
    </div>
  )
}

export default LineNode
