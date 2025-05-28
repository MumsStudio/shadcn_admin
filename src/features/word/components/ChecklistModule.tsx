// ChecklistModule.tsx
import React, { useState } from 'react'
import { IconTrash } from '@tabler/icons-react'

interface ChecklistModuleProps {
  onChange: (data: any) => void
}
const ChecklistModule: React.FC<ChecklistModuleProps> = ({ onChange }) => {
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [items, setItems] = useState<string[]>([])
  const [checkedItems, setCheckedItems] = useState<boolean[]>([])

  const progress =
    items.length > 0
      ? Math.round((checkedItems.filter(Boolean).length / items.length) * 100)
      : 0

  return (
    <div className='module-content'>
      <div className='pb-2'>
        <div className='flex justify-between text-sm'>
          <span>{progress}%</span>
          <span>
            {checkedItems.filter(Boolean).length}/{items.length}
          </span>
        </div>
        <div className='h-2 w-full rounded-full bg-gray-200'>
          <div
            className='h-full rounded-full bg-blue-500 transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {items.map((item, index) => (
        <div key={index} className='checklist-item flex items-center py-1'>
          <input
            type='checkbox'
            className='mr-2'
            checked={checkedItems[index]}
            onChange={(e) => {
              const newCheckedItems = [...checkedItems]
              newCheckedItems[index] = e.target.checked
              setCheckedItems(newCheckedItems)
            }}
          />
          <div
            className={`group flex w-[23.125rem] cursor-pointer justify-between p-1 hover:rounded hover:bg-gray-300 ${checkedItems[index] ? 'text-gray-400 line-through' : ''}`}
          >
            <div>{item}</div>
            <button
              className='invisible text-red-500 group-hover:visible hover:text-red-700'
              onClick={() => {
                setItems(items.filter((_, i) => i !== index))
                setCheckedItems(checkedItems.filter((_, i) => i !== index))
              }}
            >
              <IconTrash className='h-4 w-4' />
            </button>
          </div>
        </div>
      ))}
      {!showAdd && (
        <button
          className='mt-3 ml-4 rounded bg-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-400'
          onClick={() => setShowAdd(true)}
        >
          添加项目
        </button>
      )}
      {showAdd && (
        <div className='flex flex-col gap-2'>
          <input
            type='text'
            placeholder='添加清单项'
            className='w-full rounded border border-gray-300 px-2 py-1'
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <div className='flex gap-2'>
            <button
              className='rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600'
              onClick={() => {
                setItems([...items, newItem])
                setCheckedItems([...checkedItems, false])
                setNewItem('')
                setShowAdd(false)
              }}
            >
              确定
            </button>
            <button
              className='rounded bg-gray-300 px-3 py-1 hover:bg-gray-400'
              onClick={() => setShowAdd(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChecklistModule
