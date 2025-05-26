import React from 'react'

interface CardDrawerProps {
  onInsert: (name: string) => void
  onClose: () => void
  compact: boolean
}

const CardDrawer: React.FC<CardDrawerProps> = ({
  onInsert,
  onClose,
  compact,
}) => {
  const [name, setName] = React.useState('')

  const handleInsert = () => {
    onInsert(name)
    onClose()
  }

  return (
    <div className='bg-card space-y-4 rounded-lg p-4 shadow-lg'>
      <input
        type='text'
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='输入卡片名称'
        className='border-input focus:ring-ring focus:border-ring w-full rounded-md border px-3 py-2'
      />
      <div className='flex space-x-2'>
        <button
          onClick={handleInsert}
          className='bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-md px-4 py-2'
        >
          插入卡片
        </button>
        <button
          onClick={onClose}
          className='bg-secondary text-secondary-foreground hover:bg-secondary/90 flex-1 rounded-md px-4 py-2'
        >
          关闭
        </button>
      </div>
    </div>
  )
}

export default CardDrawer
