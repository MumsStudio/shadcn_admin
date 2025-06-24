import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IconPlus, IconCircleDashedCheck } from '@tabler/icons-react'


interface NewListFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newListTitle: string
  setNewListTitle: (title: string) => void
  editList: any
  teamMember: any[]
  selectedMember: any[]
  setSelectedMember: (members: any[]) => void
  ListOwner: any
  setListOwner: (owner: any) => void
  isTransferring: boolean
  setIsTransferring: (transferring: boolean) => void
  showSelect: boolean
  setShowSelect: (show: boolean) => void
  toggleInput: () => void
  handleSelectChange: (value: any) => void
  handleRemoveUser: (email: string) => void
  onCreateList: () => void
  onUpdateList: () => void
}

export const NewListForm = ({
  open,
  onOpenChange,
  newListTitle,
  setNewListTitle,
  editList,
  teamMember,
  selectedMember,
  setSelectedMember,
  ListOwner,
  setListOwner,
  isTransferring,
  setIsTransferring,
  showSelect,
  setShowSelect,
  toggleInput,
  handleSelectChange,
  handleRemoveUser,
  onCreateList,
  onUpdateList,
}: NewListFormProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {Object.keys(editList).length ? '编辑清单' : '新建清单'}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <Label htmlFor='title'>清单标题</Label>
          <Input
            placeholder='清单标题'
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
          />
          <Label htmlFor='title'>负责人</Label>
          {Object.keys(editList).length &&
          editList.owner === ListOwner &&
          isTransferring ? (
            <div className='flex items-center gap-2'>
              <Select
                value={ListOwner}
                onValueChange={(value) => setListOwner(value)}
                disabled={!isTransferring}
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue placeholder='选择负责人' />
                </SelectTrigger>
                <SelectContent>
                  {teamMember.map((user: any) => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.username || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                onClick={() => setIsTransferring(!isTransferring)}
              >
                {isTransferring ? '取消移交' : '移交负责人'}
              </Button>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Input placeholder='负责人' value={ListOwner} disabled={true} />
              <Button
                variant='outline'
                disabled={ListOwner !== ListOwner}
                onClick={() => setIsTransferring(!isTransferring)}
              >
                {isTransferring ? '取消移交' : '移交负责人'}
              </Button>
            </div>
          )}
          <Label htmlFor='title'>协作者</Label>
          <div className='module-content flex flex-col'>
            {teamMember && teamMember.length > 0 ? (
              <div className='member-list flex flex-wrap items-center gap-2'>
                {selectedMember.map((user) => (
                  <div key={user.email} className='relative'>
                    <Avatar className='z-1 size-10'>
                      <AvatarImage src={''} alt={user.username || user.email} />
                      <AvatarFallback className='bg-[#2CB0C8]'>
                        {user.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => handleRemoveUser(user.email)}
                      className='absolute -top-1 -right-1 z-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={toggleInput}
                  className='add-member-btn border border-gray-300'
                >
                  <IconPlus size={30} className='text-gray-300' />
                </button>
              </div>
            ) : (
              <div className='text-center text-gray-600'>
                该小组暂无其他成员，请先添加至小组
              </div>
            )}

            {showSelect && (
              <div className='mt-2 flex items-center gap-2'>
                <Select onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='选择成员' />
                  </SelectTrigger>
                  <SelectContent className='z-100000'>
                    {teamMember.map((user: any) => (
                      <SelectItem
                        key={user.id}
                        value={user.email}
                        disabled={selectedMember.some(
                          (u) => u.email === user.email
                        )}
                        className={
                          selectedMember.some((u) => u.email === user.email)
                            ? 'notselected'
                            : ''
                        }
                      >
                        {user.username || user.email}
                        {selectedMember.some((u) => u.email === user.email) ? (
                          <IconCircleDashedCheck className='text-green-500' />
                        ) : (
                          <></>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              onClick={
                Object.keys(editList).length ? onUpdateList : onCreateList
              }
            >
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
