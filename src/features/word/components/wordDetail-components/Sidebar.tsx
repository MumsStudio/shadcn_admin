import { useState } from 'react'
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react'

export interface SidebarProps {
  isSidebarCollapsed: boolean
  headings: Array<{ id: string; text: string; level: number }>
  activeHeadingId: string | null
  setIsSidebarCollapsed: (collapsed: boolean) => void
  scrollToHeading: (id: string) => void
  setActiveHeadingId: (id: string) => void
}

export function Sidebar({
  isSidebarCollapsed,
  headings,
  activeHeadingId,
  setIsSidebarCollapsed,
  scrollToHeading,
  setActiveHeadingId,
}: SidebarProps) {
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
                    setActiveHeadingId(heading.id)
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
