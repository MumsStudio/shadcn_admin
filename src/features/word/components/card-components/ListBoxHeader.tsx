// ListBoxHeader.tsx
import React from 'react'

interface ListBoxHeaderProps {
  title: string
  isMenuOpen: boolean
  setMenuOpen: (isOpen: boolean) => void
  getPos: () => number
  editor: any
}

const ListBoxHeader: React.FC<ListBoxHeaderProps> = ({
  title,
  isMenuOpen,
  setMenuOpen,
  getPos,
  editor,
}) => {
  const handleMenuClick = () => setMenuOpen(!isMenuOpen)
  const handleDeleteClick = () => {
    setMenuOpen(false)
    const pos = getPos()
    if (
      typeof getPos === 'function' &&
      pos >= 0 &&
      pos < editor.state.doc.content.size
    ) {
      editor.commands.deleteRange({
        from: pos,
        to: (pos + editor.state.doc.nodeSize) - 2,
      })
    }
  }

  return (
    <div className='list-box-header flex items-center justify-between border-b border-gray-300 p-2'>
      <span className='list-box-title text-lg font-bold'>{title}</span>
      <div className='list-box-menu'>
        <button
          className='list-box-menu-button'
          onClick={handleMenuClick}
          aria-label='List box menu'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='12' cy='12' r='1' />
            <circle cx='12' cy='5' r='1' />
            <circle cx='12' cy='19' r='1' />
          </svg>
        </button>
        {isMenuOpen && (
          <div className='list-box-menu-dropdown absolute right-0 mt-2 rounded border border-gray-300 bg-white shadow'>
            {/* <button className='list-box-menu-item block px-2 py-1 hover:bg-gray-100'>
              编辑盒子
            </button> */}
            <button
              className='list-box-menu-item delete-item block px-2 py-1 hover:bg-gray-100'
              onClick={handleDeleteClick}
            >
              删除盒子
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListBoxHeader
