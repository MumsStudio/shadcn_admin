import { createFileRoute } from '@tanstack/react-router';
import whiteboardeditor from '@/features/whiteboard/components/whiteboard-editor';


export const Route = createFileRoute('/whiteboard/detail/$id')({
  component: whiteboardeditor,
})
