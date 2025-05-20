import { useUsers } from '../context/users-context'
import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'

interface UsersDialogsProps {
  onSuccess?: () => void
}

export function UsersDialogs({
  onSuccess = () => {
    console.log('onSuccess callback triggered')
  },
}: UsersDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
        onSuccess={onSuccess}
      />

      <UsersInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            onSuccess={onSuccess}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            onSuccess={onSuccess}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
