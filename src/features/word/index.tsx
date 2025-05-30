import { useState, useEffect, useCallback } from 'react';
import { IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustified, IconTextSize, IconH1, IconH2, IconH3, IconItalic, IconBackground, IconBold, IconStrikethrough, IconUnderline, IconList, IconListNumbers, IconTypography, IconHorse, IconStar, IconShare, IconMenu, IconUser, IconHistory, IconEye, IconComet, IconPaperclip, IconTrash, IconIndentIncrease, IconIndentDecrease, IconLayoutSidebarRightCollapse, IconLayoutSidebarRightExpand } from '@tabler/icons-react';
import { Route } from '@/routes/word/detail.$id';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Indent } from '@weiruo/tiptap-extension-indent';
import { Markdown } from 'tiptap-markdown';
import debounce from '@/utils/debounce';
import { Main } from '@/components/layout/main';
import { LeftSelect } from '@/components/left-select';
import { LinkPopup } from '@/components/link-popup';
import { SimpleSelect } from '@/components/simple-select';
import { ListBox } from './components/CardCommand';
import { HistoryPanel } from './components/HistoryPanel';
import { Link } from './components/LinkCommand';
import { Board } from './components/board';
import { Video } from './components/video';
import Request from './request';


export default function Word() {
  const { id } = Route.useParams()
  // 获取文档详情
  const getDocumentDetail = async () => {
    Request._GetDocumentDetail(id).then((res: any) => {
      if (res) {
        const data = res.data
        setDocTitle(data.name || '未命名文档')
        setLastSaved(
          data?.lastEditedAt ? formatLastEditedTime(data.lastEditedAt) : '刚刚'
        )
        editor?.commands.setContent(data.content || '')
      }
    })
  }
  const cards = localStorage.getItem('cards')
  const parsedCards = cards ? JSON.parse(cards) : {}
  // 保存文档
  const saveDocument = async () => {
    const updateContent = {
      content,
      // ...parsedCards,
    }
    Request._UpdateDocumentDetail(id, { content }).then(
      (res: any) => {
        if (res) {
          console.log(res, 'res')
          setLastSaved('刚刚')
        }
      }
    )
  }

  useEffect(() => {
    getDocumentDetail()
  }, [])

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
  useEffect(() => {
    if (!content) return
    console.log(cards, 'cards')
    const debouncedSaveDocument = debounce(saveDocument, 800)
    debouncedSaveDocument()
  }, [content, cards])

  const formatLastEditedTime = (timestamp: string) => {
    const now = new Date()
    const editedTime = new Date(timestamp)
    const diffInMs = now.getTime() - editedTime.getTime()
    const diffInSec = Math.floor(diffInMs / 1000)
    const diffInMin = Math.floor(diffInSec / 60)
    const diffInHrs = Math.floor(diffInMin / 60)
    const diffInDays = Math.floor(diffInHrs / 24)

    if (diffInDays > 0) {
      return editedTime.toLocaleString()
    } else if (diffInHrs > 0) {
      return `${diffInHrs}小时前`
    } else if (diffInMin > 0) {
      return `${diffInMin}分钟前`
    } else {
      return `${diffInSec}秒前`
    }
  }

  const editor: any = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      Color,
      Image,
      TaskList,
      TaskItem,
      ListBox,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Indent.configure({
        types: ['listItem', 'paragraph'],
        minLevel: 0,
        maxLevel: 1,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Video,
      Board,
      Link,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      FontSize,
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
        linkify: false,
        breaks: false,
        transformPastedText: false,
        transformCopiedText: false,
      }),
    ],
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
          if (event.key === '#' && event.code.startsWith('Digit')) {
            const num = parseInt(event.code.replace('Digit', ''))
            if (num >= 1 && num <= 6) {
              const { state } = view
              const { from } = state.selection

              if (state.doc.textBetween(from - 1, from) === ' ') {
                const tr = state.tr.replaceSelectionWith(
                  editor.schema.nodes.heading.create(
                    { level: num },
                    editor.schema.text(' ')
                  )
                )
                view.dispatch(tr)
                editor.commands.focus()
                setContent(editor.getHTML())
                return true
              }
            }
          }
          return false
        },
      },
      handleKeyDown: (view, event) => {
        if (event.ctrlKey || event.metaKey) {
          switch (event.key.toLowerCase()) {
            case 'b':
              editor?.chain().focus().toggleBold().run()
              return true
            case 'i':
              editor?.chain().focus().toggleItalic().run()
              return true
            case 'u':
              editor?.chain().focus().toggleUnderline().run()
              return true
            case '1':
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
              return true
            case '2':
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
              return true
            case '3':
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
              return true
            case 'l':
              if (event.shiftKey) {
                editor?.chain().focus().setTextAlign('left').run()
              } else {
                editor?.chain().focus().toggleBulletList().run()
              }
              return true
            case 'e':
              if (event.shiftKey) {
                editor?.chain().focus().setTextAlign('center').run()
              } else {
                editor?.chain().focus().toggleCode().run()
              }
              return true
            case 'r':
              if (event.shiftKey) {
                editor?.chain().focus().setTextAlign('right').run()
              }
              return true
            case 'j':
              if (event.shiftKey) {
                editor?.chain().focus().setTextAlign('justify').run()
              }
              return true
          }
        }
        return false
      },
    },
  })

  const [headingLevel, setHeadingLevel] = useState<'p' | '1' | '2' | '3'>('p')
  const [listType, setListType] = useState<'none' | 'ul' | 'ol'>('none')
  const [alignType, setAlignType] = useState<
    'left' | 'center' | 'right' | 'justify'
  >('left')
  const [fontSize, setFontSize] = useState<string>('14px')
  const [fontFamily, setfontFamily] = useState<string>('Inter')

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
      if (editor.isActive('heading', { level: 1 })) {
        setHeadingLevel('1')
      } else if (editor.isActive('heading', { level: 2 })) {
        setHeadingLevel('2')
      } else if (editor.isActive('heading', { level: 3 })) {
        setHeadingLevel('3')
      } else {
        setHeadingLevel('p')
      }
    }

    const updateListType = () => {
      if (editor.isActive('bulletList')) {
        setListType('ul')
      } else if (editor.isActive('orderedList')) {
        setListType('ol')
      } else {
        setListType('none')
      }
    }

    const updateAlignType = () => {
      if (editor.isActive({ textAlign: 'left' })) {
        setAlignType('left')
      } else if (editor.isActive({ textAlign: 'center' })) {
        setAlignType('center')
      } else if (editor.isActive({ textAlign: 'right' })) {
        setAlignType('right')
      } else if (editor.isActive({ textAlign: 'justify' })) {
        setAlignType('justify')
      }
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

  const [headings, setHeadings] = useState<
    Array<{ id: string; text: string; level: number }>
  >([])
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)

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
      <Main className='overflow-hidden'>
        {/* 顶部导航栏 */}
        <div className='sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 text-[2rem]'>
          <div className='flex items-center space-x-4'>
            {/* <button className='flex items-center space-x-1 rounded p-1 hover:bg-gray-100'>
              <IconMenu className='h-5 w-5 text-gray-500' />
              <span className='text-sm font-medium'>文档</span>
            </button> */}

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

        <div className='flex h-[calc(100vh-48px)]'>
          {/* 左侧导航栏 */}
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
                    <div className='markdown-menu flex min-w-[400px] flex-wrap gap-1 rounded-md border p-1 shadow-lg ring-1 ring-black/5'>
                      <button
                        title='加粗 (Ctrl+B)'
                        onClick={() =>
                          editor.chain().focus().toggleBold().run()
                        }
                        className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
                      >
                        <IconBold className='h-4 w-4' />
                      </button>
                      <button
                        title='超链接 (Ctrl+K)'
                        onClick={() => {
                          const selectedText =
                            editor.state.selection.content().content.firstChild
                              ?.textContent || ''
                          if (!selectedText) return

                          setShowLinkPopup(true)
                          setLinkPopupProps({
                            selectedText,
                            onInsert: (text: any, url: any) => {
                              editor?.commands.setLink({
                                href: url,
                                text: selectedText,
                              })
                            },
                            onClose: () => setShowLinkPopup(false),
                          })
                        }}
                        className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
                      >
                        <IconPaperclip className='h-4 w-4' />
                      </button>
                      <SimpleSelect
                        value={fontSize}
                        onValueChange={(value) => {
                          editor.chain().focus().setFontSize(value).run()
                        }}
                        items={[
                          { label: '12px', value: '12px' },
                          { label: '16px', value: '16px' },
                          { label: '20px', value: '20px' },
                          { label: '24px', value: '24px' },
                        ]}
                        className='font-size-select rounded bg-transparent p-1 hover:bg-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none'
                      />
                      <SimpleSelect
                        value={fontFamily}
                        onValueChange={(value) => {
                          editor.chain().focus().setFontFamily(value).run()
                        }}
                        items={[
                          { label: '宋体', value: 'SimSun' },
                          { label: '黑体', value: 'SimHei' },
                          { label: '微软雅黑', value: 'Microsoft YaHei' },
                          { label: '楷体', value: 'KaiTi' },
                          { label: 'Inter', value: 'Inter' },
                          { label: 'Manrope', value: 'Manrope' },
                        ]}
                        className='font-family-select rounded bg-transparent p-1 hover:bg-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none'
                      />
                      <button
                        title='斜体 (Ctrl+I)'
                        onClick={() =>
                          editor.chain().focus().toggleItalic().run()
                        }
                        className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
                      >
                        <IconItalic className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleStrike().run()
                        }
                        className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
                      >
                        <IconStrikethrough className='h-4 w-4' />
                      </button>
                      <button
                        title='下划线 (Ctrl+U)'
                        onClick={() =>
                          editor.chain().focus().toggleUnderline().run()
                        }
                        className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
                      >
                        <IconUnderline className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleCode().run()
                        }
                        className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('code') ? 'bg-gray-300' : ''}`}
                      >
                        &lt;&gt;
                      </button>
                      <SimpleSelect
                        value={headingLevel}
                        onValueChange={(value) => {
                          const level = parseInt(value)
                          if (level) {
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level })
                              .run()
                          } else {
                            editor.chain().focus().setParagraph().run()
                          }
                        }}
                        items={[
                          {
                            label: '正文',
                            value: 'p',
                            icon: <IconTextSize className='h-4 w-4' />,
                          },
                          {
                            label: 'H1',
                            value: '1',
                            icon: <IconH1 className='h-4 w-4' />,
                          },
                          {
                            label: 'H2',
                            value: '2',
                            icon: <IconH2 className='h-4 w-4' />,
                          },
                          {
                            label: 'H3',
                            value: '3',
                            icon: <IconH3 className='h-4 w-4' />,
                          },
                        ]}
                        className='heading-select rounded bg-transparent p-1 hover:bg-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none'
                      />
                      <SimpleSelect
                        value={listType}
                        onValueChange={(value) => {
                          if (value === 'ul') {
                            editor.chain().focus().toggleBulletList().run()
                          } else if (value === 'ol') {
                            editor.chain().focus().toggleOrderedList().run()
                          } else if (value === 'none') {
                            editor.chain().focus().liftListItem().run()
                          }
                        }}
                        items={[
                          { label: '无', value: 'none' },
                          {
                            label: '无序列表',
                            value: 'ul',
                            icon: <IconList className='h-4 w-4' />,
                          },
                          {
                            label: '有序列表',
                            value: 'ol',
                            icon: <IconListNumbers className='h-4 w-4' />,
                          },
                        ]}
                        className='list-select rounded bg-transparent p-1 hover:bg-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none'
                      />
                      <SimpleSelect
                        value={alignType}
                        onValueChange={(value) => {
                          editor.chain().focus().setTextAlign(value).run()
                          setAlignType(
                            value as 'left' | 'center' | 'right' | 'justify'
                          )
                        }}
                        items={[
                          {
                            label: '左对齐',
                            value: 'left',
                            icon: <IconAlignLeft className='h-4 w-4' />,
                          },
                          {
                            label: '居中',
                            value: 'center',
                            icon: <IconAlignCenter className='h-4 w-4' />,
                          },
                          {
                            label: '右对齐',
                            value: 'right',
                            icon: <IconAlignRight className='h-4 w-4' />,
                          },
                          {
                            label: '两端对齐',
                            value: 'justify',
                            icon: <IconAlignJustified className='h-4 w-4' />,
                          },
                        ]}
                        className='align-select rounded bg-transparent p-1 hover:bg-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none'
                      />
                      <SimpleSelect
                        value={indentType}
                        onValueChange={(value) => {
                          if (value === 'increase') {
                            console.log('increase')
                            editor.chain().focus().indent().run()
                          } else {
                            editor.chain().focus().outdent().run()
                          }
                        }}
                        items={[
                          {
                            label: '增加缩进',
                            value: 'increase',
                            icon: <IconIndentIncrease className='h-4 w-4' />,
                          },
                          {
                            label: '减少缩进',
                            value: 'decrease',
                            icon: <IconIndentDecrease className='h-4 w-4' />,
                          },
                        ]}
                        className='indent-select rounded bg-transparent p-1 hover:bg-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none'
                      />
                      <div className='flex items-center space-x-1 border-l border-gray-200 pl-2'>
                        <IconTypography className='h-4 w-4 text-gray-500' />
                        <input
                          type='color'
                          onInput={(event) =>
                            editor
                              .chain()
                              .focus()
                              .setColor(
                                (event.target as HTMLInputElement).value
                              )
                              .run()
                          }
                          value={
                            editor?.getAttributes('textStyle').color ||
                            '#000000'
                          }
                          className='h-6 w-6 rounded border border-gray-300 hover:bg-gray-300'
                          data-testid='setColor'
                        />
                        <IconBackground className='h-4 w-4 text-gray-500' />
                        <input
                          type='color'
                          onInput={(event) =>
                            editor
                              .chain()
                              .focus()
                              .setHighlight({
                                color: (event.target as HTMLInputElement).value,
                              })
                              .run()
                          }
                          value={editor?.getAttributes('highlight').color}
                          className='h-6 w-6 rounded border border-gray-300 hover:bg-gray-300'
                          data-testid='setHighlightColor'
                        />
                      </div>
                    </div>
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
                      onHidden: () => false,
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
                    shouldShow={() => true}
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