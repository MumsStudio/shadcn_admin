import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export function FindReplaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')

  const handleFind = () => {
    // TODO: 实现查找逻辑
    console.log('查找:', findText)
  }

  const handleReplace = () => {
    // TODO: 实现替换逻辑
    console.log('将', findText, '替换为', replaceText)
  }

  const handleReplaceAll = () => {
    // TODO: 实现全部替换逻辑
    console.log('将所有', findText, '替换为', replaceText)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>查找与替换</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>查找内容</label>
            <Input
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder='输入要查找的内容'
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>替换为</label>
            <Input
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder='输入替换内容'
            />
          </div>
          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={handleFind}>
              查找
            </Button>
            <Button variant='outline' onClick={handleReplace}>
              替换
            </Button>
            <Button onClick={handleReplaceAll}>全部替换</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
