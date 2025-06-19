import { useState, useEffect, useMemo, useRef } from 'react'
import { Route } from '@/routes/word/detail.$id'
import { useAuthStore } from '@/stores/authStore'
import { formatLastEditedTime } from '@/utils/common'
import debounce from '@/utils/debounce'
import { Main } from '@/components/layout/main'
import { EditorProvider } from './EditorContext'
import EditorContentArea from './components/EditorContentArea'
import EditorHeader from './components/EditorHeader'
import EditorSidebar from './components/EditorSidebar'
import { HistoryPanel } from './components/HistoryPanel'
import { useEditorSetup } from './hooks/useEditorSetup'
import Request from './request'

export default function Word() {
  const { id } = Route.useParams()
  const [docTitle, setDocTitle] = useState('未命名文档')
  const [isStarred, setIsStarred] = useState(false)
  const [lastSaved, setLastSaved] = useState('刚刚')
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  const [comments, setComments] = useState<any[]>([])
  const [commentsideBarOpen, setCommentsideBarOpen] = useState(false)
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  // const commentsSectionRef = useRef<HTMLDivElement | null>(null)
  const commentsSectionRef = useRef<HTMLDivElement>(
    document.createElement('div')
  )

  // 获取文档详情
  const getDocumentDetail = async () => {
    Request._GetDocumentDetail(id).then((res: any) => {
      if (res.data?.errCode === 403) {
        window.location.href = `/403`
        return
      }
      if (res) {
        const data = res.data
        setDocTitle(data.name || '未命名文档')
        setLastSaved(
          data?.lastEditedAt ? formatLastEditedTime(data.lastEditedAt) : '刚刚'
        )
      }
    })
  }

  // 保存文档
  const saveDocument = async (content: string) => {
    Request._UpdateDocumentDetail(id, { content }).then((res: any) => {
      if (res) {
        setLastSaved('刚刚')
      }
    })
  }

  const debouncedSave = debounce(saveDocument, 800)

  useEffect(() => {
    getDocumentDetail()
  }, [])

  // 编辑器相关逻辑
  const { editor, provider, content, setContent, headings, activeHeadingId } =
    useEditorSetup(id, email || '', debouncedSave)

  return (
    <EditorProvider
      value={{
        editor,
        provider,
        content,
        setContent,
        headings,
        activeHeadingId,
        docTitle,
        setDocTitle,
        isStarred,
        setIsStarred,
        lastSaved,
        showHistoryPanel,
        setShowHistoryPanel,
        email: email || '',
        comments,
        setComments,
        commentsideBarOpen,
        setCommentsideBarOpen,
        activeCommentId,
        setActiveCommentId,
        commentsSectionRef,
      }}
    >
      <Main className='overflow-hidden'>
        <EditorHeader />

        <div className='flex h-[calc(100vh-48px)]'>
          <EditorSidebar />
          <EditorContentArea />
        </div>

        {showHistoryPanel && (
          <HistoryPanel
            docId={id}
            currentContent={editor?.getHTML() as string}
            onRestore={(content) => {
              editor?.commands.setContent(content)
              setShowHistoryPanel(false)
            }}
            onClose={() => setShowHistoryPanel(false)}
          />
        )}
      </Main>
    </EditorProvider>
  )
}
