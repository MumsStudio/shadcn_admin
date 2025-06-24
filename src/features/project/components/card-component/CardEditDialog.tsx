import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface CardEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editedCard: any
  setEditedCard: (card: any) => void
  onSave: () => void
}

export const CardEditDialog = ({
  open,
  onOpenChange,
  editedCard,
  setEditedCard,
  onSave,
}: CardEditDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑卡片</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>标题</Label>
            <Input
              value={editedCard.title}
              onChange={(e) =>
                setEditedCard({ ...editedCard, title: e.target.value })
              }
            />
          </div>

          <div className='space-y-2'>
            <Label>描述</Label>
            <Textarea
              value={editedCard.description}
              onChange={(e) =>
                setEditedCard({
                  ...editedCard,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>状态</Label>
              <Select
                value={editedCard.status}
                onValueChange={(value) =>
                  setEditedCard({ ...editedCard, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择状态' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='待处理'>待处理</SelectItem>
                  <SelectItem value='进行中'>进行中</SelectItem>
                  <SelectItem value='已完成'>已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>优先级</Label>
              <Select
                value={editedCard.priority}
                onValueChange={(value) =>
                  setEditedCard({ ...editedCard, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择优先级' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='低'>低</SelectItem>
                  <SelectItem value='中'>中</SelectItem>
                  <SelectItem value='高'>高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>截止日期</Label>
            <Input
              type='date'
              value={editedCard.dueDate}
              onChange={(e) =>
                setEditedCard({ ...editedCard, dueDate: e.target.value })
              }
            />
          </div>

          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={onSave}>保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
