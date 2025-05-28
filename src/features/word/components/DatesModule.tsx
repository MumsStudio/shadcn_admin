// DatesModule.tsx
import React, { useState } from 'react'

interface DatesModuleProps {
  onChange: (data: any) => void
}
const DatesModule: React.FC<DatesModuleProps> = ({ onChange }) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [showTag, setShowTag] = useState(false)

  const handleSave = () => {
    setShowTag(true)
  }

  return (
    <div className='module-content'>
      {showTag ? (
        <div
          className='date-tag cursor-pointer rounded bg-gray-100 px-2 py-1 hover:bg-gray-200'
          onClick={() => setShowTag(false)}
        >
          {startDate} {startTime} 至 {endDate} {endTime}
        </div>
      ) : (
        <>
          <div className='py-2'>
            {['开始日期', '到期日'].map((label, index) => (
              <label key={index} className='text-[14px] text-gray-700'>
                {label}:
                <div className='flex gap-2'>
                  <input
                    type='date'
                    className='w-full rounded border border-gray-300 px-2 py-1 text-gray-700'
                    value={index === 0 ? startDate : endDate}
                    onChange={(e) =>
                      index === 0
                        ? setStartDate(e.target.value)
                        : setEndDate(e.target.value)
                    }
                  />
                  <input
                    type='time'
                    className='w-full rounded border border-gray-300 px-2 py-1'
                    value={index === 0 ? startTime : endTime}
                    onChange={(e) =>
                      index === 0
                        ? setStartTime(e.target.value)
                        : setEndTime(e.target.value)
                    }
                  />
                </div>
              </label>
            ))}
          </div>
          <button
            className='save-dates-button rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600'
            onClick={handleSave}
          >
            保存
          </button>
        </>
      )}
    </div>
  )
}

export default DatesModule
