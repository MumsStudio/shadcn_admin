import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Route } from '@/routes/_authenticated/project/card.$teamId.$listId.$id'
import {
  Check,
  ChevronLeft,
  Edit,
  File,
  MessageSquare,
  Share,
  Upload,
  UserPlus,
  X,
} from 'lucide-react'
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import Request from '../request'
import { CardAssignees } from './card-component/CardAssignees'
import { CardAttachments } from './card-component/CardAttachments'
import { CardComments } from './card-component/CardComments'
import { CardDescription } from './card-component/CardDescription'
import { CardEditDialog } from './card-component/CardEditDialog'
import { CardHeaderInfo } from './card-component/CardHeaderInfo'
import { CardImages } from './card-component/CardImages'
import { CardMembers } from './card-component/CardMembers'
import ChecklistModule from './card-component/ChecklistModule'
import LabelsModule from './card-component/LabelsModule'
import LinksModule from './card-component/LinksModule'

export default function CardDetail() {
  const [card, setCard] = useState<any>({})
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editedCard, setEditedCard] = useState({ ...card })
  const [status, setStatus] = useState('待处理')
  const [members, setMembers] = useState<any[]>([])
  const [cards, setCards] = useState<any[]>([])
  const { history } = useRouter()
  const { teamId, listId, id: cardId } = Route.useParams()

  const getTeamList = async () => {
    const res = await Request._GetProjectLists(teamId, listId)
    const { data } = res
    if (data) {
      setMembers(data.listmembers || [])
      setCards(data.cards)
      console.log('data', data.cards)
      data.cards.find((c: any) => {
        if (c.id === cardId) {
          setCard({
            ...c,
            status: c.status || '待处理',
            priority: c.priority || '不重要不紧急',
            members: c.members || [],
            comments: c.comments || [],
          })
          if (c.status) {
            setStatus(c.status)
          }
          if (c.members) {
            setCard({
              ...c,
              members: c.members || [],
            })
          }
        }
      })
    } else {
      console.log('error', res)
      showErrorData(res.error)
    }
  }

  useEffect(() => {
    getTeamList()
  }, [])

  const handleStatusChange = (status: string) => {
    setCard({ ...card, status })
  }

  const updateCard = async (data: any) => {
    const res = await Request._UpdateList(teamId, data, listId)
    if (res.data) {
      showSuccessData('更新成功')
    } else {
      showErrorData(res.error)
    }
  }

  const saveCardChanges = () => {
    setCard(editedCard)
    const newCards = cards.map((c: any) => {
      if (c.id === cardId) {
        return editedCard
      }
      return c
    })
    updateCard({ cards: newCards })
    setEditDialogOpen(false)
  }

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <Button variant='outline'>
            <Share className='mr-2 h-4 w-4' /> 分享
          </Button>
        </div>
      </Header>

      <Main>
        <div className='space-y-6'>
          <Button
            variant='ghost'
            className='px-0'
            onClick={() => history.go(-1)}
          >
            <ChevronLeft className='mr-2 h-4 w-4' /> 返回列表
          </Button>

          <Card className='h-[45rem] overflow-y-auto'>
            <CardHeader>
              <CardHeaderInfo
                card={card}
                onEdit={() => {
                  setEditedCard({ ...card })
                  setEditDialogOpen(true)
                }}
              />
            </CardHeader>
            <CardContent className='space-y-6'>
              <CardDescription card={card} />
              <CardAssignees card={card} />
              <CardMembers
                card={card}
                members={members}
                cards={cards}
                updateCard={updateCard}
              />
              <CardImages card={card} setCard={setCard} />
              <CardAttachments card={card} setCard={setCard} />

              <div>
                <h3 className='mb-2 text-sm font-medium'>任务清单</h3>
                <div className='mb-4'>
                  <ChecklistModule
                    currentCard={card}
                    onChange={(items, action) => {
                      setCard({
                        ...card,
                        checklist: items,
                      })
                      const updatedCards = cards.map((c: any) => {
                        if (c.id === cardId) {
                          return {...c, checklist: items || [] }
                        }
                        return c
                      })
                      updateCard({ cards: updatedCards })
                    }}
                  />
                </div>
              </div>

              <div>
                <h3 className='mb-2 text-sm font-medium'>标签</h3>
                <LabelsModule
                  currentCard={card}
                  onChange={(items, action) => {
                    setCard({
                      ...card,
                      labels: items,
                    })
                    const updatedCards = cards.map((c: any) => {
                      if (c.id === cardId) {
                        return { ...c, labels: items || [] }
                      }
                      return c
                    })
                    updateCard({ cards: updatedCards })
                  }}
                />
              </div>
              <div>
                <LinksModule
                  currentCard={card}
                  onChange={(links, action) => {
                    setCard({
                      ...card,
                    })
                  }}
                  onUpdateCard={(data: any) => {
                    console.log('data', data)
                    const updatedCards = cards.map((c: any) => {
                      if (c.id === cardId) {
                        return { ...c, links: data.links || [] }
                      }
                      return c
                    })
                    // console.log('updatedCards', updatedCards)
                    updateCard({ cards: updatedCards })
                  }}
                />
              </div>

              <CardComments
                card={card}
                setCard={setCard}
                onUpdate={(data: any) => {
                  const updatedCards = cards.map((c: any) => {
                    if (c.id === cardId) {
                      return { ...c, comments: data || [] }
                    }
                    return c
                  })
                  updateCard({ cards: updatedCards })
                }}
              />
            </CardContent>
          </Card>
        </div>

        <CardEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          editedCard={editedCard}
          setEditedCard={setEditedCard}
          onSave={saveCardChanges}
        />
      </Main>
    </>
  )
}
