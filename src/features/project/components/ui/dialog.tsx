import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
    creator: string
    status: 'active' | 'inactive'
    deadline?: string
  }) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creator, setCreator] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive')
  const [deadline, setDeadline] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  useEffect(() => {
    if (email) {
      setCreator(email)
    }
  }, [email])
  const handleSubmit = async () => {
    if (!name.trim()) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        name,
        description,
        creator,
        status,
        deadline: deadline || undefined,
      })
      setName('')
      setDescription('')
      setCreator('')
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

          <div className='space-y-2'>
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
              {isSubmitting ? '创建中...' : '创建项目'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
