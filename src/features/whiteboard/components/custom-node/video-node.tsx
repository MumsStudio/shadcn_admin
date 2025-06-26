import { useState } from 'react'
import { NodeProps, Handle, Position } from '@xyflow/react'

type VideoNodeData = {
  id: string
  type: string
  data: any
  position: any
  src: string
  width?: number
  height?: number
  controls?: boolean
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
}

const VideoNode = ({ data, id, selected }: NodeProps<VideoNodeData>) => {
  const [isEditing, setIsEditing] = useState(false)
  const [videoSource, setVideoSource] = useState<'file' | 'url'>('file')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')

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
                value={videoSource}
                onChange={(e) =>
                  setVideoSource(e.target.value as 'file' | 'url')
                }
              >
                <option value='file'>上传文件</option>
                <option value='url'>URL输入</option>
              </select>
            </div>

            {videoSource === 'file' ? (
              <div>
                <input
                  type='file'
                  accept='video/*'
                  className='w-full rounded border bg-blue-50 p-2 transition-colors hover:bg-blue-100'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setVideoFile(file)
                      setPreviewUrl(URL.createObjectURL(file))
                    }
                  }}
                />
                {previewUrl && (
                  <video src={previewUrl} controls className='mt-2 max-h-40' />
                )}
              </div>
            ) : (
              <div>
                <input
                  type='text'
                  placeholder='输入视频URL'
                  className='w-full rounded border p-2'
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                {videoUrl && (
                  <video
                    src={videoUrl}
                    controls
                    className='mt-2 max-h-40'
                    onError={() => alert('视频加载失败，请检查URL')}
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
                  if (videoSource === 'file' && previewUrl) {
                    data.src = previewUrl
                  } else if (videoSource === 'url' && videoUrl) {
                    data.src = videoUrl
                  }
                  setIsEditing(false)
                }}
              >
                确认
              </button>
            </div>
          </div>
        ) : (
          <video
            src={data.src}
            width={data.width || '100%'}
            height={data.height || 'auto'}
            controls={data.controls !== false}
            autoPlay={data.autoPlay}
            loop={data.loop}
            muted={data.muted}
          />
        )}
      </div>
    </div>
  )
}

export default VideoNode
