import { createFileRoute } from '@tanstack/react-router'
import Project from '@/features/project/index'

export const Route = createFileRoute('/_authenticated/project/')({
  component: Project,
})
