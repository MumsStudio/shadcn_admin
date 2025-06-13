import { mergeAttributes, Extension, CommandProps } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      /**
       * 增加缩进
       */
      indent: () => ReturnType
      /**
       * 减少缩进
       */
      outdent: () => ReturnType
    }
  }
}

export const Indent = Extension.create({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'listItem'],
      minLevel: 0,
      maxLevel: 8,
      HTMLAttributes: {},
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) =>
              parseInt(element.getAttribute('data-indent') || '0'),
            renderHTML: (attributes) => {
              if (!attributes.indent || attributes.indent === 0) {
                return {}
              }

              return { 'data-indent': attributes.indent }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ chain, state, dispatch }) => {
          const { selection } = state
          const { $from, $to } = selection
          const nodeType = state.schema.nodes[this.name]

          return chain()
            .command(() => {
              let tr = state.tr
              const currentIndent = $from.node($from.depth).attrs.indent || 0
              const newIndent = Math.min(
                currentIndent + 1,
                this.options.maxLevel
              )

              if (newIndent > currentIndent) {
                tr.setNodeMarkup($from.pos, undefined, {
                  ...$from.node($from.depth).attrs,
                  indent: newIndent,
                })

                if (dispatch) {
                  dispatch(tr)
                }
              }

              return true
            })
            .run()
        },

      outdent:
        () =>
        ({ chain, state, dispatch }) => {
          const { selection } = state
          const { $from, $to } = selection
          const nodeType = state.schema.nodes[this.name]

          return chain()
            .command(() => {
              let tr = state.tr
              const currentIndent = $from.node($from.depth).attrs.indent || 0
              const newIndent = Math.max(
                currentIndent - 1,
                this.options.minLevel
              )

              if (newIndent < currentIndent) {
                tr.setNodeMarkup($from.pos, undefined, {
                  ...$from.node($from.depth).attrs,
                  indent: newIndent,
                })

                if (dispatch) {
                  dispatch(tr)
                }
              }

              return true
            })
            .run()
        },
    }
  },
})
