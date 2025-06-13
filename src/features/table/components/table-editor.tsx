import React, { useEffect, useRef, useState } from 'react'
import { IconDeviceFloppy, IconHistory } from '@tabler/icons-react'
import { Route } from '@/routes/table/detail.$id'
import { ICommandService } from '@univerjs/core'
import DrawingUIZhCN from '@univerjs/drawing-ui/locale/zh-CN'
import {
  createUniver,
  defaultTheme,
  LocaleType,
  merge,
} from '@univerjs/presets'
import '@univerjs/presets/lib/styles/preset-sheets-conditional-formatting.css'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'
import '@univerjs/presets/lib/styles/preset-sheets-data-validation.css'
import '@univerjs/presets/lib/styles/preset-sheets-drawing.css'
import '@univerjs/presets/lib/styles/preset-sheets-filter.css'
import '@univerjs/presets/lib/styles/preset-sheets-find-replace.css'
import '@univerjs/presets/lib/styles/preset-sheets-hyper-link.css'
import '@univerjs/presets/lib/styles/preset-sheets-sort.css'
import '@univerjs/presets/lib/styles/preset-sheets-table.css'
import '@univerjs/presets/lib/styles/preset-sheets-thread-comment.css'
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/presets/preset-sheets-conditional-formatting'
import UniverPresetSheetsConditionalFormattingZhCN from '@univerjs/presets/preset-sheets-conditional-formatting/locales/zh-CN'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import sheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import { UniverSheetsDataValidationPreset } from '@univerjs/presets/preset-sheets-data-validation'
import UniverPresetSheetsDataValidationZhCN from '@univerjs/presets/preset-sheets-data-validation/locales/zh-CN'
import { UniverSheetsDrawingPreset } from '@univerjs/presets/preset-sheets-drawing'
import UniverPresetSheetsDrawingZhCN from '@univerjs/presets/preset-sheets-drawing/locales/zh-CN'
import { UniverSheetsFilterPreset } from '@univerjs/presets/preset-sheets-filter'
import UniverPresetSheetsFilterZhCN from '@univerjs/presets/preset-sheets-filter/locales/zh-CN'
import { UniverSheetsFindReplacePreset } from '@univerjs/presets/preset-sheets-find-replace'
import UniverPresetSheetsFindReplaceZhCN from '@univerjs/presets/preset-sheets-find-replace/locales/zh-CN'
import { UniverSheetsHyperLinkPreset } from '@univerjs/presets/preset-sheets-hyper-link'
import UniverPresetSheetsHyperLinkZhCN from '@univerjs/presets/preset-sheets-hyper-link/locales/zh-CN'
import { UniverSheetsSortPreset } from '@univerjs/presets/preset-sheets-sort'
import SheetsSortZhCN from '@univerjs/presets/preset-sheets-sort/locales/zh-CN'
import { UniverSheetsTablePreset } from '@univerjs/presets/preset-sheets-table'
import UniverPresetSheetsTableZhCN from '@univerjs/presets/preset-sheets-table/locales/zh-CN'
import { UniverSheetsThreadCommentPreset } from '@univerjs/presets/preset-sheets-thread-comment'
import UniverPresetSheetsThreadCommentZhCN from '@univerjs/presets/preset-sheets-thread-comment/locales/zh-CN'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import '@univerjs/sheets-crosshair-highlight/facade'
import '@univerjs/sheets-crosshair-highlight/lib/index.css'
import SheetsCrosshairHighlightZhCN from '@univerjs/sheets-crosshair-highlight/locale/zh-CN'
import SheetsDrawingUIZhCN from '@univerjs/sheets-drawing-ui/locale/zh-CN'
import '@univerjs/watermark/facade'
import { formatLastEditedTime } from '@/utils/common'
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data'
import { HistoryPanel } from '../../whiteboard/components/HistoryPanel'
import Request from '../request'
import { UniverSheetsCustomMenuPlugin } from './plugin/video-plugin'

