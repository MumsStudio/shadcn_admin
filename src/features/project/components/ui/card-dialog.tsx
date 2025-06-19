import { useEffect, useState } from 'react'
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

export function CardDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    assignedTo: string
    description?: string
  }) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        title,
        assignedTo,
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
            <Input
              id='card-assigned'
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder='输入负责人'
            />
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
