// ListBoxFooter.tsx
import React from 'react'
import { IconPlus } from '@tabler/icons-react'

interface ListBoxFooterProps {
  handleAddCardClick: () => void
}

const ListBoxFooter: React.FC<ListBoxFooterProps> = ({
  handleAddCardClick,
}) => {
  return (
    <button
      className='add-card-button absolute bottom-2 left-1/2 -translate-x-1/2 transform rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        handleAddCardClick()
      }}
    >
      <IconPlus size={20} className='text-white' />
      添加卡片
    </button>
  )
}

export default ListBoxFooter
