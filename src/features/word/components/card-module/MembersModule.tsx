// MembersModule.tsx
import React, { useState, useEffect } from 'react'
import { IconCircleDashedCheck, IconPlus } from '@tabler/icons-react'
import { showErrorData } from '@/utils/show-submitted-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Request from '../../request'

interface MembersModuleProps {
  onChange: (data: any, action: string) => void
  currentCard: {
    modules?: {
      members?: any[]
    }
  }
}
const MembersModule: React.FC<MembersModuleProps> = ({
  onChange,
  currentCard,
}) => {
  const [showSelect, setShowSelect] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  useEffect(() => {
    setSelectedUsers(currentCard?.modules?.members || [])
  }, [currentCard?.modules])
  useEffect(() => {
    // 调用_GetUsers接口获取用户列表
    const fetchUsers = async () => {
      try {
        const response = await Request._GetUsers()
        const { data } = response
        setUsers(data)
      } catch (error) {
        showErrorData(error)
        console.error('Failed to fetch users:', error)
      }
    }

    if (showSelect) {
      fetchUsers()
    }
  }, [showSelect])

  const handleSelectChange = (value: any) => {
    const user = users.find((u) => u.email === value)
    if (user && !selectedUsers.some((u) => u.email === user.email)) {
      onChange([...selectedUsers, user], `Add member ${user.email}`)
    }
    setShowSelect(false)
  }

  const handleRemoveUser = (email: string) => {
    const updatedUsers = selectedUsers.filter((u) => u.email !== email)
    onChange(updatedUsers, `Remove member ${email}`)
  }
  const toggleInput = () => {
    setShowSelect(!showSelect)
  }
  return (
    <div className='module-content flex flex-col'>
      <div className='member-list flex flex-wrap items-center gap-2'>
        {selectedUsers.map((user) => (
          <div key={user.email} className='relative'>
            <Avatar className='z-1 size-10'>
              <AvatarImage src={''} alt={user.username || user.email} />
              <AvatarFallback className='bg-[#2CB0C8]'>
                {`${user.firstName.substring(0, 1)}${user.lastName.substring(0, 1)}` ||
                  user.email.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => handleRemoveUser(user.email)}
              className='absolute -top-1 -right-1 z-50 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={toggleInput}
          className='add-member-btn border border-gray-300'
        >
          <IconPlus size={30} className='text-gray-300' />
        </button>
      </div>
      {showSelect && (
        <div className='mt-2 flex items-center gap-2'>
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder='选择成员' />
            </SelectTrigger>
            <SelectContent className='z-100000'>
              {users.map((user: any) => (
                <SelectItem
                  key={user.id}
                  value={user.email}
                  disabled={selectedUsers.some((u) => u.email === user.email)}
                  className={
                    selectedUsers.some((u) => u.email === user.email)
                      ? 'notselected'
                      : ''
                  }
                >
                  {user.username || user.email}
                  {selectedUsers.some((u) => u.email === user.email) ? (
                    <IconCircleDashedCheck className='text-green-500' />
                  ) : (
                    <></>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

export default MembersModule
