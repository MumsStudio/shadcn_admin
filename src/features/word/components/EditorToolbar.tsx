import { useContext, useEffect, useRef, useState } from 'react'
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconTextSize,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconIndentIncrease,
  IconIndentDecrease,
  IconTypography,
  IconBackground,
  IconPaperclip,
} from '@tabler/icons-react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react'
import { MessageSquareText } from 'lucide-react'
import { LeftSelect } from '@/components/left-select'
import { SimpleSelect } from '@/components/simple-select'
// import SimpleSelect from '@/components/simple-select'
import { useEditorContext } from '../EditorContext'

const EditorToolbar = () => {
  const { editor,comments,setActiveCommentId,setComments,commentsSectionRef,commentsideBarOpen,setCommentsideBarOpen,activeCommentId } = useEditorContext()
  const [fontSize, setFontSize] = useState('14px')
  const [fontFamily, setFontFamily] = useState('Inter')
  const [headingLevel, setHeadingLevel] = useState<'p' | '1' | '2' | '3'>('p')
  const [listType, setListType] = useState<'none' | 'ul' | 'ol'>('none')
  const [alignType, setAlignType] = useState<
    'left' | 'center' | 'right' | 'justify'
  >('left')
  const [indentType, setIndentType] = useState<'increase' | 'decrease'>(
    'increase'
  )
  const [showLinkPopup, setShowLinkPopup] = useState(false)
  const [linkPopupProps, setLinkPopupProps] = useState<any>({})

  // const [comments, setComments] = useContext<any[]>([])
  // const [commentsideBarOpen, setCommentsideBarOpen] = useState(false)

  // const [activeCommentId, setActiveCommentId] = useState<string | null>(null)

  // const commentsSectionRef = useRef<HTMLDivElement | null>(null)

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

  if (!editor) return null

  const updateFontSize = () => {
    const currentFontSize = editor.getAttributes('textStyle').fontSize
    setFontSize(currentFontSize || '14px')
  }

  const updateFontFamily = () => {
    const currentFontFamily = editor.getAttributes('textStyle').fontFamily
    setFontFamily(currentFontFamily || 'Inter')
  }

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

  // 设置编辑器事务监听
  useEffect(() => {
    if (!editor) return

    const onTransaction = () => {
      updateHeadingLevel()
      updateListType()
      updateAlignType()
      updateFontFamily()
      updateFontSize()
    }

    editor.on('transaction', onTransaction)

    return () => {
      editor.off('transaction', onTransaction)
    }
  }, [editor])

  return (
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
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
          >
            <IconBold className='h-4 w-4' />
          </button>
          <button
            className='rounded-md bg-white/10 px-2.5 py-1.5 font-semibold hover:bg-white/20'
            onClick={() => {
              const newComment = {
                id: `${Date.now()}`,
                content: '',
                replies: [],
                createdAt: new Date(),
              }
              setCommentsideBarOpen(true)
              setComments([...comments, newComment])
              editor.commands.setComment(newComment.id)
              setActiveCommentId(newComment.id)
            }}
          >
            <MessageSquareText className='h-4 w-4' />
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
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
          >
            <IconItalic className='h-4 w-4' />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
          >
            <IconStrikethrough className='h-4 w-4' />
          </button>
          <button
            title='下划线 (Ctrl+U)'
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
          >
            <IconUnderline className='h-4 w-4' />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`rounded p-1 hover:bg-gray-300 ${editor.isActive('code') ? 'bg-gray-300' : ''}`}
          >
            &lt;&gt;
          </button>
          <SimpleSelect
            value={headingLevel}
            onValueChange={(value) => {
              const level = parseInt(value)
              if (level) {
                editor.chain().focus().toggleHeading({ level }).run()
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
              setAlignType(value as 'left' | 'center' | 'right' | 'justify')
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
                  .setColor((event.target as HTMLInputElement).value)
                  .run()
              }
              value={editor?.getAttributes('textStyle').color || '#000000'}
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

      <FloatingMenu
        editor={editor}
        tippyOptions={{
          duration: 100,
          appendTo: 'parent',
          interactive: true,
          placement: 'left-start',
          offset: [0, -5],
          onHidden: () => !editor?.isEditable,
          getReferenceClientRect: () => {
            const { state } = editor
            const { $from } = state.selection

            const lineStartPos = $from.start()
            const lineDom = editor.view.domAtPos(lineStartPos)
              .node as HTMLElement
            const lineRect = lineDom.getBoundingClientRect()

            const cursorPos = editor.view.coordsAtPos(state.selection.from)

            const menuHeight = 30
            const lineCenter = lineRect.top + lineRect.height / 2
            const menuTop = lineCenter - menuHeight / 2

            return new DOMRect(lineRect.left - 10, menuTop, 0, 0)
          },
        }}
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
  )
}

export default EditorToolbar
