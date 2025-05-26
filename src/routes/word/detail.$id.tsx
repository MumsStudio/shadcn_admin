import { createFileRoute } from '@tanstack/react-router'
import Word from '@/features/word/index'

export const Route = createFileRoute('/word/detail/$id')({
  component: Word,
})
