import { createFileRoute } from '@tanstack/react-router';
import ProjectList from '@/features/project/components/lists';


export const Route = createFileRoute('/_authenticated/project/list/$id')({
  component: ProjectList,
})