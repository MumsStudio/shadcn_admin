import React from 'react'
import { NodeProps, Handle, Position } from '@xyflow/react'

const PolygonNode = ({ data, selected }: NodeProps<any>) => {
  // 默认样式配置
  const styles = {
    width: data.width || 120,
    height: data.height || 120,
    backgroundColor: data.fill || '#ffffff',
    borderColor: data.borderColor || '#4f46e5',
    borderWidth: data.borderWidth || '2px',
    borderRadius: data.borderRadius || '0',
    color: data.textColor || '#1f2937',
    fontSize: data.fontSize || '14px',
    fontWeight: data.fontWeight || '500',
    boxShadow: selected
      ? '0 4px 6px -1px rgba(79, 70, 229, 0.3), 0 2px 4px -1px rgba(79, 70, 229, 0.2)'
      : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  }

 return (
    <div className="relative" style={{ width: styles.width, height: styles.height }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${styles.width} ${styles.height}`}>
        {/* 六边形路径 */}
        <polygon
          points={`
            ${styles.width/2},0 
            ${styles.width},${styles.height*0.25} 
            ${styles.width},${styles.height*0.75} 
            ${styles.width/2},${styles.height} 
            0,${styles.height*0.75} 
            0,${styles.height*0.25}
          `}
          fill={styles.backgroundColor}
          stroke={styles.borderColor}
          strokeWidth={styles.borderWidth}
        />
      </svg>

      {/* 内容 */}
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
        <div
          style={{
            color: styles.color,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
          }}
        >
          {data.label}
        </div>
      </div>

      {/* 连接点和装饰... */}
    </div>
  )
}

export default PolygonNode
