import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

type TableDrawerProps = {
  onInsert: (rows: number, cols: number) => void
  onClose: () => void
  compact?: boolean
}

export function TableDrawer({ onInsert, onClose }: TableDrawerProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setIsDrawing(true)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRows = Math.min(Math.max(Math.ceil(y / 20), 1), 10)
    const newCols = Math.min(Math.max(Math.ceil(x / 20), 1), 10)

    setRows(newRows)
    setCols(newCols)
  }

  return (
    <div className='absolute z-50 rounded border bg-white p-4 shadow-lg'>
      <div
        ref={canvasRef}
        className='relative mb-4 h-[200px] w-[200px] bg-gray-100'
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className='flex'>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  'h-5 w-5 border border-gray-300',
                  rowIndex === 0 && 'border-t-2 border-t-gray-500',
                  colIndex === 0 && 'border-l-2 border-l-gray-500',
                  rowIndex === rows - 1 && 'border-b-2 border-b-gray-500',
                  colIndex === cols - 1 && 'border-r-2 border-r-gray-500'
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className='flex items-center justify-between'>
        <span>
          {rows} × {cols}
        </span>
        <div className='flex gap-2'>
          <button
            className='rounded bg-gray-200 px-3 py-1 hover:bg-gray-300'
            onClick={onClose}
          >
            取消
          </button>
          <button
            className='rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600'
            onClick={() => {
              onInsert(rows, cols)
              onClose()
            }}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}
