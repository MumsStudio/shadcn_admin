// src/plugin/controllers/menu/single-button.menu.ts
import type { IMenuButtonItem } from '@univerjs/ui';
import { MenuItemType } from '@univerjs/ui';
import { InsertVideoUICommand } from './video-manager-service';

export function CustomMenuItemSingleButtonFactory(): IMenuButtonItem<string> {
  return {
    // 绑定 Command id，单击该按钮将触发该命令
    id: InsertVideoUICommand.id,
    // 菜单项的类型，在本例中，它是一个按钮
    type: MenuItemType.BUTTON,
    // 按钮的图标，需要在 ComponentManager 中注册
    icon: 'ButtonIcon',
    // 按钮的提示，优先匹配国际化，如果没有匹配到，将显示原始字符串
    tooltip: '视频',
    // 按钮的标题，优先匹配国际化，如果没有匹配到，将显示原始字符串
    title: '视频',
  };
}