import { useState } from 'react'
import {
  IconHistory,
  IconEye,
  IconComet,
  IconShare,
  IconSearch,
  IconUser,
  IconStar,
  IconDownload,
} from '@tabler/icons-react'
import { showSuccessData } from '@/utils/show-submitted-data'

export interface HeaderProps {
  docTitle: string
  isStarred: boolean
  lastSaved: string
  showHistoryPanel: boolean
  commentsideBarOpen: boolean
  findReplaceOpen: boolean
  onDocTitleChange: (title: string) => void
  onStarClick: () => void
  onHistoryClick: () => void
  onCommentClick: () => void
  onFindReplaceClick: () => void
  onDownload: (format: 'word' | 'pdf') => void
}

export function Header({
  docTitle,
  isStarred,
  lastSaved,
  showHistoryPanel,
  commentsideBarOpen,
  findReplaceOpen,
  onDocTitleChange,
  onStarClick,
  onHistoryClick,
  onCommentClick,
  onFindReplaceClick,
  onDownload,
}: HeaderProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  return (
    <div className='sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 text-[2rem]'>
      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-2'>
          <input
            type='text'
            value={docTitle}
            onChange={(e) => onDocTitleChange(e.target.value)}
            className='w-64 border-none bg-transparent text-base font-medium focus:ring-0 focus:outline-none'
          />
          <button
            onClick={onStarClick}
            className='p-1 text-gray-500 hover:text-yellow-500'
          >
            <IconStar
              className={`h-4 w-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`}
            />
          </button>
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <div className='flex items-center space-x-1 pr-[8px] text-[14px] text-gray-500'>
          <span>最后保存: {lastSaved}</span>
        </div>

        <div className='flex items-center gap-1 space-x-1 text-[1rem]'>
          <button
            onClick={onHistoryClick}
            className='flex items-center space-x-1 rounded p-2 text-gray-600 hover:bg-gray-100'
          >
            <IconHistory size={18} />
            <span>历史</span>
          </button>
          <button className='flex items-center space-x-1 rounded p-2 text-gray-600 hover:bg-gray-100'>
            <IconEye size={18} />
            <span>预览</span>
          </button>
          <button
            className='flex items-center space-x-1 rounded p-2 text-gray-600 hover:bg-gray-100'
            onClick={onCommentClick}
          >
            <IconComet size={18} />
            <span>评论</span>
          </button>
          <div className='relative'>
            <button
              className='flex items-center space-x-1 rounded p-2 text-gray-600 hover:bg-gray-100'
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <IconShare size={18} />
              <span>分享</span>
            </button>
            {showShareMenu && (
              <div className='absolute right-0 z-10 mt-1 w-40 rounded-md border bg-white shadow-lg'>
                <button
                  className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    showSuccessData('复制链接成功')
                    setShowShareMenu(false)
                  }}
                >
                  复制链接
                </button>
                <button
                  className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                  onClick={() => {
                    window.open(
                      `/qrcode?text=${encodeURIComponent(window.location.href)}`,
                      '_blank',
                      'width=300,height=300'
                    )
                    setShowShareMenu(false)
                  }}
                >
                  二维码生成
                </button>
              </div>
            )}
          </div>
          <button
            className='flex items-center space-x-1 rounded p-2 text-gray-600 hover:bg-gray-100'
            onClick={onFindReplaceClick}
          >
            <IconSearch size={18} />
            <span>查找与替换</span>
          </button>
          <button className='flex items-center space-x-1 rounded text-gray-600 hover:bg-gray-100'>
            <IconUser size={18} />
            <span>协作</span>
          </button>
          <div className='relative'>
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className='flex items-center space-x-1 rounded p-2 text-gray-600 hover:bg-gray-100'
            >
              <IconDownload size={18} />
              <span>下载</span>
            </button>
            {showDownloadMenu && (
              <div className='absolute right-0 z-10 mt-1 w-40 rounded-md border bg-white shadow-lg'>
                <button
                  className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                  onClick={() => onDownload('word')}
                >
                  Word格式
                </button>
                <button
                  className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                  onClick={() => onDownload('pdf')}
                >
                  PDF格式
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
