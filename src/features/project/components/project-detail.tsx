import { useEffect, useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { IconCircleDashedCheck } from '@tabler/icons-react';
import { Route } from '@/routes/_authenticated/project/detail.$id';
import { ChevronLeft, Edit, Plus, Users, MoreVertical, Trash2, Activity, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getChanges } from '@/utils/common';
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import Request from '../request';
import TeamManagement from './team';
import { EditProjectDialog } from './ui/dialog';
import { Timeline, TimelineItem, TimelineContent, TimelineDot, TimelineSeparator, TimelineConnector } from './ui/timeline';


type Member = {
  id: string
  email: string
  avatar?: string
  role: 'leader' | 'developer' | 'designer' | 'qa'
  joinedAt: string
}

export default function ProjectOverview() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentDeleteMember, setCurrentDeleteMember] = useState<Member | null>(
    null
  )
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [projectInfo, setProjectInfo] = useState<any>({})
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [teamMemberDialogOpen, setTeamMemberDialogOpen] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [activities, setActivities] = useState<any>([])
  const [filteredUsers, setFilteredUsers] = useState<any>([])
  const [editOpen, setEditOpen] = useState(false)
  const { history } = useRouter()
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  const [users, setUsers] = useState<any>([])
  const [members, setMembers] = useState<Member[]>([])
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'developer' as const,
  })
  const [teams, setTeams] = useState<any>([])
  useEffect(() => {
    fetchProjectInfo()
  }, [])
  useEffect(() => {
    fetchUsers()
  }, [memberDialogOpen === true])
  const updateProject = async (data: any) => {
    const res = await Request._UpdateProject(id, data)
    if (res.data) {
      fetchProjectInfo()
    } else {
      showErrorData('修改项目失败')
      console.error(res)
    }
  }
  const fetchProjectInfo = async () => {
    try {
      const res = await Request._GetProjectDetail(id)
      const { data } = res
      if (data.errCode === 403) {
        showErrorData(res.message)
        navigate({ to: `/403` })
        return
      }
      const projectData = {
        ...data,
        createdAt: new Date(data.createdAt).toLocaleDateString(),
        deadline: new Date(data.deadline).toLocaleDateString(),
      }
      const teamsData = data.teams.map((team: any) => ({
        ...team,
        expanded: false,
      }))
      const activitiesData = data.activities.map((activity: any) => ({
        ...activity,
        date: new Date(activity.date).toLocaleString(),
      }))
      const membersData = data.members.map((member: any) => ({
        ...member,
        joinedAt: new Date(member.joinedAt).toLocaleString(),
      }))
      setProjectInfo(projectData)
      setMembers(membersData)
      setActivities(activitiesData)
      setTeams(teamsData)
      setFilteredUsers(membersData)
    } catch (error) {
      console.error('Error fetching project info:', error)
    }
  }
  const fetchUsers = async () => {
    try {
      const response = await Request._GetUsers()
      const data = response.data
      setUsers(data)
    } catch (error) {
      showErrorData('获取用户列表失败')
      console.error('Failed to fetch users:', error)
    }
  }
  const handleAddMember = async () => {
    if (!newMember.email) return

    const member = {
      email: newMember.email,
      role: newMember.role,
    }
    const res = await Request._AddProjectMember(id, member)
    if (res.data) {
      fetchProjectInfo()
      showSuccessData('添加成员成功')
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '添加成员',
            description: `${newMember.email} 作为 ${roleLabels[newMember.role]} 加入项目`,
            date: Date.now(),
            user: email,
          },
        ],
      })
    } else {
      showErrorData('添加成员失败')
      console.error(res)
    }
    setNewMember({ email: '', role: 'developer' })
    setMemberDialogOpen(false)
  }

  const handleEditMember = async () => {
    if (!editMember) return
    const editMemberData = {
      ...editMember,
      joinedAt: new Date(editMember.joinedAt),
    }
    const res = await Request._EditProjectMember(
      id,
      editMemberData,
      editMember.id
    )
    if (res.data) {
      fetchProjectInfo()
      showSuccessData('编辑成员成功')
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '编辑成员',
            description: `修改 ${editMemberData.email} 为 ${roleLabels[editMemberData.role]} `,
            date: Date.now(),
            user: email,
          },
        ],
      })
    } else {
      showErrorData('编辑成员失败')
      console.error(res)
    }
    setEditMember(null)
  }

  const handleDeleteMember = async (MemberId: string) => {
    const res = await Request._DeleteProjectMember(id, MemberId)
    if (res.data) {
      if (res.data.message) {
        showErrorData(res.data.message)
      } else {
        fetchProjectInfo()
        showSuccessData('删除成员成功')
        updateProject({
          activities: [
            ...activities,
            {
              id: Date.now(),
              action: '删除成员',
              description: `${members.find((member: any) => member.id === MemberId)?.email}`,
              date: Date.now(),
              user: email,
            },
          ],
        })
      }
    } else {
      showErrorData('删除成员失败')
      console.error(res)
    }
  }
  const handleCreateNewTeam = async (
    name: string,
    description: string,
    owner: string
  ) => {
    const newTeam = {
      name: name,
      description: description,
      members: [members.find((member: any) => member.email === owner)],
      owner: owner,
    }
    const res = await Request._AddProjectTeam(id, newTeam)
    if (res.data) {
      fetchProjectInfo()
      showSuccessData('创建团队成功')
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '创建小队',
            description: `${name}，负责人为 ${owner}`,
            date: Date.now(),
            user: email,
          },
        ],
      })
    } else {
      showErrorData('创建团队失败')
      console.error(res)
    }
    setTeamDialogOpen(false)
  }
  const handleDeleteTeam = async (teamId: string) => {
    const res = await Request._DeleteProjectTeam(id, teamId)
    if (res.data) {
      fetchProjectInfo()
      showSuccessData('删除团队成功')
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '删除小队',
            description: `${teams.find((team: any) => team.id === teamId)?.name}`,
            date: Date.now(),
            user: email,
          },
        ],
      })
    } else {
      showErrorData('删除团队失败')
      console.error(res)
    }
  }
  const handleUpdateTeam = async (
    editTeam: any,
    name: string,
    description: string,
    owner: string
  ) => {
    const updateTeam = {
      ...editTeam,
      name: name,
      description: description,
      owner: owner,
    }
    const oldTeam = teams.find((team: any) => team.id === editTeam.id)
    const changes = getChanges(oldTeam, updateTeam)
    let changeDescription = ''
    const fieldChanges = [
      { field: 'name', label: '小队名称', verb: '修改为' },
      { field: 'description', label: '小队描述', verb: '修改为' },
      { field: 'owner', label: '小队负责人', verb: '变更为' },
    ]

    fieldChanges.forEach(({ field, label, verb }) => {
      if (changes[field]) {
        changeDescription += `${label}从"${changes[field].old}"${verb}"${changes[field].new}"\n`
      }
    })

    if (!changeDescription) {
      changeDescription = '小队信息未发生变化'
    }
    const res = await Request._UpdateProjectTeam(id, updateTeam, editTeam.id)
    if (res.data) {
      fetchProjectInfo()
      showSuccessData('编辑小队成功')
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '编辑小队',
            description: changeDescription,
            date: Date.now(),
            user: email,
          },
        ],
      })
    } else {
      showErrorData('编辑小队失败')
      console.error(res)
    }
    setTeamDialogOpen(false)
  }
  const handleAddTeamMember = async (team: any, memberData: string) => {
    const addTeamMembers = members.find(
      (member: any) => member.email === memberData
    )
    const updateTeam = {
      members: [...team.members, addTeamMembers],
    }
    const res = await Request._UpdateProjectTeam(id, updateTeam, team.id)
    if (res.data) {
      fetchProjectInfo()
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '添加小队成员',
            description: `${addTeamMembers?.email}`,
            date: Date.now(),
            user: email,
          },
        ],
      })
      showSuccessData('添加团队成员成功')
    } else {
      showErrorData('添加团队成员失败')
      console.error(res)
    }
    setTeamMemberDialogOpen(false)
  }
  const handleConfirmAction = async (confirmDialog: any) => {
    const { member, team } = confirmDialog
    const isOwner = member.email === team.owner
    if (isOwner) {
      showErrorData('小组负责人不能删除')
      return
    }
    const deletTeamMembers = team.members.filter(
      (item: any) => item.email !== member.email
    )
    const deleteListMembers = team.lists.some((item: any) =>
      item.listmembers.some(
        (listmember: any) => listmember.email === member.email
      )
    )
    if (deleteListMembers) {
      showErrorData('小组成员已分配任务，不能删除')
      return
    }
    const updateTeam = {
      members: [...deletTeamMembers],
    }
    const res = await Request._UpdateProjectTeam(id, updateTeam, team.id)
    if (res.data) {
      fetchProjectInfo()
      updateProject({
        activities: [
          ...activities,
          {
            id: Date.now(),
            action: '删除小队',
            description: `${teams.find((team: any) => team.id === team.id)?.name}`,
            date: Date.now(),
            user: email,
          },
        ],
      })
      showSuccessData('删除团队成员成功')
    } else {
      showErrorData('删除团队成员失败')
      console.error(res)
    }
  }
  const handleToggleExpand = (id: string) => {
    if (!teams) return
    setTeams(
      teams.map((team: any) =>
        team.id === id ? { ...team, expanded: !team.expanded } : team
      )
    )
  }
  const handleEditProject = async (data: any) => {
    const formatData = {
      ...data,
      deadline: new Date(data.deadline).toLocaleDateString(),
    }
    const changes = getChanges(projectInfo, formatData)
    let changeDescription = ''
    const fieldChanges = [
      { field: 'name', label: '项目名称', verb: '修改为' },
      { field: 'description', label: '项目描述', verb: '修改为' },
      { field: 'deadline', label: '截止日期', verb: '变更为' },
      { field: 'status', label: '项目状态', verb: '变更为' },
    ]
    fieldChanges.forEach(({ field, label, verb }) => {
      if (changes[field]) {
        changeDescription += `${label}${verb}"${changes[field].new}"\n`
      }
    })
    const newData = {
      ...data,
      activities: [
        ...activities,
        {
          id: Date.now(),
          action: '修改项目信息',
          description: changeDescription,
          date: Date.now(),
          user: email,
        },
      ],
    }
    const res = await Request._UpdateProject(id, newData)
    if (res.data) {
      fetchProjectInfo()
      showSuccessData('修改项目成功')
    } else {
      showErrorData('修改项目失败')
      console.error(res)
    }
  }
  const roleLabels = {
    owner: '项目负责人',
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
          <Button onClick={() => setEditOpen(true)}>
            <Edit className='mr-2 h-4 w-4' /> 编辑项目
          </Button>
          <EditProjectDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            onSubmit={handleEditProject}
            initialData={{
              name: projectInfo.name,
              description: projectInfo.description || '',
              status: projectInfo.status as 'active' | 'inactive',
              deadline: projectInfo.deadline,
            }}
          />
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
                {members.length === 0 ? (
                  <div className='flex flex-col items-center justify-center space-y-4 rounded-lg border p-8 text-center'>
                    <User className='text-muted-foreground h-12 w-12' />
                    <h3 className='text-lg font-medium'>暂无成员</h3>
                    <p className='text-muted-foreground text-sm'>
                      当前项目还没有成员
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className='flex items-center justify-between space-x-3'
                      >
                        <div className='flex items-center space-x-3'>
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.email}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='flex'>
                              <p className='mr-2 font-medium'>{member.email}</p>
                              <span className='inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset'>
                                {roleLabels[member.role]}
                              </span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <span className='text-muted-foreground text-xs'>
                                加入: {member.joinedAt}
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
                )}
              </CardContent>
            </Card>
            {/* 近期活动时间线 */}
            <Card className='overflow-y-auto lg:col-span-1'>
              <CardHeader>
                <CardTitle>近期活动</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline>
                  {activities.length === 0 ? (
                    <div className='flex flex-col items-center justify-center space-y-4 rounded-lg border p-8 text-center'>
                      <Activity className='text-muted-foreground h-12 w-12' />
                      <h3 className='text-lg font-medium'>暂无活动</h3>
                      <p className='text-muted-foreground text-sm'>
                        当前项目还没有活动记录
                      </p>
                    </div>
                  ) : (
                    activities.map((activity: any, index: any) => (
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
                              <span className='font-medium'>
                                {activity.user}
                              </span>
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
                    ))
                  )}
                </Timeline>
              </CardContent>
            </Card>
            {/* 团队管理 */}
            <Card className='lg:col-span-1'>
              <CardHeader>
                <CardTitle>
                  <div className='flex items-center justify-between space-x-2'>
                    <div className='flex items-center'>
                      <Users className='mr-2 h-5 w-5' /> 项目小组 (
                      {teams.length})
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
                    projectId={id}
                    roleLabels={roleLabels}
                    handleConfirmAction={handleConfirmAction}
                    filteredUsers={filteredUsers}
                    teamMemberDialogOpen={teamMemberDialogOpen}
                    closeTeamMemberDialog={() => setTeamMemberDialogOpen(false)}
                    openTeamMemberDialog={() => setTeamMemberDialogOpen(true)}
                    toggleExpand={handleToggleExpand}
                    teams={teams}
                    AddTeamMember={handleAddTeamMember}
                    onCloseDialog={() => setTeamDialogOpen(false)}
                    dialogOpen={teamDialogOpen}
                    deleteTeam={handleDeleteTeam}
                    updateTeam={handleUpdateTeam}
                    createNewTeam={handleCreateNewTeam}
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
                您确定要删除成员 {currentDeleteMember?.email} 吗?
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

              <Select
                value={newMember.email}
                onValueChange={(value) =>
                  setNewMember({ ...newMember, email: value })
                }
              >
                <SelectTrigger className='w-[300px]'>
                  <SelectValue placeholder='选择用户' />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem
                      key={user.id}
                      value={user.email}
                      disabled={filteredUsers.some(
                        (u: any) => u.email === user.email
                      )}
                      className={
                        filteredUsers.some((u: any) => u.email === user.email)
                          ? 'notselected'
                          : ''
                      }
                    >
                      {user.username || user.email}
                      {filteredUsers.some(
                        (u: any) => u.email === user.email
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
                  {/* <SelectItem value='owner'>项目负责人</SelectItem> */}
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
                    disabled={true}
                    value={editMember.email}
                    onChange={(e) =>
                      setEditMember({ ...editMember, email: e.target.value })
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
                      <SelectItem disabled={true} value='owner'>
                        项目负责人
                      </SelectItem>
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