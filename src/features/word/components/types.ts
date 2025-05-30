// types.ts
export interface ModuleConfig {
  id: string
  name: string
  component: React.FC
  allowMultiple?: boolean
}

export interface Card {
  id: string
  name: string
  content: string
  modules?: Record<string, any>
  cardContent: Record<string, any> // 保存当前卡片弹窗中每个模块的数据
  cardActions: Array<{ action: string; timestamp: string; isEditing?: boolean }> // 保存当前卡片的操作记
}