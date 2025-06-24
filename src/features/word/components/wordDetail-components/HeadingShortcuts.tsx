import { Editor } from '@tiptap/react'

export function handleHeadingShortcuts(editor: Editor, event: KeyboardEvent) {
  if (event.key === '#' && event.code.startsWith('Digit')) {
    const num = parseInt(event.code.replace('Digit', ''))
    if (num >= 1 && num <= 6) {
      const { state } = editor.view
      const { from } = state.selection

      if (state.doc.textBetween(from - 1, from) === ' ') {
        const tr = state.tr.replaceSelectionWith(
          editor.schema.nodes.heading.create(
            { level: num },
            editor.schema.text(' ')
          )
        )
        editor.view.dispatch(tr)
        editor.commands.focus()
        return true
      }
    }
  }
  return false
}
