import { Graph } from '@antv/x6';

export const setupHistoryHandlers = (
  graph: Graph,
  setCanUndo: (canUndo: boolean) => void,
  setCanRedo: (canRedo: boolean) => void,
  handleUndo: () => void,
  handleRedo: () => void
) => {
  // 监听历史状态变化
  graph.on('history:change', () => {
    setCanUndo(graph.canUndo());
    setCanRedo(graph.canRedo());
  });

  // 绑定键盘快捷键
  graph.bindKey('ctrl+z', () => {
    handleUndo();
    return false;
  });

  graph.bindKey('ctrl+shift+z', () => {
    handleRedo();
    return false;
  });
};
