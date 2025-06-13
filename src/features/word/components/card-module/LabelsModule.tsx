// LabelsModule.tsx
import React, { useEffect, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'

interface LabelsModuleProps {
  currentCard: {
    modules?: {
      labels?: any[]
    }
  }
  onChange: (data: any, action: string) => void
}

const LabelsModule: React.FC<LabelsModuleProps> = ({
  onChange,
  currentCard,
}) => {
  const [showDialog, setShowDialog] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [selectedColor, setSelectedColor] = useState('#61bd4f')
  const [labels, setLabels] = useState<any[]>([])
  const [editingLabelIndex, setEditingLabelIndex] = useState<number | null>(
    null
  )
  useEffect(() => {
    setLabels(currentCard?.modules?.labels || [])
  }, [currentCard?.modules])
  const handleAddLabel = () => {
    if (newLabel.trim()) {
      onChange(
        [...labels, { text: newLabel, color: selectedColor }],
        `add Label:${newLabel}`
      )
      setNewLabel('')
      setShowDialog(false)
    }
  }

  const handleUpdateLabel = (index: number) => {
    if (newLabel.trim()) {
      const updatedLabels = [...labels]
      updatedLabels[index] = { text: newLabel, color: selectedColor }
      onChange(updatedLabels, `update Label:${newLabel}`)
      setNewLabel('')
      setShowDialog(false)
      setEditingLabelIndex(null)
    }
  }

  return (
    <div className='module-content flex'>
      <div className='flex h-[2rem] w-[390px] flex-wrap gap-2'>
        {labels.map((label, index) => (
          <div
            key={index}
            className='flex h-[2.875rem] cursor-pointer items-center justify-center rounded px-2 text-center text-white'
            style={{ backgroundColor: label.color }}
            onClick={() => {
              setNewLabel(label.text)
              setSelectedColor(label.color)
              setEditingLabelIndex(index)
              setShowDialog(true)
            }}
          >
            {label.text}
          </div>
        ))}
        <button
          className='add-label-button rounded bg-gray-100 px-2 py-1 text-white hover:bg-gray-400'
          onClick={() => {
            setNewLabel('')
            setSelectedColor('#61bd4f')
            setEditingLabelIndex(null)
            setShowDialog(true)
          }}
        >
          <IconPlus size={30} className='text-gray-300' />
        </button>
      </div>

      {showDialog && (
        <div className='bg-opacity-50 fixed inset-0 flex items-center justify-center z-10'>
          <div className='h-[400px] w-[300px] rounded-lg border border-gray-300 bg-white p-4 shadow-lg'>
            <h3 className='mb-2 text-lg font-medium'>
              {editingLabelIndex !== null ? '编辑标签' : '创建新标签'}
            </h3>
            <input
              type='text'
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder='输入标签名称'
              className='w-full rounded border'
            />
            <div className='flex gap-2 py-4'>
              {[
                '#61bd4f',
                '#f2d600',
                '#ff9f1a',
                '#eb5a46',
                '#c377e0',
                '#00c2e0',
              ].map((color) => (
                <div
                  key={color}
                  className={`h-6 w-6 cursor-pointer rounded-full ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            <div className='flex justify-end gap-2'>
              <button
                className='rounded bg-gray-300 px-3 py-1 hover:bg-gray-400'
                onClick={() => setShowDialog(false)}
              >
                取消
              </button>
              {editingLabelIndex !== null && (
                <button
                  className='rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600'
                  onClick={() => {
                    const updatedLabels = [...labels]
                    updatedLabels.splice(editingLabelIndex, 1)
                    onChange(updatedLabels, `delete Label:${labels[editingLabelIndex].text}`)
                    setShowDialog(false)
                    setEditingLabelIndex(null)
                  }}
                >
                  删除
                </button>
              )}
              <button
                className='rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600'
                onClick={() => {
                  if (editingLabelIndex !== null) {
                    handleUpdateLabel(editingLabelIndex)
                  } else {
                    handleAddLabel()
                  }
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LabelsModule
