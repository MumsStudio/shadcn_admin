import { useEffect, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Route } from '@/routes/_authenticated/project/list.$projectId.$id'
import {
  Plus,
  GripVertical,
  Edit,
  MoreVertical,
  ChevronLeft,
  Trash,
  NotebookText,
  Copy,
} from 'lucide-react'
import { DragDropContext } from 'react-beautiful-dnd'
import { useAuthStore } from '@/stores/authStore'
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ListCard } from '../components/list-components/ListCard'
import { NewListForm } from '../components/list-components/NewListForm'
import Request from '../request'
import { CardDialog } from './ui/card-dialog'
import { ConfirmDialog } from './ui/confirm-dialog'

export default function ListManagement() {
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  const [lists, setLists] = useState<any[]>([])
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    list: {
      id: '',
    },
  })
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editCard, setEditCard] = useState<any>({})
  const [newListTitle, setNewListTitle] = useState('')
  const [editList, setEditList] = useState<any>({})
  const [teamMember, setTeamMember] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState<any[]>([])
  const [isTransferring, setIsTransferring] = useState(false)
  const [ListOwner, setListOwner] = useState<any>(email)
  const [showSelect, setShowSelect] = useState(false)

  const { projectId, id: teamId } = Route.useParams()
  useEffect(() => {
    getTeamList()
  }, [])
  useEffect(() => {
    if (dialogOpen === false) {
      setNewListTitle('')
      setEditList({})
      setListOwner(email)
      setSelectedMember([])
      setIsTransferring(false)
    }
  }, [dialogOpen])
  useEffect(() => {
    if (cardDialogOpen === false) {
      setEditList({})
      setEditCard({})
    }
  }, [cardDialogOpen])
  const getTeamList = async () => {
    const res = await Request._GetTeamlists(projectId, teamId)
    const { data } = res
    if (data) {
      console.log('lists', data)
      const TeamMembers = data.members || []
      const getTeanMember = TeamMembers.filter((u: any) => u.email !== email)
      setTeamMember(getTeanMember)
      setLists(data.lists)
    } else {
      console.log('error', res)
      showErrorData(res.error)
    }
  }
  const navigate = useNavigate()
  const { history } = useRouter()
  const toggleInput = () => {
    setShowSelect(!showSelect)
  }
  const createNewList = async () => {
    if (!newListTitle.trim()) return

    const newList = {
      name: newListTitle,
      owner: email,
      cards: [],
      listmembers: selectedMember,
    }
    const res = await Request._CreateList(teamId, newList)
    const { data } = res
    if (data) {
      getTeamList()
      showSuccessData('创建成功')
    } else {
      console.log('error', res)
      showErrorData(res.error)
    }
    setDialogOpen(false)
  }
  const handleUpdateListOrder = async (teamId: string, listData: any) => {
    const res = await Request._UpdateListOrder(teamId, listData)
    const { data } = res
    if (data) {
      getTeamList()
      showSuccessData('更新成功')
    } else {
      console.log('error', res)
      showErrorData(res.error)
    }
    return res
  }
  const handleUpdateList = async (
    teamId: string,
    newList: any,
    listId: string
  ) => {
    const res = await Request._UpdateList(teamId, newList, listId)
    const { data } = res
    if (data) {
      getTeamList()
      showSuccessData('更新成功')
    } else {
      console.log('error', res)
      showErrorData(res.error)
    }
    return res
  }
  const handleCardOption = async (cards: any) => {
    const newList = {
      cards: [...editList.cards, { ...cards, id: `${Date.now()}` }],
    }
    // return
    await handleUpdateList(teamId, newList, editList.id)
    setCardDialogOpen(false)
  }
  const handleEditCard = async (cards: any, editCard: any) => {
    const { id, listId } = editCard
    const editList = lists.find((list) => list.id === listId)
    const editCardData = editList.cards.filter((card: any) => card.id !== id)
    editCardData
    const newList = {
      cards: [...editCardData, { ...cards, id: id }],
    }
    await handleUpdateList(teamId, newList, listId)
    setCardDialogOpen(false)
  }
  const updateList = async () => {
    if (!newListTitle.trim()) return

    const newList = {
      name: newListTitle,
      listmembers: selectedMember,
      owner: ListOwner,
    }
    await handleUpdateList(teamId, newList, editList.id)
    setDialogOpen(false)
  }
  const moveCard = async (
    fromListId: string,
    toListId: string,
    cardId: string
  ) => {
    const fromListIndex = lists.findIndex((list) => list.id === fromListId)
    const toListIndex = lists.findIndex((list) => list.id === toListId)
    const cardIndex = lists[fromListIndex].cards.findIndex(
      (card: any) => card.id === cardId
    )

    if (fromListIndex === toListIndex) return

    const newLists = [...lists]
    const [removedCard] = newLists[fromListIndex].cards.splice(cardIndex, 1)
    newLists[toListIndex].cards.push(removedCard)

    setLists(newLists)
    console.log('newLists', newLists)
    const newListData = newLists.map(({ id, ...list }) => ({
      ...list,
    }))
    console.log('newListData', newListData)

    await handleUpdateListOrder(teamId, newListData)
  }

  const onDragEnd = (result: any) => {
    const { source, destination } = result

    if (!destination) return

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    moveCard(source.droppableId, destination.droppableId, result.draggableId)
  }
  const handleSelectChange = (value: any) => {
    const user = teamMember.find((u) => u.email === value)
    setSelectedMember([...selectedMember, user])
    setShowSelect(false)
  }
  const handleRemoveUser = (email: string) => {
    const updatedUsers = selectedMember.filter((u) => u.email !== email)
    setSelectedMember(updatedUsers)
  }
  const handleDeleteList = async () => {
    const { list } = confirmDialog
    const res = await Request._DeleteList(teamId, list.id)
    if (res.data) {
      showSuccessData('删除成功')
      getTeamList()
    } else {
      showErrorData(res.error)
      console.log('error', res)
    }
  }

  const handleDuplicateList = async (list: any) => {
    const newList = {
      name: `${list.name} (副本)`,
      owner: email,
      cards: [...list.cards],
      listmembers: [...list.listmembers],
    }
    const res = await Request._CreateList(teamId, newList)
    if (res.data) {
      showSuccessData('复制成功')
      getTeamList()
    } else {
      showErrorData(res.error)
      console.log('error', res)
    }
  }
  const handleClickCard = (cardId: string, listId: string) => () => {
    navigate({ to: `/project/card/${teamId}/${listId}/${cardId}` })
  }
  const openConfirmDialog = (list: any) => {
    setConfirmDialog({
      open: true,
      title: '确认删除项目?',
      description: `您确定要删除项目 ${list?.name} 吗? 删除后将无法恢复该项目。`,
      list,
    })
  }
  const handleDeleteCard = async (listId: string, CardId: string) => {
    const updatedLists = lists.map((list) => {
      if (list.id === listId) {
        return {
          ...list,
          cards: list.cards.filter((card: any) => card.id !== CardId),
        }
      }
      return list
    })
    const newListData = updatedLists.map(({ id, ...list }) => ({
      ...list,
    }))
    await handleUpdateListOrder(teamId, newListData)
  }
  return (
    <>
      <Header fixed>
        <div className='ml-auto flex w-full items-center justify-between space-x-4'>
          <Button
            variant='outline'
            className='scale-80 !p-2'
            onClick={() => history.go(-1)}
          >
            <ChevronLeft className='!h-5 !w-5' />
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' /> 新建清单
          </Button>
        </div>
      </Header>

      <Main>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className='flex space-x-4 overflow-x-auto pb-4'>
            {lists.length === 0 ? (
              <div className='text-muted-foreground flex w-full flex-col items-center justify-center rounded border p-8'>
                <NotebookText className='mr-2 mb-2 h-10 w-10' />
                暂无清单，点击右上角按钮创建新清单
              </div>
            ) : (
              lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  onEditList={() => {
                    setDialogOpen(true)
                    setNewListTitle(list.name)
                    setEditList(list)
                    setListOwner(list.owner)
                    setSelectedMember(list.listmembers)
                  }}
                  onDuplicateList={() => handleDuplicateList(list)}
                  onDeleteList={() => openConfirmDialog(list)}
                  onAddCard={() => {
                    setCardDialogOpen(true)
                    setEditList(list)
                  }}
                  onEditCard={(card: any) => {
                    setEditCard({
                      ...card,
                      listId: list.id,
                    })
                    setCardDialogOpen(true)
                  }}
                  onDeleteCard={(cardId: string) =>
                    handleDeleteCard(list.id, cardId)
                  }
                  onCopyCard={(card: any) => {
                    const newCard = {
                      ...card,
                      id: `${Date.now()}`,
                      title: `${card.title} (副本)`,
                    }
                    const newList = {
                      cards: [...list.cards, newCard],
                    }
                    handleUpdateList(teamId, newList, list.id)
                  }}
                  handleClickCard={handleClickCard}
                />
              ))
            )}
          </div>
        </DragDropContext>

        <NewListForm
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          newListTitle={newListTitle}
          setNewListTitle={setNewListTitle}
          editList={editList}
          teamMember={teamMember}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          ListOwner={ListOwner}
          setListOwner={setListOwner}
          isTransferring={isTransferring}
          setIsTransferring={setIsTransferring}
          showSelect={showSelect}
          setShowSelect={setShowSelect}
          toggleInput={toggleInput}
          handleSelectChange={handleSelectChange}
          handleRemoveUser={handleRemoveUser}
          onCreateList={createNewList}
          onUpdateList={updateList}
        />

        <CardDialog
          projectId={projectId}
          teamId={teamId}
          open={cardDialogOpen}
          onOpenChange={setCardDialogOpen}
          onSubmit={async (data) => {
            if (Object.keys(editCard).length > 0) {
              handleEditCard(data, editCard)
            } else {
              handleCardOption(data)
            }
            setEditCard(null)
          }}
          initialData={editCard}
        />

        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={handleDeleteList}
        />
      </Main>
    </>
  )
}
