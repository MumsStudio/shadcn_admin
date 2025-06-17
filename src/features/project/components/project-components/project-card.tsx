// components/ProjectCard.jsx
import { Copy, LogOut, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ProjectCard = ({
  project,
  onCopyId,
  onExitProject,
  onEnterProject,
}: any) => {
  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 text-lg'>
              {project.name}
              <Badge
                variant={project.status === 'active' ? 'default' : 'secondary'}
              >
                {project.status === 'active' ? '进行中' : '未开始'}
              </Badge>
            </CardTitle>
            <p className='text-muted-foreground mt-1 text-sm'>
              {project.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onCopyId(project.id)
                }}
              >
                <Copy className='mr-2 h-4 w-4' />
                复制项目ID
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-red-500'
                onClick={(e) => {
                  e.stopPropagation()
                  onExitProject(project)
                }}
              >
                <LogOut className='mr-2 h-4 w-4' />
                退出项目
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>创建者</span>
            <span>{project.creator}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>创建时间</span>
            <span>{project.createdAt}</span>
          </div>
          <div className='pt-2'>
            <div className='mb-1 flex justify-between text-sm'>
              <span className='text-muted-foreground'>进度</span>
              <span>{project.progress}%</span>
            </div>
            <div className='h-2 rounded-full bg-gray-200'>
              <div
                className='h-full rounded-full bg-blue-500'
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
          <div className='pt-2'>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => onEnterProject(project.id)}
            >
              进入项目
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectCard
