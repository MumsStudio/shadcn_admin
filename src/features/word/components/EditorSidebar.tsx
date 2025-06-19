import { useState } from 'react'
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react'
import { useEditorContext } from '../EditorContext'

const EditorSidebar = () => {
  const { headings, activeHeadingId, editor } = useEditorContext()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const scrollToHeading = (id: string) => {
    const level = id.split('-')[1]
    const index: any = id.split('-')[2]
    const markdownEle = document.getElementsByClassName(`markdown`)[0]
    const element = markdownEle.querySelectorAll(`h${level}`)[index]
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <>
      <div
        className={`${isSidebarCollapsed ? 'hidden' : 'w-64'} overflow-y-auto p-4 transition-all duration-300`}
        style={{
          position: 'fixed',
          left: '10px',
          top: '110px',
          height: 'calc(100vh - 48px)',
        }}
      >
        <div className='mb-4'>
          <ul className='space-y-1'>
            {headings.map((heading) => (
              <li key={heading.id}>
                <button
                  onClick={() => {
                    scrollToHeading(heading.id)
                  }}
                  className={`hover:text-primary text-sm ${heading.level === 1 ? 'font-bold' : heading.level === 2 ? 'ml-2' : 'ml-4'} ${activeHeadingId === heading.id ? 'text-blue-500' : ''}`}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className='fixed top-[90px] left-4 z-50 h-8 w-8 -translate-y-1/2 rounded-full p-1 text-[26px] text-gray-500'
      >
        {isSidebarCollapsed ? (
          <IconLayoutSidebarRightCollapse
            size={30}
            className='hover:text-blue-400'
          />
        ) : (
          <IconLayoutSidebarRightExpand
            size={30}
            className='hover:text-blue-400'
          />
        )}
      </button>
    </>
  )
}

export default EditorSidebar
