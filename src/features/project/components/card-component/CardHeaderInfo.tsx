import { Edit } from 'lucide-react'
import { CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CardHeaderInfoProps {
  card: any
  onEdit: () => void
}

export const CardHeaderInfo = ({ card, onEdit }: CardHeaderInfoProps) => {
  return (
    <div className='flex items-start justify-between'>
      <div>
        <CardTitle>{card.title}</CardTitle>
        <div className='mt-2 flex items-center space-x-2'>
          <Badge variant={card.status === '已完成' ? 'default' : 'secondary'}>
            {card.status}
          </Badge>
          <Badge variant={card.priority === '重要紧急' ? 'destructive' : 'outline'}>
            {card.priority}
          </Badge>
          <span className='text-muted-foreground text-sm'>
            截止日期: {card.dueDate}
          </span>
        </div>
      </div>
      <Button variant='outline' onClick={onEdit}>
        <Edit className='mr-2 h-4 w-4' /> 编辑
      </Button>
    </div>
  )
}
