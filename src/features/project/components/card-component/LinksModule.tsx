import React, { useState, useEffect } from 'react';
import { IconPlus, IconTrash, IconEdit, IconFile, IconLink, IconChalkboard } from '@tabler/icons-react';
import { useAuthStore } from '@/stores/authStore';
import { showErrorData } from '@/utils/show-submitted-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Request from '../../request';


interface DocumentInfo {
  id: string
  name: string
  owner: string
}

interface LinksModuleProps {
  currentCard: any
  onChange: (
    links: Array<{ url: string; title?: string }>,
    action: string
  ) => void
  onUpdateCard: (data: any) => void
}

export const LinksModule: React.FC<LinksModuleProps> = ({
  currentCard,
  onChange,
  onUpdateCard,
}) => {
  type PermissionType = 'NONE' | 'ADMIN' | 'EDITOR' | 'VIEWER'
  const permissionMap: Record<PermissionType, string> = {
    NONE: '暂无权限',
    ADMIN: '你可管理',
    EDITOR: '你可编辑',
    VIEWER: '你可查看',
  }
  const [links, setLinks] = useState<
    Array<{
      url: string
      title?: string
      docName?: string
      docOwner?: string
      docPermission?: PermissionType
    }>
  >([])
  const [showDialog, setShowDialog] = useState(false)
  const [newLink, setNewLink] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [documentInfos, setDocumentInfos] = useState<
    Record<string, DocumentInfo>
  >({})
  const [isLoading, setIsLoading] = useState(false)
  const authStore = useAuthStore()
  const email = authStore.auth.user?.email
  useEffect(() => {
    console.log('currentCard', currentCard)
    if (currentCard.links && currentCard.links.length > 0) {
      setLinks(currentCard.links)
    }
  }, [currentCard])
  const getDocumentInfo = async (url: string): Promise<any> => {
    const wordDetailMatch = url.match(/word\/detail\/([a-f0-9-]+)/)
    const whiteboardDetailMatch = url.match(/whiteboard\/detail\/([a-f0-9-]+)/)

    if (wordDetailMatch) {
      const docId = wordDetailMatch[1]
      try {
        setIsLoading(true)
        const res = await Request._GetDocumentDetail(docId)
        if (!res.data) {
        } else {
          return res.data
        }
      } catch (error) {
        console.error('获取文档信息错误:', error)
        return null
      } finally {
        setIsLoading(false)
      }
    } else if (whiteboardDetailMatch) {
      const boardId = whiteboardDetailMatch[1]
      try {
        setIsLoading(true)
        const res = await Request._GetWhiteboardDetail(boardId)
        if (!res.data) {
          // showErrorData('获取白板信息失败')
        } else {
          return res.data
        }
      } catch (error) {
        console.error('获取白板信息错误:', error)
        return null
      } finally {
        setIsLoading(false)
      }
    }
    return null
  }

  const handleAddLink = async () => {
    if (!newLink.trim()) return
    const docInfo = await getDocumentInfo(newLink)
    if (
      (newLink.includes('word/detai') ||
        newLink.includes('whiteboard/detai')) &&
      docInfo === null
    ) {
      showErrorData('请输入正确的链接')
      return
    }
    const title = newTitle
    const docName = docInfo?.name || ''
    const docOwner = newLink.includes('word/detai')
      ? docInfo?.document.ownerEmail
      : docInfo?.ownerEmail
    const updatedLinks = [...links]
    const linkObj = { url: newLink, title, docName, docOwner }

    if (editingIndex !== null) {
      updatedLinks[editingIndex] = linkObj
      onChange(updatedLinks, `更新链接: ${newLink}`)
    } else {
      updatedLinks.push(linkObj)
      onChange(updatedLinks, `添加链接: ${newLink}`)
    }
    onUpdateCard({
      links: updatedLinks,
    })
    setLinks(updatedLinks)
    setNewLink('')
    setNewTitle('')
    setShowDialog(false)
    setEditingIndex(null)
  }

  const handleRemoveLink = (index: number) => {
    const updatedLinks = [...links]
    updatedLinks.splice(index, 1)
    setLinks(updatedLinks)
    onUpdateCard({
      links: updatedLinks,
    })
    onChange(updatedLinks, `删除链接: ${links[index].url}`)
  }

  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-sm font-medium'>相关链接</h3>
        <Button variant='ghost' size='sm' onClick={() => setShowDialog(true)}>
          <IconPlus className='mr-1 h-4 w-4' /> 添加
        </Button>
      </div>

      {links.length > 0 ? (
        <div className='w-[25%] space-y-2'>
          {links.map((link, index) => (
            <div
              key={index}
              className='flex items-center justify-between rounded border p-2'
            >
              <div className='flex-1 truncate px-2'>
                {(link.url.includes('word/detai') ||
                  link.url.includes('whiteboard/detai')) && (
                  <div className='flex items-center'>
                    <div>
                      {link.url.includes('word/detai') ? (
                        <IconFile />
                      ) : (
                        <IconChalkboard></IconChalkboard>
                      )}
                    </div>
                    <div className='flex flex-col p-2 text-[1rem] font-bold'>
                      <a
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline'
                      >
                        {link.docName}
                      </a>
                      <span className='text-[.875rem] text-gray-600'>
                        拥有者：{link.docOwner}
                      </span>
                      {/* <span className='text-[.875rem] font-normal'>
                        {permissionMap[link?.docPermission || 'NONE']}
                      </span> */}
                    </div>
                  </div>
                )}
                {!link.url.includes('word/detai') &&
                  !link.url.includes('whiteboard/detai') && (
                    <div className='flex items-center gap-2 truncate'>
                      <div>
                        <IconLink />
                      </div>
                      <a
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline'
                      >
                        {link.title || link.url}
                      </a>
                    </div>
                  )}
              </div>
              <div className='flex cursor-pointer gap-2'>
                <IconEdit
                  className='h-4 w-4'
                  onClick={() => {
                    setNewLink(link.url)
                    setNewTitle(link.title || '')
                    setEditingIndex(index)
                    setShowDialog(true)
                  }}
                />

                <IconTrash
                  onClick={() => handleRemoveLink(index)}
                  className='h-4 w-4'
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-muted-foreground text-sm'>暂无链接</p>
      )}

      {showDialog && (
        <div className='bg-opacity-50 fixed inset-0 z-10 flex items-center justify-center border'>
          <div className='w-[400px] rounded-lg bg-white p-4 shadow-lg'>
            <h3 className='mb-4 text-lg font-medium'>
              {editingIndex !== null ? '编辑链接' : '添加链接'}
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium'>URL</label>
                <Input
                  type='url'
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder='https://example.com'
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium'>
                  标题 (可选)
                </label>
                <Input
                  type='text'
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder='链接标题'
                />
              </div>
              <div className='flex justify-end space-x-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setShowDialog(false)
                    setEditingIndex(null)
                    setNewLink('')
                    setNewTitle('')
                  }}
                >
                  取消
                </Button>
                <Button onClick={handleAddLink}>
                  {editingIndex !== null ? '更新' : '添加'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LinksModule