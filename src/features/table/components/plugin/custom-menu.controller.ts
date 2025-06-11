import { Disposable, ICommandService, Injector, Inject } from '@univerjs/core';
import { IMenuManagerService, ComponentManager } from '@univerjs/ui';
import { ContextMenuGroup, ContextMenuPosition, RibbonStartGroup } from '@univerjs/ui';
import { CustomMenuItemSingleButtonFactory } from './single-button.menu';
import { InsertVideoCommand, InsertVideoUICommand } from './video-manager-service';
import { ButtonIcon } from './ButtonIcon';
export class CustomMenuController extends Disposable {
  constructor(
    @Inject(Injector) private readonly _injector: Injector,
    @ICommandService private readonly _commandService: ICommandService,
    @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
    @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
  ) {
    super();
    this._initCommands();
    this._registerComponents();
    this._initMenus();
  }

  /**
   * register commands
   */
  private _initCommands(): void {
    [
      InsertVideoUICommand,
    ].forEach((c) => {
      this.disposeWithMe(this._commandService.registerCommand(c));
    });
  }

  /**
   * register icon components
   */
  private _registerComponents(): void {
    this.disposeWithMe(this._componentManager.register("ButtonIcon", ButtonIcon));
  }

  /**
   * register menu items
   */
  private _initMenus(): void {
    this._menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [InsertVideoUICommand.id]: {
          order: 10,
          menuItemFactory: CustomMenuItemSingleButtonFactory,
        },
      },
      [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.OTHERS]: {
          [InsertVideoUICommand.id]: {
            order: 12,
            menuItemFactory: CustomMenuItemSingleButtonFactory,
          },
        },
      },
    })
  }
}