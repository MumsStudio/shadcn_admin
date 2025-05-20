'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Folder } from 'lucide-react'
import { showSubmittedData, showSuccessData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tree } from '@/components/ui/tree'
import { SelectDropdown } from '@/components/select-dropdown'
import { documentTypes } from '../data/data'
import Request from '../request'

const formSchema = z
  .object({
    name: z.string().min(1, { message: '文档名称不能为空' }),
    type: z.string(),
    parentId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    console.log('data', data)
    if (data.parentId === '-1') {
      data.type = 'folder'
    } else if (!data.type || typeof data.type !== 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['type'],
        message: '请选择文档类型',
      })
    }
  })

type DocumentForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  onClose?: () => void
  parentId?: string
  documents: any[]
}

export function DocumentActionDialog({
  open,
  onOpenChange,
  onSuccess = () => {},
  onClose = () => {},
  parentId = '',
  documents,
}: Props) {
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<{
    id: string
    name: string
  } | null>(null)
  const [parentName, setParentName] = useState('')
  const findDocument = (docs: any[], id: string): any | undefined => {
    for (const doc of docs) {
      if (doc.id === id) return doc
      if (doc.children) {
        const found = findDocument(doc.children, id)
        if (found) return found
      }
    }
  }
  useEffect(() => {
    console.log('parentId', parentId)
    if (parentId === '-1') {
      setParentName('根目录')
    } else if (parentId) {
      const folder = findDocument(documents, parentId)
      setParentName(folder?.name || '')
    } else {
      setParentName('')
    }
  }, [parentId, documents])
  useEffect(() => {
    if (open) {
      // 只在对话框打开时更新
      form.setValue('parentId', parentId)
      form.setValue('type', parentId === '-1' ? 'folder' : '')
    }
  }, [parentId, open])
  const form = useForm<DocumentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: parentId === '-1' ? 'folder' : '',
      parentId: parentId,
    },
  })
  const onSubmit = (values: DocumentForm) => {
    console.log('values', values)
    // return
    Request._AddDocument(values).then((res: any) => {
      if (res) {
        showSuccessData('创建成功')
        onSuccess()
      }
      form.reset()
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
        if (!state && parentId === '-1') {
          onClose()
        }
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>新建文档</DialogTitle>
          <DialogDescription>创建新文档，完成后点击保存。</DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='document-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      文档名称
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入文档名称'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      文档类型
                    </FormLabel>
                    {parentId === '-1' ? (
                      <div className='col-span-4 flex items-center gap-2'>
                        <Folder size={16} />
                        <span className='text-sm'>文件夹</span>
                        <input type='hidden' {...field} value='folder' />
                      </div>
                    ) : (
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='选择文档类型'
                        className='col-span-4'
                        items={documentTypes.map(({ label, value }) => ({
                          label,
                          value,
                        }))}
                      />
                    )}
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='parentId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      文件位置
                    </FormLabel>
                    <div className='col-span-4 flex items-center gap-2'>
                      {parentId === '-1' ? (
                        <span className='text-muted-foreground text-sm'>
                          当前文件夹: 根目录
                        </span>
                      ) : (
                        <>
                          {parentName && (
                            <span className='text-muted-foreground text-sm'>
                              当前文件夹: {parentName}
                            </span>
                          )}
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => setIsFolderDialogOpen(true)}
                          >
                            选择文件夹
                          </Button>
                        </>
                      )}
                    </div>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='document-form'>
            保存
          </Button>
        </DialogFooter>
        <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>选择文件夹</DialogTitle>
            </DialogHeader>
            <div className='h-[300px] overflow-y-auto'>
              <Tree
                data={documents}
                onSelect={(id) => {
                  const folder = findDocument(documents, id)
                  if (folder && folder.type === 'folder') {
                    setSelectedFolder({ id: folder.id, name: folder.name })
                    setParentName(folder.name)
                    form.setValue('parentId', folder.id)
                    setIsFolderDialogOpen(false)
                  }
                }}
                renderItem={(item) =>
                  item.type === 'folder' && (
                    <div className='flex items-center gap-2'>
                      <Folder size={16} />
                      <span>{item.name}</span>
                    </div>
                  )
                }
              />
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
