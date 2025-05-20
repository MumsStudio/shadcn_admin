import { createFileRoute } from '@tanstack/react-router'
import Word from '@/features/word/word-menu'

export const Route = createFileRoute('/_authenticated/whiteboard/')({
  component: Word,
})
