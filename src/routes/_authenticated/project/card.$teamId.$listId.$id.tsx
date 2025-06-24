import { createFileRoute } from '@tanstack/react-router';
import ProjectCard from '@/features/project/components/card';


export const Route = createFileRoute('/_authenticated/project/card/$teamId/$listId/$id')({
  component: ProjectCard,
})
