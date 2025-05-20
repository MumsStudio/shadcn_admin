'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { showSubmittedData, showSuccessData } from '@/utils/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { User } from '../data/schema'
import Request from '../request'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
  onSuccess?: () => void
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess = () => {
    // console.log('刷新')
  },
}: Props) {
  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value.trim() !== currentRow.username) return
    Request._DeleteUser(currentRow?.id).then((res: any) => {
      if (res) {
        showSuccessData('delete successfully')
        onSuccess()
        // console.log('执行刷新')
      }
    })
    onOpenChange(false)
    // showSubmittedData(currentRow, 'The following user has been deleted:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.username}</span>?
            <br />
            This action will permanently remove the user with the role of{' '}
            <span className='font-bold'>
              {currentRow.role?.toUpperCase()}
            </span>{' '}
            from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Username:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter username to confirm deletion.'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be carefull, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
