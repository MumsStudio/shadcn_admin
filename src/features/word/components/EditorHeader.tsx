import {
  IconHistory,
  IconEye,
  IconComet,
  IconShare,
  IconUser,
  IconStar,
} from '@tabler/icons-react'
import { useEditorContext } from '../EditorContext'

const EditorHeader = () => {
  const {
    docTitle,
    setDocTitle,
    isStarred,
    setIsStarred,
    lastSaved,
    setShowHistoryPanel,
  } = useEditorContext()

  return (
    <div className='sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 text-[2rem]'>
      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-2'>
          <input
            type='text'
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className='w-64 border-none bg-transparent text-base font-medium focus:ring-0 focus:outline-none'
          />
          <button
            onClick={() => setIsStarred(!isStarred)}
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
            onClick={() => setShowHistoryPanel(true)}
            className='flex items-center space-x-1 rounded p-2 text-gray-600 hover:bg-gray-100'
          >
            <IconHistory size={18} />
            <span>历史</span>
          </button>
          <button className='flex items-center space-x-1 rounded p-2 text-gray-600 hover:bg-gray-100'>
            <IconEye size={18} />
            <span>预览</span>
          </button>
          <button className='flex items-center space-x-1 rounded p-2 text-gray-600 hover:bg-gray-100'>
            <IconComet size={18} />
            <span>评论</span>
          </button>
          <button className='flex items-center space-x-1 rounded p-2 text-gray-600 hover:bg-gray-100'>
            <IconShare size={18} />
            <span>分享</span>
          </button>
          <button className='flex items-center space-x-1 rounded text-gray-600 hover:bg-gray-100'>
            <IconUser size={18} />
            <span>协作</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditorHeader
