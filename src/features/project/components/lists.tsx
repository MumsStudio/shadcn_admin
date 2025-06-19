import { useEffect, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { IconPlus, IconCircleDashedCheck } from '@tabler/icons-react'
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
import { useAuthStore } from '@/stores/authStore'
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import Request from '../request'
import { CardDialog } from './ui/card-dialog'
import { ConfirmDialog } from './ui/confirm-dialog'

export default function ListManagement() {
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
  const [newListTitle, setNewListTitle] = useState('')
  const [editList, setEditList] = useState<any>({})
  const [teamMember, setTeamMember] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState<any[]>([])
  const [showSelect, setShowSelect] = useState(false)
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  const { projectId, id: teamId } = Route.useParams()
  useEffect(() => {
    getTeamList()
  }, [])
  useEffect(() => {
    if (dialogOpen === false) {
      setNewListTitle('')
      setEditList({})
      setSelectedMember([])
    }
  }, [dialogOpen])
  useEffect(() => {
    if (cardDialogOpen === false) {
      setEditList({})
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
  const handleCardOption = async (cards: any) => {
    console.log('cards', cards)
    const newList = {
      cards: [...editList.cards, cards],
    }
    // return
    const res = await Request._UpdateList(teamId, newList, editList.id)
    const { data } = res
    if (data) {
      getTeamList()
      showSuccessData('新增成功')
    } else {
      console.log('error', res)
      showErrorData(res.error)
    }
    setCardDialogOpen(false)
  }
  const updateList = async () => {
    if (!newListTitle.trim()) return

    const newList = {
      name: newListTitle,
      listmembers: selectedMember,
    }
    const res = await Request._UpdateList(teamId, newList, editList.id)
    const { data } = res
    if (data) {
      getTeamList()
      showSuccessData('更新成功')
    } else {
      console.log('error', res)
      showErrorData(res.error)
    }
    setDialogOpen(false)
  }
  const moveCard = (fromListId: string, toListId: string, cardId: string) => {
    // 实现卡片移动逻辑
    console.log(`Moving card ${cardId} from ${fromListId} to ${toListId}`)
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
  const handleClickCard = (cardId: string) => () => {
    navigate({ to: `/project/card/${cardId}` })
  }
  const openConfirmDialog = (list: any) => {
    setConfirmDialog({
      open: true,
      title: '确认删除项目?',
      description: `您确定要删除项目 ${list?.name} 吗? 删除后将无法恢复该项目。`,
      list,
    })
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
        <div className='flex space-x-4 overflow-x-auto pb-4'>
          {lists.length === 0 ? (
            <div className='text-muted-foreground flex w-full flex-col items-center justify-center rounded border p-8'>
              <NotebookText className='mr-2 mb-2 h-10 w-10' />
              暂无清单，点击右上角按钮创建新清单
            </div>
          ) : (
            lists.map((list) => (
              <div key={list.id} className='w-72 flex-shrink-0'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 p-4'>
                    <CardTitle className='text-sm font-medium'>
                      {list.name}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setDialogOpen(true)
                            setNewListTitle(list.name)
                            setEditList(list)
                            setSelectedMember(list.listmembers)
                          }}
                        >
                          <Edit className='mr-2 h-4 w-4' /> 编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateList(list)}
                        >
                          <Copy className='mr-2 h-4 w-4' />
                          复制
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-500'
                          onClick={() => openConfirmDialog(list)}
                        >
                          <Trash className='mr-2 h-4 w-4 text-red-500' />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className='space-y-2 p-4 pt-0'>
                    {list.cards.map((card: any) => (
                      <div
                        key={card.id}
                        className='flex items-center justify-between rounded border p-3 hover:shadow'
                        draggable
                        onClick={handleClickCard(card.id)}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('cardId', card.id)
                          e.dataTransfer.setData('fromListId', list.id)
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const fromListId =
                            e.dataTransfer.getData('fromListId')
                          const cardId = e.dataTransfer.getData('cardId')
                          if (fromListId !== list.id) {
                            moveCard(fromListId, list.id, cardId)
                          }
                        }}
                      >
                        <div>
                          <p className='text-sm'>{card.title}</p>
                          <p className='text-muted-foreground text-xs'>
                            负责人: {card.assignedTo}
                          </p>
                        </div>
                        <GripVertical className='text-muted-foreground h-4 w-4 cursor-move' />
                      </div>
                    ))}
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-muted-foreground w-full justify-start'
                      onClick={() => {
                        setCardDialogOpen(true), setEditList(list)
                      }}
                    >
                      <Plus className='mr-2 h-4 w-4' /> 添加卡片
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>

        {/* 创建清单对话框 */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {Object.keys(editList).length ? '编辑清单' : '新建清单'}
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <Label htmlFor='title'>清单标题</Label>
              <Input
                placeholder='清单标题'
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />
              <Label htmlFor='title'>负责人</Label>
              <Input placeholder='负责人' value={email} disabled={true} />
              <Label htmlFor='title'>协作者</Label>
              <div className='module-content flex flex-col'>
                {teamMember && teamMember.length > 0 ? (
                  <div className='member-list flex flex-wrap items-center gap-2'>
                    {selectedMember.map((user) => (
                      <div key={user.email} className='relative'>
                        <Avatar className='z-1 size-10'>
                          <AvatarImage
                            src={''}
                            alt={user.username || user.email}
                          />
                          <AvatarFallback className='bg-[#2CB0C8]'>
                            {/* {`${user.firstName?.substring(0, 1)}${user.lastName?.substring(0, 1)}` || */}
                            {user.email.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => handleRemoveUser(user.email)}
                          className='absolute -top-1 -right-1 z-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={toggleInput}
                      className='add-member-btn border border-gray-300'
                    >
                      <IconPlus size={30} className='text-gray-300' />
                    </button>
                  </div>
                ) : (
                  <div className='text-center text-gray-600'>
                    该小组暂无其他成员，请先添加至小组
                  </div>
                )}

                {showSelect && (
                  <div className='mt-2 flex items-center gap-2'>
                    <Select onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder='选择成员' />
                      </SelectTrigger>
                      <SelectContent className='z-100000'>
                        {teamMember.map((user: any) => (
                          <SelectItem
                            key={user.id}
                            value={user.email}
                            disabled={selectedMember.some(
                              (u) => u.email === user.email
                            )}
                            className={
                              selectedMember.some((u) => u.email === user.email)
                                ? 'notselected'
                                : ''
                            }
                          >
                            {user.username || user.email}
                            {selectedMember.some(
                              (u) => u.email === user.email
                            ) ? (
                              <IconCircleDashedCheck className='text-green-500' />
                            ) : (
                              <></>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className='flex justify-end space-x-2'>
                <Button variant='outline' onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  onClick={
                    Object.keys(editList).length ? updateList : createNewList
                  }
                >
                  保存
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <CardDialog
          open={cardDialogOpen}
          onOpenChange={setCardDialogOpen}
          onSubmit={async (data) => {
            handleCardOption(data)
          }}
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
