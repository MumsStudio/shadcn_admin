import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import {
  ChevronLeft,
  Edit,
  Plus,
  Users,
  MoreVertical,
  Trash2,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import TeamManagement from './team'
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineDot,
  TimelineSeparator,
  TimelineConnector,
} from './ui/timeline'

type Member = {
  id: string
  name: string
  avatar: string
  role: 'leader' | 'developer' | 'designer' | 'qa'
  joinDate: string
}

export default function ProjectOverview() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentDeleteMember, setCurrentDeleteMember] = useState<Member | null>(
    null
  )
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const { history } = useRouter()
  const [teamNumber, setTeamNumber] = useState<any>(null)

  // 模拟数据 - 实际项目中应从API获取
  const projectInfo = {
    name: '电商平台重构',
    description: '重构现有电商平台的前端架构',
    createdAt: '2023-10-15',
    deadline: '2024-03-30',
    progress: 65,
  }

  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: '张三',
      avatar: '',
      role: 'leader',
      joinDate: '2023-10-15',
    },
    {
      id: '2',
      name: '李四',
      avatar: '',
      role: 'developer',
      joinDate: '2023-10-16',
    },
    {
      id: '3',
      name: '王五',
      avatar: '',
      role: 'designer',
      joinDate: '2023-10-17',
    },
  ])

  const [newMember, setNewMember] = useState({
    name: '',
    role: 'developer' as const,
  })

  const activities = [
    {
      id: '1',
      action: '创建了任务卡片',
      description: '商品详情页性能优化',
      date: '2023-11-20 14:30',
      user: '张三',
    },
    {
      id: '2',
      action: '完成了清单',
      description: '用户认证模块开发',
      date: '2023-11-18 09:15',
      user: '李四',
    },
    {
      id: '3',
      action: '加入了项目',
      description: '作为UI设计师加入',
      date: '2023-11-15 10:00',
      user: '王五',
    },
  ]

  const handleAddMember = () => {
    if (!newMember.name) return

    const member: Member = {
      id: Date.now().toString(),
      name: newMember.name,
      avatar: '',
      role: newMember.role,
      joinDate: new Date().toISOString().split('T')[0],
    }

    setMembers([...members, member])
    setNewMember({ name: '', role: 'developer' })
    setMemberDialogOpen(false)
  }

  const handleEditMember = () => {
    if (!editMember) return

    setMembers(members.map((m) => (m.id === editMember.id ? editMember : m)))
    setEditMember(null)
  }

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  const roleLabels = {
    leader: '组长',
    developer: '开发',
    designer: '设计',
    qa: '测试',
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
          <Button>
            <Edit className='mr-2 h-4 w-4' /> 编辑项目
          </Button>
        </div>
      </Header>

      <Main>
        <div className='flex flex-col'>
          {/* 项目信息卡片 */}
          <div className='flex-1 space-y-6 py-4'>
            <Card>
              <CardHeader>
                <CardTitle>项目概览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <h3 className='text-lg font-medium'>{projectInfo.name}</h3>
                    <p className='text-muted-foreground text-sm'>
                      {projectInfo.description}
                    </p>
                  </div>

                  <div className='flex flex-col items-center space-y-2'>
                    <div className='flex pl-3 text-sm'>
                      <span className='text-muted-foreground'>创建时间：</span>
                      <span>{projectInfo.createdAt}</span>
                    </div>
                    <div className='flex pl-3 text-sm'>
                      <span className='text-muted-foreground'>截止日期：</span>
                      <span>{projectInfo.deadline}</span>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>项目进度</span>
                      <span>{projectInfo.progress}%</span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-blue-500'
                        style={{ width: `${projectInfo.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='grid h-[30rem] grid-cols-1 grid-cols-3 gap-6'>
            {/* 成员列表 */}
            <Card className='col-span-1 h-full'>
              <CardHeader>
                <CardTitle>
                  <div className='flex items-center justify-between space-x-2'>
                    <div className='flex items-center'>
                      项目成员 ({members.length})
                    </div>
                    <Button onClick={() => setMemberDialogOpen(true)}>
                      <Plus className='mr-2 h-4 w-4' /> 添加成员
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className='flex items-center justify-between space-x-3'
                    >
                      <div className='flex items-center space-x-3'>
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='flex'>
                            <p className='mr-2 font-medium'>{member.name}</p>
                            <span className='inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset'>
                              {roleLabels[member.role]}
                            </span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span className='text-muted-foreground text-xs'>
                              加入: {member.joinDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                          >
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => setEditMember(member)}
                            className='flex items-center'
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentDeleteMember(member)
                              setDeleteDialogOpen(true)
                            }}
                            className='flex items-center text-red-500'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 近期活动时间线 */}
            <Card className='lg:col-span-1'>
              <CardHeader>
                <CardTitle>近期活动</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline>
                  {activities.map((activity, index) => (
                    <TimelineItem key={activity.id}>
                      <TimelineSeparator>
                        <TimelineDot className='bg-blue-500' />
                        {index !== activities.length - 1 && (
                          <TimelineConnector />
                        )}
                      </TimelineSeparator>
                      <TimelineContent>
                        <div className='space-y-1'>
                          <div className='flex items-center space-x-2'>
                            <span className='font-medium'>{activity.user}</span>
                            <span className='text-muted-foreground text-sm'>
                              {activity.date}
                            </span>
                          </div>
                          <p className='text-sm'>
                            <span className='text-blue-500'>
                              {activity.action}
                            </span>
                            : {activity.description}
                          </p>
                        </div>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
            {/* 团队管理 */}
            <Card className='lg:col-span-1'>
              <CardHeader>
                <CardTitle>
                  <div className='flex items-center justify-between space-x-2'>
                    <div className='flex items-center'>
                      <Users className='mr-2 h-5 w-5' /> 项目小组 ({teamNumber})
                    </div>
                    <Button onClick={() => setTeamDialogOpen(true)}>
                      <Plus className='mr-2 h-4 w-4' /> 创建小组
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='max-h-[20rem] overflow-y-auto'>
                  <TeamManagement
                    onCloseDialog={() => setTeamDialogOpen(false)}
                    dialogOpen={teamDialogOpen}
                    setteamNumber={setTeamNumber}
                    onOpenDialog={() => setTeamDialogOpen(true)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除成员?</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除成员 {currentDeleteMember?.name} 吗?
                删除后将无法恢复该成员。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (currentDeleteMember) {
                    handleDeleteMember(currentDeleteMember.id)
                  }
                  setDeleteDialogOpen(false)
                }}
              >
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Main>

      {/* 添加成员对话框 */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加新成员</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                姓名
              </Label>
              <Input
                id='name'
                value={newMember.name}
                onChange={(e) =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='role' className='text-right'>
                角色
              </Label>
              <Select
                value={newMember.role}
                onValueChange={(value) =>
                  setNewMember({ ...newMember, role: value as any })
                }
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='选择角色' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='leader'>组长</SelectItem>
                  <SelectItem value='developer'>开发</SelectItem>
                  <SelectItem value='designer'>设计</SelectItem>
                  <SelectItem value='qa'>测试</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddMember}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑成员对话框 */}
      <Dialog
        open={!!editMember}
        onOpenChange={(open) => !open && setEditMember(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑成员</DialogTitle>
          </DialogHeader>
          {editMember && (
            <>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='name' className='text-right'>
                    姓名
                  </Label>
                  <Input
                    id='name'
                    value={editMember.name}
                    onChange={(e) =>
                      setEditMember({ ...editMember, name: e.target.value })
                    }
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='role' className='text-right'>
                    角色
                  </Label>
                  <Select
                    value={editMember.role}
                    onValueChange={(value) =>
                      setEditMember({ ...editMember, role: value as any })
                    }
                  >
                    <SelectTrigger className='col-span-3'>
                      <SelectValue placeholder='选择角色' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='leader'>组长</SelectItem>
                      <SelectItem value='developer'>开发</SelectItem>
                      <SelectItem value='designer'>设计</SelectItem>
                      <SelectItem value='qa'>测试</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleEditMember}>保存</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
