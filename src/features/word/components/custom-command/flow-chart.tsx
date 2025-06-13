import ReactDOM from 'react-dom/client'
import { Shape } from '@antv/x6'
import { Node, mergeAttributes } from '@tiptap/core'
import { FlowchartComponent } from '../flow-components/FlowchartComponent'

export interface FlowchartOptions {
  HTMLAttributes: Record<string, any>
  graphConfig?: Partial<any>
  stencilConfig?: Partial<any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    flowchart: {
      insertFlowchart: (options?: {
        width?: string
        height?: string
      }) => ReturnType
    }
  }
}

export const Flowchart = Node.create<FlowchartOptions>({
  name: 'flowchart',
  group: 'block',
  atom: true,
  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'flowchart-container',
      },
      graphConfig: {
        grid: true,
        background: {
          color: '#f5f5f5',
        },
        mousewheel: {
          enabled: true,
          zoomAtMousePosition: true,
          modifiers: 'ctrl',
          minScale: 0.5,
          maxScale: 3,
        },
        connecting: {
          router: 'manhattan',
          connector: {
            name: 'rounded',
            args: {
              radius: 8,
            },
          },
          anchor: 'center',
          connectionPoint: 'anchor',
          allowBlank: false,
          snap: {
            radius: 20,
          },
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  stroke: '#A2B1C3',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'block',
                    width: 12,
                    height: 8,
                  },
                },
              },
              zIndex: 0,
            })
          },
          validateConnection({ targetMagnet }: any) {
            return !!targetMagnet
          },
        },
        highlighting: {
          magnetAdsorbed: {
            name: 'stroke',
            args: {
              attrs: {
                fill: '#5F95FF',
                stroke: '#5F95FF',
              },
            },
          },
        },
      },
      stencilConfig: {
        title: '流程图',
        stencilGraphWidth: 200,
        stencilGraphHeight: 180,
        collapsable: true,
        groups: [
          {
            title: '基础流程图',
            name: 'group1',
          },
          {
            title: '系统设计图',
            name: 'group2',
            graphHeight: 250,
            layoutOptions: {
              rowHeight: 70,
            },
          },
        ],
        layoutOptions: {
          columns: 2,
          columnWidth: 80,
          rowHeight: 55,
        },
      },
    }
  },

  addAttributes() {
    return {
      width: {
        default: '100%',
      },
      height: {
        default: '600px',
      },
      data: {
        default: null,
      },
      showStencil: {
        default: true,
      },
      stencilWidth: {
        default: '180px',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-flowchart]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          class: 'flowchart-container',
          'data-flowchart': '',
          style: `width: ${HTMLAttributes.width}; height: ${HTMLAttributes.height};`,
        },
        this.options.HTMLAttributes
      ),
    ]
  },

  addCommands() {
    return {
      insertFlowchart:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              width: options.width || '100%',
              height: options.height || '600px',
              showStencil: true,
              stencilWidth: '180px',
            },
          })
        },
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement('div')
      const root = ReactDOM.createRoot(container)

      root.render(
        <FlowchartComponent node={node} editor={editor} getPos={getPos} />
      )

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }

          root.render(
            <FlowchartComponent
              node={updatedNode}
              editor={editor}
              getPos={getPos}
            />
          )
          return true
        },
        destroy: () => {
          root.unmount()
        },
      }
    }
  },
})
