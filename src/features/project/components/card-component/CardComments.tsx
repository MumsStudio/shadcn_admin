import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CardCommentsProps {
  card: any
  setCard: (card: any) => void
}

export const CardComments = ({ card, setCard }: CardCommentsProps) => {
  const [newComment, setNewComment] = useState('')

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment = {
      id: `cmt-${Date.now()}`,
      user: { id: 'current-user', name: '我', avatar: '' },
      content: newComment,
      time: new Date().toLocaleString(),
    }

    setCard({
      ...card,
      comments: [...card.comments, comment],
    })
    setNewComment('')
  }

  return (
    <div>
      <h3 className='mb-2 text-sm font-medium'>
        讨论 ({card.comments?.length})
      </h3>
      <div className='space-y-4'>
        {card.comments?.map((comment: any) => (
          <div key={comment.id} className='flex space-x-3'>
            <Avatar>
              <AvatarImage src={comment.user.avatar} />
              <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-medium'>{comment.user.name}</span>
                <span className='text-muted-foreground text-xs'>
                  {comment.time}
                </span>
              </div>
              <p className='mt-1 text-sm'>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-4 flex space-x-2'>
        <Avatar>
          <AvatarFallback>我</AvatarFallback>
        </Avatar>
        <div className='flex-1 space-y-2'>
          <Textarea
            placeholder='添加评论...'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className='flex justify-end'>
            <Button size='sm' onClick={handleAddComment}>
              <MessageSquare className='mr-1 h-4 w-4' /> 评论
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
