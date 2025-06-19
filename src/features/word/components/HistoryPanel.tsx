import { useState, useEffect } from 'react'
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { diffLines } from 'diff'
import Request from '../request'

type HistoryItem = {
  version: string
  editedBy: string
  id: string
  content: string
  createdAt: string
  editor: string
}

type HistoryPanelProps = {
  docId: string
  currentContent: string 
  onRestore: (content: string) => void
  onClose: () => void
}

export function HistoryPanel({
  docId,
  currentContent,
  onRestore,
  onClose,
}: HistoryPanelProps) {
  const [histories, setHistories] = useState<HistoryItem[]>([])
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(
    null
  )
  const [diffResult, setDiffResult] = useState<any[]>([])

  useEffect(() => {
    loadHistories()
  }, [docId])

  const loadHistories = async () => {
    const res = await Request._GetDocumentHistory(docId)
    if (res && res.data) {
      setHistories(res.data)
    }
  }

  const handleSelectHistory = (history: HistoryItem) => {
    setSelectedHistory(history)

    // 解析HTML内容为纯文本
    const parseHtmlToText = (html: string) => {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // 保留基本格式标记
      const elements = doc.body.querySelectorAll('h1, h2, h3, strong, p, li')
      let text = ''

      elements.forEach((el) => {
        if (el.tagName.toLowerCase() === 'h1') {
          text += `# ${el.textContent}\n`
        } else if (el.tagName.toLowerCase() === 'h2') {
          text += `## ${el.textContent}\n`
        } else if (el.tagName.toLowerCase() === 'h3') {
          text += `### ${el.textContent}\n`
        } else if (el.tagName.toLowerCase() === 'strong') {
          text += `**${el.textContent}**\n`
        } else {
          text += `${el.textContent}\n`
        }
      })

      return text
    }

    const historyText = parseHtmlToText(history.content)
    const currentText = parseHtmlToText(currentContent)

    const diff = diffLines(currentText, historyText)
    setDiffResult(diff)
  }

  const handleRestore = () => {
    if (selectedHistory) {
      onRestore(selectedHistory.content)
    }
  }

  return (
    <div className='fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l bg-white shadow-lg'>
      <div className='flex items-center justify-between border-b p-4'>
        <button
          onClick={onClose}
          className='flex items-center space-x-1 rounded p-1 hover:bg-gray-100'
        >
          <IconArrowLeft className='h-4 w-4' />
          <span>返回文档</span>
        </button>
        <button
          onClick={handleRestore}
          disabled={!selectedHistory}
          className='flex items-center space-x-1 rounded bg-blue-500 px-3 py-1 text-white disabled:bg-gray-300'
        >
          <IconRefresh className='h-4 w-4' />
          <span>还原此版本</span>
        </button>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='border-b p-4'>
          <h3 className='text-lg font-medium'>历史版本</h3>
          <ul className='mt-2 space-y-2'>
            {histories.map((history) => (
              <li key={history.id}>
                <button
                  onClick={() => handleSelectHistory(history)}
                  className={`w-full rounded p-2 text-left hover:bg-gray-100 ${selectedHistory?.id === history.id ? 'bg-blue-50' : ''}`}
                >
                  <div className='flex justify-between'>
                    <span className='font-medium'>{history.editor}</span>
                    <span className='text-sm text-gray-500'>
                      {new Date(history.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className='mt-1 text-xs text-gray-500'>
                    <span>编辑者: {history.editedBy || '未知'}</span>
                    <span className='ml-2'>版本: {history.version || '0'}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {selectedHistory && (
          <div className='p-4'>
            <h3 className='mb-2 text-lg font-medium'>变更对比</h3>
            <div className='rounded border p-2 font-mono text-sm whitespace-pre-wrap'>
              {diffResult.map((part, index) => {
                const color = part.added
                  ? 'bg-green-100'
                  : part.removed
                    ? 'bg-red-100'
                    : ''
                return (
                  <div key={index} className={`${color} my-1`}>
                    {part.value}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
