import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { CommandType, IAccessor, ICommand, ICommandService, IMutationInfo, IUndoRedoService, IUniverInstanceService, sequenceExecute, UniverInstanceType, Workbook } from '@univerjs/core';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import { MenuItemType } from '@univerjs/ui';

// 定义视频插入参数接口
interface IInsertVideoParams {
  unitId: string;
  subUnitId: string;
  row: number;
  column: number;
  videoUrl: string;
  width?: number;
  height?: number;
}

// 视频插入命令
export const InsertVideoCommand: ICommand = {
  id: 'sheet.command.insert-video',
  type: CommandType.COMMAND,
  handler: (accessor: IAccessor, params: IInsertVideoParams) => {
    const { unitId, subUnitId, row, column, videoUrl, width = 300, height = 200 } = params;
    // const univerAPI = accessor.get('univerAPI');
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);

    // 获取当前工作表
    const worksheet = univerInstanceService
      .getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!
      .getActiveSheet();

    // 准备重做和撤销操作
    const redoMutations: IMutationInfo[] = [];
    const undoMutations: IMutationInfo[] = [];

    // 创建视频对象数据
    // 修改 videoData 结构以符合 ICellData 接口要求
    const videoData = {
      [row]: {
        [column]: {
          v: '',
          custom: {
            type: 'video',
            videoUrl,
            width,
            height,
          },
        },
      },
    };

    // 设置范围值的参数
    const setRangeValuesMutationRedoParams: ISetRangeValuesMutationParams = {
      unitId,
      subUnitId,
      cellValue: videoData,
    };

    const setRangeValuesMutationUndoParams: ISetRangeValuesMutationParams =
      SetRangeValuesUndoMutationFactory(accessor, setRangeValuesMutationRedoParams);

    redoMutations.push({
      id: SetRangeValuesMutation.id,
      params: setRangeValuesMutationRedoParams,
    });

    undoMutations.push({
      id: SetRangeValuesMutation.id,
      params: setRangeValuesMutationUndoParams,
    });

    // 执行重做操作
    const result = sequenceExecute(redoMutations, commandService);

    if (result.result) {
      // 将操作推入撤销重做栈
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations,
        redoMutations,
      });

      return true;
    }

    return false;
  },
};

// 视频插入UI命令
export const InsertVideoUICommand: ICommand = {
  id: 'sheet.command.insert-video-ui',
  type: CommandType.OPERATION,
  handler: (accessor: IAccessor) => {    // 这里可以添加UI逻辑，例如打开文件选择器或URL输入对话框

    // 模拟用户选择了视频
    const videoUrl = 'https://example.com/video.mp4';
    const row = 5;
    const column = 3;

    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);

    if (!workbook) {
      return false;
    }

    const worksheet = workbook.getActiveSheet();
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();

    const commandService = accessor.get(ICommandService);

    return commandService.executeCommand(InsertVideoCommand.id, {
      unitId,
      subUnitId,
      row,
      column,
      videoUrl,
      width: 400,
      height: 300,
    });
  },
};