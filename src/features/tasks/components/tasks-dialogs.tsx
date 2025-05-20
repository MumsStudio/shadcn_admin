import { ConfirmDialog } from '@/components/confirm-dialog';
import { useTasks } from '../context/tasks-context';
import Request from '../request';
import { TasksImportDialog } from './tasks-import-dialog';
import { TasksMutateDrawer } from './tasks-mutate-drawer';
import { showSuccessData } from '@/utils/show-submitted-data';


interface TasksDialogsProps {
  fetchTasks: () => void
}

export function TasksDialogs({ fetchTasks }: TasksDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useTasks()
  return (
    <>
      <TasksMutateDrawer
        key='task-create'
        open={open === 'create'}
        fetchTasks={fetchTasks}
        onOpenChange={() => setOpen('create')}
      />

      <TasksImportDialog
        key='tasks-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
        fetchTasks={fetchTasks}
      />

      {currentRow && (
        <>
          <TasksMutateDrawer
            key={`task-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            fetchTasks={fetchTasks}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='task-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              Request._DeleteTasks(currentRow.id).then((res: any) => {
                if (res) {
                  showSuccessData('delete successfully')
                  fetchTasks()
                }
              })
            }}
            className='max-w-md'
            title={`Delete this task: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a task with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}