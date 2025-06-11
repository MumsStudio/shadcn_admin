// src/plugin/plugin.ts
import type { Dependency } from '@univerjs/core';
import { Inject, Injector, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { CustomMenuController } from './custom-menu.controller';

const SHEET_CUSTOM_MENU_PLUGIN = 'SHEET_CUSTOM_MENU_PLUGIN';

export class UniverSheetsCustomMenuPlugin extends Plugin {
  static override type = UniverInstanceType.UNIVER_SHEET;
  static override pluginName = SHEET_CUSTOM_MENU_PLUGIN;

  constructor(
    @Inject(Injector) protected readonly _injector: Injector
  ) {
    super();
  }

  override onStarting(): void {
    ([
      [CustomMenuController],
    ] as Dependency[]).forEach(d => this._injector.add(d))
  }

  override onRendered(): void {
    touchDependencies(this._injector, [
      [CustomMenuController],
    ])
  }
}