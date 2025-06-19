// pages/Project.jsx
import { use, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import JoinProjectForm from './components/project-components/join-project-form'
import ProjectList from './components/project-components/project-list'
import { ConfirmDialog } from './components/ui/confirm-dialog'
import { CreateProjectDialog } from './components/ui/dialog'
import Request from './request'

export default function Project() {
  const [projectId, setProjectId] = useState('')
  const [joinProject, setJoinProject] = useState<any>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '', // 'exit' or 'delete'
    title: '',
    description: '',
    project: null,
  })
  const [projects, setProjects] = useState<any>([])
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [role, setRole] = useState('')
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await Request._GetProjects()
      const { data } = response
      if (data) {
        console.log('projects', data)
        setProjects(data)
      }
    } catch (error) {
      showErrorData(`Error joining project: ${error}`)
      console.error('Error joining project:', error)
    }
  }

  const handleJoinProject = async () => {
    if (!role) {
      showErrorData('Please choose a role')
      return
    }
    const member = {
      email: email,
      role: role,
    }
    try {
      const res = await Request._AddProjectMember(projectId, member)
      if (res.data) {
        showSuccessData('加入项目成功，即将跳转至项目详情页')
        setTimeout(() => {
          navigate({ to: `/project/detail/${projectId}` })
        }, 2000)
      } else {
        showErrorData('加入项目失败，请稍后再试')
        console.error(res)
      }
      setRole('')
      setRoleDialogOpen(false)
      setJoinProject([])
      // window.location.href = `/project/detail/${projectId}`
    } catch (error) {
      showErrorData(`Error joining project: ${error}`)
      console.error('Error joining project:', error)
    }
  }
  const getJoinProjectInfo = async () => {
    try {
      const res = await Request._GetProjectDetail(projectId)
      const { data } = res
      if (data) {
        console.log('project', data)
        setJoinProject(data)
        setRoleDialogOpen(true)
      } else {
        showErrorData(`项目ID不存在，请检查后再试！`)
      }
    } catch (error) {
      showErrorData(`Error joining project: ${error}`)
    }
  }
  const handleConfirmAction = async () => {
    const { type, project }: any = confirmDialog

    try {
      if (type === 'delete') {
        const res = await Request._DeleteProject(project?.id)
        const { data } = res
        if (data) {
          fetchProjects()
          showSuccessData(`已删除项目: ${project.name}`)
        }
      } else if (type === 'exit') {
        console.log('exit', project)
        const { members, id } = project
        const MemberId = members.find(
          (member: any) => member.email === email
        )?.id
        const res = await Request._DeleteProjectMember(id, MemberId)
        if (res.data) {
          showSuccessData('退出项目成功')
          fetchProjects()
        } else {
          showErrorData('退出项目失败')
          console.error(res)
        }
      }
    } catch (error) {
      showErrorData(`Error: ${error}`)
      console.error('Error:', error)
    } finally {
      setConfirmDialog({ ...confirmDialog, open: false })
    }
  }

  const createNewProject = async (data: {
    name: string
    description: string
    status: 'active' | 'inactive'
    deadline?: string
  }) => {
    try {
      const newProject = {
        ...data,
        progress: 0,
        activities: [
          {
            id: Date.now(),
            action: '创建了此项目',
            description: data.name,
            date: Date.now(),
            user: email,
          },
        ],
      }
      const res = await Request._CreateProject(newProject)
      const { data: project } = res
      console.log('newProject', project)
      if (project) {
        fetchProjects()
        showSuccessData('项目创建成功')
      }
    } catch (error) {
      showErrorData(`Error creating project: ${error}`)
      console.error('Error creating project:', error)
    }
  }

  const copyProjectId = (projectId: string) => {
    navigator.clipboard.writeText(projectId)
    showSuccessData('项目ID已复制')
  }

  const enterProject = (projectId: string) => {
    navigate({ to: `/project/detail/${projectId}` })
  }

  const openConfirmDialog = (type: 'exit' | 'delete', project: any) => {
    setConfirmDialog({
      open: true,
      type,
      title: type === 'exit' ? '确认退出项目?' : '确认删除项目?',
      description:
        type === 'exit'
          ? `您确定要退出项目 ${project?.name} 吗? 退出后将无法访问该项目。`
          : `您确定要删除项目 ${project?.name} 吗? 删除后将无法恢复该项目。`,
      project,
    })
  }

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' /> 新建项目
          </Button>
        </div>
      </Header>

      <Main className='mt-16 h-[52rem] overflow-y-auto p-4'>
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold tracking-tight'>项目管理</h1>
          <p className='text-muted-foreground'>
            查看您参与的所有项目或加入新项目
          </p>
        </div>

        <JoinProjectForm
          projectId={projectId}
          setProjectId={setProjectId}
          onJoinProject={getJoinProjectInfo}
        />

        <ProjectList
          projects={projects}
          onCopyId={copyProjectId}
          onExitProject={(project: any) => openConfirmDialog('exit', project)}
          onEnterProject={enterProject}
          onDeleteProject={(project: any) =>
            openConfirmDialog('delete', project)
          }
        />

        <CreateProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={createNewProject}
        />

        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={handleConfirmAction}
        />

        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>加入项目</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-1 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  加入项目名称：{joinProject.name}
                </Label>
                <Label htmlFor='name' className='text-right'>
                  加入项目负责人：{joinProject.creator}
                </Label>
                <Label htmlFor='name' className='text-right'>
                  加入成员：
                </Label>
                <Input value={email} disabled={true} />
              </div>
              <div className='grid grid-cols-1 items-center gap-4'>
                <Label className='text-right'>选择加入的角色：</Label>
                <Select value={role} onValueChange={(value) => setRole(value)}>
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
              <Button onClick={handleJoinProject}>进入</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
