import { createFileRoute } from '@tanstack/react-router';
import ProjectTeam from '@/features/project/components/team';


export const Route = createFileRoute('/_authenticated/project/team/$id')({
  component: ProjectTeam,
})
