// ListBox.tsx
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { mergeAttributes, Node } from '@tiptap/core'
import { createPortal } from 'react-dom'
import CardEditor from '../card-components/CardEditor'
import ListBoxContent from '../card-components/ListBoxContent'
import ListBoxFooter from '../card-components/ListBoxFooter'
import ListBoxHeader from '../card-components/ListBoxHeader'
import { Card } from '../types'

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
  atom: true,
  draggable: false,
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
        // parseHTML: (element) => {
        //   const cards = element.getAttribute('data-cards')
        // },
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-cards]',
      },
    ]
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          class: 'list-box-container',
          'data-cards': JSON.stringify(node.attrs.cards || []), // 将cards数组转为JSON字符串
          style: `width: ${HTMLAttributes.width}; height: ${HTMLAttributes.height};`,
        },
        this.options.HTMLAttributes
      ),
    ]
  },
  addCommands() {
    return {
      setListBox:
        (options) =>
        ({ commands, editor }) => {
          const success = commands.insertContent({
            type: this.name,
            attrs: {
              title: options.title || 'List Box',
              width: options.width || '300px',
              height: options.height || '400px',
              cards: options.cards || [],
            },
          })
          return success
        },
    }
  },
  addNodeView() {
    return ({ node, getPos, editor, HTMLAttributes }) => {
      const ListBoxComponent = () => {
        const [isMenuOpen, setMenuOpen] = useState(false)
        const [isModalOpen, setModalOpen] = useState(false)
        const [activeModules, setActiveModules] = useState<string[]>([])
        const [cards, setCards] = useState<Card[]>(node.attrs.cards)
        const ModalRef = React.useRef<HTMLDivElement>(null)
        useEffect(() => {
          if (!cards || cards.length === 0) {
            return
          }
          editor.commands.updateAttributes('listBox', {
            cards: cards,
          })
          console.log('cards', node.attrs.cards)
        }, [cards])

        const handleAddCardClick = () => {
          setCards([
            ...cards,
            {
              id: Date.now().toString(),
              name: '',
              content: '',
              modules: {},
              cardContent: {},
              cardActions: [],
            },
          ])
          setModalOpen(true)
          editor.commands.blur()
        }
        const [currentClickCard, setCurrentClickCard] = useState<Card | null>(
          null
        )
        const handleCardClick = (cardId: string) => {
          // console.log('handleCardClick', cardId)
          const card = cards.find((c) => c.id === cardId)
          if (card) {
            // console.log('card', card)
            setCurrentClickCard(card)
            setModalOpen(true)
          }
        }
        useEffect(() => {
          if (isModalOpen && ModalRef.current) {
            ModalRef.current.focus()
          }
        }, [isModalOpen])
        const handleModalSubmit = () => {
          const newCard: Card = {
            id: Date.now().toString(),
            name: '新卡片',
            content: '自动生成的内容',
            modules: {},
            cardContent: {},
            cardActions: [],
          }
          setCards([...cards, newCard])
          setModalOpen(false)
        }
        const handleModalClose = (e: React.MouseEvent) => {
          e.stopPropagation()
          console.log('handleModalClose')
          setCurrentClickCard(null)
          setActiveModules([])
          setModalOpen(false)
        }

        return (
          <div
            className='list-box-container relative'
            onClick={(e) => e.stopPropagation()} // 阻止容器点击事件冒泡
            style={{ width: node.attrs.width, height: node.attrs.height }}
          >
            <ListBoxHeader
              title={node.attrs.title}
              isMenuOpen={isMenuOpen}
              setMenuOpen={setMenuOpen}
              getPos={getPos}
              editor={editor}
            />
            <ListBoxContent
              cards={cards}
              handleCardClick={(cardId) => {
                handleCardClick(cardId)
              }}
            />
            <ListBoxFooter handleAddCardClick={handleAddCardClick} />
            <div>
              {isModalOpen &&
                createPortal(
                  <CardEditor
                    isModalOpen={isModalOpen}
                    currentClickCard={currentClickCard}
                    handleModalSubmit={handleModalSubmit}
                    handleModalClose={handleModalClose}
                    activeModules={activeModules}
                    setActiveModules={setActiveModules}
                    cards={cards}
                    setCards={setCards}
                  />,
                  document.body
                )}
            </div>
          </div>
        )
      }

      const container = document.createElement('div')
      container.className = 'list-box-container'

      const root = ReactDOM.createRoot(container)
      root.render(<ListBoxComponent />)

      return {
        dom: container,
        // destroy: () => {
        //   root.unmount()
        // },
      }
    }
  },
})
