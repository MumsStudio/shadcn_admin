import { useState, useEffect, useMemo } from 'react'
import { Editor, useEditor } from '@tiptap/react'
import * as Y from 'yjs'
import { getOrCreateProvider, releaseProvider } from '../components/provider-manager'
import { extensions } from '../utils/editorExtensions'

export const useEditorSetup = (id: string, email: string, onSave: (content: string) => void) => {
  const [content, setContent] = useState('')
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)

  const provider = useMemo(() => {
    return getOrCreateProvider(id, email)
  }, [id, email])

  const editor = useEditor({
    extensions: extensions(provider, email),
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setContent(html)
      onSave(html)
    },
    editorProps: {
      attributes: {
        class: 'markdown prose max-w-none focus:outline-none',
      },
    },
  })

  // 清理效果
  useEffect(() => {
    return () => {
      releaseProvider(id)
    }
  }, [id])

  // 标题效果
  useEffect(() => {
    if (!editor) return

    const updateHeadings = () => {
      const nodes = editor.state.doc.content.content
      const newHeadings: Array<{ id: string; text: string; level: number }> = []

      nodes.forEach((item: any, index: number) => {
        if (item.type.name === 'heading') {
          const id = `heading-${item.attrs.level}-${index}`
          newHeadings.push({
            id,
            text: item.textContent,
            level: item.attrs.level
          })
        }
      })

      setHeadings(newHeadings)
    }

    updateHeadings()
    editor.on('transaction', updateHeadings)

    return () => {
      editor.off('transaction', updateHeadings)
    }
  }, [editor])

  return {
    editor,
    provider,
    content,
    setContent,
    headings,
    activeHeadingId,
    setActiveHeadingId
  }
}