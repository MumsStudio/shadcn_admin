// CardEditor.tsx
import React, { useState, useEffect } from 'react'
import {
  IconCalendarWeekFilled,
  IconCheckbox,
  IconCircleX,
  IconMenuDeep,
  IconMessage,
  IconPaperclip,
  IconSquareRoundedPlus2,
  IconTag,
  IconUser,
} from '@tabler/icons-react'
import { useAuthStore } from '@/stores/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Request from '../request'
import AttachmentsModule from './AttachmentsModule'
import ChecklistModule from './ChecklistModule'
import CustomFieldsModule from './CustomFieldsModule'
import DatesModule from './DatesModule'
import LabelsModule from './LabelsModule'
import MembersModule from './MembersModule'
import { Card, ModuleConfig } from './types'

interface CardEditorProps {
  currentClickCard: Card | null
  handleModalSubmit: () => void
  handleModalClose: (e: React.MouseEvent) => void
  activeModules: string[]
  setActiveModules: React.Dispatch<React.SetStateAction<string[]>>
  cards: Card[]
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
  isModalOpen: boolean
}

const CardEditor: React.FC<CardEditorProps> = ({
  handleModalSubmit,
  handleModalClose,
  activeModules,
  isModalOpen,
  setActiveModules,
  cards,
  setCards,
  currentClickCard,
}) => {
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [user, getUser] = useState<any>({})
  const [description, setDescription] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescrip, setIsEditingDescrip] = useState(false)
  const [name, setName] = useState('')
  useEffect(() => {
    if (currentCard) {
      setName(currentCard.modules?.name || '')
    }
  }, [currentCard?.modules?.name])
  useEffect(() => {
    setDescription(currentCard?.modules?.description || '')
  }, [currentCard?.modules?.description])
  useEffect(() => {
    if (cards.length > 0) {
      setCurrentCard(cards[cards.length - 1])
      console.log('currentCard:', currentCard)
    }
  }, [cards.length])
  useEffect(() => {
    if (currentClickCard) {
      setCurrentCard(currentClickCard)
      setActiveModules(Object.keys(currentClickCard.modules || {}))
      console.log('currentClickCard:', currentClickCard)
    }
  }, [currentClickCard])
  const handleAddModule = (moduleId: string) => {
    const moduleConfig = availableModules.find((m) => m.id === moduleId)
    if (!moduleConfig) return

    if (moduleConfig.allowMultiple) {
      setActiveModules([...activeModules, moduleId])
    } else {
      const exists = activeModules.includes(moduleId)
      if (!exists) {
        if (moduleId === 'members') {
          setActiveModules([moduleId, ...activeModules])
          console.log('handleAddModule:', activeModules)
        } else setActiveModules([...activeModules, moduleId])
      }
    }
    if (moduleId === 'dates') {
      handleModuleChange(
        moduleId,
        [
          { type: 'start', date: '', time: '' },
          { type: 'end', date: '', time: '' },
        ],
        `Add module ${moduleId}`
      )
    } else {
      handleModuleChange(moduleId, [], `Add module ${moduleId}`)
    }
  }

  const handleRemoveModule = (index: number, moduleId: string) => {
    const newModules = [...activeModules]
    newModules.splice(index, 1)
    setActiveModules(newModules)
    handleModuleChange(moduleId, [], `Remove module ${moduleId}`)
  }

  const handleModuleChange = (moduleId: string, data: any, action: string) => {
    const actionObject =
      moduleId === 'remark'
        ? { action, timestamp: new Date().toLocaleString(), isEditing: false }
        : { action, timestamp: new Date().toLocaleString() }
    if (currentCard) {
      const updatedCard = {
        ...currentCard,
        modules: {
          ...currentCard.modules,
          [moduleId]: data,
        },
        cardContent: {
          ...currentCard.cardContent,
          [moduleId]: data,
        },
        cardActions: [...currentCard.cardActions, { ...actionObject }],
      }
      console.log('handleModuleChange:', currentCard)
      setCurrentCard(updatedCard)
      setCards(
        cards.map((card) => (card.id === currentCard.id ? updatedCard : card))
      )
    }
  }

  useEffect(() => {
    const getUserInfo = async () => {
      const response = await Request._GetUserInfo(email)
      const { data } = response
      getUser(data)
    }
    getUserInfo()
  }, [isModalOpen])
  const buttonIconsize = 18
  const availableModules: ModuleConfig[] = [
    {
      id: 'members',
      name: '成员',
      icon: <IconUser size={buttonIconsize}/>,
      component: (props) => (
        <MembersModule
          {...props}
          currentCard={currentCard as object}
          onChange={(data, action) => {
            handleModuleChange('members', data, action)
          }}
        />
      ),
      allowMultiple: false,
    },
    {
      id: 'labels',
      name: '标签',
      icon: <IconTag size={buttonIconsize} />,
      component: (props) => (
        <LabelsModule
          {...props}
          currentCard={currentCard as object}
          onChange={(data, action) => {
            handleModuleChange('labels', data, action)
          }}
        />
      ),
      allowMultiple: false,
    },
    {
      id: 'checklist',
      name: '清单',
      icon: <IconCheckbox size={buttonIconsize} />,
      component: (props) => (
        <ChecklistModule
          {...props}
          currentCard={currentCard as object}
          onChange={(data, action) => {
            handleModuleChange('checklist', data, action)
          }}
        />
      ),
      allowMultiple: true,
    },
    {
      id: 'dates',
      name: '日期',
      icon: <IconCalendarWeekFilled size={buttonIconsize} />,
      component: (props) => (
        <DatesModule
          {...props}
          currentCard={currentCard as object}
          onChange={(data, action) => {
            handleModuleChange('dates', data, action)
          }}
        />
      ),
      allowMultiple: false,
    },
    {
      id: 'attachments',
      name: '附件',
      icon: <IconPaperclip size={buttonIconsize} />,
      component: (props) => (
        <AttachmentsModule
          {...props}
          currentCard={currentCard as object}
          onChange={(data, action) => {
            handleModuleChange('attachments', data, action)
          }}
        />
      ),
      allowMultiple: true,
    },
    {
      id: 'customFields',
      name: '自定义字段',
      icon: <IconSquareRoundedPlus2 size={buttonIconsize} />,
      component: (props) => (
        <CustomFieldsModule
          {...props}
          currentCard={currentCard as object}
          onChange={(data, action) => {
            handleModuleChange('customFields', data, action)
          }}
        />
      ),
      allowMultiple: false,
    },
  ]
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  return (
    <div className='card-modal bg-opacity-50 fixed inset-0 flex items-center justify-between bg-black'>
      <div className='modal-wrapper rounded bg-white p-1 shadow'>
        <div>
          <div className='mb-[8px] flex justify-between px-2 pt-2 text-[20px] font-bold text-[#172b4d]'>
            {isEditingName ? (
              <input
                className='w-full border-b-2 border-blue-500 outline-none'
                value={name || ''}
                onChange={
                  (e) => setName(e.target.value)
                  // setCurrentCard({ ...currentCard, name: e.target.value })
                }
                onBlur={(e) => {
                  handleModuleChange(
                    'name',
                    e.target.value,
                    `updateCardName: ${name}`
                  )
                  setIsEditingName(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleModuleChange(
                      'name',
                      e.currentTarget.value,
                      `updateCardName: ${name}`
                    )
                    e.currentTarget.blur()
                  }
                }}
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className='cursor-pointer hover:bg-gray-100'
              >
                {name || '卡片名'}
              </div>
            )}
            <button
              onClick={handleModalClose}
              className='rounded px-2 py-1 text-gray-100'
            >
              <IconCircleX className='h-6 w-6 text-gray-300' />
            </button>
          </div>
        </div>

        <div className='modal-content flex'>
          <div className='mr-1 w-[65%] overflow-y-auto !px-[10px] !py-4'>
            <div className='flex flex-wrap items-center gap-3 mb-4'>
              {availableModules.map((module) => (
                <button
                  key={module.id}
                  className='flex w-auto items-center rounded border px-2 py-1 text-[14px] text-gray-700 hover:bg-gray-300'
                  onClick={() => handleAddModule(module.id)}
                >
                  <div className='mr-[4px]'>{module.icon}</div>
                  {module.name}
                </button>
              ))}
            </div>
            <div className='py-2'>
              <div className='flex items-center text-[16px] font-bold text-[#5e6c84]'>
                <div className='mr-2'>
                  <IconMenuDeep className='h-4 w-4' />
                </div>
                <div>描述</div>
              </div>
             
              {isEditingDescrip ? (
                <input
                  className='description-content border-none bg-white'
                  value={description || ''}
                  placeholder='添加详细描述...'
                  onBlur={(e) => {
                    handleModuleChange(
                      'description',
                      e.target.value,
                      'updateDescription'
                    )
                    // e.target.value = ''
                    setIsEditingDescrip(false)
                  }}
                  onChange={(e) => {
                    setDescription(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleModuleChange(
                        'description',
                        e.currentTarget.value,
                        'updateDescription'
                      )
                      e.currentTarget.blur()
                      setIsEditingDescrip(false)
                    }
                  }}
                  autoFocus
                />
              ):( <div className='py-1 pl-2 text-[.875rem] text-gray-400' onClick={() => setIsEditingDescrip(true)}>{description ||'添加详细描述...'}</div>)}
            </div>

            {activeModules.map((moduleId, index) => {
              const module = availableModules.find((m) => m.id === moduleId)
              if (!module) return null

              return (
                <div
                  key={`${moduleId}-${index}`}
                  className='module-overlay pb-4'
                >
                  <div className='module-container'>
                    <div className='mb-2 flex items-center justify-between'>
                      <div className='flex items-center justify-center text-[16px] font-bold text-[#5e6c84]'>
                        <div className='mr-2'>{module.icon}</div>
                        {module.name}
                      </div>
                      <button
                        onClick={() => handleRemoveModule(index, moduleId)}
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

          <div className='flex-1 overflow-y-auto bg-gray-100 px-2 py-1'>
            <div className='modal-section'>
              <div className='p-2 pt-0 text-[16px] font-bold text-[#5e6c84]'>
                <div className='flex items-center'>
                  <div>
                    <IconMessage size={16} className='mr-2' />
                  </div>
                  <div>评论和活动</div>
                </div>
              </div>
              <input
                className='w-full rounded-md bg-gray-300 p-2 text-[#5e6c84]'
                placeholder='添加评论...'
                onBlur={(e) => {
                  handleModuleChange(
                    'remark',
                    e.target.value,
                    `remark: ${e.target.value}`
                  )
                  e.target.value = ''
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleModuleChange(
                      'remark',
                      e.currentTarget.value,
                      `remark: ${e.currentTarget.value}`
                    )
                    e.currentTarget.blur()
                  }
                }}
              />
            </div>
            <div className='history-section'>
              {currentCard?.cardActions
                .slice()
                .sort((a, b) => {
                  const dateA = new Date(a.timestamp)
                  const dateB = new Date(b.timestamp)
                  return dateB.getTime() - dateA.getTime()
                })
                .map((action, index) => (
                  <div key={`${index}-${action.timestamp}`} className='flex'>
                    <div className='mr-2 flex items-center'>
                      <Avatar className='z-1 size-10'>
                        <AvatarImage src={''} alt={'2345'} />
                        <AvatarFallback className='bg-[#2CB0C8]'>
                          {`${user.firstName ? user.firstName.substring(0, 1) : ''}${user.lastName ? user.lastName.substring(0, 1) : ''}` ||
                            email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className='flex flex-col py-2'>
                      <div className='flex flex-col text-[14px] text-gray-700'>
                        <span className='font-bold'>{email} </span>

                        {action.action.startsWith('remark') ? (
                          <div className='flex flex-col'>
                            {action.isEditing ? (
                              <input
                                type='text'
                                defaultValue={action.action
                                  .split(':')[1]
                                  .trim()}
                                onBlur={(e) => {
                                  const newText = e.target.value
                                  const newActions = [
                                    ...(currentCard?.cardActions.sort(
                                      (a, b) => {
                                        const dateA = new Date(a.timestamp)
                                        const dateB = new Date(b.timestamp)
                                        return dateB.getTime() - dateA.getTime()
                                      }
                                    ) || []),
                                  ]
                                  newActions[index] = {
                                    ...action,
                                    action: `remark: ${newText}`,
                                    isEditing: false,
                                  }
                                  setCurrentCard({
                                    ...currentCard,
                                    cardActions: newActions,
                                  })
                                  setCards(
                                    cards.map((card) =>
                                      card.id === currentCard?.id
                                        ? { ...card, cardActions: newActions }
                                        : card
                                    )
                                  )
                                }}
                                className='rounded-md border-[1px] border-gray-300 bg-white px-2 py-1 text-[14px] font-semibold'
                                autoFocus
                              />
                            ) : (
                              <span className='rounded-md border-[1px] border-gray-300 bg-white px-2 py-1 text-[14px] font-semibold'>
                                {action.action.split(':')[1].trim()}
                              </span>
                            )}
                            <div className=''>
                              <button
                                onClick={() => {
                                  const newActions = [
                                    ...(currentCard?.cardActions.sort(
                                      (a, b) => {
                                        const dateA = new Date(a.timestamp)
                                        const dateB = new Date(b.timestamp)
                                        return dateB.getTime() - dateA.getTime()
                                      }
                                    ) || []),
                                  ]
                                  newActions.splice(index, 1)
                                  // return
                                  setCurrentCard({
                                    ...currentCard,
                                    cardActions: newActions,
                                  })
                                  setCards(
                                    cards.map((card) =>
                                      card.id === currentCard?.id
                                        ? { ...card, cardActions: newActions }
                                        : card
                                    )
                                  )
                                }}
                                className='rounded text-[12px] font-bold'
                              >
                                · 删除
                              </button>
                              <button
                                onClick={() => {
                                  const newActions = [
                                    ...(currentCard?.cardActions.sort(
                                      (a, b) => {
                                        const dateA = new Date(a.timestamp)
                                        const dateB = new Date(b.timestamp)
                                        return dateB.getTime() - dateA.getTime()
                                      }
                                    ) || []),
                                  ]
                                  newActions[index] = {
                                    ...action,
                                    isEditing: true,
                                  }
                                  setCurrentCard({
                                    ...currentCard,
                                    cardActions: newActions,
                                  })
                                }}
                                className='rounded text-[12px] font-bold'
                              >
                                · 编辑
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className='text-[12px] font-semibold'>
                            {action.action}
                          </span>
                        )}
                      </div>
                      <div className='text-[12px] text-gray-700'>
                        {action.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardEditor
