import { useState } from 'react'
import { IconCertificateOff } from '@tabler/icons-react'
import { File, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CardAttachmentsProps {
  card: any
  setCard: (card: any) => void
}

export const CardAttachments = ({ card, setCard }: CardAttachmentsProps) => {
  const handleUploadAttachment = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const attachment = {
          name: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          file,
        }
        setCard({
          ...card,
          attachments: [...(card.attachments || []), attachment],
        })
      }
    }
    input.click()
  }

  const handleAttachmentNoteChange = (index: number, note: string) => {
    const newAttachments = [...card.attachments]
    newAttachments[index].note = note
    setCard({ ...card, attachments: newAttachments })
  }

  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-sm font-medium'>附件</h3>
        <Button variant='ghost' size='sm' onClick={handleUploadAttachment}>
          <Upload className='mr-1 h-4 w-4' /> 上传
        </Button>
      </div>
      {card.attachments?.length > 0 ? (
        <div className='w-[20%] space-y-2'>
          {card.attachments.map((file: any, index: number) => (
            <div
              key={index}
              className='flex items-center gap-2 rounded border p-2'
            >
              <File className='h-5 w-5' />
              <div className='flex-1 truncate'>
                <p className='text-sm'>{file.name}</p>
                <p className='text-muted-foreground text-xs'>{file.size}</p>
                <input
                  type='text'
                  placeholder='添加附件备注'
                  className='mt-1 w-full rounded border p-1 text-xs'
                  onChange={(e) =>
                    handleAttachmentNoteChange(index, e.target.value)
                  }
                />
              </div>
              <Button variant='ghost' size='sm'>
                下载
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-muted-foreground text-sm flex items-center gap-2'>
          <IconCertificateOff />
          暂无附件
        </p>
      )}
    </div>
  )
}
