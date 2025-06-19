import { createContext, useContext, useRef } from 'react'
import { Editor } from '@tiptap/react'
import * as Y from 'yjs'

interface EditorContextType {
  editor: Editor | null
  provider: any
  content: string
  setContent: (content: string) => void
  headings: Array<{ id: string; text: string; level: number }>
  activeHeadingId: string | null
  docTitle: string
  setDocTitle: (title: string) => void
  isStarred: boolean
  setIsStarred: (starred: boolean) => void
  lastSaved: string
  showHistoryPanel: boolean
  setShowHistoryPanel: (show: boolean) => void
  email: string
  comments: any[]
  setComments: (comments: any[]) => void
  commentsideBarOpen: boolean
  setCommentsideBarOpen: (open: boolean) => void
  activeCommentId: string | null
  setActiveCommentId: (id: string | null) => void
  commentsSectionRef: React.RefObject<HTMLDivElement>
}

export const EditorContext = createContext<EditorContextType>({
  editor: null,
  provider: null,
  content: '',
  setContent: () => {},
  headings: [],
  activeHeadingId: null,
  docTitle: '',
  setDocTitle: () => {},
  isStarred: false,
  setIsStarred: () => {},
  lastSaved: '',
  showHistoryPanel: false,
  setShowHistoryPanel: () => {},
  email: '',
  comments: [],
  setComments: () => {},
  commentsideBarOpen: false,
  setCommentsideBarOpen: () => {},
  activeCommentId: null,
  setActiveCommentId: () => {},
  commentsSectionRef: null,
})

export const EditorProvider = EditorContext.Provider

export const useEditorContext = () => {
  const commentsSectionRef = useRef<HTMLDivElement>(null)
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider')
  }
  return { ...context, commentsSectionRef }
  return context
}
