import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Trash2, Edit, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Request from '../request'

export const columns = ({
  getWhiteboards,
  handleOpenPermissionDialog,
}: {
  getWhiteboards: () => Promise<void>
  handleOpenPermissionDialog: (whiteboard: any) => void
}): ColumnDef<any>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return date.toLocaleString()
    },
  },
  {
    accessorKey: 'lastEditedAt',
    header: 'lastEdited At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('lastEditedAt'))
      return date.toLocaleString()
    },
  },
  {
    accessorKey: 'ownerEmail',
    header: 'ownerEmail',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const whiteboard = row.original

      const handleDelete = async () => {
        try {
          await Request._DeleteWhiteboard(whiteboard.id)
          await getWhiteboards()
        } catch (error) {
          console.error('Error deleting whiteboard:', error)
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() => {
                // Navigate to edit page
                window.open(`/whiteboard/detail/${whiteboard.id}`, '_blank')
              }}
            >
              <Edit className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                handleOpenPermissionDialog(whiteboard)
              }}
            >
              <KeyRound className='mr-2 h-4 w-4' /> 权限管理
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2 className='mr-2 h-4 w-4' /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
