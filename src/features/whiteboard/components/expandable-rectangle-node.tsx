import { useEffect, useState } from 'react'
import { NodeProps, Handle, Position, useReactFlow } from '@xyflow/react'

const ExpandableRectangleNode = ({ id, data, selected }: NodeProps<any>) => {
  const [isHovering, setIsHovering] = useState(false)
  const [resizingSide, setResizingSide] = useState<string | null>(null)
  const [resizeStartPosition, setResizeStartPosition] = useState({ x: 0, y: 0 })
  const [initialSize, setInitialSize] = useState({
    width: data.width || 150,
    height: data.height || 100,
  })
  const { updateNode } = useReactFlow()

  const handleMouseDown = (side: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setResizingSide(side)
    setResizeStartPosition({ x: e.clientX, y: e.clientY })
    setInitialSize({ width: data.width || 150, height: data.height || 100 })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!resizingSide) return

    const deltaX = e.clientX - resizeStartPosition.x
    const deltaY = e.clientY - resizeStartPosition.y
    const newData = { ...data }

    switch (resizingSide) {
      case 'top':
        newData.height = Math.max(30, initialSize.height - deltaY)
        break
      case 'right':
        newData.width = Math.max(30, initialSize.width + deltaX)
        break
      case 'bottom':
        newData.height = Math.max(30, initialSize.height + deltaY)
        break
      case 'left':
      case 'left':
        newData.width = Math.max(30, initialSize.width - deltaX)
        break
      case 'top-right':
        newData.height = Math.max(30, initialSize.height - deltaY)
        newData.width = Math.max(30, initialSize.width + deltaX)
        break
      case 'bottom-right':
        newData.height = Math.max(30, initialSize.height + deltaY)
        newData.width = Math.max(30, initialSize.width + deltaX)
        break
      case 'bottom-left':
        newData.height = Math.max(30, initialSize.height + deltaY)
        newData.width = Math.max(30, initialSize.width - deltaX)
        break
      case 'top-left':
        newData.height = Math.max(30, initialSize.height - deltaY)
        newData.width = Math.max(30, initialSize.width - deltaX)
        break
    }

    updateNode(id, { data: newData })
  }

  const handleMouseUp = () => {
    setResizingSide(null)
  }

  // Add event listeners for mouse move and up when resizing
  useEffect(() => {
    if (resizingSide) {
      window.addEventListener('mousemove', handleMouseMove as any)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove as any)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [resizingSide, resizeStartPosition, initialSize])

  return (
    <div
      className={`relative flex items-center justify-center border-2 nodrag ${
        selected ? 'ring-2 ring-blue-500' : ''
      } transition-colors`}
      style={{
        width: data.width || 150,
        height: data.height || 100,
        backgroundColor: data.fill || '#fff',
        borderColor: data.borderColor || '#000',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Node handles */}
      <Handle type='source' position={Position.Top} id='top' />
      <Handle type='source' position={Position.Right} id='right' />
      <Handle type='source' position={Position.Bottom} id='bottom' />
      <Handle type='source' position={Position.Left} id='left' />

      {/* Resize controls - only show when hovering or selected */}
      {(isHovering || selected) && (
        <>
          {/* Top */}
          <div
            className='absolute top-0 left-1/2 h-2 w-4 -translate-x-1/2 -translate-y-1/2 cursor-n-resize rounded-sm bg-blue-500 hover:bg-blue-600'
            onMouseDown={(e) => handleMouseDown('top', e)}
          />

          {/* Right */}
          <div
            className='absolute top-1/2 right-0 h-4 w-2 translate-x-1/2 -translate-y-1/2 cursor-e-resize rounded-sm bg-blue-500 hover:bg-blue-600'
            onMouseDown={(e) => handleMouseDown('right', e)}
          />

          {/* Bottom */}
          <div
            className='absolute bottom-0 left-1/2 h-2 w-4 -translate-x-1/2 translate-y-1/2 cursor-s-resize rounded-sm bg-blue-500 hover:bg-blue-600'
            onMouseDown={(e) => handleMouseDown('bottom', e)}
          />

          {/* Left */}
          <div
            className='absolute top-1/2 left-0 h-4 w-2 -translate-x-1/2 -translate-y-1/2 cursor-w-resize rounded-sm bg-blue-500 hover:bg-blue-600'
            onMouseDown={(e) => handleMouseDown('left', e)}
          />

          {/* Corners */}
          <div
            className='absolute top-0 left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize rounded-sm bg-blue-500 hover:bg-blue-600'
            onMouseDown={(e) => handleMouseDown('top-left', e)}
          />
          <div
            className='absolute top-0 right-0 h-3 w-3 translate-x-1/2 -translate-y-1/2 cursor-ne-resize rounded-sm bg-blue-500 hover:bg-blue-600'
            onMouseDown={(e) => handleMouseDown('top-right', e)}
          />
          <div
            className='absolute right-0 bottom-0 h-3 w-3 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-sm bg-blue-500 hover:bg-blue-600'
            onMouseDown={(e) => handleMouseDown('bottom-right', e)}
          />
          <div
            className='absolute bottom-0 left-0 h-3 w-3 -translate-x-1/2 translate-y-1/2 cursor-sw-resize rounded-sm bg-blue-500 hover:bg-blue-600'
            onMouseDown={(e) => handleMouseDown('bottom-left', e)}
          />
        </>
      )}

      <div className='p-2 text-center'>{data.label}</div>
    </div>
  )
}

export default ExpandableRectangleNode
