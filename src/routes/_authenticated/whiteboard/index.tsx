import { createFileRoute } from '@tanstack/react-router';
import whiteboard from '@/features/whiteboard/index';


export const Route = createFileRoute('/_authenticated/whiteboard/')({
  component: whiteboard,
})