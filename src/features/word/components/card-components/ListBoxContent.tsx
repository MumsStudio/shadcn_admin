// ListBoxContent.tsx
import React from 'react'
import {
  IconCheckbox,
  IconChecklist,
  IconClockHour3,
  IconMenuDeep,
  IconMessage,
  IconPaperclip,
} from '@tabler/icons-react'
import { index } from 'mathjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '../types'

interface ListBoxContentProps {
  cards: Card[]
  handleCardClick: (cardId: string) => void
}

const ListBoxContent: React.FC<ListBoxContentProps> = ({
  cards,
  handleCardClick,
}) => {
  const clickCard = (cardId: string) => {
    handleCardClick(cardId)
  }
  const size = 18
  const CardIconMap: any = {
    description: <IconMenuDeep size={size} className='mr-1' />,
    remark: <IconMessage size={size} className='mr-1' />,
    attachments: <IconPaperclip size={size} className='mr-1' />,
    dates: <IconClockHour3 size={size} className='mr-1' />,
    checklist: <IconCheckbox size={size} className='mr-1' />,
  }
  const needCountModules = ['attachments']
  return (
    <div className='list-box-content p-2'>
      {cards.map((card, index) => (
        <div
          key={card.id}
          onClick={() => clickCard(card.id)}
          className='list-box-card mb-2 rounded border border-gray-300 bg-white p-2'
        >
          <div className='card-header text-lg font-bold'>
            {card.modules?.name || `卡片${index + 1}`}
          </div>
          <div className='card-content'>
            {card.modules && Object.keys(card.modules).length > 0 ? (
              <div className='flex shrink-0 flex-wrap gap-1'>
                {Object.keys(card.modules).map(
                  (moduleName) =>
                    card.modules?.[moduleName] &&
                    card.modules?.[moduleName].length > 0 &&
                    card.modules?.dates?.[1].date !== '' && (
                      <div
                        key={moduleName}
                        className={`flex items-center px-1 text-[14px] ${moduleName === 'dates' ? 'rounded bg-[#F5CD47] p-1' : ''}`}
                      >
                        {/* {card.modules[moduleName]} */}
                        {CardIconMap[moduleName]}
                        {needCountModules.includes(moduleName)
                          ? card.modules?.[moduleName].length
                          : ''}
                        {moduleName === 'dates' && (
                          <div className='ml-1 flex items-center justify-center'>
                            <div>
                              {/* <IconClockHour3 className='mr-1' /> */}
                            </div>
                            {card.modules?.dates.length > 1 && (
                              <div className='text-[12px]'>
                                {card.modules?.dates[1].date}
                              </div>
                            )}
                          </div>
                        )}
                        {moduleName === 'labels' && (
                          <div className='labels flex gap-1'>
                            {card.modules?.labels &&
                            card.modules?.labels.length > 0
                              ? card.modules?.labels.map(
                                  (label: any, index: any) => (
                                    <div
                                      key={index}
                                      className='rounded px-2 py-1 text-white'
                                      style={{ backgroundColor: label.color }}
                                    ></div>
                                  )
                                )
                              : ''}
                          </div>
                        )}
                        {moduleName === 'checklist' &&
                          card.modules?.checklist && (
                            <div>
                              {
                                card.modules?.checklist.filter(
                                  (item: any) => item.checked
                                ).length
                              }
                              /{card.modules?.checklist.length}
                            </div>
                          )}
                        {moduleName === 'customFields' &&
                          card.modules?.customFields &&
                          card.modules?.customFields.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                              {card.modules?.customFields.map((item: any) => {
                                return (
                                  <div key={item.id} className=''>
                                    {item.type === 'checkbox' ? (
                                      <div className='flex items-center justify-center gap-2'>
                                        {' '}
                                        <input
                                          type='checkbox'
                                          checked={item.value}
                                          className='rounded border border-gray-300 p-1'
                                        />
                                        <span>{item.name}</span>
                                      </div>
                                    ) : (
                                      <div>
                                        {item.name}
                                        {item.value ? `: ${item.value}` : ''}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                      </div>
                    )
                )}
              </div>
            ) : (
              <div className='text-gray-500'></div>
            )}
          </div>
          <div className='flex justify-end pt-2'>
            {card.modules?.members && card.modules?.members.length > 0 && (
              <div className='flex items-center justify-end gap-2'>
                {card.modules?.members.map((user: any) => (
                  <div key={user.email} className='relative'>
                    <Avatar className='z-1 size-6'>
                      <AvatarImage src={''} alt={user.username || user.email} />
                      <AvatarFallback className='bg-[#2CB0C8]'>
                        {`${user.firstName.substring(0, 1)}${user.lastName.substring(0, 1)}` ||
                          user.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ListBoxContent
