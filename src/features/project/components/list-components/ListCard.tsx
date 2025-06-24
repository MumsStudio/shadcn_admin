import {
  Edit,
  MoreVertical,
  Trash,
  Copy,
  GripVertical,
  Plus,
} from 'lucide-react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ListCardProps {
  list: any
  onEditList: () => void
  onDuplicateList: () => void
  onDeleteList: () => void
  onAddCard: () => void
  onEditCard: (card: any) => void
  onDeleteCard: (cardId: string) => void
  onCopyCard: (card: any) => void
  handleClickCard: (cardId: string, listId: string) => () => void
}

export const ListCard = ({
  list,
  onEditList,
  onDuplicateList,
  onDeleteList,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onCopyCard,
  handleClickCard,
}: ListCardProps) => {
  return (
    <Droppable
      droppableId={list.id}
      isDropDisabled={false}
      isCombineEnabled={false}
      ignoreContainerClipping={false}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className='w-72 flex-shrink-0'
        >
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-4'>
              <CardTitle className='text-sm font-medium'>{list.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onEditList}>
                    <Edit className='mr-2 h-4 w-4' /> 编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDuplicateList}>
                    <Copy className='mr-2 h-4 w-4' />
                    复制
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-red-500'
                    onClick={onDeleteList}
                  >
                    <Trash className='mr-2 h-4 w-4 text-red-500' />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className='space-y-2 p-4 pt-0'>
              {list.cards.map((card: any, index: number) => (
                <Draggable draggableId={card.id} index={index} key={card.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className='flex items-center justify-between rounded border p-3 hover:shadow'
                    >
                      <div onClick={handleClickCard(card.id, list.id)}>
                        <p className='text-sm'>{card.title}</p>
                        <p className='text-muted-foreground text-xs'>
                          负责人: {card.assignedTo}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onEditCard(card)}>
                              <Edit className='mr-2 h-4 w-4' /> 编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCopyCard(card)}>
                              <Copy className='mr-2 h-4 w-4' /> 复制
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className='text-red-500'
                              onClick={() => onDeleteCard(card.id)}
                            >
                              <Trash className='mr-2 h-4 w-4 text-red-500' />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <GripVertical className='text-muted-foreground h-4 w-4 cursor-move' />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              <Button
                variant='ghost'
                size='sm'
                className='text-muted-foreground w-full justify-start'
                onClick={onAddCard}
              >
                <Plus className='mr-2 h-4 w-4' /> 添加卡片
              </Button>
            </CardContent>
          </Card>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
