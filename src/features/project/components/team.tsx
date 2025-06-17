import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Edit,
  Plus,
  Users,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
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
import { Badge } from '@/components/ui/badge'
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
import { Main } from '@/components/layout/main'

interface TeamManagementProps {
  onCloseDialog: () => void
  onOpenDialog: () => void
  dialogOpen: boolean
  setteamNumber: (teamNumber: any) => void
}

export default function TeamManagement({
  onCloseDialog,
  dialogOpen,
  setteamNumber,
  onOpenDialog
}: TeamManagementProps) {
  const [teams, setTeams] = useState([
    {
      id: '1',
      name: '前端开发组',
      description: '负责前端界面开发',
      members: [
        { id: 'u1', name: '张三', role: '前端工程师' },
        { id: 'u2', name: '李四', role: 'UI开发' },
      ],
      expanded: false,
    },
    {
      id: '2',
      name: '后端开发组',
      description: '负责API和服务端开发',
      members: [
        { id: 'u3', name: '王五', role: '后端工程师' },
        { id: 'u4', name: '赵六', role: '数据库管理员' },
      ],
      expanded: false,
    },
  ])
  useEffect(() => {
    setteamNumber(teams.length)
  }, [teams])
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDesc, setNewTeamDesc] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentDeleteTeam, setCurrentDeleteTeam] = useState<null | {
    id: string
    name: string
  }>(null)
  const [editMode, setEditMode] = useState(false)
  const [currentEditTeam, setCurrentEditTeam] = useState<null | {
    id: string
    name: string
    description: string
  }>(null)
  const navigate = useNavigate()
  const toggleExpand = (teamId: string) => {
    setTeams(
      teams.map((team) =>
        team.id === teamId ? { ...team, expanded: !team.expanded } : team
      )
    )
  }
  const handleTolistClick = (teamId: string) => {
    // 处理小组点击事件，例如跳转到小组详情页
    console.log(`跳转到小组 ${teamId} 的详情页`)
    navigate({ to: `/project/list/${teamId}` })
  }
  const createNewTeam = () => {
    if (!newTeamName.trim()) return

    if (editMode && currentEditTeam) {
      setTeams(
        teams.map((team) =>
          team.id === currentEditTeam.id
            ? { ...team, name: newTeamName, description: newTeamDesc }
            : team
        )
      )
      setEditMode(false)
    } else {
      const newTeam = {
        id: `team-${Date.now()}`,
        name: newTeamName,
        description: newTeamDesc,
        members: [],
        expanded: false,
      }
      setTeams([...teams, newTeam])
    }

    setNewTeamName('')
    setNewTeamDesc('')
    onCloseDialog()
  }
  return (
    <>
      <Main>
        <div className='space-y-4'>
          <div>
            <CardContent>
              <div className='space-y-4'>
                {teams.length === 0 ? (
                  <div className='flex flex-col items-center justify-center space-y-4 rounded-lg border p-8 text-center'>
                    <Users className='h-12 w-12 text-muted-foreground' />
                    <h3 className='text-lg font-medium'>暂无小组</h3>
                    <p className='text-muted-foreground text-sm'>
                      您还没有创建任何小组，点击按钮创建一个小组
                    </p>
                    <Button onClick={onOpenDialog}>
                      <Plus className='mr-2 h-4 w-4' /> 创建小组
                    </Button>
                  </div>
                ) : (
                  teams.map((team) => (
                    <div key={team.id} className='rounded-lg border p-4'>
                    <div
                      className='flex cursor-pointer items-center justify-between'
                      onClick={() => handleTolistClick(team.id)}
                    >
                      <div>
                        <h3 className='font-medium'>{team.name}</h3>
                        <p className='text-muted-foreground text-sm'>
                          {team.description}
                        </p>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Badge
                          variant='secondary'
                          onClick={(e) => {
                            toggleExpand(team.id), e.stopPropagation()
                          }}
                        >
                          {team.members.length}人
                        </Badge>
                        {team.expanded ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setCurrentEditTeam({
                                  id: team.id,
                                  name: team.name,
                                  description: team.description,
                                })
                                setNewTeamName(team.name)
                                setNewTeamDesc(team.description)
                                setEditMode(true)
                                onOpenDialog()
                              }}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className='text-destructive'
                              onClick={(e) => {
                                e.stopPropagation()
                                setCurrentDeleteTeam({
                                  id: team.id,
                                  name: team.name,
                                })
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {team.expanded && (
                      <div className='mt-4 space-y-3'>
                        <div className='flex items-center justify-between'>
                          <h4 className='text-sm font-medium'>小组成员</h4>
                          <Button variant='ghost' size='sm'>
                            <Plus className='mr-1 h-3 w-3' /> 添加成员
                          </Button>
                        </div>

                        <div className='space-y-2'>
                          {team.members.map((member) => (
                            <div
                              key={member.id}
                              className='flex items-center justify-between rounded p-2 hover:bg-gray-50'
                            >
                              <div className='flex items-center space-x-3'>
                                <Avatar className='h-8 w-8'>
                                  <AvatarImage src='' />
                                  <AvatarFallback>
                                    {member.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='text-sm font-medium'>
                                    {member.name}
                                  </p>
                                  <p className='text-muted-foreground text-xs'>
                                    {member.role}
                                  </p>
                                </div>
                              </div>
                              <Button variant='ghost' size='sm'>
                                <Edit className='h-3 w-3' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )))}
              </div>
            </CardContent>
          </div>
        </div>

        {/* 创建小组对话框 */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditMode(false)
              setNewTeamName('')
              setNewTeamDesc('')
            }
            onCloseDialog()
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editMode ? '编辑小组' : '创建新小组'}</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <Input
                placeholder='小组名称'
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <Input
                placeholder='小组描述 (可选)'
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
              />
              <div className='flex justify-end space-x-2'>
                <Button variant='outline' onClick={() => onCloseDialog()}>
                  取消
                </Button>
                <Button onClick={createNewTeam}>确定</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 删除小组确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除小组?</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除小组 {currentDeleteTeam?.name} 吗?
                删除后将无法恢复该小组。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (currentDeleteTeam) {
                    setTeams(teams.filter((t) => t.id !== currentDeleteTeam.id))
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
    </>
  )
}
