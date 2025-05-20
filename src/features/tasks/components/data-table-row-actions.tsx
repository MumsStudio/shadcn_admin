import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { IconTrash } from '@tabler/icons-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTasks } from '../context/tasks-context';
import { labels } from '../data/data';
import { taskSchema } from '../data/schema';
import Request from '../request';
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data';


interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  fetchTasks: () => Promise<void>
}

export function DataTableRowActions<TData>({
  row,
  fetchTasks,
}: DataTableRowActionsProps<TData>) {
  const task = taskSchema.parse(row.original)
  const authStore = useAuthStore()
  const { setOpen, setCurrentRow } = useTasks()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(task)
            setOpen('update')
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            try {
              const newTask: any = {
                ...task,
                email: authStore.auth.user?.email,
              }
              delete newTask.id
              await Request._AddTasks(newTask)
              fetchTasks()
            } catch (error) {
              console.error('Failed to copy task:', error)
            }
          }}
        >
          Make a copy
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={task.label}
              onValueChange={async (value) => {
                try {
                  await Request._UpdateTasks(task.id, {
                    ...task,
                    label: value,
                  })
                  showSuccessData('updated successfully')
                  fetchTasks()
                } catch (error) {
                  console.error('Failed to update task label:', error)
                  showErrorData('updated failed')
                }
              }}
            >
              {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(task)
            setOpen('delete')
          }}
        >
          Delete
          <DropdownMenuShortcut>
            <IconTrash size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}