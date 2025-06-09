import { createFileRoute } from '@tanstack/react-router';
import { TableEditor } from '@/features/table/components/table-editor';


export const Route = createFileRoute('/table/detail/$id')({
  component: TableEditor,
})