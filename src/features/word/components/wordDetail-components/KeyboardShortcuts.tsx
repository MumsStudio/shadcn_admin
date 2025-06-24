import { Editor } from '@tiptap/react'

export function handleKeyboardShortcuts(editor: Editor, event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        editor?.chain().focus().toggleBold().run()
        return true
      case 'i':
        editor?.chain().focus().toggleItalic().run()
        return true
      case 'u':
        editor?.chain().focus().toggleUnderline().run()
        return true
      case '1':
        editor?.chain().focus().toggleHeading({ level: 1 }).run()
        return true
      case '2':
        editor?.chain().focus().toggleHeading({ level: 2 }).run()
        return true
      case '3':
        editor?.chain().focus().toggleHeading({ level: 3 }).run()
        return true
      case 'l':
        if (event.shiftKey) {
          editor?.chain().focus().setTextAlign('left').run()
        } else {
          editor?.chain().focus().toggleBulletList().run()
        }
        return true
      case 'e':
        if (event.shiftKey) {
          editor?.chain().focus().setTextAlign('center').run()
        } else {
          editor?.chain().focus().toggleCode().run()
        }
        return true
      case 'r':
        if (event.shiftKey) {
          editor?.chain().focus().setTextAlign('right').run()
        }
        return true
      case 'j':
        if (event.shiftKey) {
          editor?.chain().focus().setTextAlign('justify').run()
        }
        return true
    }
  }
  return false
}
