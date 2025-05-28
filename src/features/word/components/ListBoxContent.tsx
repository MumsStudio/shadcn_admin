// ListBoxContent.tsx
import React from 'react'
import { Card } from './types'

interface ListBoxContentProps {
  cards: Card[]
}

const ListBoxContent: React.FC<ListBoxContentProps> = ({ cards }) => {
  return (
    <div className='list-box-content p-2'>
      {cards.map((card) => (
        <div
          key={card.id}
          className='list-box-card mb-2 rounded border border-gray-300 bg-white p-2'
        >
          <div className='card-header text-lg font-bold'>{card.name}</div>
          <div className='card-content'>{card.content || '卡片内容...'}</div>
        </div>
      ))}
    </div>
  )
}

export default ListBoxContent
