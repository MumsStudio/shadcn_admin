import { createFileRoute } from '@tanstack/react-router';
import ProjectDetail from '@/features/project/components/project-detail';


export const Route = createFileRoute('/_authenticated/project/detail/$id')({
  component: ProjectDetail,
})