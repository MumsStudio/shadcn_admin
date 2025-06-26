import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Collaborator {
  email: string
  permission: 'VIEW' | 'EDIT' | 'ADMIN'
}

interface User {
  id: string
  email: string
  name: string
}

export function PermissionDialog({
  open,
  onOpenChange,
  currentEditingWhiteboard,
  userInfo,
  filteredUsers,
  users,
  email,
  handleSavePermissions,
  handleRemoveCollaborator,
  newCollaboratorEmail,
  setNewCollaboratorEmail,
  newCollaboratorPermission,
  setNewCollaboratorPermission,
  handleAddCollaborator,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEditingWhiteboard: any
  userInfo: any
  filteredUsers: any[]
  users: any[]
  email: string | undefined
  handleSavePermissions: (data: {
    userEmail: string
    permission: string
  }) => void
  handleRemoveCollaborator: (email: string) => void
  newCollaboratorEmail: string
  setNewCollaboratorEmail: (email: string) => void
  newCollaboratorPermission: 'VIEW' | 'EDIT' | 'ADMIN'
  setNewCollaboratorPermission: (permission: 'VIEW' | 'EDIT' | 'ADMIN') => void
  handleAddCollaborator: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>编辑白板权限</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div>
            <h4 className='mb-2 text-sm font-medium'>
              当前白板: {currentEditingWhiteboard?.name}
            </h4>

            {/* 协作者列表 */}
            <div className={`mb-4 space-y-2`}>
              <h4 className='py-2 text-sm font-medium'>所有者</h4>
              <div className='space-between flex items-center gap-3'>
                <Avatar className='z-1 size-10'>
                  <AvatarImage
                    src={''}
                    alt={userInfo.username || userInfo.email}
                  />
                  <AvatarFallback className='bg-[#2CB0C8]'>
                    {`${userInfo.firstName?.substring(0, 1)}${userInfo.lastName?.substring(0, 1)}` ||
                      userInfo.email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>{userInfo.email}</div>
              </div>
              {}
              <h4 className='py-2 text-sm font-medium'>协作者</h4>
              {currentEditingWhiteboard?.permissions?.length ? (
                <div className='space-y-2'>
                  {currentEditingWhiteboard.permissions.map(
                    (collaborator: any) => (
                      <div
                        key={collaborator.userEmail}
                        className='flex items-center justify-between rounded border p-2'
                      >
                        <Avatar className='z-1 size-10'>
                          <AvatarImage src={''} alt={collaborator.userEmail} />
                          <AvatarFallback className='bg-[#2CB0C8]'>
                            {collaborator.userEmail
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{collaborator.userEmail}</span>
                        <div className='flex items-center gap-2'>
                          <Select
                            value={collaborator.permission}
                            disabled={
                              !(
                                currentEditingWhiteboard?.permissions?.find(
                                  (item: any) => item.userEmail === email
                                )?.permission === 'ADMIN' ||
                                currentEditingWhiteboard?.ownerEmail === email
                              )
                            }
                            onValueChange={(
                              value: 'VIEW' | 'EDIT' | 'ADMIN'
                            ) => {
                              handleSavePermissions({
                                userEmail: collaborator.userEmail,
                                permission: value,
                              })
                            }}
                          >
                            <SelectTrigger className='w-[120px]'>
                              <SelectValue placeholder='选择权限' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='VIEW'>查看</SelectItem>
                              <SelectItem value='EDIT'>编辑</SelectItem>
                              <SelectItem value='ADMIN'>管理</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant='ghost'
                            size='sm'
                            disabled={
                              !(
                                currentEditingWhiteboard?.permissions?.find(
                                  (item: any) => item.userEmail === email
                                )?.permission === 'ADMIN' ||
                                currentEditingWhiteboard?.ownerEmail === email
                              )
                            }
                            onClick={() =>
                              handleRemoveCollaborator(collaborator.userEmail)
                            }
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className='text-sm text-gray-500'>暂无协作者</p>
              )}
            </div>

            {/* 添加新协作者 */}
            {(currentEditingWhiteboard?.permissions?.find(
              (item: any) => item.userEmail === email
            )?.permission === 'ADMIN' ||
              currentEditingWhiteboard?.ownerEmail === email) && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>添加协作者</h4>
                <div className='flex gap-2'>
                  <Select
                    value={newCollaboratorEmail}
                    onValueChange={setNewCollaboratorEmail}
                  >
                    <SelectTrigger className='w-[300px]'>
                      <SelectValue placeholder='选择用户' />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem
                          key={user.id}
                          value={user.email}
                          disabled={filteredUsers.some(
                            (u) => u.email === user.email
                          )}
                        >
                          {user.username || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={newCollaboratorPermission}
                    onValueChange={(value: 'VIEW' | 'EDIT' | 'ADMIN') =>
                      setNewCollaboratorPermission(value)
                    }
                  >
                    <SelectTrigger className='w-[120px]'>
                      <SelectValue placeholder='选择权限' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='VIEW'>查看</SelectItem>
                      <SelectItem value='EDIT'>编辑</SelectItem>
                      <SelectItem value='ADMIN'>管理</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddCollaborator}>添加</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
