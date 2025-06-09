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
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ChecklistModule from '@/features/word/components/ChecklistModule'
import CustomFieldsModule from '@/features/word/components/CustomFieldsModule'
import DatesModule from '@/features/word/components/DatesModule'
import LabelsModule from '@/features/word/components/LabelsModule'
import MembersModule from '@/features/word/components/MembersModule'
import { ModuleConfig } from '../../word/components/types'
import { Card as CardType } from '../../word/components/types'
import Request from '../request'

interface CardNodeProps {
  data: {
    label?: string
    width?: number
    height?: number
    content?: string
    locked?: boolean
    modules?: any
    cards?: CardType[]
  }
  selected: boolean
  isModalOpen?: boolean
  handleModalClose?: (e: React.MouseEvent) => void
  handleModalSubmit?: () => void
}

const CardNode: React.FC<CardNodeProps> = ({
  data,
  selected,
  isModalOpen = false,
  handleModalClose,
  handleModalSubmit,
}) => {
  const [isModalOpenLocal, setIsModalOpenLocal] = useState(false)

  const handleDoubleClick = () => {
    setIsModalOpenLocal(true)
  }

  const handleCloseModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsModalOpenLocal(false)
    if (handleModalClose) handleModalClose(e)
  }
  const [currentCard, setCurrentCard] = useState<any | null>(null)
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [activeModules, setActiveModules] = useState<string[]>([])
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescrip, setIsEditingDescrip] = useState(false)

  useEffect(() => {
    if (data.modules) {
      setCurrentCard({
        id: 'node-card',
        modules: data.modules,
        cardContent: {},
        cardActions: [],
      })
      setName(data.modules.name || '')
      setDescription(data.modules.description || '')
    }
  }, [data.modules])

  return (
    <Card
      className={`w-[${data.width || 300}px] p-4 ${selected ? 'ring-2 ring-blue-500' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <h3 className='text-lg font-medium'>{name}</h3>
      <p className='text-gray-600'>{description}</p>

      <div className='mt-4 space-y-4'>
        {(isModalOpen || isModalOpenLocal) && (
          <div className='mb-[8px] flex justify-between px-2 pt-2 text-[20px] font-bold text-[#172b4d]'>
            {isEditingName ? (
              <input
                className='w-full border-b-2 border-blue-500 outline-none'
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => {
                  setIsEditingName(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
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
        )}

        {data.modules?.members && (
          <div className='module-container'>
            <MembersModule
              currentCard={currentCard}
              onChange={(newData, action) => {
                // Handle members change
              }}
            />
          </div>
        )}

        {data.modules?.labels && (
          <div className='module-container'>
            <LabelsModule
              currentCard={currentCard}
              onChange={(newData, action) => {
                // Handle labels change
              }}
            />
          </div>
        )}

        {data.modules?.checklist && (
          <div className='module-container'>
            <ChecklistModule
              currentCard={currentCard}
              onChange={(newData, action) => {
                // Handle checklist change
              }}
            />
          </div>
        )}

        {data.modules?.dates && (
          <div className='module-container'>
            <DatesModule
              currentCard={currentCard}
              onChange={(newData, action) => {
                // Handle dates change
              }}
            />
          </div>
        )}

        {data.modules?.customFields && (
          <div className='module-container'>
            <CustomFieldsModule
              currentCard={currentCard}
              onChange={(newData, action) => {
                // Handle custom fields change
              }}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

export default CardNode
