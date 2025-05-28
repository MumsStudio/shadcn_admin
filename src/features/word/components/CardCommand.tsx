import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { IconCircleX, IconPlus } from '@tabler/icons-react'
import { Node, mergeAttributes } from '@tiptap/core'

// 模块配置类型
interface ModuleConfig {
  id: string
  name: string
  component: React.FC
  allowMultiple?: boolean
}

// 卡片类型
interface Card {
  id: string
  name: string
  content: string
  modules?: Record<string, any>
}

export interface ListBoxOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    listBox: {
      setListBox: (options: {
        title?: string
        width?: string
        height?: string
        cards?: Card[]
      }) => ReturnType
    }
  }
}

export const ListBox = Node.create<ListBoxOptions>({
  name: 'listBox',
  group: 'block',
  atom: false,
  draggable: true,
  content: 'block*',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'list-box-container',
      },
    }
  },

  addAttributes() {
    return {
      width: {
        default: '300px',
      },
      height: {
        default: '400px',
      },
      title: {
        default: 'List Box',
      },
      cards: {
        default: [],
        parseHTML: (element) =>
          JSON.parse(element.getAttribute('data-cards') || '[]'),
        renderHTML: (attributes) => ({
          'data-cards': JSON.stringify(attributes.cards),
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-list-box]',
        getAttrs: (node) => ({
          cards: JSON.parse(
            (node as HTMLElement).getAttribute('data-cards') || ''
          ),
        }),
      },
    ]
  },

  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-list-box': '',
          'data-cards': JSON.stringify(node.attrs.cards),
          style: `width: ${node.attrs.width}; height: ${node.attrs.height};`,
        },
        this.options.HTMLAttributes
      ),
      0,
    ]
  },

  addCommands() {
    return {
      setListBox:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: options.title || 'List Box',
              width: options.width || '300px',
              height: options.height || '400px',
              cards: options.cards || [],
            },
          })
        },
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      // 定义所有可用模块

      const ListBoxComponent = () => {
        const [isMenuOpen, setMenuOpen] = useState(false)
        const [isModalOpen, setModalOpen] = useState(false)
        const [activeModules, setActiveModules] = useState<string[]>([])
        const [cards, setCards] = useState<Card[]>(node.attrs.cards)
        const [showInput, setShowInput] = useState(false)

        const toggleInput = () => {
          setShowInput(!showInput)
        }
        const availableModules: ModuleConfig[] = [
          {
            id: 'members',
            name: '成员',
            allowMultiple: false,
            component: () => (
              <div className='module-content flex'>
                <div className='member-list'>
                  <button
                    onClick={toggleInput}
                    className='add-member-btn border border-gray-300'
                  >
                    <IconPlus size={30} className='text-gray-300' />
                  </button>
                  {showInput && (
                    <input
                      type='text'
                      placeholder='搜索或添加成员'
                      className='w-full border border-gray-300 px-2 py-1'
                    />
                  )}
                </div>
              </div>
            ),
          },
          {
            id: 'labels',
            name: '标签',
            allowMultiple: true,
            component: () => {
              const [showDialog, setShowDialog] = useState(false)
              const [newLabel, setNewLabel] = useState('')
              const [selectedColor, setSelectedColor] = useState('#61bd4f')
              const [labels, setLabels] = useState([] as any)

              const handleAddLabel = () => {
                if (newLabel.trim()) {
                  setLabels([...labels,{ text: newLabel, color: selectedColor }])
                  setNewLabel('')
                  setShowDialog(false)
                }
              }

              return (
                <div className='module-content flex'>
                  <div className='label-grid grid grid-cols-4 gap-2 flex'>
                    {labels.map((label: any, index: any) => (
                      <div
                        key={index}
                        className='label-item rounded p-1 text-center text-white'
                        style={{ backgroundColor: label.color }}
                      >
                        {label.text}
                      </div>
                    ))}
                  </div>
                  <button
                    className='add-label-button rounded bg-gray-100 px-2 py-1 text-white hover:bg-gray-400'
                    onClick={() => setShowDialog(true)}
                  >
                   <IconPlus size={30} className='text-gray-300' />
                  </button>
                  {showDialog && (
                    <div className='bg-opacity-50 items-center fixed inset-0 flex justify-center'>
                      <div className='rounded-lg border border-gray-300 bg-white p-4 shadow-lg w-[300px] h-[400px]'>
                        <h3 className='mb-2 text-lg font-medium'>创建新标签</h3>
                        <input
                          type='text'
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          placeholder='输入标签名称'
                          className='pb-2 w-full rounded border'
                        />
                        <div className='py-4 flex gap-2'>
                          {[
                            '#61bd4f',
                            '#f2d600',
                            '#ff9f1a',
                            '#eb5a46',
                            '#c377e0',
                            '#00c2e0',
                          ].map((color) => (
                            <div
                              key={color}
                              className={`h-6 w-6 cursor-pointer rounded-full ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setSelectedColor(color)}
                            />
                          ))}
                        </div>
                        <div className='flex justify-end gap-2'>
                          <button
                            className='rounded bg-gray-300 px-3 py-1 hover:bg-gray-400'
                            onClick={() => setShowDialog(false)}
                          >
                            取消
                          </button>
                          <button
                            className='rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600'
                            onClick={handleAddLabel}
                          >
                            确定
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            },
          },
          {
            id: 'checklist',
            name: '清单',
            allowMultiple: true,
            component: () => (
              <div className='module-content'>
                <h3 className='text-lg font-bold'>清单管理</h3>
                {['完成前端开发', '完成后端API'].map((item, index) => (
                  <div key={index} className='checklist-item flex items-center'>
                    <input type='checkbox' className='mr-2' />
                    <span>{item}</span>
                  </div>
                ))}
                <input
                  type='text'
                  placeholder='添加清单项'
                  className='w-full rounded border border-gray-300 px-2 py-1'
                />
              </div>
            ),
          },
          {
            id: 'dates',
            name: '日期',
            allowMultiple: true,
            component: () => (
              <div className='module-content'>
                <div className='date-picker'>
                  {['开始日期', '截止日期'].map((label, index) => (
                    <label key={index} className='block'>
                      {label}:
                      <input
                        type='date'
                        className='w-full rounded border border-gray-300 px-2 py-1'
                      />
                    </label>
                  ))}
                </div>
                <button className='save-dates-button rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600'>
                  保存日期
                </button>
              </div>
            ),
          },
          {
            id: 'attachments',
            name: '附件',
            allowMultiple: true,
            component: () => (
              <div className='module-content'>
                <div className='attachment-list'>
                  <div className='attachment-item flex items-center'>
                    <div className='attachment-icon mr-2'>📎</div>
                    <span>设计稿.pdf</span>
                  </div>
                </div>
                <button className='upload-button rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600'>
                  上传附件
                </button>
              </div>
            ),
          },
          {
            id: 'customFields',
            name: '自定义字段',
            allowMultiple: true,
            component: () => (
              <div className='module-content'>
                <div className='field-list'>
                  <div className='field-item'>
                    <label className='block'>优先级</label>
                    <select className='w-full rounded border border-gray-300 px-2 py-1'>
                      {['高', '中', '低'].map((option, index) => (
                        <option key={index}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className='add-field-button rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600'>
                  添加字段
                </button>
              </div>
            ),
          },
        ]
        // 处理菜单点击
        const handleMenuClick = () => setMenuOpen(!isMenuOpen)

        // 处理删除点击
        const handleDeleteClick = () => {
          setMenuOpen(false)
          if (typeof getPos === 'function') {
            editor.commands.deleteRange({
              from: getPos(),
              to: getPos() + node.nodeSize,
            })
          }
        }

        // 添加新卡片
        const handleAddCardClick = () => setModalOpen(true)

        // 提交新卡片
        const handleModalSubmit = () => {
          const newCard: Card = {
            id: Date.now().toString(),
            name: '新卡片',
            content: '自动生成的内容',
            modules: {},
          }

          setCards([...cards, newCard])
          setModalOpen(false)

          if (typeof getPos === 'function') {
            editor.view.dispatch(
              editor.state.tr.setNodeMarkup(getPos(), undefined, {
                ...node.attrs,
                cards: [...cards, newCard],
              })
            )
          }
        }

        // 关闭模态框
        const handleModalClose = (e: React.MouseEvent) => {
          e.stopPropagation()
          setModalOpen(false)
        }

        // 添加模块
        const handleAddModule = (moduleId: string) => {
          const moduleConfig = availableModules.find((m) => m.id === moduleId)
          if (!moduleConfig) return

          if (moduleConfig.allowMultiple) {
            // 对于允许多次的模块，直接添加
            setActiveModules([...activeModules, moduleId])
          } else {
            // 对于不允许多次的模块，检查是否已存在
            const exists = activeModules.includes(moduleId)
            if (!exists) {
              setActiveModules([...activeModules, moduleId])
            }
          }
        }

        // 移除模块
        const handleRemoveModule = (index: number) => {
          const newModules = [...activeModules]
          newModules.splice(index, 1)
          setActiveModules(newModules)
        }

        return (
          <div
            className='list-box-container relative'
            style={{ width: node.attrs.width, height: node.attrs.height }}
          >
            {/* 列表盒子头部 */}
            <div className='list-box-header flex items-center justify-between border-b border-gray-300 p-2'>
              <span className='list-box-title text-lg font-bold'>
                {node.attrs.title}
              </span>
              <div className='list-box-menu'>
                <button
                  className='list-box-menu-button'
                  onClick={handleMenuClick}
                  aria-label='List box menu'
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <circle cx='12' cy='12' r='1' />
                    <circle cx='12' cy='5' r='1' />
                    <circle cx='12' cy='19' r='1' />
                  </svg>
                </button>
                {isMenuOpen && (
                  <div className='list-box-menu-dropdown absolute right-0 mt-2 rounded border border-gray-300 bg-white shadow'>
                    <button className='list-box-menu-item block px-2 py-1 hover:bg-gray-100'>
                      编辑盒子
                    </button>
                    <button
                      className='list-box-menu-item delete-item block px-2 py-1 hover:bg-gray-100'
                      onClick={handleDeleteClick}
                    >
                      删除盒子
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 卡片列表 */}
            <div className='list-box-content p-2'>
              {cards.map((card) => (
                <div
                  key={card.id}
                  className='list-box-card mb-2 rounded border border-gray-300 bg-white p-2'
                >
                  <div className='card-header text-lg font-bold'>
                    {card.name}
                  </div>
                  <div className='card-content'>
                    {card.content || '卡片内容...'}
                  </div>
                </div>
              ))}
            </div>

            {/* 添加卡片按钮 */}
            <button
              className='add-card-button absolute bottom-2 left-1/2 -translate-x-1/2 transform rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
              onClick={handleAddCardClick}
            >
              + 添加卡片
            </button>

            {/* 卡片模态框 */}
            {isModalOpen && (
              <div className='card-modal bg-opacity-50 fixed inset-0 flex items-center justify-between bg-black'>
                <div className='modal-wrapper rounded bg-white p-4 shadow'>
                  <div>
                    <div className='mb-[8px] flex justify-between text-[20px] font-bold text-[#172b4d]'>
                      <div>{node.attrs.title || '待办'}</div>
                      <button
                        onClick={handleModalClose}
                        className='rounded px-2 py-1 text-gray-100'
                      >
                        <IconCircleX className='h-6 w-6 text-gray-300' />
                      </button>
                    </div>
                  </div>

                  <div className='modal-content flex'>
                    {/* 动态生成的模块按钮 */}
                    <div className='!pr-[10px] !pb-4'>
                      <div className='flex gap-2'>
                        {availableModules.map((module) => (
                          <button
                            key={module.id}
                            className='flex h-[30px] w-auto gap-2 rounded bg-gray-200 px-2 py-1 text-gray-700 hover:bg-gray-300'
                            onClick={() => handleAddModule(module.id)}
                          >
                            {module.name}
                          </button>
                        ))}
                      </div>
                      <div className='modal-section'>
                        <h3>描述</h3>
                        <input
                          className='description-content'
                          placeholder='添加详细描述...'
                        />
                      </div>

                      {/* 显示所有激活的模块 */}
                      {activeModules.map((moduleId, index) => {
                        const module = availableModules.find(
                          (m) => m.id === moduleId
                        )
                        if (!module) return null

                        return (
                          <div
                            key={`${moduleId}-${index}`}
                            className='module-overlay mb-4'
                          >
                            <div className='module-container'>
                              <div className='mb-4 flex items-center justify-between'>
                                <div className='text-[16px] font-bold text-[#5e6c84]'>
                                  {module.name}
                                </div>
                                <button
                                  onClick={() => handleRemoveModule(index)}
                                  className='rounded px-2 py-1 text-gray-100'
                                >
                                  <IconCircleX className='h-6 w-6 text-gray-300' />
                                </button>
                              </div>
                              <module.component />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className='flex-1'>
                      <div className='modal-section'>
                        <div className='text-[16px] font-bold text-[#5e6c84]'>
                          评论和活动
                        </div>
                        <input
                          className='description-content'
                          placeholder='添加评论...'
                        />
                      </div>
                      <div className='history-section'>
                        <div className='history-item'>
                          <span className='history-action'>
                            Xiang Li 往 To do 添加了这张卡
                          </span>
                          <span className='history-date'>
                            2024年12月4日 12:08
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }

      const container = document.createElement('div')
      container.className = 'list-box-container'

      const root = ReactDOM.createRoot(container)
      root.render(<ListBoxComponent />)

      return {
        dom: container,
        destroy: () => {
          root.unmount()
        },
      }
    }
  },
})
