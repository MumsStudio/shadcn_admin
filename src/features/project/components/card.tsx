import { useState } from 'react';
import { Check, ChevronLeft, Edit, MessageSquare, Share, UserPlus, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useRouter } from '@tanstack/react-router';


export default function CardDetail() {
  const [card, setCard] = useState({
    id: 'c1',
    title: '设计登录页面',
    description: '设计并实现用户登录界面，包括手机号登录和第三方登录选项',
    status: '进行中',
    priority: '高',
    dueDate: '2023-12-15',
    assignedTo: [
      { id: 'u1', name: '张三', avatar: '' },
      { id: 'u2', name: '李四', avatar: '' },
    ],
    comments: [
      {
        id: 'cmt1',
        user: { id: 'u1', name: '张三', avatar: '' },
        content: '我已经完成了UI设计稿',
        time: '2023-11-20 14:30',
      },
      {
        id: 'cmt2',
        user: { id: 'u3', name: '王五', avatar: '' },
        content: '后端接口已经准备好了',
        time: '2023-11-21 09:15',
      },
    ],
  })

  const [newComment, setNewComment] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editedCard, setEditedCard] = useState({ ...card })
  const { history } = useRouter()
  const handleStatusChange = (status: string) => {
    setCard({ ...card, status })
  }

  const addComment = () => {
    if (!newComment.trim()) return

    const comment = {
      id: `cmt-${Date.now()}`,
      user: { id: 'current-user', name: '我', avatar: '' },
      content: newComment,
      time: new Date().toLocaleString(),
    }

    setCard({
      ...card,
      comments: [...card.comments, comment],
    })
    setNewComment('')
  }

  const saveCardChanges = () => {
    setCard(editedCard)
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
          <Button variant='ghost' className='px-0' onClick={() => history.go(-1)}>
            <ChevronLeft className='mr-2 h-4 w-4' /> 返回列表
          </Button>

          <Card>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <div className='mt-2 flex items-center space-x-2'>
                    <Badge
                      variant={
                        card.status === '已完成' ? 'default' : 'secondary'
                      }
                    >
                      {card.status}
                    </Badge>
                    <Badge
                      variant={
                        card.priority === '高' ? 'destructive' : 'outline'
                      }
                    >
                      {card.priority}优先级
                    </Badge>
                    <span className='text-muted-foreground text-sm'>
                      截止日期: {card.dueDate}
                    </span>
                  </div>
                </div>
                <Button
                  variant='outline'
                  onClick={() => {
                    setEditedCard({ ...card })
                    setEditDialogOpen(true)
                  }}
                >
                  <Edit className='mr-2 h-4 w-4' /> 编辑
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <h3 className='mb-2 text-sm font-medium'>任务描述</h3>
                <p className='text-muted-foreground'>{card.description}</p>
              </div>

              <div>
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='text-sm font-medium'>负责人</h3>
                  <Button variant='ghost' size='sm'>
                    <UserPlus className='mr-1 h-4 w-4' /> 添加
                  </Button>
                </div>
                <div className='flex space-x-2'>
                  {card.assignedTo.map((user) => (
                    <div
                      key={user.id}
                      className='flex items-center space-x-2 rounded border p-2'
                    >
                      <Avatar className='h-6 w-6'>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className='text-sm'>{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex space-x-2'>
                <Button
                  variant={card.status === '待处理' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handleStatusChange('待处理')}
                >
                  <X className='mr-1 h-4 w-4' /> 待处理
                </Button>
                <Button
                  variant={card.status === '进行中' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handleStatusChange('进行中')}
                >
                  进行中
                </Button>
                <Button
                  variant={card.status === '已完成' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handleStatusChange('已完成')}
                >
                  <Check className='mr-1 h-4 w-4' /> 完成
                </Button>
              </div>

              <div>
                <h3 className='mb-2 text-sm font-medium'>
                  讨论 ({card.comments.length})
                </h3>
                <div className='space-y-4'>
                  {card.comments.map((comment) => (
                    <div key={comment.id} className='flex space-x-3'>
                      <Avatar>
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback>
                          {comment.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm font-medium'>
                            {comment.user.name}
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            {comment.time}
                          </span>
                        </div>
                        <p className='mt-1 text-sm'>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-4 flex space-x-2'>
                  <Avatar>
                    <AvatarFallback>我</AvatarFallback>
                  </Avatar>
                  <div className='flex-1 space-y-2'>
                    <Textarea
                      placeholder='添加评论...'
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className='flex justify-end'>
                      <Button size='sm' onClick={addComment}>
                        <MessageSquare className='mr-1 h-4 w-4' /> 评论
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 编辑卡片对话框 */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑卡片</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>标题</Label>
                <Input
                  value={editedCard.title}
                  onChange={(e) =>
                    setEditedCard({ ...editedCard, title: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label>描述</Label>
                <Textarea
                  value={editedCard.description}
                  onChange={(e) =>
                    setEditedCard({
                      ...editedCard,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>状态</Label>
                  <Select
                    value={editedCard.status}
                    onValueChange={(value) =>
                      setEditedCard({ ...editedCard, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择状态' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='待处理'>待处理</SelectItem>
                      <SelectItem value='进行中'>进行中</SelectItem>
                      <SelectItem value='已完成'>已完成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>优先级</Label>
                  <Select
                    value={editedCard.priority}
                    onValueChange={(value) =>
                      setEditedCard({ ...editedCard, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择优先级' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='低'>低</SelectItem>
                      <SelectItem value='中'>中</SelectItem>
                      <SelectItem value='高'>高</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>截止日期</Label>
                <Input
                  type='date'
                  value={editedCard.dueDate}
                  onChange={(e) =>
                    setEditedCard({ ...editedCard, dueDate: e.target.value })
                  }
                />
              </div>

              <div className='flex justify-end space-x-2'>
                <Button
                  variant='outline'
                  onClick={() => setEditDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={saveCardChanges}>保存</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}