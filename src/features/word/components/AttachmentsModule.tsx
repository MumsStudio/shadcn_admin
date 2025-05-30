// AttachmentsModule.tsx
import React, { useState, useRef, useEffect } from 'react'
import { IconMessage, IconTrashX } from '@tabler/icons-react'

interface Attachment {
  file: File
  note: string
  addTime: string
}

interface AttachmentsModuleProps {
  currentCard: {
    modules?: {
      attachments?: any[]
    }
  }
  onChange: (data: any, action: string) => void
}

const AttachmentsModule: React.FC<AttachmentsModuleProps> = ({
  onChange,
  currentCard,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  )
  const [currentNote, setCurrentNote] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Initialize with existing attachments or empty array
    setSelectedAttachments(currentCard?.modules?.attachments || [])
  }, [currentCard?.modules])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        note: '',
        addTime: '',
      }))
      setSelectedAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const handleUpload = () => {
    const addTimeAttachments = selectedAttachments.map((attachment) => ({
      ...attachment,
      addTime: new Date().toLocaleString(),
    }))
    onChange(
      addTimeAttachments,
      `Add attachments ${addTimeAttachments.map((a) => a.file.name).join(', ')}`
    )
    setShowModal(false)
  }

  const removeFile = (index: number) => {
    onChange(
      selectedAttachments.filter((_, i) => i !== index),
      `Remove attachment ${selectedAttachments[index].file.name}`
    )
  }

  const updateNote = (index: number, note: string) => {
    const updatedAttachments = [...selectedAttachments]
    updatedAttachments[index] = {
      ...updatedAttachments[index],
      note,
    }
    setSelectedAttachments(updatedAttachments)
  }

  return (
    <div className='module-content'>
      <div className='attachment-list relative'>
        {selectedAttachments.map((attachment, index) => (
          <div
            key={index}
            className='attachment-item relative flex w-full items-center py-2'
          >
            {(() => {
              const file = attachment.file
              const ext = file.name.split('.').pop()
              const isImage =
                ext &&
                ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
                  ext.toLowerCase()
                )

              if (isImage) {
                return (
                  <div className='mr-2 h-[3rem] w-[4rem] overflow-hidden rounded-md shadow-sm shadow-gray-800'>
                    <img
                      src={URL.createObjectURL(file)}
                      alt='预览图'
                      className='h-full w-full object-cover'
                    />
                  </div>
                )
              } else {
                return (
                  <div className='mr-2 flex h-[3rem] w-[4rem] items-center justify-center rounded-md bg-gray-200 font-bold text-[#5e6c84] shadow-sm shadow-gray-800'>
                    {ext ? `${ext}` : '📎'}
                  </div>
                )
              }
            })()}
            <div className='flex flex-col pl-2'>
              <span className='text-[#5e6c84]'>{attachment.file.name}</span>
              {attachment.note && (
                <span className='text-xs text-gray-500'>
                  备注: {attachment.note}
                </span>
              )}
            </div>
            <div className='absolute top-1 right-0 ml-2 flex items-center text-red-500 hover:text-red-700'>
              <span className='text-xs text-gray-400'>
                {attachment.addTime}
              </span>
              <IconTrashX
                className='cursor-pointer ml-[.75rem]'
                onClick={() => removeFile(index)}
                size={20}
              />
            </div>
            <div className='absolute right-0 bottom-1 text-gray-400'><IconMessage/></div>
          </div>
        ))}
      </div>
      <button
        className='upload-button rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 text-[14px] mt-2'
        onClick={() => setShowModal(true)}
      >
        上传附件
      </button>

      {showModal && (
        <div className='bg-opacity-50 fixed inset-0 z-100 flex items-center justify-center bg-black'>
          <div className='w-96 rounded-lg bg-white p-4'>
            <h3 className='mb-4 text-lg font-medium'>上传附件</h3>
            <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              onChange={handleFileChange}
              accept='*'
              multiple
            />
            <button
              className='mb-4 w-full rounded bg-gray-200 px-4 py-2 hover:bg-gray-300'
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click()
                }
              }}
            >
              选择文件
            </button>

            {selectedAttachments.length > 0 && (
              <div className='mb-4 max-h-60 overflow-y-auto'>
                <p className='font-medium'>已选择:</p>
                <ul className='space-y-4'>
                  {selectedAttachments.map((attachment, index) => (
                    <li key={index} className='border-b pb-2'>
                      <div className='flex items-center justify-between'>
                        <span>{attachment.file.name}</span>
                        <button
                          className='text-red-500 hover:text-red-700'
                          onClick={() => {
                            setSelectedAttachments((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div className='mt-2'>
                        <label className='mb-1 block text-sm font-medium'>
                          备注
                        </label>
                        <input
                          type='text'
                          value={attachment.note}
                          onChange={(e) => updateNote(index, e.target.value)}
                          className='w-full rounded border px-2 py-1 text-sm'
                          placeholder='请输入文件备注信息'
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className='flex justify-end gap-2'>
              <button
                className='rounded border border-gray-300 px-4 py-2 hover:bg-gray-100'
                onClick={() => {
                  setShowModal(false)
                  setSelectedAttachments(
                    currentCard?.modules?.attachments || []
                  )
                }}
              >
                取消
              </button>
              <button
                className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
                onClick={handleUpload}
                disabled={selectedAttachments.length === 0}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttachmentsModule
