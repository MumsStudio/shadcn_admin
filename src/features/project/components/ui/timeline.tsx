// components/ui/timeline.tsx
import { cn } from '@/lib/utils'

export function Timeline({ children }: { children: React.ReactNode }) {
  return <div className='space-y-8'>{children}</div>
}

export function TimelineItem({ children }: { children: React.ReactNode }) {
  return <div className='flex'>{children}</div>
}

export function TimelineSeparator({ children }: { children: React.ReactNode }) {
  return <div className='flex flex-col items-center px-2'>{children}</div>
}

export function TimelineDot({ className }: { className?: string }) {
  return <div className={cn('h-3 w-3 rounded-full', className)} />
}

export function TimelineConnector() {
  return <div className='h-full w-px bg-gray-200' />
}

export function TimelineContent({ children }: { children: React.ReactNode }) {
  return <div className='flex-1 py-1'>{children}</div>
}
