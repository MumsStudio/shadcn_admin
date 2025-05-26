import { CommandProps, mergeAttributes, Node } from '@tiptap/core'

export interface LinkOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    link: {
      setLink: (options: { href: string; text?: string }) => ReturnType
    }
  }
}

export const Link = Node.create<LinkOptions>({
  name: 'link',
  group: 'inline',
  inline: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      href: {
        default: null,
      },
      text: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'a[href]',
        getAttrs: (dom) => ({
          href: dom.getAttribute('href'),
          text: dom.textContent,
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, {
        href: HTMLAttributes.href,
        target: '_blank',
        rel: 'noopener noreferrer',
        contenteditable: 'false',
        draggable: 'true',
      }),
      HTMLAttributes.text || HTMLAttributes.href,
    ]
  },

  addCommands() {
    return {
      setLink:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
