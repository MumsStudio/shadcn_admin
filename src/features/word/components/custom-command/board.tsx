import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  IconPointer,
  IconRectangleFilled,
  IconCircleFilled,
  IconLetterT,
  IconPencil,
  IconRectangle,
  IconCircle,
  IconSquareX,
  IconArrowBack,
  IconArrowForward,
  IconTrash,
  IconTriangleFilled,
  IconLine,
  IconStarFilled,
  IconBold,
  IconItalic,
  IconUnderline,
  IconColorPicker,
  IconPalette,
  IconSquareRoundedXFilled,
  IconCopy,
  IconCut,
  IconClipboard,
  IconTriangle,
  IconStar,
  IconRefresh,
  IconPolygon,
  IconPointFilled,
} from '@tabler/icons-react'
import { mergeAttributes, Node, Command } from '@tiptap/core'
import * as fabric from 'fabric'
import { SketchPicker } from 'react-color'
import { createPortal } from 'react-dom'

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

interface BoardComponentProps {
  node: any
  editor: any
  getPos: () => number
}

const BoardComponent: React.FC<BoardComponentProps> = ({
  node,
  editor,
  getPos,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [activeTool, setActiveTool] = useState('select')
  const [textStyle, setTextStyle] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontFamily: 'Arial',
    fontSize: 16,
    color: '#000000',
  })
  const [fillColor, setFillColor] = useState('transparent')
  const [strokeColor, setStrokeColor] = useState('#303f9f')
  const [brushWidth, setBrushWidth] = useState(3)
  const [cursorSize, setCursorSize] = useState('10px')
  const [showColorPicker, setShowColorPicker] = useState<
    'fill' | 'stroke' | null
  >(null)
  const [clipboard, setClipboard] = useState<fabric.Object[] | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const fabricPreviewCanvasRef = useRef<fabric.StaticCanvas | null>(null)
  const fabricMainCanvasRef = useRef<fabric.Canvas | null>(null)
  const historyRef = useRef<fabric.Object[]>([])
  const historyIndexRef = useRef(-1)

  // Initialize preview canvas
  // Initialize preview canvas
  useEffect(() => {
    if (!previewCanvasRef.current) return

    const canvas = new fabric.StaticCanvas(previewCanvasRef.current, {
      width: parseInt(node.attrs.width),
      height: parseInt(node.attrs.height),
      enableRetinaScaling: true,
    })

    if (node.attrs.data) {
      canvas.loadFromJSON(node.attrs.data, () => {
        // 添加缩放逻辑
        const objects = canvas.getObjects()
        console.log('objects', objects)
          // 计算缩放比例
          const mainWidth = window.innerWidth - 80 // 主画板宽度
          const mainHeight = window.innerHeight - 50 // 主画板高度
          const scaleX = 600 / mainWidth
          const scaleY = 400 / mainHeight
          const scale = Math.min(scaleX, scaleY)
          // 计算缩放后画板的宽度和高度
          // 应用缩放
          canvas.setZoom(scale)

          // 调整视口位置
          canvas.viewportTransform = [scale, 0, 0, scale, 0, 0]
        // }
        setTimeout(() => {
          canvas.renderAll()
        })
      })
    }
    fabricPreviewCanvasRef.current = canvas
    return () => {
      canvas.dispose()
    }
  }, [node.attrs.width, node.attrs.height, node.attrs.data])

  // Initialize main canvas when editor opens
  useEffect(() => {
    if (!isEditorOpen || !mainCanvasRef.current) return

    const canvas = new fabric.Canvas(mainCanvasRef.current, {
      width: window.innerWidth - 80,
      height: window.innerHeight - 50,
      enableRetinaScaling: true,
      preserveObjectStacking: true,
    })

    // Setup event listeners
    canvas.on('object:added', saveHistory)
    canvas.on('object:modified', saveHistory)
    canvas.on('object:removed', saveHistory)
    canvas.on('selection:created', handleSelection)
    canvas.on('selection:updated', handleSelection)
    canvas.on('selection:cleared', handleSelectionCleared)

    if (node.attrs.data) {
      canvas.loadFromJSON(node.attrs.data, () => {
        setTimeout(() => {
          canvas.renderAll()
        }, 0)
      })
    }

    fabricMainCanvasRef.current = canvas
    saveHistory() // Save initial state

    return () => {
      canvas.off('object:added', saveHistory)
      canvas.off('object:modified', saveHistory)
      canvas.off('object:removed', saveHistory)
      canvas.off('selection:created', handleSelection)
      canvas.off('selection:updated', handleSelection)
      canvas.off('selection:cleared', handleSelectionCleared)
      canvas.dispose()
    }
  }, [isEditorOpen])

  // Update preview canvas when data changes
  // useEffect(() => {
  //   if (!node.attrs.data || !fabricPreviewCanvasRef.current) return

  //   fabricPreviewCanvasRef.current.loadFromJSON(node.attrs.data, () => {
  //     setTimeout(() => {
  //       fabricPreviewCanvasRef.current?.renderAll()
  //     }, 0)
  //   })
  // }, [node.attrs.data])

  const handleSelection = (options: any) => {
    if (!fabricMainCanvasRef.current || !options.selected) return

    const selectedObject = options.selected[0]
    if (selectedObject.fill) {
      setFillColor(selectedObject.fill as string)
    }
    if (selectedObject.stroke) {
      setStrokeColor(selectedObject.stroke as string)
    }

    // Update text styles if selected object is text
    if (selectedObject instanceof fabric.Textbox) {
      setTextStyle({
        bold: selectedObject.fontWeight === 'bold',
        italic: selectedObject.fontStyle === 'italic',
        underline: selectedObject.underline || false,
        fontFamily: selectedObject.fontFamily || 'Arial',
        fontSize: selectedObject.fontSize || 16,
        color: (selectedObject.fill as string) || '#000000',
      })
    }
  }
  const MAX_HISTORY_LIMIT = 100
  const handleSelectionCleared = () => {
    // Reset to default colors when selection is cleared
    setFillColor('transparent')
    setStrokeColor('#303f9f')
  }
  const handleBrushWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value)
    setBrushWidth(width)
    if (fabricMainCanvasRef.current?.freeDrawingBrush) {
      fabricMainCanvasRef.current.freeDrawingBrush.width = width

      // 实时更新光标样式以预览大小
      setCursorSize(
        `${Math.max(10, Math.min(50, width))}px` // 确保光标大小在10px到30px之间
      )
      // = Math.max(10, Math.min(30, width * 2))
    }
  }

  const saveHistory = () => {
    if (!fabricMainCanvasRef.current) return

    const canvas = fabricMainCanvasRef.current
    const json = canvas.toJSON()

    // 更准确的比较方式（排除不需要比较的字段）
    const shouldSave =
      historyRef.current.length === 0 ||
      !isCanvasStateEqual(historyRef.current[historyIndexRef.current], json)

    if (shouldSave) {
      // 只保留当前历史指针之前的历史（实现正确的分支截断）
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(
          0,
          historyIndexRef.current + 1
        )
      }

      historyRef.current.push(json)
      historyIndexRef.current = historyRef.current.length - 1

      // 可选：限制历史记录数量
      if (historyRef.current.length > MAX_HISTORY_LIMIT) {
        historyRef.current.shift()
        historyIndexRef.current--
      }
    }
  }

  // 辅助函数：比较两个画布状态是否相同
  const isCanvasStateEqual = (state1: any, state2: any) => {
    // 简单实现：比较关键属性
    return (
      JSON.stringify({
        objects: state1.objects,
        background: state1.background,
      }) ===
      JSON.stringify({
        objects: state2.objects,
        background: state2.background,
      })
    )
  }

  const undo = () => {
    if (!fabricMainCanvasRef.current || historyIndexRef.current <= 0) return

    historyIndexRef.current--
    loadCanvasState(historyRef.current[historyIndexRef.current])
  }

  const redo = () => {
    if (
      !fabricMainCanvasRef.current ||
      historyIndexRef.current >= historyRef.current.length - 1
    )
      return

    historyIndexRef.current++
    loadCanvasState(historyRef.current[historyIndexRef.current])
  }

  // 公共加载函数
  const loadCanvasState = (json: any) => {
    fabricMainCanvasRef.current?.loadFromJSON(json, () => {
      // 使用requestAnimationFrame替代setTimeout 0
      requestAnimationFrame(() => {
        fabricMainCanvasRef.current?.renderAll()
      })
    })
  }

  const clearCanvas = () => {
    setTimeout(() => {
      if (!fabricMainCanvasRef.current) return

      fabricMainCanvasRef.current.clear()
      fabricMainCanvasRef.current.renderAll()
    }, 0)
    saveHistory()
  }

  const deleteSelected = () => {
    if (!fabricMainCanvasRef.current) return

    const canvas = fabricMainCanvasRef.current
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects && activeObjects.length > 0) {
      canvas.remove(...activeObjects)
      canvas.discardActiveObject()
      canvas.renderAll()
      saveHistory()
    }
  }

  const copySelected = () => {
    if (!fabricMainCanvasRef.current) return

    const canvas = fabricMainCanvasRef.current
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects && activeObjects.length > 0) {
      // Clone the objects to avoid reference issues
      const clonedObjects = activeObjects.map((obj) => obj.clone())
      // 由于 clonedObjects 可能是 Promise 数组，需要等待所有 Promise 解析完成
      Promise.all(clonedObjects).then((resolvedObjects) => {
        setClipboard(resolvedObjects)
      })
    }
  }

  const cutSelected = () => {
    if (!fabricMainCanvasRef.current) return

    copySelected()
    deleteSelected()
  }

  const pasteObjects = () => {
    if (!fabricMainCanvasRef.current || !clipboard) return

    const canvas = fabricMainCanvasRef.current
    const offset = 20

    const pastedObjects = clipboard.map((obj) => {
      const cloned = obj.clone()
      obj.set({
        left: (obj.left || 0) + offset,
        top: (obj.top || 0) + offset,
        evented: true,
      })

      if (
        obj instanceof fabric.ActiveSelection ||
        obj instanceof fabric.Group
      ) {
        obj.forEachObject((pastedObj: fabric.Object) => {
          canvas.add(pastedObj)
        })
        obj.setCoords()
      } else {
        canvas.add(obj)
      }
      return obj
    })

    // Select the pasted objects
    if (pastedObjects.length > 1) {
      const selection = new fabric.ActiveSelection(pastedObjects, {
        canvas: canvas,
      })
      canvas.setActiveObject(selection)
    } else if (pastedObjects.length === 1) {
      canvas.setActiveObject(pastedObjects[0])
    }
    setTimeout(() => {
      canvas.renderAll()
    }, 0)
    // canvas.renderAll()
    saveHistory()
  }

  const handleToolSelect = (tool: string) => {
    if (!fabricMainCanvasRef.current) return

    setActiveTool(tool)
    const canvas = fabricMainCanvasRef.current

    // Exit text editing mode if switching tools
    canvas.getActiveObjects().forEach((obj) => {
      if (obj instanceof fabric.Textbox && obj.isEditing) {
        obj.exitEditing()
      }
    })

    switch (tool) {
      case 'select':
        canvas.isDrawingMode = false
        canvas.selection = true
        canvas.defaultCursor = 'default'
        canvas.forEachObject((obj) => {
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
          fill: fillColor,
          stroke: strokeColor,
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
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: 1,
          selectable: true,
        })
        canvas.add(circle)
        canvas.setActiveObject(circle)
        break

      case 'triangle':
        canvas.isDrawingMode = false
        canvas.selection = false
        const triangle = new fabric.Triangle({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: 1,
          selectable: true,
        })
        canvas.add(triangle)
        canvas.setActiveObject(triangle)
        break

      case 'line':
        canvas.isDrawingMode = false
        canvas.selection = false
        const line = new fabric.Line([50, 50, 200, 50], {
          stroke: strokeColor,
          strokeWidth: 2,
          selectable: true,
        })
        canvas.add(line)
        canvas.setActiveObject(line)
        break

      case 'star':
        canvas.isDrawingMode = false
        canvas.selection = false
        const star = new fabric.Path(
          'M 100 10 L 123 85 L 200 85 L 138 130 L 160 205 L 100 160 L 40 205 L 62 130 L 0 85 L 77 85 Z',
          {
            left: 100,
            top: 100,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: 1,
            selectable: true,
          }
        )
        canvas.add(star)
        canvas.setActiveObject(star)
        break

      case 'text':
        canvas.isDrawingMode = false
        canvas.selection = false
        const text = new fabric.Textbox('点击编辑文字', {
          left: 100,
          top: 100,
          width: 150,
          fontSize: textStyle.fontSize,
          fontFamily: textStyle.fontFamily,
          fill: textStyle.color,
          fontWeight: textStyle.bold ? 'bold' : 'normal',
          fontStyle: textStyle.italic ? 'italic' : 'normal',
          underline: textStyle.underline,
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
        canvas.freeDrawingBrush.color = strokeColor
        canvas.freeDrawingBrush.width = brushWidth
        canvas.defaultCursor = 'crosshair'
        break

      case 'polygon':
        canvas.isDrawingMode = false
        canvas.selection = false
        const polygon = new fabric.Polygon(
          [
            { x: 100, y: 0 },
            { x: 200, y: 50 },
            { x: 200, y: 150 },
            { x: 100, y: 200 },
            { x: 0, y: 150 },
            { x: 0, y: 50 },
          ],
          {
            left: 100,
            top: 100,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: 1,
            selectable: true,
          }
        )
        canvas.add(polygon)
        canvas.setActiveObject(polygon)
        break

      default:
        break
    }
  }

  const updateTextStyle = (property: string, value: any) => {
    if (!fabricMainCanvasRef.current) return

    const newStyle = { ...textStyle, [property]: value }
    setTextStyle(newStyle)

    const canvas = fabricMainCanvasRef.current
    const activeObject = canvas.getActiveObject()

    if (activeObject instanceof fabric.Textbox) {
      if (property === 'bold') {
        activeObject.set('fontWeight', value ? 'bold' : 'normal')
      } else if (property === 'italic') {
        activeObject.set('fontStyle', value ? 'italic' : 'normal')
      } else if (property === 'underline') {
        activeObject.set('underline', value)
      } else {
        activeObject.set(property, value)
      }

      if (activeObject.isEditing) {
        activeObject.exitEditing()
        activeObject.enterEditing()
      }

      canvas.renderAll()
    }
  }

  const updateActiveObjectColors = (type: 'fill' | 'stroke', color: string) => {
    if (!fabricMainCanvasRef.current) return

    const canvas = fabricMainCanvasRef.current
    const activeObjects = canvas.getActiveObjects()

    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        if (type === 'fill') {
          setFillColor(color)
          obj.set('fill', color)
        } else {
          setStrokeColor(color)
          obj.set('stroke', color)
        }
      })
      canvas.renderAll()
    }
  }

  const handleCloseEditor = () => {
    if (!fabricMainCanvasRef.current) return

    // Exit text editing mode
    fabricMainCanvasRef.current.getObjects().forEach((obj) => {
      if (obj instanceof fabric.Textbox && obj.isEditing) {
        obj.exitEditing()
      }
    })

    fabricMainCanvasRef.current.renderAll()

    const json = fabricMainCanvasRef.current.toJSON()
    editor.commands.command(({ chain }: { chain: () => Command }) => {
      return chain()
        .setNodeSelection(getPos())
        .updateAttributes('board', {
          data: json,
        })
        .run()
    })

    setIsEditorOpen(false)
  }

  const tools = [
    { id: 'select', icon: <IconPointer size={20} />, label: 'Select' },
    { id: 'rect', icon: <IconRectangle size={20} />, label: 'Rectangle' },
    { id: 'circle', icon: <IconCircle size={20} />, label: 'Circle' },
    {
      id: 'triangle',
      icon: <IconTriangle size={20} />,
      label: 'Triangle',
    },
    { id: 'polygon', icon: <IconPolygon size={20} />, label: 'Polygon' },
    { id: 'line', icon: <IconLine size={20} />, label: 'Line' },
    { id: 'star', icon: <IconStar size={20} />, label: 'Star' },
    { id: 'text', icon: <IconLetterT size={20} />, label: 'Text' },
    { id: 'free-draw', icon: <IconPencil size={20} />, label: 'Free Draw' },
  ]

  const actionButtons = [
    {
      id: 'undo',
      icon: <IconArrowBack size={20} />,
      label: 'Undo',
      action: undo,
      disabled: historyIndexRef.current <= 0,
    },
    {
      id: 'redo',
      icon: <IconArrowForward size={20} />,
      label: 'Redo',
      action: redo,
      disabled: historyIndexRef.current >= historyRef.current.length - 1,
    },
    {
      id: 'clear',
      icon: <IconRefresh size={20} />,
      label: 'Clear',
      action: clearCanvas,
    },
    {
      id: 'copy',
      icon: <IconCopy size={20} />,
      label: 'Copy',
      action: copySelected,
    },
    {
      id: 'cut',
      icon: <IconCut size={20} />,
      label: 'Cut',
      action: cutSelected,
    },
    {
      id: 'paste',
      icon: <IconClipboard size={20} />,
      label: 'Paste',
      action: pasteObjects,
    },
    {
      id: 'delete',
      icon: <IconTrash size={20} />,
      label: 'Delete',
      action: deleteSelected,
    },
  ]

  return (
    <>
      <div
        className='board-container'
        style={{ width: node.attrs.width, height: node.attrs.height }}
      >
        <canvas
          ref={previewCanvasRef}
          className='board-preview'
          style={{
            width: '100%',
            height: '100%',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
          onClick={() => setIsEditorOpen(true)}
        />
      </div>

      {isEditorOpen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'white',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '10px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                {actionButtons.map((button) => (
                  <button
                    key={button.id}
                    onClick={button.action}
                    title={button.label}
                    style={{
                      padding: '5px',
                      opacity: button.disabled ? 0.5 : 1,
                      cursor: button.disabled ? 'not-allowed' : 'pointer',
                    }}
                    disabled={
                      button.disabled || (button.id === 'paste' && !clipboard)
                    }
                  >
                    {button.icon}
                  </button>
                ))}
              </div>
              <button onClick={handleCloseEditor} style={{ padding: '5px' }}>
                <IconSquareX size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  width: '60px',
                  background: '#f0f0f0',
                  padding: '10px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className={activeTool === tool.id ? 'active' : ''}
                    title={tool.label}
                    style={{
                      padding: '5px',
                      display: 'flex',
                      justifyContent: 'center',
                      backgroundColor:
                        activeTool === tool.id ? '#ddd' : 'transparent',
                    }}
                  >
                    {tool.icon}
                  </button>
                ))}

                <div
                  style={{
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <button
                    onClick={() => setShowColorPicker('fill')}
                    style={{
                      padding: '5px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    title='Fill Color'
                  >
                    <IconPalette size={16} />
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: fillColor,
                        border: '1px solid #000',
                      }}
                    />
                  </button>

                  <button
                    onClick={() => setShowColorPicker('stroke')}
                    style={{
                      padding: '5px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    title='Stroke Color'
                  >
                    <IconColorPicker size={16} />
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: strokeColor,
                        border: '1px solid #000',
                      }}
                    />
                  </button>
                </div>

                {showColorPicker && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '70px',
                      top: '50px',
                      zIndex: 1001,
                    }}
                  >
                    <SketchPicker
                      color={
                        showColorPicker === 'fill' ? fillColor : strokeColor
                      }
                      onChangeComplete={(color) => {
                        const hexColor = color.hex
                        if (showColorPicker === 'fill') {
                          setFillColor(hexColor)
                        } else {
                          setStrokeColor(hexColor)
                        }
                        updateActiveObjectColors(showColorPicker, hexColor)
                      }}
                    />
                    <button
                      onClick={() => setShowColorPicker(null)}
                      style={{ marginTop: '5px', padding: '5px 10px' }}
                    >
                      <IconSquareRoundedXFilled />
                    </button>
                  </div>
                )}
                {activeTool === 'free-draw' && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100px',
                      left: '10px',
                      backgroundColor: 'white',
                      padding: '10px',
                      borderRadius: '4px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      zIndex: 1001,
                    }}
                  >
                    <div style={{ marginBottom: '5px' }}>
                      <IconPointFilled size={cursorSize} /> {brushWidth}px
                    </div>
                    <input
                      type='range'
                      min='1'
                      max='50'
                      value={brushWidth}
                      onChange={handleBrushWidthChange}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
                {activeTool === 'text' && (
                  <div
                    style={{
                      marginTop: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <button
                      onClick={() => updateTextStyle('bold', !textStyle.bold)}
                      style={{
                        padding: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: textStyle.bold
                          ? '#ddd'
                          : 'transparent',
                      }}
                      title='Bold'
                    >
                      <IconBold size={16} />
                    </button>

                    <button
                      onClick={() =>
                        updateTextStyle('italic', !textStyle.italic)
                      }
                      style={{
                        padding: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: textStyle.italic
                          ? '#ddd'
                          : 'transparent',
                      }}
                      title='Italic'
                    >
                      <IconItalic size={16} />
                    </button>

                    <button
                      onClick={() =>
                        updateTextStyle('underline', !textStyle.underline)
                      }
                      style={{
                        padding: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: textStyle.underline
                          ? '#ddd'
                          : 'transparent',
                      }}
                      title='Underline'
                    >
                      <IconUnderline size={16} />
                    </button>

                    <select
                      value={textStyle.fontFamily}
                      onChange={(e) =>
                        updateTextStyle('fontFamily', e.target.value)
                      }
                      style={{ padding: '5px', fontSize: '12px' }}
                    >
                      <option value='Arial'>Arial</option>
                      <option value='Times New Roman'>Times New Roman</option>
                      <option value='Courier New'>Courier New</option>
                      <option value='Georgia'>Georgia</option>
                      <option value='Verdana'>Verdana</option>
                    </select>

                    <select
                      value={textStyle.fontSize}
                      onChange={(e) =>
                        updateTextStyle('fontSize', parseInt(e.target.value))
                      }
                      style={{ padding: '5px', fontSize: '12px' }}
                    >
                      {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map(
                        (size) => (
                          <option key={size} value={size}>
                            {size}px
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}
              </div>

              <canvas
                ref={mainCanvasRef}
                style={{ flex: 1, border: '1px solid #ccc' }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  )
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
        default: '600px',
      },
      height: {
        default: '400px',
      },
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
    return ({ node, getPos, editor }) => {
      const container = document.createElement('div')
      const root = ReactDOM.createRoot(container)

      root.render(
        <BoardComponent node={node} editor={editor} getPos={getPos} />
      )

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }

          root.render(
            <BoardComponent
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
