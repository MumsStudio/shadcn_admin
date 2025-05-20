import { mergeAttributes, Node } from '@tiptap/core'

export interface VideoOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType
    }
  }
}

export const Video = Node.create<VideoOptions>({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'resizable-video-container',
      },
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '500px',
      },
      height: {
        default: 'auto',
      },
      aspectRatio: {
        default: '16/9',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-video': '',
          'data-width': HTMLAttributes.width,
          'data-aspect-ratio': HTMLAttributes.aspectRatio,
          style: `width: ${HTMLAttributes.width}; aspect-ratio: ${HTMLAttributes.aspectRatio};`,
        },
        this.options.HTMLAttributes
      ),
      [
        'video',
        {
          src: HTMLAttributes.src,
          controls: true,
          style: 'width: 100%; height: 100%; object-fit: contain;',
        },
      ],
      ['div', { class: 'resize-handle' }],
    ]
  },

  addCommands() {
    return {
      setVideo:
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
