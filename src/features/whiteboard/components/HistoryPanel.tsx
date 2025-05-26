import { useState } from 'react'
import { IconX, IconClock, IconRotateClockwise } from '@tabler/icons-react'

type Version = {
  id: string
  name: string
  version: string
  editedBy: string
  createdAt: string
  nodes: any[]
  edges: any[]
}

type HistoryPanelProps = {
  versions: Version[]
  onClose: () => void
  onRestore: (version: Version) => void
}

export function HistoryPanel({
  versions,
  onClose,
  onRestore,
}: HistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const editedTime = new Date(timestamp)
    const diffInMs = now.getTime() - editedTime.getTime()
    const diffInSec = Math.floor(diffInMs / 1000)
    const diffInMin = Math.floor(diffInSec / 60)
    const diffInHrs = Math.floor(diffInMin / 60)
    const diffInDays = Math.floor(diffInHrs / 24)

    if (diffInDays > 0) {
      return editedTime.toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (diffInHrs > 0) {
      return `${diffInHrs}小时前`
    } else if (diffInMin > 0) {
      return `${diffInMin}分钟前`
    } else {
      return `${diffInSec}秒前`
    }
  }

  return (
    <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm'>
      <div className='w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl'>
        <div className='flex items-center justify-between border-b pb-4'>
          <h3 className='text-xl font-semibold text-gray-800'>历史版本</h3>
          <button
            onClick={onClose}
            className='rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <IconX size={20} />
          </button>
        </div>

        <div className='mt-4 max-h-[70vh] overflow-y-auto'>
          {versions.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>暂无历史记录</div>
          ) : (
            <ul className='space-y-2'>
              {versions.map((version) => (
                <li
                  key={version.id}
                  className={`rounded-lg p-4 transition-all ${
                    selectedVersion?.id === version.id
                      ? 'bg-blue-50 ring-2 ring-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start'>
                      <div className='mt-0.5 mr-3 rounded-full bg-blue-100 p-1.5'>
                        <IconClock className='h-4 w-4 text-blue-600' />
                      </div>
                      <div>
                        <div className='flex items-baseline'>
                          <span className='text-lg font-medium text-gray-900'>
                            {version.name}
                          </span>
                          <span className='ml-2 text-xs font-medium text-blue-600'>
                            v{version.version || '0'}
                          </span>
                        </div>
                        <div className='mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500'>
                          <span className='font-medium text-gray-700'>
                            {formatTime(version.createdAt)}
                          </span>
                          <span>编辑者: {version.editedBy || '未知'}</span>
                        </div>
                      </div>
                    </div>
                    {selectedVersion?.id === version.id && (
                      <button
                        className='flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                        onClick={(e) => {
                          e.stopPropagation()
                          onRestore(version)
                        }}
                      >
                        <IconRotateClockwise className='mr-1.5 h-4 w-4' />
                        恢复
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
