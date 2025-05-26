import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LinkDrawerProps {
  onInsert: (text: string, url: string) => void
  onClose: () => void
  compact?: boolean
}

export function LinkDrawer({ onInsert, onClose, compact }: LinkDrawerProps) {
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text && url) {
      let processedUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        processedUrl = `https://${url}`
      }
      onInsert(text, processedUrl)
      onClose()
    }
  }

  return (
    <div
      className={`bg-background rounded-md p-4 shadow-lg ${compact ? 'w-64' : 'w-80'}`}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label htmlFor='link-text'>链接文字</Label>
          <Input
            id='link-text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='请输入链接文字'
            className='mt-1'
          />
        </div>
        <div>
          <Label htmlFor='link-url'>链接地址</Label>
          <Input
            id='link-url'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='请输入链接地址'
            className='mt-1'
          />
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose} type='button'>
            取消
          </Button>
          <Button type='submit'>确认</Button>
        </div>
      </form>
    </div>
  )
}
