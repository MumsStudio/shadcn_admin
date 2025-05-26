import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface LinkPopupProps {
  selectedText: string
  ongeturl?: (url: string) => void
  onInsert: (text: string, url: string) => void
  onClose: () => void
  compact?: boolean
}

export function LinkPopup({
  selectedText,
  onInsert,
  onClose,
  compact,
  ongeturl,
}: LinkPopupProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      let processedUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        processedUrl = `https://${url}`
      }
      if (ongeturl) {
        ongeturl(processedUrl)
      }
      onInsert(selectedText, processedUrl)
      onClose()
    }
  }

  return (
    <div
      className={`bg-background rounded-md p-4 shadow-lg ${compact ? 'w-64' : 'w-80'}`}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
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
        <div>
          <Label>链接文字</Label>
          <Input
            id='link-url'
            value={selectedText}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='请输入链接文字或选中文字'
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