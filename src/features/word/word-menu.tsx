import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  IconFolderFilled,
  IconReceipt,
  IconTournament,
} from '@tabler/icons-react'
import { FileText, Folder, MoreHorizontal, Plus, Upload } from 'lucide-react'
import { showSuccessData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { DocumentActionDialog } from './components/option'
import Request from './request'

interface Document {
  updatedAt: any
  ownerEmail: any
  id: string
  name: string
  type: 'file' | 'folder'
  parentId?: string
  children?: Document[]
}

export default function WordMenu() {
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: string
  }>({ key: 'name', direction: 'asc' })

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

  const [documents, setDocuments] = useState<Document[]>([
    // {
    //   id: 'folder1',
    //   parentId: '-1',
    //   name: '项目文档',
    //   type: 'folder',
    //   children: [
    //     {
    //       parentId: 'folder1',
    //       id: 'file1',
    //       name: '需求文档.docx',
    //       type: 'file',
    //     },
    //     {
    //       parentId: 'folder1',
    //       id: 'file2',
    //       name: '设计文档.docx',
    //       type: 'file',
    //     },
    //   ],
    // },
    // {
    //   id: 'folder2',
    //   parentId: '-1',
    //   name: '会议记录',
    //   type: 'folder',
    //   children: [
    //     {
    //       id: 'folder3',
    //       parentId: 'folder2',
    //       name: '周会记录',
    //       type: 'folder',
    //       children: [
    //         {
    //           id: 'file3',
    //           parentId: 'folder3',
    //           name: '2024年10月1日周会记录.docx',
    //           type: 'file',
    //         },
    //       ],
    //     },
    //     {
    //       id: 'file4',
    //       parentId: 'folder2',
    //       name: '项目评审.docx',
    //       type: 'file',
    //     },
    //   ],
    // },
  ])
  // 获取文档目录
  const buildDocumentTree = (items: Document[]): Document[] => {
    const itemMap = new Map<string, Document>()
    const tree: Document[] = []

    // 首先创建所有项的映射
    items.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] })
    })

    // 构建树结构
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
    Request._GetDocument().then((res: any) => {
      if (res && res.data) {
        const treeData = buildDocumentTree(res.data)
        setDocuments(treeData)
      }
    })
  }
  useEffect(() => {
    getDocuments()
  }, [])
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<Document[]>([])
  const [currentDocuments, setCurrentDocuments] =
    useState<Document[]>(documents)

  useEffect(() => {
    // 自动选中第一个文件夹
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
      // 检查是否是根目录下的文件夹或当前路径下的子文件夹
      // 查找点击文件夹在文档树中的完整路径
      const newPath = []
      let current: any = clickedDoc
      while (current) {
        newPath.unshift(current)
        current = findDocument(documents, current.parentId || '')
      }
      setCurrentPath(newPath)
      setCurrentDocuments(clickedDoc.children || [])
    } else {
      // 假设 clickedDoc 变量在当前作用域内存在，将 id 拼接到 URL 中
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
    // TODO: 实现编辑逻辑
    console.log('编辑文档:', doc)
  }

  const handleDelete = async (id: string) => {
    try {
      await Request._DeleteDocument(id)
      // 重新获取文档列表
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
                    // 保留原有选择逻辑
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
                  // 为了解决类型不匹配问题，将 null 转换为 undefined
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
                            <DropdownMenuItem onClick={() => handleEdit(doc)}>
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
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
      </Main>
    </div>
  )
}
