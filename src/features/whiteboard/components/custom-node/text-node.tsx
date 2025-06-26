import { useState, useRef, useEffect, forwardRef, JSX } from 'react'
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconTrashX,
  IconUnderline,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconIndentIncrease,
  IconIndentDecrease,
  IconLink,
  IconListCheck,
  IconTypography,
  IconBackground,
} from '@tabler/icons-react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import ContentEditable from 'react-contenteditable'
import { LinkPopup } from '@/components/link-popup'
import { SimpleSelect } from '@/components/simple-select'

// 类型定义
type TextStyle = {
  fontSize: string
  color: string
  fontWeight: string
  fontStyle: string
  textDecoration: string
  fontFamily: string
  backgroundColor: string
  textAlign: string
}

type TextNodeData = {
  text?: string
  style?: Partial<TextStyle>
  onTextChange?: (id: string, text: string, style: TextStyle) => void
  id: string
  type: string
  data: any
  position: any
}

// 默认文本样式
const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: '16px',
  color: '#333',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  fontFamily: 'Inter',
  backgroundColor: 'transparent',
  textAlign: 'left',
}

// 自定义 hook 管理编辑状态
const useEditState = (
  initialText: string,
  initialStyle: Partial<TextStyle>,
  onSave?: (text: string, style: TextStyle) => void
) => {
  const [html, setHtml] = useState(initialText)
  const [style, setStyle] = useState<TextStyle>({
    ...DEFAULT_TEXT_STYLE,
    ...initialStyle,
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleHtmlChange = (evt: { target: { value: string } }) => {
    setHtml(evt.target.value)
  }

  const saveChanges = () => {
    setIsEditing(false)
    onSave?.(html, style)
  }

  return {
    html,
    style,
    isEditing,
    setHtml,
    setStyle,
    setIsEditing,
    handleHtmlChange,
    saveChanges,
  }
}

// 工具栏组件
interface TextToolbarProps {
  onCommand: (command: string, value?: string) => void
}

const TextToolbar = forwardRef<HTMLDivElement, TextToolbarProps>(
  ({ onCommand }, ref): JSX.Element => {
    const [currentStyles, setCurrentStyles] = useState({
      fontSize: '16px',
      bold: false,
      italic: false,
      underline: false,
      fontFamily: 'Inter',
      backgroundColor: 'transparent',
      listType: '', // 'ordered', 'unordered', or 'checklist'
      textAlign: 'left',
      hasLink: false,
    })

    const updateStyles = () => {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const parentElement = range.commonAncestorContainer.parentElement
        const blockElement =
          parentElement?.closest('div,p,h1,h2,h3,h4,h5,h6,li') || parentElement

        // Check if selection is inside a list
        let listType = ''
        if (parentElement?.closest('ol')) listType = 'ordered'
        if (parentElement?.closest('ul')) {
          if (parentElement?.closest('ul[data-type="taskList"]')) {
            listType = 'checklist'
          } else {
            listType = 'unordered'
          }
        }

        // Check if selection is inside a link
        const hasLink = !!parentElement?.closest('a')

        setCurrentStyles({
          fontSize: document.queryCommandValue('fontSize') || '16px',
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          fontFamily: document.queryCommandValue('fontName') || 'Inter',
          backgroundColor:
            parentElement?.style.backgroundColor || 'transparent',
          listType,
          textAlign: parentElement?.style.textAlign || 'left',
          hasLink,
        })
      }
    }

    useEffect(() => {
      document.addEventListener('selectionchange', updateStyles)
      return () => {
        document.removeEventListener('selectionchange', updateStyles)
      }
    }, [])

    const fontFamilies = [
      { label: '宋体', value: 'SimSun' },
      { label: '黑体', value: 'SimHei' },
      { label: '微软雅黑', value: 'Microsoft YaHei' },
      { label: '楷体', value: 'KaiTi' },
      { label: 'Inter', value: 'Inter' },
      { label: 'Manrope', value: 'Manrope' },
    ]

    const [showLinkPopup, setShowLinkPopup] = useState(false)
    const [saveurl, setSaveurl] = useState('')
    const [savedSelection, setSavedSelection] = useState<Range | null>(null)

    const handleCreateLink = () => {
      if (currentStyles.hasLink) {
        onCommand('unlink')
        return
      }

      // 保存当前选中的范围
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        setSavedSelection(selection.getRangeAt(0).cloneRange())
      }

      setShowLinkPopup(true)
    }

    const handleLinkSubmit = (text: string, url: string) => {
      setShowLinkPopup(false)
      onCommand('createLink', url)
    }

    return (
      <>
        <div
          ref={ref}
          className='text-toolbar z-100 flex gap-2 rounded-lg border border-gray-100 bg-white p-1 shadow-lg px-2'
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '90vw',
          }}
        >
          {/* First Row */}
          <div className='flex items-center gap-2'>
            {/* Font controls */}
            <div className='flex items-center gap-1'>
              <SimpleSelect
                items={[
                  '12px',
                  '14px',
                  '16px',
                  '18px',
                  '20px',
                  '24px',
                  '32px',
                ].map((size) => ({
                  label: size,
                  value: size,
                }))}
                onValueChange={(value) => onCommand('fontSize', value)}
                value={currentStyles.fontSize}
                className='w-[40px] text-[10px] px-0 h-[24px] border-none'
                itemClassName='text-[12px] w-[80px]'
              />

              <SimpleSelect
                items={fontFamilies}
                onValueChange={(value) => onCommand('fontName', value)}
                value={currentStyles.fontFamily}
                className='w-[40px] text-[10px] px-0  h-[24px] border-none'
                itemClassName='text-[12px] w-[90px]'
              />
            </div>

            {/* Color pickers */}
            <div className='flex items-center gap-1 border-gray-200 pl-1'>
              <div className='flex items-center gap-1'>
                <label className='flex items-center gap-1 text-xs text-gray-500'>
                   <IconTypography size={12} />
                  <input
                    type='color'
                    onChange={(e) => onCommand('foreColor', e.target.value)}
                    className='h-5 w-5 cursor-pointer rounded border border-gray-300'
                    title='Text color'
                  />
                </label>
              </div>

              <div className='flex items-center gap-1'>
                <label className='flex items-center gap-1 text-xs text-gray-500'>
                   <IconBackground size={12} />
                  <input
                    type='color'
                    onChange={(e) => onCommand('hiliteColor', e.target.value)}
                    className='h-5 w-5 cursor-pointer rounded border border-gray-300'
                    title='Background color'
                  />
                </label>
              </div>
            </div>

            {/* Text formatting */}
            <div className='flex items-center gap-1 border-l border-gray-200 pl-2'>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('bold')
                }}
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 ${currentStyles.bold ? 'bg-gray-200' : ''}`}
                title='Bold'
              >
                <IconBold size={12} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('italic')
                }}
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 ${currentStyles.italic ? 'bg-gray-200' : ''}`}
                title='Italic'
              >
                <IconItalic size={12} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('underline')
                }}
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 ${currentStyles.underline ? 'bg-gray-200' : ''}`}
                title='Underline'
              >
                <IconUnderline size={12} />
              </button>
            </div>
          </div>

          {/* Second Row */}
          <div className='flex items-center gap-2'>
            {/* Text alignment */}
            <div className='flex items-center gap-1'>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('justifyLeft')
                }}
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 ${currentStyles.textAlign === 'left' ? 'bg-gray-200' : ''}`}
                title='Align left'
              >
                <IconAlignLeft size={12} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('justifyCenter')
                }}
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 ${currentStyles.textAlign === 'center' ? 'bg-gray-200' : ''}`}
                title='Align center'
              >
                <IconAlignCenter size={12} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('justifyRight')
                }}
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 ${currentStyles.textAlign === 'right' ? 'bg-gray-200' : ''}`}
                title='Align right'
              >
                <IconAlignRight size={12} />
              </button>
            </div>

            {/* Indentation */}
            <div className='flex items-center gap-1 border-l border-gray-200 pl-2'>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('indent')
                }}
                className='flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100'
                title='Increase indent'
              >
                <IconIndentIncrease size={12} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('outdent')
                }}
                className='flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100'
                title='Decrease indent'
              >
                <IconIndentDecrease size={12} />
              </button>
            </div>

            {/* Lists */}
            <div className='flex items-center gap-1 border-l border-gray-200 pl-2'>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('insertOrderedList')
                }}
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 ${currentStyles.listType === 'ordered' ? 'bg-gray-200' : ''}`}
                title='Ordered list'
              >
                <IconListNumbers size={12} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('insertUnorderedList')
                }}
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 ${currentStyles.listType === 'unordered' ? 'bg-gray-200' : ''}`}
                title='Unordered list'
              >
                <IconList size={12} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('insertTaskList')
                }}
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 ${currentStyles.listType === 'checklist' ? 'bg-gray-200' : ''}`}
                title='Task list'
              >
                <IconListCheck size={12} />
              </button>
            </div>

            {/* Other actions */}
            <div className='flex items-center gap-1 border-l border-gray-200 pl-2'>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleCreateLink()
                }}
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 ${currentStyles.hasLink ? 'bg-gray-200' : ''}`}
                title={currentStyles.hasLink ? 'Remove link' : 'Add link'}
              >
                <IconLink size={12} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  onCommand('removeFormat')
                }}
                className='flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100'
                title='Clear formatting'
              >
                <IconTrashX size={12} />
              </button>
            </div>
          </div>
        </div>
        {showLinkPopup && (
          <div className='absolute top-full left-0 z-10 mt-2 w-full'>
            <LinkPopup
              selectedText={window.getSelection()?.toString() || ''}
              onInsert={handleLinkSubmit}
              onClose={() => setShowLinkPopup(false)}
            />
          </div>
        )}
      </>
    )
  }
)

