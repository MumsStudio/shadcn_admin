import { useState } from 'react'
import { NodeProps, Handle, Position } from '@xyflow/react'

const StickyNode = ({ data, selected }: NodeProps<any>) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(data.title || '')
  const [content, setContent] = useState(data.content || '')

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    data.title = title
    data.content = content
  }

  return (
    <div
      className={`p-4 shadow-md ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundColor: data.color || '#fef08a',
        width: data.width || 200,
        minHeight: data.height || 150,
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type='source' position={Position.Right} id='right' />
      <Handle type='target' position={Position.Left} id='left' />
      {isEditing ? (
        <>
          <input
            className='mb-2 w-full rounded border p-1 font-bold'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            autoFocus
          />
          <textarea
            className='w-full rounded border p-1'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
          />
        </>
      ) : (
        <>
          <div className='mb-2 font-bold'>{title || '便签'}</div>
          <div>{content || '双击编辑内容'}</div>
        </>
      )}
    </div>
  )
}

export default StickyNode
