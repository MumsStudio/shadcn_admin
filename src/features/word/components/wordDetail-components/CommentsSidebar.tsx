import { useRef } from 'react'
import { IconTrash } from '@tabler/icons-react'

export interface CommentsSidebarProps {
  comments: any[]
  activeCommentId: string | null
  email: string
  editor: any
  commentsideBarOpen: boolean
  setComments: (comments: any[]) => void
  setActiveCommentId: (id: string | null) => void
}

export function CommentsSidebar({
  comments,
  activeCommentId,
  email,
  editor,
  commentsideBarOpen,
  setComments,
  setActiveCommentId,
}: CommentsSidebarProps) {
  const commentsSectionRef = useRef<HTMLDivElement | null>(null)

  const focusCommentWithActiveId = (id: string) => {
    if (!commentsSectionRef.current) return

    const escapedId = id.replace(/[^\w-]/g, '\\$&')
    const commentInput =
      commentsSectionRef.current.querySelector<HTMLInputElement>(
        `input[id="${escapedId}"]`
      )

    if (!commentInput) return

    commentInput.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
  }

  return (
    commentsideBarOpen && (
      <section
        className='fixed top-[4rem] right-0 z-20 flex h-[calc(100vh-4rem)] w-96 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2'
        ref={commentsSectionRef}
      >
        {comments.length ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex flex-col gap-4 rounded-lg border border-slate-400 p-2 ${
                comment.id === activeCommentId ? 'border-2 border-blue-400' : ''
              } box-border`}
            >
              <div className='flex items-center justify-between'>
                <span className='flex items-end gap-2'>
                  <span className='border-b border-blue-200 font-semibold'>
                    {email}
                  </span>
                  <span className='text-xs text-slate-400'>
                    {comment.createdAt.toLocaleDateString()}
                  </span>
                </span>
                <button
                  onClick={() => {
                    setComments(comments.filter((c) => c.id !== comment.id)),
                      editor.commands.unsetComment(comment.id)
                  }}
                  className='text-red-500 hover:text-red-700'
                >
                  <IconTrash size={16} />
                </button>
              </div>
              <input
                value={comment.content || ''}
                disabled={comment.id !== activeCommentId}
                className={`rounded-lg bg-transparent p-2 text-inherit focus:outline-none ${
                  comment.id === activeCommentId ? 'bg-slate-100' : ''
                }`}
                id={comment.id}
                onChange={(event) => {
                  const value = event.target.value
                  setComments(
                    comments.map((c) => {
                      if (c.id === activeCommentId) {
                        return { ...c, content: value }
                      }
                      return c
                    })
                  )
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return
                  setActiveCommentId(null)
                }}
              />
              {comment.id === activeCommentId && (
                <button
                  className='rounded-md bg-blue-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600'
                  onClick={() => {
                    setActiveCommentId(null)
                    editor.commands.focus()
                  }}
                >
                  保存
                </button>
              )}
            </div>
          ))
        ) : (
          <span className='pt-8 text-center text-slate-400'>暂无评论</span>
        )}
      </section>
    )
  )
}
