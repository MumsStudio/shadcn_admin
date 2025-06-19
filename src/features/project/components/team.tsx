import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { IconCircleDashedCheck } from '@tabler/icons-react'
import {
  Edit,
  Plus,
  Users,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  User,
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
  DialogFooter,
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
import { Main } from '@/components/layout/main'
import { ConfirmDialog } from './ui/confirm-dialog'

interface TeamManagementProps {
  roleLabels: { [key: string]: string }
  onCloseDialog: () => void
  onOpenDialog: () => void
  dialogOpen: boolean
  teams: any[]
  toggleExpand: (teamId: string) => void
  createNewTeam: (teamName: string, teamDesc: string, teamOwner: string) => void
  updateTeam: (
    EditTeam: any,
    teamName: string,
    teamDesc: string,
    teamOwner: string
  ) => void
  deleteTeam: (teamId: string) => void
  teamMemberDialogOpen: boolean
  AddTeamMember: (teamId: string, memberData: any) => void
  filteredUsers: any[]
  openTeamMemberDialog: () => void
  closeTeamMemberDialog: () => void
  handleConfirmAction: (confirmDialog: any) => void
}

export default function TeamManagement({
  onCloseDialog,
  dialogOpen,
  onOpenDialog,
  teams,
  toggleExpand,
  createNewTeam,
  updateTeam,
  deleteTeam,
  roleLabels,
  teamMemberDialogOpen,
  filteredUsers,
  AddTeamMember,
  openTeamMemberDialog,
  closeTeamMemberDialog,
  handleConfirmAction,
}: TeamManagementProps) {
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDesc, setNewTeamDesc] = useState('')
  const [newTeamOwner, setNewTeamOwner] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentDeleteTeam, setCurrentDeleteTeam] = useState<null | {
    id: string
    name: string
  }>(null)
  const [editMode, setEditMode] = useState(false)
  const [memberData, setMemberData] = useState<any>({})
  const [currentAddMember, setCurrentAddMember] = useState<any>({})
  const [currentEditTeam, setCurrentEditTeam] = useState<null | {
    id: string
    name: string
    description: string
    owner: string
    members: any[]
  }>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    team: null,
    member: null,
  })
  const navigate = useNavigate()
  const onConfirm = () => {
    handleConfirmAction(confirmDialog)
  }
  const openConfirmDialog = (team: any, member: any) => {
    setConfirmDialog({
      open: true,
      title: '确认删除该成员?',
      description: `您确定要删除小组 ${team?.name} 中的成员 ${member.email} 吗? 删除后将无法恢复。`,
      team,
      member,
    })
  }
  const handleTolistClick = (teamId: string) => {
    // 处理小组点击事件，例如跳转到小组详情页
    console.log(`跳转到小组 ${teamId} 的详情页`)
    navigate({ to: `/project/list/${teamId}` })
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
                    <Users className='text-muted-foreground h-12 w-12' />
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
                          <div className='flex items-center space-x-2'>
                            <h3 className='font-medium'>{team.name}</h3>
                            <p className='text-muted-foreground text-sm'>
                              {team.description}
                            </p>
                          </div>
                          <div className='text-[14px]'>负责人：{team.owner}</div>
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
                                    members: team.members,
                                    description: team.description,
                                    owner: team.owner,
                                  })
                                  setNewTeamName(team.name)
                                  setNewTeamDesc(team.description)
                                  setNewTeamOwner(team.owner)
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
                      <ConfirmDialog
                        open={confirmDialog.open}
                        onOpenChange={(open) =>
                          setConfirmDialog({ ...confirmDialog, open })
                        }
                        title={confirmDialog.title}
                        description={confirmDialog.description}
                        onConfirm={onConfirm}
                      />
                      {team.expanded && (
                        <div className='mt-4 space-y-3'>
                          <div className='flex items-center justify-between'>
                            <h4 className='text-sm font-medium'>小组成员</h4>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setCurrentAddMember(team),
                                  openTeamMemberDialog()
                              }}
                            >
                              <Plus className='mr-1 h-3 w-3' /> 添加成员
                            </Button>
                          </div>

                          <div className='space-y-2'>
                            {team.members.map((member: any) => (
                              <div
                                key={member.id}
                                className='flex items-center justify-between rounded p-2 hover:bg-gray-50'
                              >
                                <div className='flex items-center space-x-3'>
                                  <Avatar className='h-8 w-8'>
                                    <AvatarImage src='' />
                                    <AvatarFallback>
                                      {member.email}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className='text-sm font-medium'>
                                      {member.email}
                                    </p>
                                    <p className='text-muted-foreground text-xs'>
                                      {roleLabels[member.role]}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={(e) => {
                                    e.stopPropagation(),
                                      openConfirmDialog(team, member)
                                  }}
                                >
                                  <Trash2 className='h-3 w-3' />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </div>
        </div>
        <Dialog
          open={teamMemberDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setMemberData({})
              setCurrentAddMember({})
            }
            closeTeamMemberDialog()
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新成员</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  成员列表
                </Label>

                <Select
                  value={memberData}
                  onValueChange={(value) => setMemberData(value)}
                >
                  <SelectTrigger className='w-[300px]'>
                    <SelectValue placeholder='选择用户' />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers &&
                      filteredUsers.map((user: any) => (
                        <SelectItem
                          key={user.id}
                          value={user.email}
                          disabled={(() => {
                            const foundTeam = teams.find(
                              (team: any) => team.id === currentAddMember?.id
                            )
                            if (foundTeam && foundTeam.members) {
                              return foundTeam.members.some(
                                (member: any) => member.email === user.email
                              )
                            }
                            return false
                          })()}
                          className={
                            (() => {
                              const foundTeam = teams.find(
                                (team: any) => team.id === currentAddMember?.id
                              )
                              if (foundTeam && foundTeam.members) {
                                return foundTeam.members.some(
                                  (member: any) => member.email === user.email
                                )
                              }
                              return false
                            })()
                              ? 'notselected'
                              : ''
                          }
                        >
                          {user.username || user.email}
                          {(() => {
                            const foundTeam = teams.find(
                              (team: any) => team.id === currentAddMember?.id
                            )
                            if (foundTeam && foundTeam.members) {
                              return foundTeam.members.some(
                                (member: any) => member.email === user.email
                              )
                            }
                            return false
                          })() ? (
                            <IconCircleDashedCheck className='text-green-500' />
                          ) : (
                            <></>
                          )}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => AddTeamMember(currentAddMember, memberData)}
              >
                添加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* 创建小组对话框 */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditMode(false)
              setNewTeamName('')
              setNewTeamDesc('')
              setNewTeamOwner('')
            }
            onCloseDialog()
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editMode ? '编辑小组' : '创建新小组'}</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <Label htmlFor='project-name'>小组名称</Label>
              <Input
                placeholder='小组名称'
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <Label htmlFor='project-name'>小组描述</Label>
              <Input
                placeholder='小组描述 (可选)'
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
              />
              <Label htmlFor='project-name'>小组负责人</Label>
              <Select
                value={newTeamOwner}
                onValueChange={(value) => setNewTeamOwner(value)}
              >
                <SelectTrigger className='w-[300px]'>
                  <SelectValue placeholder='选择用户' />
                </SelectTrigger>
                <SelectContent>
                  {editMode
                    ? currentEditTeam &&
                      currentEditTeam?.members &&
                      currentEditTeam.members.map((user: any) => (
                        <SelectItem key={user.id} value={user.email}>
                          {user.username || user.email}
                        </SelectItem>
                      ))
                    : filteredUsers &&
                      filteredUsers.map((user: any) => (
                        <SelectItem key={user.id} value={user.email}>
                          {user.username || user.email}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>

              <div className='flex justify-end space-x-2'>
                <Button variant='outline' onClick={() => onCloseDialog()}>
                  取消
                </Button>
                <Button
                  onClick={() =>
                    editMode
                      ? updateTeam(
                          currentEditTeam,
                          newTeamName,
                          newTeamDesc,
                          newTeamOwner
                        )
                      : createNewTeam(newTeamName, newTeamDesc, newTeamOwner)
                  }
                >
                  确定
                </Button>
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
                  // if (currentDeleteTeam) {
                  //   setTeams(teams.filter((t) => t.id !== currentDeleteTeam.id))
                  // }
                  deleteTeam(currentDeleteTeam?.id as string)
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
