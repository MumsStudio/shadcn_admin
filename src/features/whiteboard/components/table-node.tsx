import { useState } from 'react'
import { NodeProps, Handle, Position } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type TableNodeData = {
  id: string
  type: string
  data: any
  position: any
  rows: number
  cols: number
  borderColor?: string
  cellPadding?: number
  cellSpacing?: number
}

const TableNode = ({ data, id, selected }: NodeProps<TableNodeData>) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [rows, setRows] = useState(data.rows || 3)
  const [cols, setCols] = useState(data.cols || 3)

  const handleSaveConfig = () => {
    if (rows > 0 && cols > 0) {
      data.rows = rows
      data.cols = cols
      setShowConfigDialog(false)
    }
  }

  return (
    <div className='relative'>
      <Handle type='source' position={Position.Right} id='right' />
      <Handle type='target' position={Position.Left} id='left' />

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='absolute -top-8 right-0'
            onClick={() => setShowConfigDialog(true)}
          >
            配置表格
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>表格配置</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <label htmlFor='rows' className='text-right'>
                行数
              </label>
              <Input
                id='rows'
                type='number'
                min='1'
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <label htmlFor='cols' className='text-right'>
                列数
              </label>
              <Input
                id='cols'
                type='number'
                min='1'
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                className='col-span-3'
              />
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => setShowConfigDialog(false)}
            >
              取消
            </Button>
            <Button onClick={handleSaveConfig}>保存</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={`${selected ? 'ring-2 ring-blue-500' : ''}`}
        onDoubleClick={() => setIsEditing(true)}
      >
        <table
          style={{
            border: data.borderColor
              ? `1px solid ${data.borderColor}`
              : '1px solid #ddd',
            borderCollapse: 'collapse',
            padding: data.cellPadding || 8,
            margin: data.cellSpacing || 0,
          }}
        >
          {Array.from({ length: data.rows || 3 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: data.cols || 3 }).map((_, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    border: data.borderColor
                      ? `1px solid ${data.borderColor}`
                      : '1px solid #ddd',
                    padding: data.cellPadding || 8,
                  }}
                >
                  {isEditing ? (
                    <input type='text' className='w-full' />
                  ) : (
                    <span>
                      单元格 {rowIndex + 1}-{colIndex + 1}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </table>
      </div>
    </div>
  )
}

export default TableNode
