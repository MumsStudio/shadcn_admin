import ReactDOM from 'react-dom/client'
import {
  IconPointer,
  IconRectangleFilled,
  IconCircleFilled,
  IconLetterT,
  IconPencil,
} from '@tabler/icons-react'
import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core'
import * as fabric from 'fabric'

export interface BoardOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    board: {
      setBoard: (options: { width: string; height: string }) => ReturnType
    }
  }
}

export const Board = Node.create<BoardOptions>({
  name: 'board',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'board-container',
      },
    }
  },

  addAttributes() {
    return {
      width: {
        default: '800px',
      },
      height: {
        default: '600px',
      },
      // Add JSON data attribute to store canvas content
      data: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-board]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-board': '',
          style: `width: ${HTMLAttributes.width}; height: ${HTMLAttributes.height};`,
        },
        this.options.HTMLAttributes
      ),
      [
        'canvas',
        {
          class: 'board-preview',
          style:
            'width: 100%; height: 100%; border: 1px solid #ccc; cursor: pointer;',
        },
      ],
    ]
  },

  addCommands() {
    return {
      setBoard:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const container = document.createElement('div')
      container.style.width = node.attrs.width
      container.style.height = node.attrs.height
      container.setAttribute('data-board', '')

      // Create preview canvas
      const previewCanvasEl = document.createElement('canvas')
      previewCanvasEl.className = 'board-preview'
      previewCanvasEl.style.width = '100%'
      previewCanvasEl.style.height = '100%'
      previewCanvasEl.style.border = '1px solid #ccc'
      previewCanvasEl.style.cursor = 'pointer'

      container.appendChild(previewCanvasEl)

      // Initialize preview canvas
      const previewCanvas = new fabric.StaticCanvas(previewCanvasEl, {
        width: parseInt(node.attrs.width),
        height: parseInt(node.attrs.height),
        enableRetinaScaling: true,
      })

      // Load data if exists
      // if (node.attrs.data) {
      //   console.log('node.attrs.data111:', node.attrs.data)
      //   previewCanvas.loadFromJSON(node.attrs.data, () => {
      //     previewCanvas.renderAll()
      //   })
      // }

      // Create fullscreen modal
      const modal = document.createElement('div')
      modal.style.position = 'fixed'
      modal.style.top = '0'
      modal.style.left = '0'
      modal.style.width = '100vw'
      modal.style.height = '100vh'
      modal.style.backgroundColor = 'white'
      modal.style.zIndex = '1000'
      modal.style.display = 'none'
      modal.style.flexDirection = 'column'
      document.body.appendChild(modal)

      // Create header with close button
      const header = document.createElement('div')
      header.style.padding = '10px'
      header.style.backgroundColor = '#f0f0f0'
      header.style.display = 'flex'
      header.style.justifyContent = 'flex-end'

      const closeButton = document.createElement('button')
      closeButton.textContent = 'Close'
      closeButton.addEventListener('click', () => {
        // 确保所有文本对象退出编辑模式
        mainCanvas.getObjects().forEach((obj) => {
          if (obj instanceof fabric.Textbox && obj.isEditing) {
            obj.exitEditing()
          }
        })

        // 强制渲染确保状态最新
        mainCanvas.renderAll()

        // 添加延迟确保状态更新完成
        const json = mainCanvas.toJSON()

        if (getPos && typeof getPos === 'function') {
          console.log('Updated JSON:', json)
          editor.commands.command(({ chain }) => {
            console.log('Updating node with JSON:', json) // Log the JSON before updating the node
            return chain()
              .setNodeSelection(getPos())
              .updateAttributes('board', {
                data: json,
              })
              .run()
          })
        }
        // modal.style.display = 'none'
        // setTimeout(() => {
        previewCanvas.loadFromJSON(json, () => {
          console.log('Loaded JSON:', json)
          console.log('node.attrs.data:', node.attrs.data)
          previewCanvas.renderAll()
          modal.style.display = 'none'
        })
        // }, 1000) // 延迟100ms确保状态更新完成
      })

      header.appendChild(closeButton)
      modal.appendChild(header)

      // Create main content area
      const content = document.createElement('div')
      content.style.display = 'flex'
      content.style.flex = '1'
      content.style.overflow = 'hidden'
      modal.appendChild(content)

      // Create tool panel
      const toolPanel = document.createElement('div')
      toolPanel.className = 'tool-panel'
      toolPanel.style.width = '60px'
      toolPanel.style.background = '#f0f0f0'
      toolPanel.style.padding = '10px'
      toolPanel.style.overflowY = 'auto'

      const tools = [
        { name: <IconPointer size={20} />, tool: 'select' },
        { name: <IconRectangleFilled size={20} />, tool: 'rect' },
        { name: <IconCircleFilled size={20} />, tool: 'circle' },
        { name: <IconLetterT size={20} />, tool: 'text' },
        { name: <IconPencil size={20} />, tool: 'free-draw' },
      ]

      tools.forEach(({ name, tool }) => {
        const button = document.createElement('button')
        button.className = 'tool-btn'
        button.setAttribute('data-tool', tool)
        button.style.marginBottom = '10px'

        // 创建容器并渲染React组件
        const container = document.createElement('div')
        const root = ReactDOM.createRoot(container)
        root.render(name)
        button.appendChild(container)

        toolPanel.appendChild(button)
      })

      content.appendChild(toolPanel)

      // Create main canvas
      const mainCanvasEl = document.createElement('canvas')
      mainCanvasEl.className = 'board-canvas'
      mainCanvasEl.style.flex = '1'
      mainCanvasEl.style.border = '1px solid #ccc'

      content.appendChild(mainCanvasEl)

      // Initialize main Fabric.js canvas
      const mainCanvas = new fabric.Canvas(mainCanvasEl, {
        width: parseInt(node.attrs.width),
        height: parseInt(node.attrs.height),
        enableRetinaScaling: true,
        preserveObjectStacking: true,
      })

      // Load data if exists
      if (node.attrs.data) {
        console.log('node.attrs.data:1111111', node.attrs.data)
        mainCanvas.loadFromJSON(node.attrs.data, () => {
          mainCanvas.renderAll()
        })
      }

      // Setup tools
      const setupTools = () => {
        const toolBtns = toolPanel.querySelectorAll('.tool-btn')

        toolBtns.forEach((btn) => {
          btn.addEventListener('click', () => {
            const tool = btn.getAttribute('data-tool')
            handleToolSelection(tool, mainCanvas)
          })
        })
      }

      const handleToolSelection = (
        tool: string | null,
        canvas: fabric.Canvas
      ) => {
        if (!tool) return

        switch (tool) {
          case 'select':
            canvas.isDrawingMode = false
            canvas.selection = true
            canvas.defaultCursor = 'default'
            canvas.forEachObject((obj: any) => {
              obj.selectable = true
            })
            break

          case 'rect':
            canvas.isDrawingMode = false
            canvas.selection = false
            const rect = new fabric.Rect({
              left: 100,
              top: 100,
              width: 100,
              height: 100,
              fill: '#3f51b5',
              stroke: '#303f9f',
              strokeWidth: 1,
              selectable: true,
            })
            canvas.add(rect)
            canvas.setActiveObject(rect)
            break

          case 'circle':
            canvas.isDrawingMode = false
            canvas.selection = false
            const circle = new fabric.Circle({
              left: 100,
              top: 100,
              radius: 50,
              fill: '#4caf50',
              stroke: '#388e3c',
              strokeWidth: 1,
              selectable: true,
            })
            canvas.add(circle)
            canvas.setActiveObject(circle)
            break

          case 'text':
            canvas.isDrawingMode = false
            canvas.selection = false
            const text = new fabric.Textbox('点击编辑文字', {
              left: 100,
              top: 100,
              width: 150,
              fontSize: 16,
              fill: '#333',
              selectable: true,
            })
            canvas.add(text)
            canvas.setActiveObject(text)
            text.enterEditing()
            break

          case 'free-draw':
            canvas.isDrawingMode = true
            canvas.selection = false
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
            canvas.freeDrawingBrush.color = '#000000'
            canvas.freeDrawingBrush.width = 3
            canvas.defaultCursor = 'crosshair'
            break

          default:
            break
        }
      }

      setupTools()

      // Click preview to open fullscreen editor
      previewCanvasEl.addEventListener('click', () => {
        modal.style.display = 'flex'
        // 重置主画布尺寸
        const width = window.innerWidth - 80
        const height = window.innerHeight - 50
        mainCanvas.setDimensions({ width, height })

        // 确保加载最新数据
        if (node.attrs.data) {
          console.log('node.attrs.data333333', node.attrs.data)
          mainCanvas.loadFromJSON(node.attrs.data, () => {
            mainCanvas.renderAll()
          })
        }
      })

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }
          container.style.width = updatedNode.attrs.width
          container.style.height = updatedNode.attrs.height

          // Update preview canvas dimensions
          previewCanvas.setDimensions({
            width: parseInt(updatedNode.attrs.width),
            height: parseInt(updatedNode.attrs.height),
          })

          // Update preview with new data if changed

          previewCanvas.loadFromJSON(updatedNode.attrs.data, () => {
            console.log('Preview canvas loaded22222,', updatedNode.attrs.data)
            previewCanvas.renderAll()
          })

          return true
        },
        destroy: () => {
          previewCanvas.dispose()
          mainCanvas.dispose()
          document.body.removeChild(modal)
        },
      }
    }
  },
})
