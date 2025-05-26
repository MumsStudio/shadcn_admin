import { useState, useRef, useEffect } from 'react';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';


type Item = {
  label: string
  value: string
  icon?: React.ReactNode
}

type SimpleSelectProps = {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  items: Item[]
  className?: string
  itemClassName?: string
}

export function SimpleSelect({
  defaultValue,
  value,
  onValueChange,
  items,
  className,
  itemClassName,
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || defaultValue)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])
  const dropdownRef = useRef<HTMLDivElement>(null)
  let closeTimeout: NodeJS.Timeout | null = null

  const handleSelect = (value: string) => {
    setSelectedValue(value)
    onValueChange?.(value)
    setIsOpen(false)
    if (closeTimeout) clearTimeout(closeTimeout)
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (!isOpen) setIsOpen(true)
    if (closeTimeout) clearTimeout(closeTimeout)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    const currentTarget = e.currentTarget as HTMLElement
    const relatedTarget = e.relatedTarget as HTMLElement

    // 如果鼠标没有移动到下拉菜单内，延迟关闭
    if (!currentTarget.contains(relatedTarget)) {
      closeTimeout = setTimeout(() => {
        setIsHovering(false)
        setIsOpen(false)
      }, 300) // 300ms 延迟
    }
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (closeTimeout) clearTimeout(closeTimeout)
    }
  }, [])

  return (
    <div
      className='relative'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={dropdownRef}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'border-input flex h-9 w-[60px] items-center justify-between border-l bg-transparent px-3 py-1 text-sm transition-colors',
          'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isOpen ? 'ring-ring ring-1' : '',
          className
        )}
      >
        {items.find((item) => item.value === selectedValue)?.icon ||
          items.find((item) => item.value === selectedValue)?.label ||
          items[0]?.icon ||
          items[0]?.label}
        <span
          className={`transition-transform duration-200 ${isHovering ? 'rotate-180' : ''}`}
        >
          <IconChevronDown className='h-4 w-4' />
        </span>
      </div>
      {isOpen && (
        <div
          className={cn(
            'bg-popover absolute z-50 mt-1 w-[180px] rounded-md border shadow-lg',
            itemClassName
          )}
          style={{ maxHeight: '200px', overflowY: 'auto' }}
          onMouseEnter={() => {
            if (closeTimeout) clearTimeout(closeTimeout)
          }}
          onMouseLeave={() => {
            closeTimeout = setTimeout(() => {
              setIsHovering(false)
              setIsOpen(false)
            }, 100)
          }}
        >
          {items.map((item) => (
            <div
              key={item.value}
              onClick={() => handleSelect(item.value)}
              className={cn(
                'hover:bg-accent flex cursor-pointer gap-4 px-3 py-2',
                item.value === selectedValue ? 'text-blue-500' : ''
              )}
            >
              {item.icon ? (
                <>
                  {item.icon}
                  <span className='flex items-center leading-4'>
                    {item.label}
                  </span>
                </>
              ) : (
                <span className=''>{item.label}</span>
              )}
              {item.value === selectedValue && (
                <span className='ml-2'>
                  <IconCheck className='h-4 w-4 text-blue-500' />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}