export function TableEditor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { id } = Route.useParams()
  const [univerAPI, setUniverAPI] = useState<any>(null)
  const [tableName, setTableName] = useState<string>('')
  const [workbookData, setWorkbookData] = useState<any>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [lastSaved, setLastSaved] = useState<string>('')
  const [lastEditedAt, setLastEditedAt] = useState<string>('')
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [historyVersions, setHistoryVersions] = useState<any[]>([])
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (showHistoryPanel === true) {
      getTableHistory()
    }
  }, [showHistoryPanel])

  const getTableHistory = async () => {
    Request._GetTableHistory(id).then((res: any) => {
      if (res) {
        setHistoryVersions(res.data || [])
      }
    })
  }

  const restoreVersion = (version: any) => {
    setWorkbookData(version)
    setShowHistoryPanel(false)
    setTimeout(() => {
      saveData()
    }, 2000)
  }
  const saveData = async () => {
    if (!univerAPI || isSaving) return

    setIsSaving(true)
    try {
      await Request._UpdateTableDetail(id, {
        ...workbookData,
      })

      const now = new Date().toISOString()
      setLastSaved(`最后保存: ${formatLastEditedTime(now)}`)
      setLastEditedAt(now) // Update last edited time
    } catch (error) {
      showErrorData(`自动保存失败: ${error}`)
      console.error('保存错误:', error)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const loadWhiteboard = async () => {
      try {
        const res = await Request._GetTableDetail(id)
        if (res.data) {
          const data = res.data
          setTableName(data.name)
          console.log('加载的数据:111', data)
          setWorkbookData(data)

          // Set last edited time when loading the document
          if (data.lastEditedAt) {
            setLastEditedAt(data.lastEditedAt)
            setLastSaved(`最后编辑: ${formatLastEditedTime(data.lastEditedAt)}`)
          }
        }
      } catch (error) {
        console.error('加载表格失败:', error)
      }
    }

    loadWhiteboard()
  }, [id])
  const handleContentChange = () => {
    console.log('内容已改变')
    console.log('workbookData', workbookData)
    if (!workbookData) return //
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveData()
    }, 3000)
  }
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Home') {
        e.preventDefault()
        const fWorkbook = univerAPI.getActiveWorkbook()
        const fWorksheet = fWorkbook?.getActiveSheet()
        if (fWorksheet) {
          let selection = fWorksheet.getSelection()
          const cell = selection?.getCurrentCell()
          const actualRow = cell?.actualRow
          const targetRange = fWorksheet.getRange(
            `A${(actualRow as number) + 1}`
          )
          selection?.updatePrimaryCell(targetRange)
          
        }
      }
      if (e.ctrlKey && e.key === 'Home') {
        e.preventDefault()
        const fWorkbook = univerAPI.getActiveWorkbook()
        const fWorksheet = fWorkbook?.getActiveSheet()
        if (fWorksheet) {
          let selection = fWorksheet.getSelection()
          const cell = selection?.getCurrentCell()
          const targetRange = fWorksheet.getRange(`A1`)
          
          selection?.updatePrimaryCell(targetRange)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    if (!containerRef.current) return

    const { univerAPI, univer } = createUniver({
      locale: LocaleType.ZH_CN,
      locales: {
        [LocaleType.ZH_CN]: merge(
          {},
          UniverPresetSheetsCoreZhCN,
          SheetsSortZhCN,
          sheetsCoreZhCN,
          UniverPresetSheetsFilterZhCN,
          UniverPresetSheetsConditionalFormattingZhCN,
          UniverPresetSheetsDrawingZhCN,
          UniverPresetSheetsHyperLinkZhCN,
          UniverPresetSheetsTableZhCN,
          UniverPresetSheetsThreadCommentZhCN,
          UniverPresetSheetsFindReplaceZhCN,
          SheetsCrosshairHighlightZhCN,
          DrawingUIZhCN,
          SheetsDrawingUIZhCN,
          UniverPresetSheetsDataValidationZhCN
        ),
      },
      theme: defaultTheme,
      // collaboration: true,
      plugins: [
        UniverSheetsCrosshairHighlightPlugin,
        UniverSheetsCustomMenuPlugin,
      ],
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
          menu: {
            'univer.operation.toggle-edit-history': {
              hidden: true,
            },
          },
        }),
        UniverSheetsSortPreset(),
        UniverSheetsFilterPreset(),
        UniverSheetsConditionalFormattingPreset(),
        UniverSheetsDrawingPreset(),
        UniverSheetsHyperLinkPreset(),
        UniverSheetsTablePreset(),
        // UniverSheetsAdvancedPreset({
        //   universerEndpoint: 'http://localhost:7382',
        // }),
        UniverSheetsThreadCommentPreset(),
        UniverSheetsFindReplacePreset(),
        UniverSheetsDataValidationPreset(),
        // UniverSheetsCollaborationPreset({
        //   universerEndpoint: 'http://localhost:7382',
        // }),
      ],
    })
    // 固定位置渲染
    // 设置标记

    setUniverAPI(univerAPI)
    univerAPI.registerComponent('myFloatDom', ({ data }: any) => (
      <div style={{ width: '100px', height: '200px', background: '#fff' }}>
        popup content
        {data?.label}
      </div>
    ))
    if (workbookData) {
      univerAPI.createWorkbook(workbookData)
      const commandService = univer.__getInjector().get(ICommandService)
      const dispose = commandService.onCommandExecuted((command) => {
        if (command.id.includes('sheet.command')) {
          handleContentChange()
        }
      })

      // // 延迟添加浮动DOM
      // setTimeout(() => {
      //   const fWorkbook = univerAPI.getActiveWorkbook()
      //   const fWorksheet = fWorkbook?.getActiveSheet()

      //   if (fWorksheet) {
      //     try {
      //       const disposeable = fWorksheet.addFloatDomToPosition({
      //         componentKey: 'myFloatDom',
      //         initPosition: {
      //           startX: 10,
      //           endX: 110,
      //           startY: 10,
      //           endY: 110,
      //         },
      //         data: {
      //           label: '测试浮动DOM',
      //         },
      //       })

      //       if (!disposeable) {
      //         console.error('添加浮动DOM失败')
      //       }
      //     } catch (error) {
      //       console.error('添加浮动DOM时出错:', error)
      //     }
      //   }
      // }, 500)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        dispose.dispose()
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
        univerAPI.dispose()
      }
    } else {
      univerAPI.createWorkbook({ name: tableName })
    }

    return () => {
      univerAPI.dispose()
    }
  }, [workbookData])

  return (
    <div className='flex h-[100vh] flex-col'>
      <div className='flex items-center justify-between p-[.625rem]'>
        <div className='flex items-center gap-2'>
          <div className='mx-1'>{tableName}</div>
          <button
            onClick={() => setShowHistoryPanel(true)}
            className='flex items-center gap-1 rounded p-2 text-gray-600 hover:bg-gray-100'
          >
            <IconHistory size={20} />
            <span>历史版本</span>
          </button>
          <div className='flex flex-col'>
            <div className='text-sm text-gray-500'>云端自动保存</div>
            {!isSaving && lastEditedAt && (
              <div className='text-sm text-gray-500'>
                {lastSaved || `最后编辑: ${formatLastEditedTime(lastEditedAt)}`}
              </div>
            )}
            {isSaving && <div className='text-sm text-blue-500'>保存中...</div>}
          </div>
        </div>
        <button
          onClick={saveData}
          disabled={isSaving}
          className='flex items-center gap-1 rounded bg-black p-2 text-[1rem] text-white disabled:opacity-50'
        >
          <IconDeviceFloppy size={24} />
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
      <div ref={containerRef} className='w-[100%] flex-1'></div>
      {showHistoryPanel && (
        <HistoryPanel
          versions={historyVersions}
          onClose={() => setShowHistoryPanel(false)}
          onRestore={restoreVersion}
        />
      )}
    </div>
  )
}
