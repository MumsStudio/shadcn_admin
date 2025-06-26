import React from 'react'
import { NodeProps, Handle, Position } from '@xyflow/react'

const TriangleNode = ({ data, selected }: NodeProps<any>) => {
  // 默认样式配置
  const defaultStyle = {
    width: 80,
    height: 80,
    fill: '#93C5FD', // 柔和的蓝色
    borderColor: '#1E40AF', // 深蓝色边框
    borderWidth: 2,
  }

  // 合并传入的data和默认样式
  const style = {
    width: data.width || defaultStyle.width,
    height: data.height || defaultStyle.height,
    fill: data.fill || defaultStyle.fill,
    borderColor: data.borderColor || defaultStyle.borderColor,
    borderWidth: data.borderWidth || defaultStyle.borderWidth,
  }

  return (
    <div
      className={`relative flex items-center justify-center ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        width: style.width,
        height: style.height,
        backgroundColor: selected ? '#3B82F6' : style.fill, // 选中时使用更亮的蓝色
        border: `${style.borderWidth}px solid ${style.borderColor}`,
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        transition: 'background-color 0.2s ease', // 添加平滑过渡效果
        cursor: 'pointer', // 显示可点击光标
      }}
    >
      <Handle
        type='source'
        position={Position.Right}
        id='right'
        style={{ backgroundColor: style.borderColor }}
      />
      <Handle
        type='target'
        position={Position.Left}
        id='left'
        style={{ backgroundColor: style.borderColor }}
      />

      {/* 可选：在三角形中心添加文字 */}
      {data.label && (
        <div
          className='absolute bottom-1/4 w-full text-center text-xs font-medium'
          style={{ color: data.textColor || '#1E3A8A' }}
        >
          {data.label}
        </div>
      )}
    </div>
  )
}

export default TriangleNode
