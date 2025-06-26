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
import { getChanges } from '@/utils/common'
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ListCard } from '../components/list-components/ListCard'
import { NewListForm } from '../components/list-components/NewListForm'
import Request from '../request'
import { CardDialog } from './ui/card-dialog'
import { ConfirmDialog } from './ui/confirm-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [ListOwner, setListOwner] = useState<any>('')
  const navigate = useNavigate()
  const [activities, setActivities] = useState<any[]>([])
  const [showSelect, setShowSelect] = useState(false)
  const [team, setTeam] = useState<any>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [myFilter, setMyFilter] = useState<string>('all') // 新增与我有关的筛选状态
  const [userFilter, setUserFilter] = useState<string>('all') // 新增人员筛选状态
  const [dateFilter, setDateFilter] = useState<any>('all') // 新增时间筛选状态
  const [startDate, setStartDate] = useState<string>('') // 开始日期
  const [endDate, setEndDate] = useState<string>('') // 结束日期
  const [filteredLists, setFilteredLists] = useState<any[]>([])

  const { projectId, id: teamId } = Route.useParams()

  // 添加筛选条件作为依赖项，确保筛选条件变化时重新获取并筛选数据
  useEffect(() => {
    getTeamList()
    fetchProjectInfo()
  }, [
    statusFilter,
    priorityFilter,
    myFilter,
    userFilter,
    dateFilter,
    startDate,
    endDate,
  ]) // 添加日期筛选相关依赖

  // 单独的筛选逻辑，提高代码可维护性
  const filterLists = (listsData: any) => {
    if (!listsData) return []

    return listsData
      .filter((list: any) => {
        // 根据myFilter筛选
        if (myFilter !== 'all') {
          if (myFilter === 'owner') return list.owner === email
          if (myFilter === 'member')
            return list.listmembers.some(
              (member: any) => member.email === email
            )
          if (myFilter === 'my')
            return (
              list.owner === email ||
              list.listmembers.some((member: any) => member.email === email)
            )
        }

        // 根据userFilter筛选
        if (userFilter !== 'all') {
          // 检查负责人是否是筛选的用户
          if (list.owner === userFilter) return true

          // 检查列表成员中是否包含筛选的用户
          return list.listmembers.some(
            (member: any) => member.email === userFilter
          )
        }

        // 根据dateFilter筛选
        if (dateFilter !== 'all') {
          const listDate = new Date(list.createdAt)

          if (dateFilter === 'today') {
            const today = new Date()
            return listDate.toDateString() === today.toDateString()
          }

          if (dateFilter === 'yesterday') {
            const today = new Date()
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            return listDate.toDateString() === yesterday.toDateString()
          }

          if (dateFilter === 'thisWeek') {
            const today = new Date()
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay())
            const endOfWeek = new Date(today)
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
            return listDate >= startOfWeek && listDate <= endOfWeek
          }

          if (dateFilter === 'lastWeek') {
            const today = new Date()
            const startOfLastWeek = new Date(today)
            startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
            const endOfLastWeek = new Date(today)
            endOfLastWeek.setDate(today.getDate() - today.getDay() - 1)
            return listDate >= startOfLastWeek && listDate <= endOfLastWeek
          }

          if (dateFilter === 'thisMonth') {
            const today = new Date()
            const startOfMonth = new Date(
              today.getFullYear(),
              today.getMonth(),
              1
            )
            const endOfMonth = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              0
            )
            return listDate >= startOfMonth && listDate <= endOfMonth
          }

          if (dateFilter === 'lastMonth') {
            const today = new Date()
            const startOfLastMonth = new Date(
              today.getFullYear(),
              today.getMonth() - 1,
              1
            )
            const endOfLastMonth = new Date(
              today.getFullYear(),
              today.getMonth(),
              0
            )
            return listDate >= startOfLastMonth && listDate <= endOfLastMonth
          }

          // 自定义日期范围筛选
          if (dateFilter === 'custom' && startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            // 设置时间部分为当天结束
            end.setHours(23, 59, 59, 999)
            return listDate >= start && listDate <= end
          }
        }

        return true
      })
      .map((list: any) => ({
        ...list,
        cards: list.cards.filter((card: any) => {
          const statusMatch =
            statusFilter === 'all' || card.status === statusFilter
          const priorityMatch =
            priorityFilter === 'all' || card.priority === priorityFilter
          return statusMatch && priorityMatch
        }),
      }))
  }

  const getTeamList = async () => {
    const res = await Request._GetTeamlists(projectId, teamId)
    const { data } = res
    if (data) {
      const TeamMembers = data.members || []
      setTeamMember(TeamMembers)
      setLists(data.lists)
      setTeam(data)

      // 应用筛选
      const filtered = filterLists(data.lists)
      setFilteredLists(filtered)
    } else {
      navigate({ to: `/404` })
      console.log('error', res)
      showErrorData(res.error)
    }
  }

  // 更新列表时重新应用筛选
  const handleUpdateList = async (
    teamId: string,
    newList: any,
    listId: string
  ) => {
    const res = await Request._UpdateList(teamId, newList, listId)
    const { data } = res
    if (data) {
      const changes = getChanges(team, newList)
      console.log('changes', changes)
      let changeDescription = ''
      const fieldChanges = [
        { field: 'name', label: '清单名称', verb: '修改为' },
        { field: 'description', label: '清单描述', verb: '修改为' },
        { field: 'owner', label: '负责人', verb: '变更为' },
        { field: 'cards', label: '卡片', verb: '新增' },
      ]
      fieldChanges.forEach(({ field, label, verb }) => {
        if (changes[field]) {
          changeDescription += `${label}${verb}"${changes[field].new}"\n`
        }
      })
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '修改清单',
            description: changeDescription,
            date: Date.now(),
            user: email,
          },
        ],
      })
      getTeamList() // 重新获取数据并应用筛选
      showSuccessData('更新成功')
    } else {
      console.log('error', res)
      showErrorData(res.error)
    }
    return res
  }

  const updateProject = async (data: any) => {
    const res = await Request._UpdateProject(projectId, data)
    if (res.data) {
      getTeamList()
    } else {
      showErrorData('修改项目失败')
      console.error(res)
    }
  }

  const { history } = useRouter()
  const toggleInput = () => {
    setShowSelect(!showSelect)
  }
  const fetchProjectInfo = async () => {
    try {
      const res = await Request._GetProjectDetail(projectId)
      const { data } = res
      if (data.errCode === 403) {
        showErrorData(res.message)
        navigate({ to: `/403` })
        return
      }
      const activitiesData = data.activities.map((activity: any) => ({
        ...activity,
        date: new Date(activity.date).toLocaleString(),
      }))
      setActivities(activitiesData)
    } catch (error) {
      console.error('Error fetching project info:', error)
    }
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
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '创建清单',
            description: `在小队 ${team?.name || ''} 下创建了清单 ${newListTitle}`,
            date: Date.now(),
            user: email,
          },
        ],
      })
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
      const changes = getChanges(team, listData)
      console.log('changes', changes)
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '移动卡片',
            description: `在小队 ${team?.name || ''} 下移动了卡片`,
            date: Date.now(),
            user: email,
          },
        ],
      })
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
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '删除清单',
            description: `在小队 ${team?.name || ''} 下删除清单 ${team.lists.find((item: any) => item.id === list.id).name}`,
            date: Date.now(),
            user: email,
          },
        ],
      })
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
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '复制清单',
            description: `在小队 ${team?.name || ''} 下复制清单 ${list.name}`,
            date: Date.now(),
            user: email,
          },
        ],
      })
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
          <div className='flex space-x-2'>
            {/* 添加与我有关的筛选器 */}
            <Select value={myFilter} onValueChange={setMyFilter}>
              <SelectTrigger className='w-[120px]'>
                <SelectValue placeholder='与我有关' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部清单</SelectItem>
                <SelectItem value='my'>我创建的</SelectItem>
                <SelectItem value='owner'>我负责的</SelectItem>
                <SelectItem value='member'>分配给我的</SelectItem>
              </SelectContent>
            </Select>

            {/* 添加人员筛选器 */}
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className='w-[120px]'>
                <SelectValue placeholder='筛选人员' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部人员</SelectItem>
                {teamMember.map((member) => (
                  <SelectItem key={member.email} value={member.email}>
                    {member.name || member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 添加时间筛选器 */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className='w-[120px]'>
                <SelectValue placeholder='时间筛选' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部时间</SelectItem>
                <SelectItem value='today'>今天</SelectItem>
                <SelectItem value='yesterday'>昨天</SelectItem>
                <SelectItem value='thisWeek'>本周</SelectItem>
                <SelectItem value='lastWeek'>上周</SelectItem>
                <SelectItem value='thisMonth'>本月</SelectItem>
                <SelectItem value='lastMonth'>上月</SelectItem>
                <SelectItem value='custom'>自定义...</SelectItem>
              </SelectContent>
            </Select>

            {/* 自定义日期范围选择器 */}
            {dateFilter === 'custom' && (
              <div className='flex space-x-2'>
                <input
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='rounded border p-2 text-sm'
                />
                <input
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className='rounded border p-2 text-sm'
                />
              </div>
            )}

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[120px]'>
                <SelectValue placeholder='状态筛选' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部状态</SelectItem>
                <SelectItem value='待处理'>待办</SelectItem>
                <SelectItem value='进行中'>进行中</SelectItem>
                <SelectItem value='已完成'>已完成</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='优先级筛选' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部优先级</SelectItem>
                <SelectItem value='重要紧急'>重要紧急</SelectItem>
                <SelectItem value='重要不紧急'>重要不紧急</SelectItem>
                <SelectItem value='不重要紧急'>不重要紧急</SelectItem>
                <SelectItem value='不重要不紧急'>不重要不紧急</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' /> 新建清单
            </Button>
          </div>
        </div>
      </Header>

      <Main>
        {/* 显示当前筛选状态 */}
        {statusFilter !== 'all' ||
        priorityFilter !== 'all' ||
        myFilter !== 'all' ||
        userFilter !== 'all' ||
        dateFilter !== 'all' ||
        (dateFilter === 'custom' && (startDate || endDate)) ? (
          <div className='mb-4 flex items-center space-x-2 rounded bg-blue-50 p-2'>
            <span className='text-sm text-blue-600'>当前筛选：</span>
            {myFilter !== 'all' && (
              <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                {myFilter === 'my'
                  ? '我的清单'
                  : myFilter === 'owner'
                    ? '我是负责人'
                    : '我是成员'}
              </span>
            )}
            {userFilter !== 'all' && (
              <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                {teamMember.find((m) => m.email === userFilter)?.name ||
                  userFilter}
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                {dateFilter === 'custom' && startDate && endDate
                  ? `日期范围: ${startDate} 至 ${endDate}`
                  : dateFilter === 'custom'
                    ? '自定义日期'
                    : dateFilter}
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                状态: {statusFilter}
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                优先级: {priorityFilter}
              </span>
            )}
            <button
              className='text-sm text-blue-600 hover:text-blue-900'
              onClick={() => {
                setStatusFilter('all')
                setPriorityFilter('all')
                setMyFilter('all')
                setUserFilter('all')
                setDateFilter('all')
                setStartDate('')
                setEndDate('')
              }}
            >
              清除筛选
            </button>
          </div>
        ) : null}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className='flex space-x-4 overflow-x-auto pb-4'>
            {filteredLists.length === 0 ? (
              <div className='text-muted-foreground flex w-full flex-col items-center justify-center rounded border p-8'>
                {statusFilter !== 'all' ||
                priorityFilter !== 'all' ||
                myFilter !== 'all' ||
                userFilter !== 'all' ||
                dateFilter !== 'all' ||
                (dateFilter === 'custom' && (startDate || endDate)) ? (
                  <>
                    <NotebookText className='mr-2 mb-2 h-10 w-10' />
                    没有找到符合筛选条件的清单，尝试调整筛选条件
                  </>
                ) : (
                  <>
                    <NotebookText className='mr-2 mb-2 h-10 w-10' />
                    暂无清单，点击右上角按钮创建新清单
                  </>
                )}
              </div>
            ) : (
              filteredLists.map((list) => (
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
