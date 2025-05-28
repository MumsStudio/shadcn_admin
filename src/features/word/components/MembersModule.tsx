// MembersModule.tsx
import React, { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'

interface MembersModuleProps {
  onChange: (data: any) => void
}
const MembersModule: React.FC<MembersModuleProps> = ({ onChange }) => {
  const [showInput, setShowInput] = useState(false)

  const toggleInput = () => {
    setShowInput(!showInput)
  }

  return (
    <div className='module-content flex'>
      <div className='member-list'>
        <button
          onClick={toggleInput}
          className='add-member-btn border border-gray-300'
        >
          <IconPlus size={30} className='text-gray-300' />
        </button>
        {showInput && (
          <input
            type='text'
            placeholder='搜索或添加成员'
            className='w-full border border-gray-300 px-2 py-1'
          />
        )}
      </div>
    </div>
  )
}

export default MembersModule
