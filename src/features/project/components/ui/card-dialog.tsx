import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
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
import Request from '../../request'

export function CardDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  projectId,
  teamId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    assignedTo: string
    description?: string
  }) => Promise<void>
  initialData?: {
    title: string
    assignedTo: string
    description?: string
  }
  projectId: string
  teamId: string
}) {
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState(email)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [teamMember, setTeamMember] = useState<any[]>([])

  useEffect(() => {
    // 获取团队成员数据
    const fetchTeamMembers = async () => {
      try {
        const res = await Request._GetTeamlists(projectId, teamId)
        if (res.data) {
          const TeamMembers = res.data.members || []
          const getTeamMember = TeamMembers.filter(
            (u: any) => u.email !== email
          )
          setTeamMember(getTeamMember)
        }
      } catch (error) {
        console.error('获取团队成员失败:', error)
      }
    }

    fetchTeamMembers()
  }, [])

  const handleSubmit = async () => {
    if (!title.trim()) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        title,
        assignedTo: assignedTo || '',
        description: description || undefined,
      })
      setTitle('')
      setAssignedTo('')
      setDescription('')
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setTitle(initialData?.title || '')
      setAssignedTo(initialData?.assignedTo || '')
      setDescription(initialData?.description || '')
    }
  }, [initialData])
  useEffect(() => {
    if (!open) {
      setTitle('')
      setIsTransferring(false)
      setDescription('')
    }
  }, [open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>卡片详情</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='card-title'>标题</Label>
            <Input
              id='card-title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='输入卡片标题'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='card-assigned'>负责人</Label>
            {isTransferring ? (
              <div className='flex items-center gap-2'>
                <Select
                  value={assignedTo}
                  onValueChange={(value) => setAssignedTo(value)}
                >
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue placeholder='选择负责人' />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMember.map((user: any) => (
                      <SelectItem key={user.id} value={user.email}>
                        {user.username || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant='outline'
                  onClick={() => setIsTransferring(false)}
                >
                  取消移交
                </Button>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <Input
                  id='card-assigned'
                  value={assignedTo}
                  disabled={true}
                  placeholder='输入负责人'
                />
                <Button
                  variant='outline'
                  disabled={assignedTo !== email}
                  onClick={() => setIsTransferring(true)}
                >
                  移交负责人
                </Button>
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='card-description'>描述</Label>
            <Textarea
              id='card-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='输入卡片描述'
              className='min-h-[70px]'
            />
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '提交'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
