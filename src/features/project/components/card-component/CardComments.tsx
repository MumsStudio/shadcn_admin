import { useEffect, useState } from 'react'
import { MessageSquare, Trash2, Reply } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CardCommentsProps {
  card: any
  setCard: (card: any) => void
  onUpdate: (comments: any[]) => void
}

export const CardComments = ({
  card,
  setCard,
  onUpdate,
}: CardCommentsProps) => {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const authStore = useAuthStore()
  const email = authStore.auth.user?.email

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment = {
      id: `cmt-${Date.now()}`,
      user: { id: 'current-user', name: email, avatar: '' },
      content: newComment,
      time: new Date().toLocaleString(),
      replies: [],
      isReply: replyingTo ? true : false,
      replyTo: replyingTo,
    }

    let newComments
    if (replyingTo) {
      newComments = card.comments.map((c: any) => {
        if (c.id === replyingTo) {
          return { ...c, replies: [...c.replies, comment] }
        }
        return c
      })
    } else {
      newComments = [...card.comments, comment]
    }

    setCard({
      ...card,
      comments: newComments,
    })
    onUpdate(newComments)
    setNewComment('')
    setReplyingTo(null)
  }

  const handleDeleteComment = (
    commentId: string,
    isReply: boolean,
    parentId?: string
  ) => {
    let newComments
    if (isReply && parentId) {
      newComments = card.comments.map((c: any) => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: c.replies.filter((r: any) => r.id !== commentId),
          }
        }
        return c
      })
    } else {
      newComments = card.comments.filter((c: any) => c.id !== commentId)
    }

    setCard({
      ...card,
      comments: newComments,
    })
    onUpdate(newComments)
  }

  return (
    <div>
      <h3 className='mb-2 text-sm font-medium'>
        讨论 ({card.comments?.length})
      </h3>
      <div className='space-y-4'>
        {card.comments?.map((comment: any) => (
          <div key={comment.id} className='space-y-2'>
            <div className='flex space-x-3'>
              <Avatar>
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm font-medium'>
                    {comment.user.name}
                  </span>
                  <span className='text-muted-foreground text-xs'>
                    {comment.time}
                  </span>
                </div>
                <p className='mt-1 text-[1rem]'>{comment.content}</p>
                <div
                  onClick={() => setReplyingTo(comment.id)}
                  className='mt-1 flex cursor-pointer items-center space-x-2 text-[.775rem] text-gray-500'
                >
                  <Reply className='mr-1 h-3 w-3' /> 回复
                  {comment.user.name === email && (
                    <div
                      onClick={() => handleDeleteComment(comment.id, false)}
                      className='ml-1 flex cursor-pointer items-center space-x-2 text-[.775rem]'
                    >
                      <Trash2 className='mr-1 h-3 w-3' /> 删除
                    </div>
                  )}
                </div>
              </div>
            </div>

            {comment.replies?.map((reply: any) => (
              <div key={reply.id} className='ml-12 flex space-x-3'>
                <Avatar className='h-6 w-6'>
                  <AvatarImage src={reply.user.avatar} />
                  <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm font-medium'>
                      {reply.user.name}
                    </span>
                    <span className='text-muted-foreground text-xs'>
                      {reply.time}
                    </span>
                  </div>
                  <p className='mt-1 text-[1rem]'>{reply.content}</p>
                  {reply.user.name === email && (
                    <div
                      onClick={() =>
                        handleDeleteComment(reply.id, true, comment.id)
                      }
                      className='mt-1 flex cursor-pointer items-center space-x-2 text-[.775rem] text-gray-500'
                    >
                      <Trash2 className='mr-1 h-3 w-3' /> 删除
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className='mt-4 flex space-x-2'>
        <Avatar>
          <AvatarFallback>{email?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className='flex-1 space-y-2'>
          {replyingTo && (
            <div className='text-muted-foreground text-sm'>
              正在回复{' '}
              {card.comments.find((c: any) => c.id === replyingTo)?.user.name}
            </div>
          )}
          <Textarea
            placeholder='添加评论...'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className='flex justify-end space-x-2'>
            {replyingTo && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setReplyingTo(null)}
              >
                取消回复
              </Button>
            )}
            <Button size='sm' onClick={handleAddComment}>
              <MessageSquare className='mr-1 h-4 w-4' /> 评论
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
