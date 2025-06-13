import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface LabelEditModalProps {
  initialValue: string
  onSave: (newValue: string) => void
  onCancel: () => void
}

export const LabelEditModal: React.FC<LabelEditModalProps> = ({
  initialValue,
  onSave,
  onCancel,
}) => {
  const [value, setValue] = useState(initialValue)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(value)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  if (!isMounted) return null

  return (
    <div className='bg-opacity-50 fixed inset-0 z-1000 flex items-center justify-center'>
      <div className='w-96 rounded-lg bg-white p-6 shadow-xl'>
        <h2 className='mb-4 text-lg font-semibold'>编辑节点标签</h2>
        <input
          type='text'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className='w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none'
        />
        <div className='mt-4 flex justify-end space-x-2'>
          <button
            onClick={onCancel}
            className='rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300'
          >
            取消
          </button>
          <button
            onClick={() => onSave(value)}
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
