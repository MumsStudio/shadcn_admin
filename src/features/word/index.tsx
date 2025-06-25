import { useState, useEffect, useMemo, useRef } from 'react'
import { IconPaperclip } from '@tabler/icons-react'
import { Route } from '@/routes/word/detail.$id'
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from '@tiptap/react'
import { useAuthStore } from '@/stores/authStore'
import { formatLastEditedTime } from '@/utils/common'
import debounce from '@/utils/debounce'
import { Main } from '@/components/layout/main'
import { LeftSelect } from '@/components/left-select'
import { LinkPopup } from '@/components/link-popup'
import { HistoryPanel } from './components/HistoryPanel'
import { FindReplaceDialog } from './components/find-replace'
// 在组件中使用
import {
  getOrCreateProvider,
  releaseProvider,
} from './components/provider-manager'
import { BubbleMenuComponent } from './components/wordDetail-components/BubbleMenu'
import { CommentsSidebar } from './components/wordDetail-components/CommentsSidebar'
import { getEditorExtensions } from './components/wordDetail-components/EditorExtensions'
import { Header } from './components/wordDetail-components/Header'
import { handleHeadingShortcuts } from './components/wordDetail-components/HeadingShortcuts'
import { handleKeyboardShortcuts } from './components/wordDetail-components/KeyboardShortcuts'
import { Sidebar } from './components/wordDetail-components/Sidebar'
import Request from './request'

