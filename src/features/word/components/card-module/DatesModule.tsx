// DatesModule.tsx
import React, { useEffect, useState } from 'react'

interface DatesModuleProps {
  onChange: (data: any, action: string) => void
  currentCard: {
    modules?: {
      dates?: any[]
    }
  }
}
const DatesModule: React.FC<DatesModuleProps> = ({ onChange, currentCard }) => {
  const [dates, setDates] = useState([
    { type: 'start', date: '', time: '' },
    { type: 'end', date: '', time: '' },
  ])
  const [showTag, setShowTag] = useState(false)
  useEffect(() => {
    setDates(
      currentCard?.modules?.dates || [
        { type: 'start', date: '', time: '' },
        { type: 'end', date: '', time: '' },
      ]
    )
  }, [currentCard?.modules])
  const handleSave = () => {
    setShowTag(true)
  }
  console.log('dates', dates)
  return (
    <div className='module-content'>
      {showTag ? (
        <div
          className='date-tag cursor-pointer rounded bg-gray-100 px-2 py-1 hover:bg-gray-200'
          onClick={() => setShowTag(false)}
        >
          {dates[0].date} {dates[0].time} 至 {dates[1].date} {dates[1].time}
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
                    value={dates[index] ? dates[index]?.date : ''}
                    onChange={(e) => {
                      const newDates = [...dates]
                      newDates[index].date = e.target.value
                      if (newDates[index].type === 'start') {
                        onChange(
                          newDates,
                          `Set the start date ${newDates[index].date}`
                        )
                      } else {
                        onChange(
                          newDates,
                          `Set the expiration date ${newDates[index].date}`
                        )
                      }
                      // setDates(newDates)
                    }}
                  />
                  <input
                    type='time'
                    className='w-full rounded border border-gray-300 px-2 py-1'
                    value={dates[index] ? dates[index]?.time : ''}
                    onChange={(e) => {
                      const newDates = [...dates]
                      newDates[index].time = e.target.value
                      if (newDates[index].type === 'start') {
                        onChange(
                          newDates,
                          `Set the start date ${newDates[index].time}`
                        )
                      } else {
                        onChange(
                          newDates,
                          `Set the expiration date ${newDates[index].time}`
                        )
                      }
                      // setDates(newDates)
                    }}
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
