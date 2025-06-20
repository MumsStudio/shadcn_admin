import { useEffect, useState } from 'react'
import { formatDate } from '@/utils/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { Textarea } from '@/components/ui/textarea'

export function EditProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description: string
    status: 'active' | 'inactive'
    deadline?: string
  }) => Promise<void>
  initialData: {
    name: string
    description: string
    status: 'active' | 'inactive'
    deadline?: string
  }
}) {
  const [name, setName] = useState(initialData.name)
  const [description, setDescription] = useState(initialData.description)
  const [status, setStatus] = useState<'active' | 'inactive'>(
    initialData.status
  )
  const [deadline, setDeadline] = useState(
    initialData.deadline
      ? new Date(initialData.deadline).toISOString().split('T')[0]
      : ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => {
    setName(initialData.name)
    setDescription(initialData.description)
    setStatus(initialData.status)
    setDeadline(initialData.deadline ? formatDate(initialData.deadline) : '')
  }, [initialData])
  const handleSubmit = async () => {
    if (!name.trim()) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        name,
        description,
        status,
        deadline: deadline || undefined,
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑项目</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='project-name'>项目名称</Label>
            <Input
              id='project-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='输入项目名称'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='project-description'>项目描述</Label>
            <Textarea
              id='project-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='输入项目描述'
              className='min-h-[70px]'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='project-deadline'>预计截至时间</Label>
            <Input
              id='project-deadline'
              type='date'
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>项目状态</Label>
            <div className='flex items-center gap-2'>
              <Select
                value={status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setStatus(value)
                }
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='选择状态' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='active'>
                    <Badge variant='default'>进行中</Badge>
                  </SelectItem>
                  <SelectItem value='inactive'>
                    <Badge variant='secondary'>未开始</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                {status === 'active' ? '进行中' : '未开始'}
              </Badge>
            </div>
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存更改'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description: string
    status: 'active' | 'inactive'
    deadline?: string
  }) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive')
  const [deadline, setDeadline] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmit = async () => {
    if (!name.trim()) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        name,
        description,
        status,
        deadline: deadline || undefined,
      })
      setName('')
      setDescription('')
      setDeadline('')
      setStatus('inactive')
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新项目</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='project-name'>项目名称</Label>
            <Input
              id='project-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='输入项目名称'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='project-description'>项目描述</Label>
            <Textarea
              id='project-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='输入项目描述'
              className='min-h-[70px]'
            />
          </div>

          {/* <div className='space-y-2'>
            <Label htmlFor='project-creator'>项目创建者</Label>
            <div className='grid grid-cols-2 gap-4'>
              <Input
                id='project-creator'
                disabled={true}
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder='项目创建者'
              />
            </div>
          </div> */}

          <div className='space-y-2'>
            <Label htmlFor='project-deadline'>预计截至时间</Label>
            <Input
              id='project-deadline'
              type='date'
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>项目状态</Label>
            <div className='flex items-center gap-2'>
              <Select
                value={status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setStatus(value)
                }
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='选择状态' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='active'>
                    <Badge variant='default'>进行中</Badge>
                  </SelectItem>
                  <SelectItem value='inactive'>
                    <Badge variant='secondary'>未开始</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                {status === 'active' ? '进行中' : '未开始'}
              </Badge>
            </div>
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : '创建项目'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
