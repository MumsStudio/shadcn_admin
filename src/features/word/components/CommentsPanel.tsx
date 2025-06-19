import { MessageSquareText } from 'lucide-react'
import { useEditorContext } from '../EditorContext'

const CommentsPanel = () => {
  const {
    comments,
    setComments,
    commentsideBarOpen,
    activeCommentId,
    setActiveCommentId,
    commentsSectionRef,
    email,
    editor,
  } = useEditorContext()

  if (!commentsideBarOpen) return null

  return (
    <section
      className='fixed top-[4rem] right-0 z-20 flex h-[calc(100vh-4rem)] w-96 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2'
      ref={commentsSectionRef}
    >
      {comments.length ? (
        comments.map((comment) => (
          <div
            key={comment.id}
            className={`flex flex-col gap-4 rounded-lg border border-slate-400 p-2 ${comment.id === activeCommentId ? 'border-2 border-blue-400' : ''} box-border`}
          >
            <span className='flex items-end gap-2'>
              <span className='border-b border-blue-200 font-semibold'>
                {email}
              </span>
              <span className='text-xs text-slate-400'>
                {comment.createdAt.toLocaleDateString()}
              </span>
            </span>
            <input
              value={comment.content || ''}
              disabled={comment.id !== activeCommentId}
              className={`rounded-lg bg-transparent p-2 text-inherit focus:outline-none ${comment.id === activeCommentId ? 'bg-slate-100' : ''}`}
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
                  editor?.commands.focus()
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
}

export default CommentsPanel
