// pages/Project.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data'
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
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import JoinProjectForm from './components/project-components/join-project-form'
import ProjectList from './components/project-components/project-list'
import { CreateProjectDialog } from './components/ui/dialog'
import Request from './request'

export default function Project() {
  const [projectId, setProjectId] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [exitDialogOpen, setExitDialogOpen] = useState(false)
  const [currentExitProject, setCurrentExitProject] = useState<any>({})
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: '电商平台重构',
      description: '重构现有电商平台的前端架构',
      creator: '张三',
      createdAt: '2023-10-15',
      progress: 65,
      status: 'active',
    },
    {
      id: '2',
      name: '用户管理系统',
      description: '开发新的用户管理后台',
      creator: '李四',
      createdAt: '2023-11-01',
      progress: 30,
      status: 'active',
    },
    {
      id: '3',
      name: 'API网关升级',
      description: '升级现有API网关服务',
      creator: '王五',
      createdAt: '2023-11-15',
      progress: 80,
      status: 'active',
    },
    {
      id: '4',
      name: '数据分析平台',
      description: '构建大数据分析平台',
      creator: '王五',
      createdAt: '2023-11-15',
      progress: 0,
      status: 'pending',
    },
  ])
  const navigate = useNavigate()

  const handleJoinProject = async () => {
    if (!projectId.trim()) {
      showErrorData('Please enter a project ID')
      return
    }

    try {
      window.location.href = `/project/detail/${projectId}`
    } catch (error) {
      showErrorData(`Error joining project: ${error}`)
      console.error('Error joining project:', error)
    }
  }

  const handleExitProject = async () => {
    if (!currentExitProject) return

    try {
      setProjects(projects.filter((p) => p.id !== currentExitProject?.id))
      showSuccessData(`已退出项目: ${currentExitProject.name}`)
    } catch (error) {
      showErrorData(`Error exiting project: ${error}`)
      console.error('Error exiting project:', error)
    } finally {
      setExitDialogOpen(false)
      setCurrentExitProject(null)
    }
  }

  const createNewProject = async (data: {
    name: string
    description: string
    creator: string
    status: 'active' | 'inactive'
    deadline?: string
  }) => {
    try {
      // 实际项目中这里会有创建项目的逻辑
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
          onJoinProject={handleJoinProject}
        />

        <ProjectList
          projects={projects}
          onCopyId={copyProjectId}
          onExitProject={(project: any) => {
            setCurrentExitProject(project)
            setExitDialogOpen(true)
          }}
          onEnterProject={enterProject}
        />

        <CreateProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={createNewProject}
        />

        <AlertDialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认退出项目?</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要退出项目 {currentExitProject?.name} 吗?
                退出后将无法访问该项目。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleExitProject}>
                确认退出
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Main>
    </>
  )
}
