import { createFileRoute } from '@tanstack/react-router';
import table from '@/features/table/index';


export const Route = createFileRoute('/_authenticated/table/')({
  component: table,
})