export default function Word() {
  const [findReplaceOpen, setFindReplaceOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [content, setContent] = useState('')
  const [indentType, setIndentType] = useState<'increase' | 'decrease'>(
    'increase'
  )
  const [docTitle, setDocTitle] = useState('未命名文档')
  const [isStarred, setIsStarred] = useState(false)
  const [lastSaved, setLastSaved] = useState('刚刚')
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [showLinkPopup, setShowLinkPopup] = useState(false)
  const [linkPopupProps, setLinkPopupProps] = useState<any>({})
  const [comments, setComments] = useState<any[]>([])
  const [commentsideBarOpen, setCommentsideBarOpen] = useState(false)
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  const commentsSectionRef = useRef<HTMLDivElement | null>(null)
  const [headingLevel, setHeadingLevel] = useState<'p' | '1' | '2' | '3'>('p')
  const [listType, setListType] = useState<'none' | 'ul' | 'ol'>('none')
  const [alignType, setAlignType] = useState<
    'left' | 'center' | 'right' | 'justify'
  >('left')
  const [fontSize, setFontSize] = useState<string>('14px')
  const [fontFamily, setfontFamily] = useState<string>('Inter')
  const [headings, setHeadings] = useState<
    Array<{ id: string; text: string; level: number }>
  >([])
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  const { id } = Route.useParams()
  let ownerEmail = ''
  useEffect(() => {
    getDocumentDetail()
    handleReadOnly()
  }, [])

  useEffect(() => {
    if (!content || content == '' || content == '<p></p>') return
    const debouncedSaveDocument = debounce(saveDocument, 800)
    debouncedSaveDocument()
  }, [content])
  useEffect(() => {
    return () => {
      releaseProvider(id)
    }
  }, [id])
  // 获取文档详情
  const getDocumentDetail = async () => {
    Request._GetDocumentDetail(id).then((res: any) => {
      if (res.data?.errCode === 403) {
        window.location.href = `/403`
        return
      }
      if (res) {
        const data = res.data
        ownerEmail = data.document.ownerEmail
        setDocTitle(data.name || '未命名文档')
        setLastSaved(
          data?.lastEditedAt ? formatLastEditedTime(data.lastEditedAt) : '刚刚'
        )
        editor?.commands.setContent(data.content || '')
      }
    })
  }
  // 保存文档
  const saveDocument = async () => {
    console.log('saveDocument', content) // 打印保存的内容，用于调试
    Request._UpdateDocumentDetail(id, { content }).then((res: any) => {
      if (res) {
        console.log(res, 'res')
        setLastSaved('刚刚')
      }
    })
  }
  const provider = useMemo(() => {
    return getOrCreateProvider(id, email as string)
  }, [id, email])
  const focusCommentWithActiveId = (id: string) => {
    if (!commentsSectionRef.current) return

    // 确保ID是有效的CSS选择器
    const escapedId = id.replace(/[^\w-]/g, '\\$&')
    const commentInput =
      commentsSectionRef.current.querySelector<HTMLInputElement>(
        `input[id="${escapedId}"]`
      )

    if (!commentInput) return

    commentInput.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
  }

  useEffect(() => {
    if (!activeCommentId) return
    focusCommentWithActiveId(activeCommentId)
  }, [activeCommentId])
  const editor: any = useEditor({
    extensions: getEditorExtensions(provider, email as string),
    content: '',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'markdown prose max-w-none focus:outline-none',
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          return handleHeadingShortcuts(editor, event) || false
        },
      },
      handleKeyDown: (view, event) => handleKeyboardShortcuts(editor, event),
    },
  })

  const updateFontFamily = () => {
    if (!editor) return
    const currentFontFamily = editor.getAttributes('textStyle').fontFamily
    setfontFamily(currentFontFamily || 'Inter')
  }
  const updateFontSize = () => {
    if (!editor) return
    const currentFontSize = editor.getAttributes('textStyle').fontSize
    setFontSize(currentFontSize || '14px')
  }
  const handleReadOnly = async () => {
    try {
      const response = await Request._GetDocumentPermission(id)
      const data = response.data
      if (data?.errCode === 403) {
        window.location.href = `/403`
        return
      }
      const permission = data.find((item: any) => item.userEmail === email)
      if (permission && permission.permission === 'VIEW') {
        if (email !== ownerEmail) {
          editor.setEditable(false)
        }
        ownerEmail = ''
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    if (!editor) return
    // 初始化后执行
    const setupVideoResizing = () => {
      const editorElement = document.querySelector('.ProseMirror')

      if (!editorElement) return

      editorElement.addEventListener('mousedown', (e: any) => {
        const handle = (e.target as HTMLElement).closest('.resize-handle')
        if (!handle) return

        e.preventDefault()
        const container = handle.closest(
          '.resizable-video-container'
        ) as HTMLElement
        if (!container) return

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = parseInt(container.style.width)
        const aspectRatio = container.dataset.aspectRatio?.split('/') || [16, 9]
        // 确保传入 parseInt 的参数为字符串类型
        const ratio =
          parseInt(String(aspectRatio[0])) / parseInt(String(aspectRatio[1]))

        const doDrag = (moveEvent: MouseEvent) => {
          const newWidth = startWidth + (moveEvent.clientX - startX)
          container.style.width = `${newWidth}px`
          container.style.height = `${newWidth / ratio}px`
        }

        const stopDrag = () => {
          document.removeEventListener('mousemove', doDrag)
          document.removeEventListener('mouseup', stopDrag)
        }

        document.addEventListener('mousemove', doDrag)
        document.addEventListener('mouseup', stopDrag)
      })
    }

    // 在编辑器初始化后调用
    setupVideoResizing()
    const updateHeadingLevel = () => {
      const headingLevels = [
        { level: 1, value: '1' as const },
        { level: 2, value: '2' as const },
        { level: 3, value: '3' as const },
      ]

      const matchedLevel = headingLevels.find(({ level }) =>
        editor.isActive('heading', { level })
      )
      setHeadingLevel(matchedLevel ? matchedLevel.value : 'p')
    }

    const updateListType = () => {
      const listTypes = [
        { type: 'bulletList', value: 'ul' as const },
        { type: 'orderedList', value: 'ol' as const },
      ]

      const matchedType = listTypes.find(({ type }) => editor.isActive(type))
      setListType(matchedType ? matchedType.value : 'none')
    }

    const updateAlignType = () => {
      const alignTypes = [
        { align: 'left', value: 'left' as const },
        { align: 'center', value: 'center' as const },
        { align: 'right', value: 'right' as const },
        { align: 'justify', value: 'justify' as const },
      ]

      const matchedAlign = alignTypes.find(({ align }) =>
        editor.isActive({ textAlign: align })
      )
      setAlignType(matchedAlign ? matchedAlign.value : 'left')
    }

    updateHeadingLevel()
    updateListType()
    updateAlignType()
    updateFontFamily()
    updateFontSize()

    editor.on('transaction', () => {
      updateHeadingLevel()
      updateListType()
      updateAlignType()
      updateFontFamily()
      updateFontSize()
    })

    return () => {
      editor.off('transaction', updateHeadingLevel)
      editor.off('transaction', updateListType)
      editor.off('transaction', updateAlignType)
      editor.off('transaction', updateFontFamily)
      editor.off('transaction', updateFontSize)
    }
  }, [editor])
  useEffect(() => {
    if (!editor || !headings.length) return

    const markdownEle = document.querySelector('.markdown')
    if (!markdownEle) {
      console.error('错误: 未找到 .markdown 容器')
      return
    }

    const headingElements = headings
      .map((heading) => {
        const level = heading.level
        const index = parseInt(heading.id.split('-')[2])
        const elements = markdownEle.querySelectorAll(`h${level}`)
        const element = elements[index] as HTMLElement | undefined

        if (!element) {
          console.warn(`未找到标题元素: ${heading.id}`)
          return null
        }

        return { id: heading.id, element, top: element.offsetTop }
      })
      .filter(Boolean) as { id: string; element: HTMLElement; top: number }[]

    const handleScroll = () => {
      const scrollPosition = markdownEle.scrollTop + 100
      let activeId = null

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const { id, top } = headingElements[i]
        if (top <= scrollPosition) {
          activeId = id
          break
        }
      }

      if (activeId && activeId !== activeHeadingId) {
        setActiveHeadingId(activeId)
      }
    }

    let ticking = false
    const optimizedHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    markdownEle.addEventListener('scroll', optimizedHandleScroll, {
      passive: true,
    })
    handleScroll()

    return () => {
      markdownEle.removeEventListener('scroll', optimizedHandleScroll)
    }
  }, [editor, headings, activeHeadingId])

  useEffect(() => {
    if (!editor) return

    const updateHeadings = () => {
      let nodes = editor.state.doc.content.content
      const newHeadings: Array<{
        id: string
        text: string
        level: number
        sort: number
      }> = []

      nodes.map((item: any, index: any) => {
        item.sort = index
      })

      const groupedNodes = nodes
        .filter((item: any) => item.type.name === 'heading')
        .reduce((acc: { [level: number]: any[] }, item: any) => {
          const level = item.attrs.level
          if (!acc[level]) {
            acc[level] = []
          }
          acc[level].push(item)
          return acc
        }, [])
        .filter((item: any) => item && item.length > 0)

      groupedNodes.map((node: any, index: any) => {
        node.forEach((item: any, nodeIndex: any) => {
          const id = `heading-${index + 1}-${nodeIndex}`
          newHeadings.push({
            id,
            text: item.textContent,
            level: index + 1,
            sort: item.sort,
          })
        })
      })

      setHeadings(newHeadings.sort((a, b) => a.sort - b.sort))
    }

    updateHeadings()
    editor.on('transaction', updateHeadings)

    return () => {
      editor.off('transaction', updateHeadings)
    }
  }, [editor])

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
      <Header
        docTitle={docTitle}
        isStarred={isStarred}
        lastSaved={lastSaved}
        showHistoryPanel={showHistoryPanel}
        commentsideBarOpen={commentsideBarOpen}
        findReplaceOpen={findReplaceOpen}
        onDocTitleChange={setDocTitle}
        onStarClick={() => setIsStarred(!isStarred)}
        onHistoryClick={() => setShowHistoryPanel(true)}
        onCommentClick={() => setCommentsideBarOpen(!commentsideBarOpen)}
        onFindReplaceClick={() => setFindReplaceOpen(true)}
      />
      <Main className='overflow-hidden'>
        {/* 顶部导航栏 */}
        <FindReplaceDialog
          open={findReplaceOpen}
          onOpenChange={setFindReplaceOpen}
        />

        {showHistoryPanel && (
          <HistoryPanel
            docId={id}
            currentContent={editor?.getHTML()}
            onRestore={(content) => {
              editor?.commands.setContent(content)
              setShowHistoryPanel(false)
            }}
            onClose={() => setShowHistoryPanel(false)}
          />
        )}
        <CommentsSidebar
          comments={comments}
          activeCommentId={activeCommentId}
          email={email as string}
          editor={editor}
          commentsideBarOpen={commentsideBarOpen}
          setComments={setComments}
          setActiveCommentId={setActiveCommentId}
        />
        <div className='flex h-[calc(100vh-48px)]'>
          {/* 左侧导航栏 */}
          <Sidebar
            isSidebarCollapsed={isSidebarCollapsed}
            headings={headings}
            activeHeadingId={activeHeadingId}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            scrollToHeading={scrollToHeading}
            setActiveHeadingId={setActiveHeadingId}
          />

          {/* 中间Markdown编辑器 */}
          <div className='ml-64 flex flex-1 justify-center p-4'>
            <div className='h-full w-full max-w-4xl overflow-auto p-4'>
              {editor && (
                <>
                  <BubbleMenu
                    editor={editor}
                    tippyOptions={{
                      duration: 100,
                      appendTo: 'parent',
                      interactive: true,
                      onHidden: () => true,
                    }}
                  >
                    <BubbleMenuComponent
                      editor={editor}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                      headingLevel={headingLevel}
                      listType={listType}
                      alignType={alignType}
                      indentType={indentType}
                      comments={comments}
                      setComments={setComments}
                      setCommentsideBarOpen={setCommentsideBarOpen}
                      setActiveCommentId={setActiveCommentId}
                      setShowLinkPopup={setShowLinkPopup}
                      setLinkPopupProps={setLinkPopupProps}
                    />
                  </BubbleMenu>

                  <BubbleMenu
                    editor={editor}
                    tippyOptions={{
                      duration: 100,
                      appendTo: 'parent',
                      interactive: true,
                    }}
                    shouldShow={({ editor }) => {
                      return editor.isActive('link')
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        const { state } = editor
                        const { $from } = state.selection

                        // 获取当前链接节点
                        const linkNode = $from.nodeAfter

                        if (linkNode) {
                          const text = linkNode.attrs.text || ''
                          editor
                            .chain()
                            .deleteRange(
                              $from.pos,
                              $from.pos + linkNode.nodeSize
                            )
                            .insertContent(text)
                            .run()
                        }
                      }}
                    >
                      <IconPaperclip className='h-4 w-4 text-[red]' />
                    </button>
                  </BubbleMenu>
                  <FloatingMenu
                    editor={editor}
                    tippyOptions={{
                      duration: 100,
                      appendTo: 'parent',
                      interactive: true,
                      placement: 'left-start',
                      offset: [0, -5],
                      // onHidden: () => ,
                      getReferenceClientRect: () => {
                        const { state } = editor
                        const { $from } = state.selection

                        const lineStartPos = $from.start()
                        const lineDom = editor.view.domAtPos(lineStartPos)
                          .node as HTMLElement
                        const lineRect = lineDom.getBoundingClientRect()

                        const cursorPos = editor.view.coordsAtPos(
                          state.selection.from
                        )

                        const menuHeight = 30
                        const lineCenter = lineRect.top + lineRect.height / 2
                        const menuTop = lineCenter - menuHeight / 2

                        return new DOMRect(lineRect.left - 10, menuTop, 0, 0)
                      },
                    }}
                    shouldShow={() => editor?.isEditable}
                  >
                    <div className='markdown-menu flex flex-wrap shadow-lg'>
                      <LeftSelect
                        editor={editor}
                        alignType={alignType}
                        listType={listType}
                        headingLevel={headingLevel}
                      />
                    </div>
                  </FloatingMenu>
                </>
              )}
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </Main>

      {showLinkPopup && (
        <div
          className='fixed inset-0 z-10000 flex items-center justify-center bg-black/50'
          onClick={() => setShowLinkPopup(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <LinkPopup {...linkPopupProps} compact />
          </div>
        </div>
      )}
    </>
  )
}
