import { useState } from 'react'
import { IconPhotoOff } from '@tabler/icons-react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CardImagesProps {
  card: any
  setCard: (card: any) => void
}

export const CardImages = ({ card, setCard }: CardImagesProps) => {
  const handleUploadImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string
          setCard({
            ...card,
            images: [...(card.images || []), imageUrl],
          })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleImageNoteChange = (index: number, note: string) => {
    const newImages = [...card.images]
    newImages[index].note = note
    setCard({ ...card, images: newImages })
  }

  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-sm font-medium'>图片</h3>
        <Button variant='ghost' size='sm' onClick={handleUploadImage}>
          <Upload className='mr-1 h-4 w-4' /> 上传
        </Button>
      </div>
      {card.images?.length > 0 ? (
        <div className='flex flex-wrap gap-2'>
          {card.images.map((img: string, index: number) => (
            <div key={index} className='relative h-32 w-32'>
              <img
                src={img}
                alt={`图片-${index}`}
                className='h-full w-full rounded-md object-cover'
              />
              <input
                type='text'
                placeholder='添加图片备注'
                className='absolute right-0 bottom-0 left-0 bg-white/80 p-1 text-xs'
                onChange={(e) => handleImageNoteChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className='text-muted-foreground text-sm flex items-center gap-2'>
          <IconPhotoOff />
          暂无图片
        </p>
      )}
    </div>
  )
}
