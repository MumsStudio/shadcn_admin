import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

type TreeItem = {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: TreeItem[]
}

interface TreeProps {
  data: TreeItem[]
  onSelect?: (id: string) => void
  renderItem?: (item: TreeItem) => React.ReactNode
}

export function Tree({ data, onSelect, renderItem }: TreeProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set()
  )

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const renderTree = (items: TreeItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className='space-y-1'>
        <div
          className='hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded px-2 py-1'
          onClick={() => onSelect?.(item.id)}
        >
          {item.type === 'folder' && (
            <button
              className='-ml-1 p-1'
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(item.id)
              }}
            >
              {expandedItems.has(item.id) ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          {renderItem ? (
            renderItem(item)
          ) : (
            <div className='flex items-center gap-2'>
              <span>{item.name}</span>
            </div>
          )}
        </div>
        {item.type === 'folder' &&
          expandedItems.has(item.id) &&
          item.children && (
            <div className='ml-6'>{renderTree(item.children, level + 1)}</div>
          )}
      </div>
    ))
  }

  return <div className='text-sm'>{renderTree(data)}</div>
}
