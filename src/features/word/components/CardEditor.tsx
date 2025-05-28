// CardEditor.tsx
import React, { useState, useEffect } from 'react'
import { IconCircleX } from '@tabler/icons-react'
import AttachmentsModule from './AttachmentsModule'
import ChecklistModule from './ChecklistModule'
import CustomFieldsModule from './CustomFieldsModule'
import DatesModule from './DatesModule'
import LabelsModule from './LabelsModule'
import MembersModule from './MembersModule'
import { Card, ModuleConfig } from './types'

interface CardEditorProps {
  handleModalSubmit: () => void
  handleModalClose: (e: React.MouseEvent) => void
  activeModules: string[]
  setActiveModules: React.Dispatch<React.SetStateAction<string[]>>
  cards: Card[]
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
}

const CardEditor: React.FC<CardEditorProps> = ({
  handleModalSubmit,
  handleModalClose,
  activeModules,
  setActiveModules,
  cards,
  setCards,
}) => {
  const [currentCard, setCurrentCard] = useState<Card | null>(null)

  useEffect(() => {
    console.log('cards:', cards)
    if (cards.length > 0) {
      setCurrentCard(cards[cards.length - 1])
    }
  }, [cards])

  const handleAddModule = (moduleId: string) => {
    const moduleConfig = availableModules.find((m) => m.id === moduleId)
    if (!moduleConfig) return

    if (moduleConfig.allowMultiple) {
      setActiveModules([...activeModules, moduleId])
    } else {
      const exists = activeModules.includes(moduleId)
      if (!exists) {
        setActiveModules([...activeModules, moduleId])
      }
    }
  }

  const handleRemoveModule = (index: number) => {
    const newModules = [...activeModules]
    newModules.splice(index, 1)
    setActiveModules(newModules)
  }

  const handleModuleChange = (moduleId: string, data: any, action: string) => {
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
        cardActions: [
          ...currentCard.cardActions,
          { action, timestamp: new Date().toLocaleString() },
        ],
      }
      console.log('handleModuleChange:', currentCard)
      setCurrentCard(updatedCard)
      setCards(
        cards.map((card) => (card.id === currentCard.id ? updatedCard : card))
      )
    }
  }
  const availableModules: ModuleConfig[] = [
    {
      id: 'members',
      name: '成员',
      component: (props) => (
        <MembersModule
          {...props}
          onChange={(data: any,) => {
            // handleModuleChange('members', data)
          }}
        />
      ),
      allowMultiple: false,
    },
    {
      id: 'labels',
      name: '标签',
      component: (props) => (
        <LabelsModule
          {...props}
          currentCard={currentCard as object}
          onChange={(data,action) => {
            handleModuleChange('labels', data, action)
          }}
        />
      ),
      allowMultiple: false,
    },
    {
      id: 'checklist',
      name: '清单',
      component: (props) => (
        <ChecklistModule
          {...props}
          onChange={(data) => {
            // handleModuleChange('checklist', data)
          }}
        />
      ),
      allowMultiple: true,
    },
    {
      id: 'dates',
      name: '日期',
      component: (props) => (
        <DatesModule
          {...props}
          onChange={(data) => {
            // handleModuleChange('dates', data)
          }}
        />
      ),
      allowMultiple: false,
    },
    {
      id: 'attachments',
      name: '附件',
      component: (props) => (
        <AttachmentsModule
          {...props}
          onChange={(data) => {
            // handleModuleChange('attachments', data)
          }}
        />
      ),
      allowMultiple: true,
    },
    {
      id: 'customFields',
      name: '自定义字段',
      component: (props) => (
        <CustomFieldsModule
          {...props}
          onChange={(data) => {
            // handleModuleChange('customFields', data)
          }}
        />
      ),
      allowMultiple: false,
    },
  ]

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      className='card-modal bg-opacity-50 fixed inset-0 flex items-center justify-between bg-black'
    >
      <div className='modal-wrapper rounded bg-white p-4 shadow'>
        <div>
          <div className='mb-[8px] flex justify-between text-[20px] font-bold text-[#172b4d]'>
            <div>{currentCard?.name || '待办'}</div>
            <button
              onClick={handleModalClose}
              className='rounded px-2 py-1 text-gray-100'
            >
              <IconCircleX className='h-6 w-6 text-gray-300' />
            </button>
          </div>
        </div>

        <div className='modal-content flex'>
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
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                onChange={(e) =>
                  handleModuleChange('description', e.target.value, 'updateDescription')
                }
              />
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
                onChange={(e) =>  handleModuleChange('remark', e.target.value, 'updateremark')}
              />
            </div>
            <div className='history-section'>
              {currentCard?.cardActions.map((action, index) => (
                <div key={index} className='history-item'>
                  <span className='history-action'>{action.action}</span>
                  <span className='history-date'>{action.timestamp}</span>
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
