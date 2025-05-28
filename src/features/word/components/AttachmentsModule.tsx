// AttachmentsModule.tsx
import React, { useState, useRef } from 'react'

interface AttachmentsModuleProps {
  onChange: (data: any) => void
}
const AttachmentsModule: React.FC<AttachmentsModuleProps> = ({ onChange }) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const handleUpload = () => {
    setShowModal(false)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className='module-content'>
      <div className='attachment-list'>
        {selectedFiles.map((file, index) => (
          <div key={index} className='attachment-item flex items-center py-2'>
            {(() => {
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
            <span className='pl-2 text-[#5e6c84]'>{file.name}</span>
            <button
              className='ml-2 text-red-500 hover:text-red-700'
              onClick={() => removeFile(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        className='upload-button rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600'
        onClick={() => setShowModal(true)}
      >
        上传附件
      </button>

      {showModal && (
        <div className='bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black'>
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
            {selectedFiles.length > 0 && (
              <div className='mb-4 max-h-40 overflow-y-auto'>
                <p className='font-medium'>已选择:</p>
                <ul className='list-disc pl-5'>
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className='flex justify-end gap-2'>
              <button
                className='rounded border border-gray-300 px-4 py-2 hover:bg-gray-100'
                onClick={() => setShowModal(false)}
              >
                取消
              </button>
              <button
                className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
                onClick={handleUpload}
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
