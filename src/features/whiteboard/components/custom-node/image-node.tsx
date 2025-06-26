import { useEffect, useState } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';


type ImageNodeData = {
  id: string
  type: string
  data: any
  position: any
  src: string
  alt?: string
  width?: number
  height?: number
  borderColor?: string
  borderRadius?: number
}

const ImageNode = ({ data, id, selected }: NodeProps<ImageNodeData>) => {
  const [isEditing, setIsEditing] = useState(false)
  const [imageSource, setImageSource] = useState<'file' | 'url'>('file')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  useEffect(() => {
    console.log(imageFile)
  }, [imageFile])
  useEffect(() => {
    console.log(imageUrl)
  }, [imageUrl])
  return (
    <div className='relative'>
      <Handle type='source' position={Position.Right} id='right' />
      <Handle type='target' position={Position.Left} id='left' />

      <div
        className={`${selected ? 'ring-2 ring-blue-500' : ''}`}
        onDoubleClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <div className='space-y-4 p-4'>
            <div className='space-y-2'>
              <select
                className='w-full rounded border bg-white p-2'
                value={imageSource}
                onChange={(e) =>
                  setImageSource(e.target.value as 'file' | 'url')
                }
              >
                <option value='file'>上传文件</option>
                <option value='url'>URL输入</option>
              </select>
            </div>

            {imageSource === 'file' ? (
              <div>
                <input
                  type='file'
                  accept='image/*'
                  className='w-full rounded border bg-blue-50 p-2 transition-colors hover:bg-blue-100'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImageFile(file)
                      setPreviewUrl(URL.createObjectURL(file))
                    }
                  }}
                />
                {previewUrl && (
                  <img src={previewUrl} alt='预览' className='mt-2 max-h-40' />
                )}
              </div>
            ) : (
              <div>
                <input
                  type='text'
                  placeholder='输入图片URL'
                  className='w-full rounded border p-2'
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt='预览'
                    className='mt-2 max-h-40'
                    onError={() => alert('图片加载失败，请检查URL')}
                  />
                )}
              </div>
            )}

            <div className='flex justify-end space-x-2'>
              <button
                className='rounded bg-gray-200 px-4 py-2'
                onClick={() => setIsEditing(false)}
              >
                取消
              </button>
              <button
                className='rounded bg-blue-500 px-4 py-2 text-white'
                onClick={() => {
                  if (imageSource === 'file' && previewUrl) {
                    data.src = previewUrl
                  } else if (imageSource === 'url' && imageUrl) {
                    data.src = imageUrl
                  }
                  setIsEditing(false)
                }}
              >
                确认
              </button>
            </div>
          </div>
        ) : (
          <img
            src={data.src}
            alt={data.alt || ''}
            style={{
              width: data.width || '100%',
              height: data.height || 'auto',
              border: data.borderColor
                ? `2px solid ${data.borderColor}`
                : 'none',
              borderRadius: data.borderRadius || 0,
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ImageNode