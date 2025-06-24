import { useState, useEffect } from 'react'
// import { useNavigate } from '@tanstack/react-router'
import {
  IconCircleDashedCheck,
  IconFolderFilled,
  IconReceipt,
  IconTournament,
} from '@tabler/icons-react'
import { FileText, Folder, MoreHorizontal, Plus, Upload } from 'lucide-react'
import { X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { showSuccessData, showErrorData } from '@/utils/show-submitted-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tree } from '@/components/ui/tree'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DocumentActionDialog } from './components/option'
import Request from './request'

interface Document {
  updatedAt: any
  ownerEmail: any
  id: string
  name: string
  type: 'file' | 'folder'
  disabled?: boolean
  parentId?: string
  children?: Document[]
  collaborators?: Collaborator[]
}

interface Collaborator {
  email: string
  permission: 'VIEW' | 'EDIT' | 'ADMIN'
}

interface User {
  id: string
  email: string
  name: string
}

export default function WordMenu() {
  // const navigate = useNavigate()
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
  // const [allFiles, setAllFiles] = useState<any>([])
  // useEffect(() => {
  //   console.log('documents', documents)
  // }, [documents])

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
    // const data = res.data
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
      const CollaboratorData = users
        .filter((user) => {
          return data.some((c: any) => c.userEmail === user.email)
        })
        .map((user: any) => {
          return {
            id: user.id,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            permission: data.find((c: any) => c.userEmail === user.email)
              ?.permission,
          }
        })
      setFilteredUsers((prev) => [...prev, ...CollaboratorData])
      setCurrentEditingDoc((prev) => {
        if (!prev) return null
        return {
          ...prev,
          collaborators: CollaboratorData,
        }
      })
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
    const isAlreadyCollaborator = currentEditingDoc.collaborators?.some(
      (c) => c.email === selectedUser.email
    )

    if (isAlreadyCollaborator) {
      alert('该用户已经是协作者')
      return
    }

    const newCollaborator = {
      email: selectedUser.email,
      permission: newCollaboratorPermission,
    }

    // 更新当前编辑文档的协作者列表
    setCurrentEditingDoc((prev) => ({
      ...prev!,
      collaborators: [...(prev?.collaborators || []), newCollaborator],
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
      collaborators:
        prev?.collaborators?.filter((c) => c.email !== email) || [],
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
    email: string
    permission: string
  }) => {
    if (!currentEditingDoc) return

    const data = {
      userEmail: newCollaborator.email,
      permission: newCollaborator.permission,
    }
    console.log('currentEditingDoc', data)
    // return
    try {
      // 调用API更新文档权限
      await Request._SetDocumentPermission(currentEditingDoc.id, data)

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
              <div className='flex items-center gap-2'>
                <Button
                  size='lg'
                  className='border-gray-400 text-[1rem]'
                  variant='outline'
                  onClick={() => {
                    setIsDialogOpen(true)
                  }}
                >
                  <Plus size={30} className='mr-1 border-gray-400' />
                  新建
                </Button>

                <DocumentActionDialog
                  open={isDialogOpen}
                  documents={documents}
                  onOpenChange={setIsDialogOpen}
                  onClose={() => {
                    const firstFolder = documents.find(
                      (doc) => doc.type === 'folder'
                    )
                    if (firstFolder) {
                      setSelectedDocument(firstFolder.id)
                    }
                  }}
                  onSuccess={() => {
                    getDocuments()
                  }}
                  parentId={selectedDocument ?? undefined}
                />
                <Button
                  size='lg'
                  variant='outline'
                  className='border-gray-400 text-[1rem]'
                >
                  <Upload size={24} className='mr-1' />
                  上传
                </Button>
                <Button
                  size='lg'
                  variant='outline'
                  className='border-gray-400 text-[1rem]'
                >
                  模板库
                </Button>
              </div>
              {/* 当前路径显示 */}
              <div className='ml-4 flex items-center gap-1 text-sm'>
                {currentPath.length > 0 && (
                  <>
                    <span
                      className='cursor-pointer hover:text-blue-500'
                      onClick={() => {
                        setCurrentPath([])
                        setCurrentDocuments(documents)
                      }}
                    >
                      根目录
                    </span>
                    {currentPath.map((folder, index) => (
                      <span key={folder.id}>
                        <span className='mx-1'>/</span>
                        <span
                          className='cursor-pointer hover:text-blue-500'
                          onClick={() => {
                            setCurrentPath(currentPath.slice(0, index + 1))
                            setCurrentDocuments(
                              index === 0
                                ? documents.find((d) => d.id === folder.id)
                                    ?.children || []
                                : currentPath[index - 1].children?.find(
                                    (d) => d.id === folder.id
                                  )?.children || []
                            )
                          }}
                        >
                          {folder.name}
                        </span>
                      </span>
                    ))}
                  </>
                )}
              </div>
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
        <Dialog
          open={isPermissionDialogOpen}
          onOpenChange={setIsPermissionDialogOpen}
        >
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>编辑文档权限</DialogTitle>
            </DialogHeader>
            <div className='space-y-4 py-2'>
              <div>
                <h4 className='mb-2 text-sm font-medium'>
                  当前文档: {currentEditingDoc?.name}
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
                  {currentEditingDoc?.collaborators?.length ? (
                    <div className='space-y-2'>
                      {currentEditingDoc.collaborators.map(
                        (collaborator: any) => (
                          <div
                            key={collaborator.email}
                            className='flex items-center justify-between rounded border p-2'
                          >
                            <Avatar className='z-1 size-10'>
                              <AvatarImage src={''} alt={collaborator.email} />
                              <AvatarFallback className='bg-[#2CB0C8]'>
                                {`${collaborator.firstName?.substring(0, 1)}${collaborator.lastName?.substring(0, 1)}` ||
                                  collaborator.email
                                    ?.substring(0, 2)
                                    .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{collaborator.email}</span>
                            <div className='flex items-center gap-2'>
                              <Select
                                value={collaborator.permission}
                                disabled={
                                  !(
                                    currentEditingDoc?.collaborators?.find(
                                      (item) => item.email === email
                                    )?.permission === 'ADMIN' ||
                                    currentEditingDoc?.ownerEmail === email
                                  )
                                }
                                onValueChange={(
                                  value: 'VIEW' | 'EDIT' | 'ADMIN'
                                ) => {
                                  setCurrentEditingDoc((prev) => ({
                                    ...prev!,
                                    collaborators:
                                      prev?.collaborators?.map((c) =>
                                        c.email === collaborator.email
                                          ? { ...c, permission: value }
                                          : c
                                      ) || [],
                                  }))
                                  handleSavePermissions({
                                    email: collaborator.email,
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
                                    currentEditingDoc?.collaborators?.find(
                                      (item) => item.email === email
                                    )?.permission === 'ADMIN' ||
                                    currentEditingDoc?.ownerEmail === email
                                  )
                                }
                                onClick={() =>
                                  handleRemoveCollaborator(collaborator.email)
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
                {(currentEditingDoc?.collaborators?.find(
                  (item) => item.email === email
                )?.permission === 'ADMIN' ||
                  currentEditingDoc?.ownerEmail === email) && (
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
                              className={
                                filteredUsers.some(
                                  (u) => u.email === user.email
                                )
                                  ? 'notselected'
                                  : ''
                              }
                            >
                              {user.username || user.email}
                              {filteredUsers.some(
                                (u) => u.email === user.email
                              ) ? (
                                <IconCircleDashedCheck className='text-green-500' />
                              ) : (
                                <></>
                              )}
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
            {/* <div className='flex justify-end gap-2'> */}
            {/* <Button
                variant='outline'
                onClick={() => setIsPermissionDialogOpen(false)}
              >
                取消
              </Button> */}
            {/* <Button onClick={handleSavePermissions}>保存</Button> */}
            {/* </div> */}
          </DialogContent>
        </Dialog>
      </Main>
    </div>
  )
}
