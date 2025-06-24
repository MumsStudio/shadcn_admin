import { useEffect, useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CardMembersProps {
  card: any
  members: any[]
  cards: any[]
  updateCard: (data: any) => void
}

export const CardMembers = ({
  card,
  members,
  cards,
  updateCard,
}: CardMembersProps) => {
  const [showMemberSelect, setShowMemberSelect] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<any[]>([])
  useEffect(() => {
    setSelectedMembers(card.members || [])
  }, [card])
  const handleAddMember = (userId: string) => {
    const user = members.find((u) => u.id === userId)
    if (user && !selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers((prev) => [...prev, user])
      const otherCards = cards.filter((c: any) => c.id !== card.id)
      const newCards = [
        ...otherCards,
        { ...card, members: [...selectedMembers, user] },
      ]
      updateCard({ cards: newCards })
      setShowMemberSelect(false)
    }
  }

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId))
    const otherCards = cards.filter((c: any) => c.id !== card.id)
    const newCards = [
      ...otherCards,
      {
        ...card,
        members: selectedMembers.filter((m) => m.id !== userId),
      },
    ]
    updateCard({ cards: newCards })
  }

  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-sm font-medium'>协作者</h3>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setShowMemberSelect(!showMemberSelect)}
        >
          <UserPlus className='mr-1 h-4 w-4' /> 添加
        </Button>
      </div>
      <div className='flex flex-col space-y-2'>
        <div className='flex flex-wrap gap-2'>
          {selectedMembers?.map((user: any) => (
            <div key={user.id} className='relative'>
              <div className='flex items-center space-x-2 rounded border p-2'>
                <Avatar className='h-6 w-6'>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.email.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className='text-sm'>{user.email}</span>
              </div>
              {showMemberSelect && (
                <button
                  onClick={() => handleRemoveMember(user.id)}
                  className='absolute -top-1 -right-1 z-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {showMemberSelect && (
          <div className='mt-2 flex items-center gap-2'>
            <Select onValueChange={handleAddMember}>
              <SelectTrigger>
                <SelectValue placeholder='选择成员' />
              </SelectTrigger>
              <SelectContent className='z-100000'>
                {members.map((user: any) => (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                    disabled={selectedMembers.some((m) => m.id === user.id)}
                  >
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
