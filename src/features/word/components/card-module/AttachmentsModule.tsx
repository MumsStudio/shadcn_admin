// AttachmentsModule.tsx
import React, { useState, useRef, useEffect } from 'react'
import { IconMessage, IconSend, IconTrashX } from '@tabler/icons-react'
import { useAuthStore } from '@/stores/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Reply {
  id: number
  user: string
  firstName: string
  lastName: string
  content: string
  time: string
}

interface Comment {
  id: number
  user: string
  firstName: string
  lastName: string
  content: string
  time: string
  replies?: Reply[]
}

interface Attachment {
  file: File
  note: string
  addTime: string
  attachmentIndex: number | null
  comments?: Comment[]
}

interface AttachmentsModuleProps {
  currentCard: {
    modules?: {
      attachments?: any[]
    }
  }
  onChange: (data: any, action: string) => void
  user: {
    avatar?: string
    lastName: string
    firstName: string
    email: string
  }
}

const AttachmentsModule: React.FC<AttachmentsModuleProps> = ({
  onChange,
  currentCard,
  user,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  )
  const [currentNote, setCurrentNote] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCommentsIndex, setShowCommentsIndex] = useState<number | null>(
    null
  )
  const [replyingTo, setReplyingTo] = useState<{
    commentId: number | null
    attachmentIndex: number | null
  }>({ commentId: null, attachmentIndex: null })
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  const [newComment, setNewComment] = useState('')
  const [newReply, setNewReply] = useState('')

  useEffect(() => {
    // Initialize with existing attachments or empty array
    setSelectedAttachments(currentCard?.modules?.attachments || [])
    const commentShow = currentCard?.modules?.attachments?.find(
      (attachment) => {
       return attachment.attachmentIndex !== null
      }
    )
    if (commentShow) {
      setShowCommentsIndex(commentShow.attachmentIndex)
    }
    // console.log(commentIndex, 'commentIndex')
  }, [currentCard?.modules])

  const addComment = (index: number, content: string) => {
    const updatedAttachments = [...selectedAttachments]

    // if (!updatedAttachments[index].comments) {
    //   updatedAttachments[index].comments = [
    //     {
    //       id: 1,
    //       user: email as string,
    //       firstName: user.firstName,
    //       lastName: user.lastName,
    //       content: '上传了此附件',
    //       time: new Date().toLocaleString(),
    //     },
    //   ]
    //   updatedAttachments[index].attachmentIndex = index
    // }

    updatedAttachments[index].comments?.push({
      id: Date.now(),
      user: email as string,
      firstName: user.firstName,
      lastName: user.lastName,
      content,
      time: new Date().toLocaleString(),
    })
    updatedAttachments[index].attachmentIndex = index
    setSelectedAttachments(updatedAttachments)
    onChange(
      updatedAttachments,
      `Add comment to attachment ${selectedAttachments[index].file.name}`
    )
    setNewComment('')
  }

  const addReply = (
    attachmentIndex: number,
    commentId: number,
    content: string
  ) => {
    const updatedAttachments = [...selectedAttachments]
    const comment = updatedAttachments[attachmentIndex].comments?.find(
      (c) => c.id === commentId
    )

    if (comment) {
      if (!comment.replies) {
        comment.replies = []
      }
      comment.replies.push({
        id: Date.now(),
        user: email as string,
        firstName: user.firstName,
        lastName: user.lastName,
        content,
        time: new Date().toLocaleString(),
      })
      setSelectedAttachments(updatedAttachments)
      onChange(
        updatedAttachments,
        `Add reply to comment ${commentId} in attachment ${selectedAttachments[attachmentIndex].file.name}`
      )
      setNewReply('')
      setReplyingTo({ commentId: null, attachmentIndex: null })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        note: '',
        addTime: new Date().toLocaleString(),
        attachmentIndex: null,
        comments: [
          {
            id: 1,
            user: email as string,
            firstName: user.firstName,
            lastName: user.lastName,
            content: '上传了此附件',
            time: new Date().toLocaleString(),
          },
        ],
      }))
      setSelectedAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const deleteComment = (attachmentIndex: number, commentId: number) => {
    const updatedAttachments = [...selectedAttachments]
    if (updatedAttachments[attachmentIndex].comments) {
      updatedAttachments[attachmentIndex].comments = updatedAttachments[
        attachmentIndex
      ].comments?.filter((c) => c.id !== commentId)
    }
    setSelectedAttachments(updatedAttachments)
    onChange(
      updatedAttachments,
      `Delete comment ${commentId} from attachment ${selectedAttachments[attachmentIndex].file.name}`
    )
  }

  const deleteReply = (
    attachmentIndex: number,
    commentId: number,
    replyId: number
  ) => {
    const updatedAttachments = [...selectedAttachments]
    const comment = updatedAttachments[attachmentIndex].comments?.find(
      (c) => c.id === commentId
    )

    if (comment && comment.replies) {
      comment.replies = comment.replies.filter((r) => r.id !== replyId)
      setSelectedAttachments(updatedAttachments)
      onChange(
        updatedAttachments,
        `Delete reply ${replyId} from comment ${commentId} in attachment ${selectedAttachments[attachmentIndex].file.name}`
      )
    }
  }

  const handleUpload = () => {
    const addTimeAttachments = selectedAttachments.map((attachment) => ({
      ...attachment,
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
            className='attachment-item relative flex w-full flex-col py-2'
            key={index}
          >
            <div className='flex w-full items-center'>
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

              <div className='flex flex-1 flex-col pl-2'>
                <div className='flex w-full justify-between'>
                  <span className='text-[#5e6c84]'>{attachment.file.name}</span>
                  <div className='flex items-center'>
                    <span className='text-xs text-gray-400'>
                      {attachment.addTime}
                    </span>
                    <IconTrashX
                      className='ml-[.75rem] cursor-pointer text-red-500'
                      onClick={() => removeFile(index)}
                      size={20}
                    />
                  </div>
                </div>
                <div className='flex w-full justify-between'>
                  {attachment.note && (
                    <span className='text-xs text-gray-500'>
                      备注: {attachment.note}
                    </span>
                  )}
                  <div
                    className='ml-2 cursor-pointer text-gray-400'
                    onClick={() =>
                      setShowCommentsIndex(
                        showCommentsIndex === index ? null : index
                      )
                    }
                  >
                    <IconMessage size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* 评论区 */}
            {showCommentsIndex === index && (
              <div className='mt-2 w-full rounded p-2'>
                <div className='comments-list mb-2 max-h-40 overflow-y-auto'>
                  {attachment.comments?.map((comment) => (
                    <div
                      key={comment.id}
                      className='comment mb-2 rounded bg-white p-2'
                    >
                      <div className='flex w-full'>
                        <Avatar className='z-1 size-10'>
                          <AvatarImage src={''} alt={'2345'} />
                          <AvatarFallback className='bg-[#2CB0C8]'>
                            {`${comment.firstName ? comment.firstName.substring(0, 1) : ''}${comment.lastName ? comment.lastName.substring(0, 1) : ''}` ||
                              comment.user?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col pl-2'>
                          <div className='flex w-full justify-between text-gray-700'>
                            {comment.user}
                          </div>
                          <span className='text-xs text-gray-500'>
                            {comment.time}
                          </span>
                          <p className='mt-1 text-sm'>{comment.content}</p>
                          <div className='flex space-x-2'>
                            {comment.user === email && (
                              <button
                                onClick={() =>
                                  setReplyingTo({
                                    commentId: comment.id,
                                    attachmentIndex: index,
                                  })
                                }
                                className='text-xs text-blue-500'
                              >
                                回复
                              </button>
                            )}
                            {comment.id !== 1 && (
                              <button
                                onClick={() => deleteComment(index, comment.id)}
                                className='text-xs text-red-500'
                              >
                                删除
                              </button>
                            )}
                          </div>

                          {/* 回复列表 */}
                          {comment.replies?.map((reply) => (
                            <div
                              key={reply.id}
                              className='mt-2 ml-4 rounded bg-gray-50 p-2'
                            >
                              <div className='flex items-center'>
                                <Avatar className='size-8'>
                                  <AvatarImage src={''} alt={'2345'} />
                                  <AvatarFallback className='bg-[#2CB0C8] text-xs'>
                                    {`${reply.firstName ? reply.firstName.substring(0, 1) : ''}${reply.lastName ? reply.lastName.substring(0, 1) : ''}` ||
                                      reply.user?.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className='ml-2'>
                                  <div className='flex items-center'>
                                    <span className='text-xs font-medium'>
                                      {reply.user}
                                    </span>
                                    <span className='ml-2 text-xs text-gray-500'>
                                      {reply.time}
                                    </span>
                                  </div>
                                  <p className='text-xs'>{reply.content}</p>
                                  <button
                                    onClick={() =>
                                      deleteReply(index, comment.id, reply.id)
                                    }
                                    className='text-xs text-red-500'
                                  >
                                    删除
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* 回复输入框 */}
                          {replyingTo.commentId === comment.id &&
                            replyingTo.attachmentIndex === index && (
                              <div className='mt-2 flex'>
                                <input
                                  type='text'
                                  value={newReply}
                                  onChange={(e) => setNewReply(e.target.value)}
                                  placeholder='输入回复内容...'
                                  className='flex-1 rounded-l border p-1 text-sm'
                                />
                                <button
                                  onClick={() => {
                                    if (newReply.trim()) {
                                      addReply(index, comment.id, newReply)
                                    }
                                  }}
                                  className='rounded-r bg-blue-500 px-2 py-1 text-sm text-white'
                                >
                                  <IconSend size={16} />
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='comment-input flex'>
                  <input
                    type='text'
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder='添加评论...'
                    className='flex-1 rounded-l border p-1 text-sm'
                  />
                  <button
                    onClick={() => {
                      if (newComment.trim()) {
                        addComment(index, newComment)
                      }
                    }}
                    className='rounded-r bg-blue-500 px-2 py-1 text-sm text-white'
                  >
                    <IconSend />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className='upload-button mt-2 rounded bg-blue-500 px-2 py-1 text-[14px] text-white hover:bg-blue-600'
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