TextToolbar.displayName = 'TextToolbar'

// 主组件
function TextNode({ data, id, selected }: NodeProps<any>) {
  const { html, isEditing, setIsEditing, handleHtmlChange, saveChanges } =
    useEditState(data.text || '双击编辑', data.style || {}, (html, style) =>
      data.onTextChange?.(id, html, style)
    )
  useEffect(() => {
    console.log('html', html)
  }, [selected])
  const contentEditableRef = useRef<HTMLElement>(null!)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const handleCommand = (command: string, value?: string) => {
    if (command === 'justifyLeft') {
      document.execCommand('justifyLeft', false, '')
      contentEditableRef.current.style.textAlign = 'left'
    } else if (command === 'justifyCenter') {
      document.execCommand('justifyCenter', false, '')
      contentEditableRef.current.style.textAlign = 'center'
    } else if (command === 'justifyRight') {
      document.execCommand('justifyRight', false, '')
      contentEditableRef.current.style.textAlign = 'right'
    } else if (command === 'fontSize' && value) {
      document.execCommand('styleWithCSS', false, 'true')
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const parentElement = range.commonAncestorContainer.parentElement

        if (
          parentElement &&
          parentElement.tagName === 'SPAN' &&
          parentElement.style.fontSize
        ) {
          parentElement.style.fontSize = value
        } else {
          const span = document.createElement('span')
          span.style.fontSize = value
          range.surroundContents(span)
        }
      }
    } else if (command === 'fontName' && value) {
      document.execCommand('styleWithCSS', false, 'true')
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const parentElement = range.commonAncestorContainer.parentElement

        if (
          parentElement &&
          parentElement.tagName === 'SPAN' &&
          parentElement.style.fontFamily
        ) {
          parentElement.style.fontFamily = value
        } else {
          const span = document.createElement('span')
          span.style.fontFamily = value
          range.surroundContents(span)
        }
      }
    } else if (command === 'insertTaskList') {
      const selection = window.getSelection()
      console.log('insertTaskList', selection)
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        console.log('range', range)

        // Check if selection is already in a task list
        const ancestor = range.commonAncestorContainer
        let taskListParent: HTMLElement | null = null

        if (ancestor instanceof HTMLElement) {
          taskListParent = ancestor.closest('.task-list-item')
          console.log('taskListParent', taskListParent)
        }
        if (taskListParent) {
          // Remove task list format
          const textContent = taskListParent.textContent || ''
          console.log('textContent', taskListParent)
          taskListParent.style.paddingLeft = '0'
          range.deleteContents()
          range.insertNode(document.createTextNode(textContent.trim()))
          // 更新html状态
          if (contentEditableRef.current) {
            const evt = {
              target: { value: contentEditableRef.current.innerHTML },
            }
            handleHtmlChange(evt)
          }
        } else {
          // Create new task list
          const listItem = document.createElement('span')
          listItem.className = 'task-list-item'
          listItem.setAttribute('data-checked', 'false')
          listItem.style.listStyleType = 'none'
          listItem.style.position = 'relative'
          listItem.style.paddingLeft = '4px'

          listItem.innerHTML = `
            <input type="checkbox" style="margin: 0; cursor: pointer;">
            ${range.toString()}
          `
          console.log('range1111', range.toString())
          range.deleteContents()
          range.insertNode(listItem)
          // 更新html状态
          if (contentEditableRef.current) {
            const evt = {
              target: { value: contentEditableRef.current.innerHTML },
            }
            handleHtmlChange(evt)
          }

          // Add event listener for the checkbox
          const checkbox = listItem.querySelector('input')
          if (checkbox) {
            checkbox.addEventListener('change', (e) => {
              const isChecked = (e.target as HTMLInputElement).checked
              listItem.setAttribute('data-checked', isChecked.toString())
              listItem.style.textDecoration = isChecked
                ? 'line-through'
                : 'none'
              listItem.style.opacity = isChecked ? '0.7' : '1'
            })
          }
        }
      }
    } else {
      document.execCommand(command, false, value)
    }
  }

  // 点击外部关闭编辑
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentEditableRef.current &&
        !contentEditableRef.current.contains(event.target as Node) &&
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        saveChanges()
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing, saveChanges])

  return (
    <div className='text-node-container relative'>
      {isEditing && <TextToolbar onCommand={handleCommand} ref={toolbarRef} />}

      <Handle type='source' position={Position.Right} id='right' />
      <Handle type='target' position={Position.Left} id='left' />

      <ContentEditable
        innerRef={contentEditableRef}
        html={html}
        onChange={handleHtmlChange}
        onDoubleClick={() => setIsEditing(true)}
        className={`text-node ${isEditing ? 'nodrag' : ''} ${selected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          fontFamily: 'Inter',
          minWidth: '100px',
          minHeight: '20px',
          fontSize: '16px',
          textAlign: 'left',
          color: '#000',
          outline: isEditing ? '1px dashed #ccc' : 'none',
          cursor: isEditing ? 'text' : 'pointer',
          padding: '8px',
          borderRadius: '4px',
          backgroundColor: isEditing ? '#f5f5f5' : 'transparent',
        }}
      />
    </div>
  )
}

export default TextNode
