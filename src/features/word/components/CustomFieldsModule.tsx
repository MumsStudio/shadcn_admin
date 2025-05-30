// CustomFieldsModule.tsx
import React, { useEffect, useState } from 'react';
import { isEqual } from 'date-fns';
import debounce from '@/utils/debounce';


// 定义字段类型
type FieldType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox'

// 定义字段接口
interface CustomField {
  id: string
  name: string
  type: FieldType
  options?: string[] // 用于下拉菜单选项
  // defaultValue?: string | number | boolean // 默认值
  value?: string | number | boolean // 当前值
}

interface CustomFieldsModuleProps {
  onChange: (fields: CustomField[], action: string) => void
  initialFields?: CustomField[]
  currentCard: {
    modules?: {
      customFields?: any[]
    }
  }
}

const CustomFieldsModule: React.FC<CustomFieldsModuleProps> = ({
  onChange,
  initialFields = [],
  currentCard,
}) => {
  const [fields, setFields] = useState<CustomField[]>(initialFields)
  const [isAddingField, setIsAddingField] = useState(false)
  const [newField, setNewField] = useState<Partial<CustomField>>({
    type: 'text',
  })
  useEffect(() => {
    setFields(currentCard?.modules?.customFields || [])
  }, [currentCard?.modules?.customFields])
  // 处理字段变化
  const handleFieldChange = (e: any, id: string) => {
    const name = fields.find((field) => field.id === id)?.name || ''
    const updatedFields = fields.map((field) =>
      field.id === id
        ? {
            ...field,
            value:
              field.type === 'checkbox' ? e.target.checked : e.target.value,
          }
        : field
    )
    // setFields(updatedFields)
    onChange(updatedFields, `handleFieldChange:${name}`)
  }

  // 添加新字段
  const handleAddField = () => {
    if (!newField.name?.trim()) return

    const field: CustomField = {
      id: `field-${Date.now()}`,
      name: newField.name.trim(),
      type: newField.type || 'text',
      options: newField.type === 'dropdown' ? newField.options : undefined,
      // defaultValue: undefined,
      value: newField.type === 'checkbox' ? false : undefined,
    }

    const updatedFields = [...fields, field]
    // setFields(updatedFields)
    console.log('addField', field)
    onChange(updatedFields, `addField:${field.name}`)
    setIsAddingField(false)
    setNewField({ type: 'text' })
  }

  // 删除字段
  const handleDeleteField = (id: string) => {
    const name = fields.find((field) => field.id === id)?.name || ''
    const updatedFields = fields.filter((field) => field.id !== id)
    // setFields(updatedFields)
    onChange(updatedFields, `deleteField:${name}`)
  }

  // 渲染字段输入控件
  const renderFieldInput = (field: CustomField) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type='text'
            placeholder='文本'
            className='w-full rounded border border-gray-300 px-2 py-1'
            disabled
          />
        )
      case 'number':
        return (
          <input
            type='number'
            placeholder='数字'
            className='w-full rounded border border-gray-300 px-2 py-1'
            disabled
          />
        )
      case 'date':
        return (
          <input
            type='date'
            className='w-full rounded border border-gray-300 px-2 py-1'
            disabled
          />
        )
      case 'dropdown':
        return (
          <select
            className='w-full rounded border border-gray-300 px-2 py-1'
            disabled
          >
            {field.options?.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        )
      case 'checkbox':
        return (
          <input
            type='checkbox'
            className='h-5 w-5 rounded border-gray-300'
            disabled
          />
        )
      default:
        return null
    }
  }

  return (
    <div className='module-content space-y-4'>
      <div className='field-list grid grid-cols-2 gap-2'>
        {fields.map((field) => (
          <div key={field.id} className='flex items-center'>
            <div className='flex items-center justify-center'>
              <div className='flex flex-col'>
                <span className='text-[16px] text-gray-600'>{field.name}</span>
                <div className='text-[14px]'>
                  {field.type === 'text' && (
                    <input
                      type='text'
                      value={(field.value as string) || ''}
                      onBlur={(e: any) => handleFieldChange(e, field.id)}
                      onChange={(e: any) => {
                        field.value = e.target.value
                        const updatedFields = [...fields]
                        setFields(updatedFields)
                      }}
                      className='rounded border border-gray-300 p-1'
                    />
                  )}
                  {field.type === 'number' && (
                    <input
                      type='number'
                      value={(field.value as number) || ''}
                      className='rounded border border-gray-300 p-1'
                      onBlur={(e: any) => handleFieldChange(e, field.id)}
                      onChange={(e: any) => {
                        field.value = e.target.value
                        const updatedFields = [...fields]
                        setFields(updatedFields)
                      }}
                    />
                  )}
                  {field.type === 'date' && (
                    <input
                      type='date'
                      value={(field.value as string) || ''}
                      className='m-0 rounded border border-gray-300 p-1'
                      onBlur={(e: any) => handleFieldChange(e, field.id)}
                      onChange={(e: any) => {
                        field.value = e.target.value
                        const updatedFields = [...fields]
                        setFields(updatedFields)
                      }}
                    />
                  )}
                  {field.type === 'dropdown' && (
                    <select
                      className='m-0 rounded border border-gray-300 p-1'
                      value={(field.value as string) || ''}
                      onChange={(e) => {
                        console.log(e.target.value, '111')
                        handleFieldChange(e, field.id)
                      }}
                    >
                      {field.options?.map((option, index) => (
                        <option key={index}>{option}</option>
                      ))}
                    </select>
                  )}
                  {field.type === 'checkbox' && (
                    <input
                      type='checkbox'
                      checked={(field.value as boolean) || false}
                      className='rounded border border-gray-300 p-1'
                      onChange={(e: any) => {
                        field.value = e.target.checked
                        const updatedFields = [...fields]
                        setFields(updatedFields)
                        handleFieldChange(e, field.id)
                      }}
                    />
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDeleteField(field.id)}
                className='mt-6 ml-2 text-gray-400 hover:text-red-500'
                title='删除字段'
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddingField ? (
        <div className='rounded border border-gray-200 p-3'>
          <div className='mb-3'>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              字段名称
            </label>
            <input
              type='text'
              value={newField.name || ''}
              onChange={(e) =>
                setNewField({ ...newField, name: e.target.value })
              }
              className='w-full rounded border border-gray-300 px-2 py-1'
              placeholder='例如：优先级'
              autoFocus
            />
          </div>

          <div className='mb-3'>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              字段类型
            </label>
            <select
              value={newField.type}
              onChange={(e) => {
                const type = e.target.value as FieldType
                setNewField({
                  ...newField,
                  type,
                  options: type === 'dropdown' ? ['选项1', '选项2'] : undefined,
                })
              }}
              className='w-full rounded border border-gray-300 px-2 py-1'
            >
              <option value='text'>文本</option>
              <option value='number'>数字</option>
              <option value='date'>日期</option>
              <option value='dropdown'>下拉菜单</option>
              <option value='checkbox'>复选框</option>
            </select>
          </div>

          {newField.type === 'dropdown' && (
            <div className='mb-3'>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                下拉选项
              </label>
              <div className='space-y-2'>
                {newField.options?.map((option, index) => (
                  <div key={index} className='flex items-center'>
                    <input
                      type='text'
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(newField.options || [])]
                        newOptions[index] = e.target.value
                        setNewField({ ...newField, options: newOptions })
                      }}
                      className='w-full rounded border border-gray-300 px-2 py-1'
                    />
                    <button
                      onClick={() => {
                        const newOptions = [...(newField.options || [])]
                        newOptions.splice(index, 1)
                        setNewField({ ...newField, options: newOptions })
                      }}
                      className='ml-2 text-red-500'
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setNewField({
                    ...newField,
                    options: [...(newField.options || []), '新选项'],
                  })
                }}
                className='mt-2 flex items-center rounded bg-gray-100 px-2 py-1 text-sm text-gray-700 hover:bg-gray-200'
              >
                <span className='mr-1'>+</span> 添加选项
              </button>
            </div>
          )}

          <div className='flex justify-end space-x-2'>
            <button
              onClick={() => setIsAddingField(false)}
              className='rounded px-3 py-1 text-gray-600 hover:bg-gray-100'
            >
              取消
            </button>
            <button
              onClick={handleAddField}
              className='rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600'
            >
              添加
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingField(true)}
          className='flex items-center rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200'
        >
          <span className='mr-1'>+</span> 添加自定义字段
        </button>
      )}
    </div>
  )
}

export default CustomFieldsModule