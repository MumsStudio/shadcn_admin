import { useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import {
  Plus,
  GripVertical,
  Edit,
  MoreVertical,
  ChevronLeft,
} from 'lucide-react'
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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export default function ListManagement() {
  const [lists, setLists] = useState([
    {
      id: '1',
      title: '待处理',
      cards: [
        { id: '1111', title: '设计登录页面', assignedTo: '张三' },
        { id: 'c2', title: 'API接口文档', assignedTo: '李四' },
      ],
    },
    {
      id: '2',
      title: '进行中',
      cards: [{ id: 'c3', title: '用户注册功能', assignedTo: '王五' }],
    },
    {
      id: '3',
      title: '已完成',
      cards: [{ id: 'c4', title: '项目初始化', assignedTo: '赵六' }],
    },
  ])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const navigate = useNavigate()
  const { history } = useRouter()
  const createNewList = () => {
    if (!newListTitle.trim()) return

    const newList = {
      id: `list-${Date.now()}`,
      title: newListTitle,
      cards: [],
    }

    setLists([...lists, newList])
    setNewListTitle('')
    setDialogOpen(false)
  }

  const moveCard = (fromListId: string, toListId: string, cardId: string) => {
    // 实现卡片移动逻辑
    console.log(`Moving card ${cardId} from ${fromListId} to ${toListId}`)
  }
  const handleClickCard = (cardId: string) => () => {
    console.log(`Card ${cardId} clicked`)
    navigate({ to: `/project/card/${cardId}` })
  }
  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4 justify-between w-full'>
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
          {lists.map((list) => (
            <div key={list.id} className='w-72 flex-shrink-0'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 p-4'>
                  <CardTitle className='text-sm font-medium'>
                    {list.title}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit className='mr-2 h-4 w-4' /> 编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-red-500'>
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className='space-y-2 p-4 pt-0'>
                  {list.cards.map((card) => (
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
                        const fromListId = e.dataTransfer.getData('fromListId')
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
                  >
                    <Plus className='mr-2 h-4 w-4' /> 添加卡片
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* 创建清单对话框 */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建清单</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <Input
                placeholder='清单标题'
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />
              <div className='flex justify-end space-x-2'>
                <Button variant='outline' onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={createNewList}>创建</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
