import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import {
  IconChevronDown,
  IconCheck,
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
  IconTypography,
  IconBackground,
  IconBold,
  IconItalic,
  IconUnderline,
  IconAdjustmentsHorizontal,
  IconCut,
  IconCopy,
  IconTrash,
  IconShare,
  IconBraille,
  IconListCheck,
  IconTable,
  IconPhoto,
  IconVideo,
  IconPaperclip,
  IconH4,
  IconH5,
  IconH6,
  IconClipboard,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import debounce from '@/utils/debounce'

type Item = {
  label: string
  value: string
  icon?: React.ReactNode
}

type LeftSelectProps = {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  items?: Item[]
  className?: string
  alignType?: 'left' | 'center' | 'right' | 'justify'
  listType?: 'none' | 'ul' | 'ol'
  headingLevel?: 'p' | '1' | '2' | '3'
}

export function LeftSelect({
  defaultValue,
  value,
  onValueChange,
  items,
  className,
  alignType,
  listType,
  headingLevel,
  editor,
}: LeftSelectProps & { editor: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || defaultValue)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])
  const dropdownRef = useRef<HTMLDivElement>(null)
  let closeTimeout: NodeJS.Timeout | null = null

  const handleMouseEnter = debounce(() => {
    setIsHovering(true)

    // 检测菜单是否超出视图底部
    setTimeout(() => {
      const menu = document.querySelector('.floating-menu') as HTMLElement
      if (menu) {
        const menuheight = menu?.getBoundingClientRect().height || 0
        const rect = menu.getBoundingClientRect()
        const windowHeight = window.innerHeight
        if (rect.top + menuheight > windowHeight) {
          menu.style.top = `50%`
          menu.style.transform = 'translateY(-50%)'
        } else if (rect.top < 50) {
          menu.style.top = '220px'
          menu.style.transform = 'translateY(-50%)'
          menu.style.height = `${menuheight}px`
        }
      }
    }, 10)
    if (closeTimeout) clearTimeout(closeTimeout)
  }, 100)

  const handleMouseLeave = (e: React.MouseEvent) => {
    const currentTarget = e.currentTarget as HTMLElement
    const relatedTarget = e.relatedTarget as HTMLElement

    if (!currentTarget.contains(relatedTarget)) {
      closeTimeout = setTimeout(() => {
        setIsHovering(false)
      }, 300)
    }
  }

  useEffect(() => {
    return () => {
      if (closeTimeout) clearTimeout(closeTimeout)
    }
  }, [])
  const formatButtons = [
    {
      onClick: () => editor?.chain().focus().toggleBold().run(),
      isActive: editor?.isActive('bold'),
      title: '加粗 (Ctrl+B)',
      icon: <IconBold className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleItalic().run(),
      isActive: editor?.isActive('italic'),
      title: '斜体 (Ctrl+I)',
      icon: <IconItalic className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleUnderline().run(),
      isActive: editor?.isActive('underline'),
      title: '下划线 (Ctrl+U)',
      icon: <IconUnderline className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleStrike().run(),
      isActive: editor?.isActive('strike'),
      title: '删除线',
      icon: <IconStrikethrough className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleCode().run(),
      isActive: editor?.isActive('code'),
      title: '代码',
      icon: <>&lt;&gt;</>,
    },
    {
      onClick: () => editor?.chain().focus().setParagraph().run(),
      isActive: editor?.isActive('paragraph'),
      title: '正文',
      icon: <IconTextSize className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor?.isActive('heading', { level: 1 }),
      title: '标题1',
      icon: <IconH1 className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor?.isActive('heading', { level: 2 }),
      title: '标题2',
      icon: <IconH2 className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor?.isActive('heading', { level: 3 }),
      title: '标题3',
      icon: <IconH3 className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleHeading({ level: 4 }).run(),
      isActive: editor?.isActive('heading', { level: 4 }),
      title: '标题4',
      icon: <IconH4 className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleHeading({ level: 5 }).run(),
      isActive: editor?.isActive('heading', { level: 5 }),
      title: '标题5',
      icon: <IconH5 className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleHeading({ level: 6 }).run(),
      isActive: editor?.isActive('heading', { level: 6 }),
      title: '标题6',
      icon: <IconH6 className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: editor?.isActive('bulletList'),
      title: '无序列表',
      icon: <IconList className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: editor?.isActive('orderedList'),
      title: '有序列表',
      icon: <IconListNumbers className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().toggleTaskList().run(),
      isActive: editor?.isActive('taskList'),
      title: '任务列表',
      icon: <IconListCheck className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().setTextAlign('left').run(),
      isActive: editor?.isActive({ textAlign: 'left' }),
      title: '左对齐',
      icon: <IconAlignLeft className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().setTextAlign('center').run(),
      isActive: editor?.isActive({ textAlign: 'center' }),
      title: '居中对齐',
      icon: <IconAlignCenter className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().setTextAlign('right').run(),
      isActive: editor?.isActive({ textAlign: 'right' }),
      title: '右对齐',
      icon: <IconAlignRight className='h-4 w-4' />,
    },
    {
      onClick: () => editor?.chain().focus().setTextAlign('justify').run(),
      isActive: editor?.isActive({ textAlign: 'justify' }),
      title: '两端对齐',
      icon: <IconAlignJustified className='h-4 w-4' />,
    },
  ]
  const optionButtons = [
    {
      action: () => {
        const handleInsert = (rows: number, cols: number) => {
          editor
            ?.chain()
            .focus()
            .insertTable({ rows, cols, withHeaderRow: false })
            .run()
        }

        const tableMenu = document.createElement('div')
        tableMenu.className = 'absolute z-50 bg-white p-2 rounded shadow-lg'

        import('@/components/table-drawer').then(({ TableDrawer }) => {
          const root = ReactDOM.createRoot(tableMenu)
          root.render(
            <TableDrawer
              onInsert={handleInsert}
              onClose={() => document.body.removeChild(tableMenu)}
              compact={true}
            />
          )
        })

        const rect = dropdownRef.current?.getBoundingClientRect()
        if (rect) {
          tableMenu.style.top = `${rect.bottom + 5}px`
          tableMenu.style.left = `${rect.left}px`
        }

        document.body.appendChild(tableMenu)
      },
      title: '插入表格',
      icon: <IconTable className='mx-2 h-4 w-4' />,
    },
    {
      icon: <IconCut className='mx-2 h-4 w-4' />,
      title: '剪切',
      action: () => {
        if (editor && editor.view) {
          let { from, to } = editor.view.state.selection
          if (from === to) {
            // 获取当前行范围
            const pos = editor.view.state.selection.$head
            from = pos.start()
            to = pos.end()
          }
          editor.commands.deleteRange({ from, to })
        }
      },
    },
    {
      icon: <IconCopy className='mx-2 h-4 w-4' />,
      title: '复制',
      action: () => {
        if (editor && editor.view) {
          let { from, to } = editor.view.state.selection
          if (from === to) {
            // 获取当前行范围
            const pos = editor.view.state.selection.$head
            from = pos.start()
            to = pos.end()
          }
          const text = editor.view.state.doc.textBetween(from, to)
          navigator.clipboard.writeText(text)
        }
      },
    },
    {
      icon: <IconClipboard className='mx-2 h-4 w-4' />,
      title: '粘贴',
      action: async () => {
        if (editor && editor.view) {
          try {
            const text = await navigator.clipboard.readText()
            editor.commands.insertContent(text)
          } catch (err) {
            console.error('Failed to read clipboard contents: ', err)
          }
        }
      },
    },
    {
      icon: <IconTrash className='mx-2 h-4 w-4' />,
      title: '删除',
      action: () => {
        if (editor && editor.view) {
          let { from, to } = editor.view.state.selection
          if (from === to) {
            // 获取当前行范围
            const pos = editor.view.state.selection.$head
            from = pos.start()
            to = pos.end()
          }
          editor?.chain().focus().deleteRange({ from, to }).run()
        }
      },
    },
    {
      icon: <IconShare className='mx-2 h-4 w-4' />,
      title: '分享',
      action: () => {
        if (editor && editor.view) {
          let { from, to } = editor.view.state.selection
          if (from === to) {
            // 获取当前行范围
            const pos = editor.view.state.selection.$head
            from = pos.start()
            to = pos.end()
          }
          const text = editor.view.state.doc.textBetween(from, to)
          alert(`分享内容: ${text}`)
        }
      },
    },
    {
      icon: <IconPhoto className='mx-2 h-4 w-4' />,
      title: '插入图片',
      action: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const imageUrl = event.target?.result as string
              editor?.chain().focus().setImage({ src: imageUrl }).run()
            }
            reader.readAsDataURL(file)
          }
        }
        input.click()
      },
    },
    {
      icon: <IconVideo className='mx-2 h-4 w-4' />,
      title: '插入视频',
      action: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'video/*'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const videoUrl = URL.createObjectURL(file)
            editor?.commands.setVideo({
              src: videoUrl,
              width: '500px',
              aspectRatio: '16/9',
            })
          }
        }
        input.click()
      },
    },
    {
      icon: <IconPhoto className='mx-2 h-4 w-4' />,
      title: '插入画板',
      action: () => {
        editor?.commands.setBoard({
          width: '500px',
          aspectRatio: '16/9',
        })
      },
    },
    {
      icon: <IconPaperclip className='mx-2 h-4 w-4' />,
      title: '插入链接',
      action: () => {
        const linkMenu = document.createElement('div')
        linkMenu.className = 'absolute z-50 bg-white p-2 rounded shadow-lg'

        import('@/components/link-drawer').then(({ LinkDrawer }) => {
          const root = ReactDOM.createRoot(linkMenu)
          root.render(
            <LinkDrawer
              onInsert={(text, url) =>
                editor?.commands.setLink({ href: url, text: text || url })
              }
              onClose={() => document.body.removeChild(linkMenu)}
              compact={true}
            />
          )
        })

        const rect = dropdownRef.current?.getBoundingClientRect()
        if (rect) {
          linkMenu.style.top = `${rect.bottom + 5}px`
          linkMenu.style.left = `${rect.left}px`
        }

        document.body.appendChild(linkMenu)
      },
    },
  ]
  return (
    <div
      className='relative'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={dropdownRef}
    >
      <div className='relative flex w-full flex-col items-start gap-1'>
        {isHovering && (
          <div className='markdown-menu floating-menu absolute top-1/2 right-[40px] flex w-[250px] -translate-y-1/2 transform flex-wrap gap-1 rounded border p-1'>
            {formatButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className={`rounded p-2 hover:bg-gray-300 ${button.isActive ? 'bg-gray-300' : ''}`}
                title={button.title}
              >
                {button.icon}
              </button>
            ))}

            {/* Color pickers */}
            <div className='flex items-center rounded p-2 hover:bg-gray-300'>
              <input
                type='color'
                onInput={(event) =>
                  editor
                    ?.chain()
                    .focus()
                    .setColor((event.target as HTMLInputElement).value)
                    .run()
                }
                value={editor?.getAttributes('textStyle').color || '#000000'}
                className='h-6 w-6 rounded border border-gray-300'
                data-testid='setColor'
                title='文字颜色'
              />
            </div>
            <div className='flex items-center rounded p-2 hover:bg-gray-300'>
              <input
                type='color'
                onInput={(event) =>
                  editor
                    ?.chain()
                    .focus()
                    .setHighlight({
                      color: (event.target as HTMLInputElement).value,
                    })
                    .run()
                }
                value={editor?.getAttributes('highlight').color || '#ffffff'}
                className='h-6 w-6 rounded border border-gray-300'
                data-testid='setHighlightColor'
                title='背景颜色'
              />
            </div>

            {/* Clipboard operations - now in a single row */}
            <div className='w-full'>
              {optionButtons.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className='flex w-full flex-1 items-center gap-1 rounded p-2 hover:bg-gray-300'
                  title={item.title}
                >
                  {item.icon}
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main select button */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          // 在这个上下文中，`ring` 通常是 CSS 框架（如 Tailwind CSS）里用于添加边框环效果的类名前缀。
          // `ring-ring` 可能是自定义的类，用于指定边框环的颜色；`ring-1`、`ring-2` 则指定边框环的宽度。
          // 当元素获得焦点或者处于特定状态时，会显示这些边框环，起到视觉反馈的作用。
          className={cn(
            'flex items-center text-sm transition-colors',
            'rounded border p-1 hover:bg-gray-100 focus:outline-none'
          )}
        >
          {headingLevel === 'p' ? (
            <IconTextSize className='h-5 w-5 text-blue-500' />
          ) : headingLevel === '1' ? (
            <IconH1 className='h-5 w-5 text-blue-500' />
          ) : headingLevel === '2' ? (
            <IconH2 className='h-5 w-5 text-blue-500' />
          ) : headingLevel === '3' ? (
            <IconH3 className='h-5 w-5 text-blue-500' />
          ) : (
            <IconTextSize className='h-5 w-5 text-blue-500' />
          )}
          <span
            className={`transition-transform duration-200 ${isHovering ? '' : ''}`}
          >
            <IconBraille className='h-3 w-3 text-gray-800' />
          </span>
        </div>
      </div>
    </div>
  )
}
