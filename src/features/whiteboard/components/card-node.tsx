import React, { useState, useEffect, useRef } from 'react'
import { IconCircleX } from '@tabler/icons-react'
import { useReactFlow, NodeProps, Handle, Position } from '@xyflow/react'
import { createPortal } from 'react-dom'
import CardEditor from '@/features/word/components/card-components/CardEditor'
import ListBoxContent from '../../word/components/card-components/ListBoxContent'
import ListBoxFooter from '../../word/components/card-components/ListBoxFooter'
import { Card as CardType } from '../../word/components/types'

interface CardNodeData {
  label?: string
  width?: number
  height?: number
  content?: string
  locked?: boolean
  modules?: any
  cards?: CardType[]
  title?: string
  data: any
  id: string
  type: string
  position: any
  selected: boolean
}

type CardNodeProps = NodeProps<CardNodeData>

const CardNode: React.FC<CardNodeProps> = ({ data, selected, id }) => {
  const { setNodes } = useReactFlow()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeModules, setActiveModules] = useState<string[]>([])
  const [cards, setCards] = useState<CardType[]>(data.cards || [])
  const ModalRef = useRef<HTMLDivElement>(null)
  const [currentClickCard, setCurrentClickCard] = useState<CardType | null>(
    null
  )
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState(
    data.modules?.name || data.title || '卡片列表'
  )

  // 更新节点数据
  const updateNodeData = (newData: Partial<CardNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          }
        }
        return node
      })
    )
  }

  // 处理卡片更新
  useEffect(() => {
    updateNodeData({ cards })
  }, [cards])

  const handleCloseModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsModalOpen(false)
    setCurrentClickCard(null)
    setActiveModules([])
  }

  const handleAddCardClick = () => {
    const newCards = [
      ...cards,
      {
        id: Date.now().toString(),
        name: '',
        content: '',
        modules: {},
        cardContent: {},
        cardActions: [],
      },
    ]
    setCards(newCards)
    setIsModalOpen(true)
  }

  const handleCardClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId)
    if (card) {
      setCurrentClickCard(card)
      setIsModalOpen(true)
    }
  }

  useEffect(() => {
    if (isModalOpen && ModalRef.current) {
      ModalRef.current.focus()
    }
  }, [isModalOpen])

  useEffect(() => {
    if (data.modules) {
      setName(data.modules.name || '')
    }
    if (data.cards) {
      setCards(data.cards)
    }
  }, [data.modules, data.cards])

  return (
    <>
      <div
        className={`list-box-container relative ${selected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          width: data.width ? `${data.width}px` : '150px',
          height: data.height ? `${data.height}px` : '200px',
        }}
      >
        {/* 标题和描述编辑区域 */}
        <div className='p-4'>
          {isEditingName ? (
            <input
              className='w-full border-b-2 border-blue-500 text-lg font-medium outline-none'
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                setIsEditingName(false)
                updateNodeData({ title: name })
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              autoFocus
            />
          ) : (
            <h3
              className='cursor-pointer text-lg font-medium hover:bg-gray-100'
              onClick={() => setIsEditingName(true)}
            >
              {name}
            </h3>
          )}
        </div>

        {/* ListBox 功能区域 */}
        <div className='absolute inset-0 top-16 bottom-10 overflow-auto'>
          <ListBoxContent cards={cards} handleCardClick={handleCardClick} />
          <ListBoxFooter handleAddCardClick={handleAddCardClick} />
        </div>

        {/* 模态框关闭按钮 */}
        {isModalOpen && (
          <div className='absolute top-2 right-2'>
            <button
              onClick={handleCloseModal}
              className='rounded px-2 py-1 text-gray-100'
            >
              <IconCircleX className='h-6 w-6 text-gray-300' />
            </button>
          </div>
        )}
      </div>

      {/* 卡片编辑器模态框 */}
      {isModalOpen &&
        createPortal(
          <CardEditor
            isModalOpen={isModalOpen}
            currentClickCard={currentClickCard}
            handleModalSubmit={() => {}}
            handleModalClose={handleCloseModal}
            activeModules={activeModules}
            setActiveModules={setActiveModules}
            cards={cards}
            setCards={setCards}
          />,
          document.body
        )}
      <Handle type='target' position={Position.Left} id={'left'} />
      <Handle type='source' position={Position.Right} id={'right'} />
    </>
  )
}

export default CardNode
