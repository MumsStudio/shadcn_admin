import { useState } from 'react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import * as math from 'mathjs'
import ReactDOM from 'react-dom'
import { BlockMath, InlineMath } from 'react-katex'

interface FormulaNodeData {
  content: string
  fontSize?: number
  color?: string
  id: string
  type: string
  data: any
  position: any
  selected: boolean
}

export default function FormulaNode({
  data,
  selected,
}: NodeProps<FormulaNodeData>) {
  const [content, setContent] = useState<string>(data.content || '')
  const [result, setResult] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)

  const calculateResult = () => {
    try {
      const expr = content.replace(/\\/g, '') // 移除LaTeX转义字符
      const res = math.evaluate(expr)
      setResult(res.toString())
      setIsEditing(false)
    } catch (error) {
      setResult(content)
    }
  }

  return (
    <div
      className={`rounded bg-white p-2 shadow ${
        selected ? 'ring-2 ring-blue-500' : ''
      } ${isEditing ? 'nodrag' : ''}`}
      onDoubleClick={() => setIsEditing(true)}
    >
      <Handle type='source' position={Position.Right} id='right' />
      <Handle type='target' position={Position.Left} id='left' />

      <div className='mt-2 flex justify-between'>
        {result && (
          <div className='flex-1 rounded p-1 text-[16px]'>{result}</div>
        )}
      </div>
      {selected && isEditing && (
        <div>
          <BlockMath math={content} />
          <div className='mb-2 flex flex-wrap gap-1'>
            <button
              className='rounded border px-2 py-1 text-xs hover:bg-gray-100'
              onClick={() => setContent(content + '\\alpha')}
            >
              α
            </button>
            <button
              className='rounded border px-2 py-1 text-xs hover:bg-gray-100'
              onClick={() => setContent(content + '\\beta')}
            >
              β
            </button>
            <button
              className='rounded border px-2 py-1 text-xs hover:bg-gray-100'
              onClick={() => setContent(content + '\\gamma')}
            >
              γ
            </button>
            <button
              className='rounded border px-2 py-1 text-xs hover:bg-gray-100'
              onClick={() => setContent(content + '\\sum')}
            >
              ∑
            </button>
            <button
              className='rounded border px-2 py-1 text-xs hover:bg-gray-100'
              onClick={() => setContent(content + '\\int')}
            >
              ∫
            </button>
          </div>
          <textarea
            className='mt-2 w-full rounded border p-1 text-xs'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={calculateResult}
            placeholder='输入LaTeX公式'
            autoFocus
          />
        </div>
      )}
    </div>
  )
}
