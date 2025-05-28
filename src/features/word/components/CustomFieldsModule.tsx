// CustomFieldsModule.tsx
import React from 'react';


interface CustomFieldsModuleProps {
  onChange: (data: any) => void
}
const CustomFieldsModule: React.FC<CustomFieldsModuleProps> = ({ onChange }) => {
  return (
    <div className='module-content'>
      <div className='field-list'>
        <div className='field-item'>
          <label className='block'>优先级</label>
          <select className='w-full rounded border border-gray-300 px-2 py-1'>
            {['高', '中', '低'].map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      <button className='add-field-button rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600'>
        添加字段
      </button>
    </div>
  )
}

export default CustomFieldsModule