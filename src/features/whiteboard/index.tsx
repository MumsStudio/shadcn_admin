import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { CreateWhiteboardDialog } from './components/dialog'
import { PermissionDialog } from './components/PermissionDialog'
import { useAuthStore } from '@/stores/authStore'
import Request from './request'

export default function Whiteboard() {
  const [whiteboards, setWhiteboards] = useState<any[]>([])
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email

  // 权限相关状态
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [currentEditingWhiteboard, setCurrentEditingWhiteboard] =
    useState<any>(null)
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('')
  const [newCollaboratorPermission, setNewCollaboratorPermission] = useState<
    'VIEW' | 'EDIT' | 'ADMIN'
  >('VIEW')
  const [users, setUsers] = useState<any[]>([])
  const [userInfo, setUserInfo] = useState<any>({})
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])

  useEffect(() => {
    getWhiteboards()
  }, [])

  const getWhiteboards = async () => {
    Request._GetWhiteboard().then((res: any) => {
      if (res.data) {
        setWhiteboards(res.data)
      }
    })
  }

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const response = await Request._GetUsers()
      const data = response.data
      setUsers(data)
    } catch (error) {
      showErrorData(error)
      console.error('Failed to fetch users:', error)
    }
  }
  const getCollaborators = async (id: string) => {
    try {
      const response = await Request._GetWhiteboardPermission(id)
      const { data } = response
      const usersRes = await Request._GetUsers()
      const userData = usersRes.data
      const CollaboratorData = userData.filter((user: any) => {
        return data.some((c: any) => c.userEmail === user.email)
      })
      setFilteredUsers((prev) => [...prev, ...CollaboratorData])
    } catch (error) {
      showErrorData(error)
      console.error('Failed to fetch users:', error)
    }
  }

  // 打开权限编辑弹窗
  const handleOpenPermissionDialog = async (whiteboard: any) => {
    setCurrentEditingWhiteboard(whiteboard)
    await fetchUsers()
    await getCollaborators(whiteboard.id)
    setIsPermissionDialogOpen(true)

    if (whiteboard.ownerEmail) {
      fetchUserDetail(whiteboard.ownerEmail)
    }
  }

  // 获取用户详情
  const fetchUserDetail = async (ownerEmail: string) => {
    try {
      const response = await Request._GetUserInfo(ownerEmail)
      const { data } = response
      setUserInfo(data)
      setFilteredUsers((prev) => [...prev, data])
    } catch (error) {
      showErrorData(error)
      console.error('Failed to fetch users:', error)
    }
  }

  // 添加协作者
  const handleAddCollaborator = () => {
    if (!newCollaboratorEmail || !currentEditingWhiteboard) return

    const selectedUser = users.find(
      (user) => user.email === newCollaboratorEmail
    )
    if (!selectedUser) return

    const isAlreadyCollaborator = currentEditingWhiteboard.permissions?.some(
      (c: any) => c.userEmail === selectedUser.email
    )

    if (isAlreadyCollaborator) {
      alert('该用户已经是协作者')
      return
    }

    const newCollaborator = {
      userEmail: selectedUser.email,
      permission: newCollaboratorPermission,
    }

    setCurrentEditingWhiteboard((prev: any) => ({
      ...prev!,
      permissions: [...(prev?.permissions || []), newCollaborator],
    }))

    setNewCollaboratorEmail('')
    setNewCollaboratorPermission('VIEW')
    setFilteredUsers((prev) => [...prev, selectedUser])
    handleSavePermissions(newCollaborator)
  }

  // 移除协作者
  const handleRemoveCollaborator = async (email: string) => {
    if (!currentEditingWhiteboard) return

    setCurrentEditingWhiteboard((prev: any) => ({
      ...prev!,
      permissions:
        prev?.permissions?.filter((c: any) => c.userEmail !== email) || [],
    }))

    const removedUser = users.find((user) => user.email === email)
    await removeCollaborator(email)
    setFilteredUsers((prev) =>
      prev.filter((user) => user.email !== removedUser?.email)
    )
  }

  // 删除协作者
  const removeCollaborator = async (email: string) => {
    try {
      await Request._DelWhiteboardPermission(currentEditingWhiteboard?.id, {
        userEmail: email,
      })
      showSuccessData('权限删除成功')
      getWhiteboards()
    } catch (error) {
      showErrorData(error)
      console.error('删除失败:', error)
    }
  }

  // 保存权限更改
  const handleSavePermissions = async (newCollaborator: {
    userEmail: string
    permission: string
  }) => {
    if (!currentEditingWhiteboard) return

    const data = {
      userEmail: newCollaborator.userEmail,
      permission: newCollaborator.permission,
    }

    try {
      await Request._SetWhiteboardPermission(currentEditingWhiteboard.id, data)
      showSuccessData('权限更新成功')
      setCurrentEditingWhiteboard((prev: any) => ({
        ...prev,
        permissions: prev?.permissions?.map((c: any) => {
          if (c.userEmail === newCollaborator.userEmail) {
            return { ...c, permission: newCollaborator.permission }
          }
          return c
        }),
      }))
      getWhiteboards()
    } catch (error) {
      console.error('更新权限失败:', error)
    }
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const createNewWhiteboard = async (name: string) => {
    try {
      await Request._AddWhiteboard({ name: name }).then((res: any) => {
        if (res.data) {
          showSuccessData('create success')
          // setWhiteboards([...whiteboards, res.data])
        }
      })
      getWhiteboards()
    } catch (error) {
      showErrorData(`Error creating whiteboard: ${error}`)
      console.error('Error creating whiteboard:', error)
    }
  }

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' /> New Whiteboard
            </Button>
            <CreateWhiteboardDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onSubmit={createNewWhiteboard}
            />
            <PermissionDialog
              open={isPermissionDialogOpen}
              onOpenChange={setIsPermissionDialogOpen}
              currentEditingWhiteboard={currentEditingWhiteboard}
              userInfo={userInfo}
              filteredUsers={filteredUsers}
              users={users}
              email={email}
              handleSavePermissions={handleSavePermissions}
              handleRemoveCollaborator={handleRemoveCollaborator}
              newCollaboratorEmail={newCollaboratorEmail}
              setNewCollaboratorEmail={setNewCollaboratorEmail}
              newCollaboratorPermission={newCollaboratorPermission}
              setNewCollaboratorPermission={setNewCollaboratorPermission}
              handleAddCollaborator={handleAddCollaborator}
            />
          </>
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Whiteboards</h2>
            <p className='text-muted-foreground'>
              Here's a list of your whiteboards!
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable
            data={whiteboards}
            columns={columns({
              getWhiteboards,
              handleOpenPermissionDialog,
            })}
          />
        </div>
      </Main>
    </>
  )
}
