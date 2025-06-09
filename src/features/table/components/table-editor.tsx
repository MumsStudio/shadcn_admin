import React, { useEffect, useRef } from 'react'
import {
  createUniver,
  defaultTheme,
  LocaleType,
  merge,
} from '@univerjs/presets'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'

export function TableEditor() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const { univerAPI } = createUniver({
      locale: LocaleType.ZH_CN,
      locales: {
        [LocaleType.ZH_CN]: merge({}, UniverPresetSheetsCoreZhCN),
      },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    })
    univerAPI.createWorkbook({ name: 'Test Sheet' })
    return () => {
      univerAPI.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} style={{ height: '100vh', width: '100%' }}></div>
  )
}
