import { useState, useEffect } from 'react'
import {
  IconFolderFilled,
  IconReceipt,
  IconTournament,
} from '@tabler/icons-react'
import { FileText, Folder, MoreHorizontal, Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { showSuccessData, showErrorData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tree } from '@/components/ui/tree'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ActionBar } from './components/wordMenu-components/ActionBar'
import { PathNavigator } from './components/wordMenu-components/PathNavigator'
import { PermissionDialog } from './components/wordMenu-components/PermissionDialog'
import Request from './request'

export interface Document {
  updatedAt: any
  ownerEmail: any
  id: string
  name: string
  type: 'file' | 'folder'
  disabled?: boolean
  parentId?: string
  children?: Document[]
  permissions?: Collaborator[]
}

interface Collaborator {
  userEmail: string
  permission: 'VIEW' | 'EDIT' | 'ADMIN'
}

interface User {
  id: string
  email: string
  name: string
}

export default function WordMenu() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: string
  }>({ key: 'name', direction: 'asc' })

  // 编辑权限相关状态
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [currentEditingDoc, setCurrentEditingDoc] = useState<Document | null>(
    null
  )
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('')
  const [newCollaboratorPermission, setNewCollaboratorPermission] = useState<
    'VIEW' | 'EDIT' | 'ADMIN'
  >('VIEW')
  const [users, setUsers] = useState<User[]>([])
  const [userInfo, setUserInfo] = useState<any>({})
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  useEffect(() => {
    if (currentEditingDoc?.ownerEmail) {
      fetchUserDetail()
    }
    getCollaborators()
  }, [isPermissionDialogOpen === true])
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

  const handleSort = (key: string) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })

    setCurrentDocuments((prev) => {
      const sorted = [...prev].sort((a: any, b: any) => {
        if (key === 'updatedAt') {
          return direction === 'asc'
            ? new Date(a[key]).getTime() - new Date(b[key]).getTime()
            : new Date(b[key]).getTime() - new Date(a[key]).getTime()
        } else {
          if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
          if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
          return 0
        }
      })
      return sorted
    })
  }

  const [documents, setDocuments] = useState<Document[]>([])
  const handleDisabled = (items: any) => {
    const permissions = items.map((file: any) => file.permissions) || []
    const formatArray: any = []
    permissions.map((item: any) => {
      formatArray.push(...item)
    })
    const permission = formatArray.filter((p: any) => p.userEmail === email)
    return permission
  }
  const buildDocumentTree = (items: Document[]): Document[] => {
    const itemMap = new Map<string, Document>()
    const tree: Document[] = []
    const permission = handleDisabled(items)
    const permissionType = ['EDIT', 'ADMIN']
    items.forEach((item) => {
      const docitem =
        permission.find((doc: any) => doc.documentId === item.id) || {}
      console.log('docitem', docitem)
      itemMap.set(item.id, {
        ...item,
        children: [],
        disabled:
          permissionType.includes(docitem.permission) ||
          item.ownerEmail === email
            ? false
            : true,
      })
    })

    items.forEach((item) => {
      const node = itemMap.get(item.id)
      if (item.parentId === '-1' || !item.parentId) {
        tree.push(node!)
      } else {
        const parent = itemMap.get(item.parentId)
        if (parent) {
          parent.children!.push(node!)
        }
      }
    })

    return tree
  }

  const getDocuments = async () => {
    const res = await Request._GetDocument()
    const treeData = buildDocumentTree(res.data)
    setDocuments(treeData)
  }

  useEffect(() => {
    getDocuments()
  }, [])

  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<Document[]>([])
  const [currentDocuments, setCurrentDocuments] =
    useState<Document[]>(documents)

  useEffect(() => {
    const firstFolder = documents.find((doc) => doc.type === 'folder')
    if (firstFolder) {
      handleDocumentClick(firstFolder.id)
    }
  }, [documents])

  const handleDocumentClick = (id: string) => {
    setSelectedDocument(id)
    const clickedDoc = findDocument(documents, id)
    if (!clickedDoc) return

    if (clickedDoc.type === 'folder') {
      const newPath = []
      let current: any = clickedDoc
      while (current) {
        newPath.unshift(current)
        current = findDocument(documents, current.parentId || '')
      }
      setCurrentPath(newPath)
      setCurrentDocuments(clickedDoc.children || [])
    } else {
      window.open(`/word/detail/${clickedDoc.id}`, '_blank')
    }
  }

  const findDocument = (docs: Document[], id: string): Document | undefined => {
    for (const doc of docs) {
      if (doc.id === id) return doc
      if (doc.children) {
        const found = findDocument(doc.children, id)
        if (found) return found
      }
    }
  }

  const handleEdit = (doc: Document) => {
    console.log('编辑文档:', doc)
  }

  const handleDelete = async (id: string) => {
    try {
      await Request._DeleteDocument(id)
      const res = await Request._GetDocument()
      if (res && res.data) {
        const treeData = buildDocumentTree(res.data)
        setDocuments(treeData)
        showSuccessData('delete success')
      }
    } catch (error) {
      console.error('删除文档失败:', error)
    } finally {
      getDocuments()
    }
  }
  const fetchUserDetail = async () => {
    try {
      const response = await Request._GetUserInfo(currentEditingDoc?.ownerEmail)
      const { data } = response
      setUserInfo(data)
      setFilteredUsers([data])
    } catch (error) {
      showErrorData(error)
      console.error('Failed to fetch users:', error)
    }
  }
  const getCollaborators = async () => {
    try {
      await fetchUsers()
      const response = await Request._GetDocumentPermission(
        currentEditingDoc?.id
      )
      const { data } = response
      const CollaboratorData = users.filter((user) => {
        return data.some((c: any) => c.userEmail === user.email)
      })
      setFilteredUsers((prev) => [...prev, ...CollaboratorData])
    } catch (error) {
      showErrorData(error)
      console.error('Failed to fetch users:', error)
    }
  }
  // 打开权限编辑弹窗
  const handleOpenPermissionDialog = (doc: Document) => {
    setCurrentEditingDoc(doc)
    setIsPermissionDialogOpen(true)
  }

  // 添加协作者
  const handleAddCollaborator = () => {
    if (!newCollaboratorEmail || !currentEditingDoc) return

    // 获取选中的用户
    const selectedUser = users.find(
      (user) => user.email === newCollaboratorEmail
    )
    if (!selectedUser) return

    // 检查是否已经是协作者
    const isAlreadyCollaborator = currentEditingDoc.permissions?.some(
      (c) => c.userEmail === selectedUser.email
    )

    if (isAlreadyCollaborator) {
      alert('该用户已经是协作者')
      return
    }

    const newCollaborator = {
      userEmail: selectedUser.email,
      permission: newCollaboratorPermission,
    }

    // 更新当前编辑文档的协作者列表
    setCurrentEditingDoc((prev) => ({
      ...prev!,
      permissions: [...(prev?.permissions || []), newCollaborator],
    }))

    // 清空选择
    setNewCollaboratorEmail('')
    setNewCollaboratorPermission('VIEW')

    setFilteredUsers((prev) => [...prev, selectedUser])
    handleSavePermissions(newCollaborator)
  }
  const removeCollaborator = async (email: string) => {
    try {
      await Request._DelDocumentPermission(currentEditingDoc?.id, {
        userEmail: email,
      })
      showSuccessData('权限删除成功')
      getCollaborators() // 刷新协作者列表
    } catch (error) {
      showErrorData(error)
      console.error('删除失败:', error)
    }
  }
  // 移除协作者
  const handleRemoveCollaborator = (email: string) => {
    if (!currentEditingDoc) return

    setCurrentEditingDoc((prev) => ({
      ...prev!,
      permissions:
        prev?.permissions?.filter((c) => c.userEmail !== email) || [],
    }))

    // 将被移除的用户重新加入可选用户列表
    const removedUser = users.find((user) => user.email === email)
    removeCollaborator(email)
    setFilteredUsers((prev) =>
      prev.filter((user) => user.email !== removedUser?.email)
    )
  }

  // 保存权限更改
  const handleSavePermissions = async (newCollaborator: {
    userEmail: string
    permission: string
  }) => {
    if (!currentEditingDoc) return

    const data = {
      userEmail: newCollaborator.userEmail,
      permission: newCollaborator.permission,
    }
    try {
      // 调用API更新文档权限
      await Request._SetDocumentPermission(currentEditingDoc.id, data)
      setCurrentEditingDoc((prev: any) => ({
        ...prev,
        permissions: prev?.permissions?.map((c: any) => {
          if (c.userEmail === newCollaborator.userEmail) {
            return { ...c, permission: newCollaborator.permission }
          }
          return c
        }),
      }))
      showSuccessData('权限更新成功')
      getDocuments() // 刷新文档列表
    } catch (error) {
      console.error('更新权限失败:', error)
    }
  }

  return (
    <div>
      <Header>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='flex' style={{ height: 'calc(100vh - 100px)' }}>
          {/* 左侧目录树 */}
          <div className='h-[100%] w-90 border-r pr-4'>
            <div className='mb-2'>
              <Button
                size='lg'
                variant='outline'
                className='w-full text-[1rem]'
                onClick={() => {
                  setIsDialogOpen(true)
                  setSelectedDocument('-1')
                }}
              >
                <Plus size={24} className='mr-2' />
                新建文件夹
              </Button>
            </div>
            {documents.length === 0 ? (
              <div className='text-muted-foreground flex h-[80%] flex-col items-center justify-center p-4'>
                <IconTournament size={60} className='text-gray-300' />
                <span className='pt-4 text-[1.25rem] text-gray-300'>
                  No Data
                </span>
              </div>
            ) : (
              <Tree
                data={documents}
                selectedDocument={selectedDocument}
                onSelect={handleDocumentClick}
                renderItem={(item) => (
                  <div className={`flex w-full items-center gap-2`}>
                    {item.type === 'folder' ? (
                      <Folder size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                    <span>{item.name}</span>
                  </div>
                )}
              />
            )}
          </div>

          {/* 右侧内容区 */}
          <div className='flex flex-1 flex-col'>
            {/* 操作按钮 */}
            <div className='flex items-center justify-between border-b px-4 pb-4'>
              <ActionBar
                setSelectedDocument={setSelectedDocument}
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                documents={documents}
                selectedDocument={selectedDocument}
                getDocuments={getDocuments}
              />
              <PathNavigator
                currentPath={currentPath}
                documents={documents}
                setCurrentPath={setCurrentPath}
                setCurrentDocuments={setCurrentDocuments}
              />
            </div>

            {/* 文档列表 */}
            {currentDocuments.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center text-gray-500'>
                <IconReceipt size={140} className='text-gray-300' />
                <span className='text-[1.5rem]'>
                  There is nothing here, click the Add button to add
                </span>
              </div>
            ) : (
              <div className='flex-1 overflow-auto p-4'>
                {/* 表头 */}
                <div className='flex items-center justify-center border-b px-2 pb-3 text-sm font-medium'>
                  <div
                    className='w-[30rem] cursor-pointer hover:text-blue-500'
                    onClick={() => handleSort('name')}
                  >
                    文档名称{' '}
                    {sortConfig.key === 'name' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                  <div
                    className='w-[12rem] cursor-pointer hover:text-blue-500'
                    onClick={() => handleSort('type')}
                  >
                    类型{' '}
                    {sortConfig.key === 'type' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                  <div
                    className='w-[24rem] cursor-pointer hover:text-blue-500'
                    onClick={() => handleSort('owner')}
                  >
                    所有者{' '}
                    {sortConfig.key === 'owner' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                  <div
                    className='flex-1 cursor-pointer hover:text-blue-500'
                    onClick={() => handleSort('updatedAt')}
                  >
                    更新时间{' '}
                    {sortConfig.key === 'updatedAt' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </div>

                {currentDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`cursor-pointer rounded-none border-t-0 border-r-0 border-b border-l-0 p-0 transition-all ${selectedDocument === doc.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
                    onClick={() => handleDocumentClick(doc.id)}
                  >
                    <CardHeader className='m-0 p-2 pb-0'>
                      <CardTitle className='flex items-center text-sm font-medium'>
                        <div className='flex w-[30rem] items-center gap-2'>
                          {doc.type === 'folder' ? (
                            <IconFolderFilled
                              size={24}
                              className='text-[#FFE792]'
                            />
                          ) : (
                            <FileText size={24} className='text-blue-600' />
                          )}
                          <span className='text-gray-800'>{doc.name}</span>
                        </div>
                        <div className='w-[12rem] text-gray-800'>
                          {doc.type === 'folder' ? '文件夹' : '文件'}
                        </div>
                        <div className='w-[24rem] text-gray-800'>
                          {doc.ownerEmail}
                        </div>
                        <div className='flex-1 text-gray-800'>
                          {new Date(doc.updatedAt).toLocaleString()}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenPermissionDialog(doc)
                              }}
                            >
                              编辑权限
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={doc.disabled}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(doc)
                              }}
                            >
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={doc.disabled}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(doc.id)
                              }}
                            >
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 权限编辑弹窗 */}
        <PermissionDialog
          open={isPermissionDialogOpen}
          onOpenChange={setIsPermissionDialogOpen}
          currentEditingDoc={currentEditingDoc}
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
      </Main>
    </div>
  )
}
