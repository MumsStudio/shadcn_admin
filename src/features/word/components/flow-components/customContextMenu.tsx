import React from 'react';


interface CustomContextMenuProps {
  currentShape: any
  onChange: (shape: string, attr: any) => void
}

export const CustomContextMenu: React.FC<CustomContextMenuProps> = ({
  currentShape,
  onChange,
}) => {
  const menuItems = [
    {
      shape: 'custom-rect',
      label: '开始',
      attrs: { body: { rx: 20, ry: 26 } },
    },
    { shape: 'custom-rect', label: '过程' },
    {
      shape: 'custom-rect',
      label: '可选过程',
      attrs: { body: { rx: 6, ry: 6 } },
    },
    {
      shape: 'custom-polygon',
      label: '决策',
      attrs: { body: { refPoints: '0,10 10,0 20,10 10,20' } },
    },
    {
      shape: 'custom-polygon',
      label: '数据',
      attrs: { body: { refPoints: '10,0 40,0 30,20 0,20' } },
    },
    { shape: 'ellipse', label: 'ellipse' },
    { shape: 'path', label: 'path' },
    { shape: 'like', label: 'like' },
    { shape: 'star', label: 'star' },
    { shape: 'music', label: 'music' },
  ]

  return (
    <div className='custom-context-menu'>
      {menuItems.map((item) => (
        <div
          key={item.label}
          className='menu-item'
          onClick={() => {
            onChange(item.shape, item.attrs?.body)
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}