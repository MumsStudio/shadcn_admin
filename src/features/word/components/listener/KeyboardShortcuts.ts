import { Graph } from '@antv/x6';

export const setupKeyboardShortcuts = (graph: Graph) => {
  // 绑定键盘快捷键
  graph.bindKey('ctrl+c', () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.copy(cells);
    }
    return false;
  });

  graph.bindKey('ctrl+v', () => {
    if (!graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 32 });
      graph.cleanSelection();
      graph.select(cells);
    }
    return false;
  });

  graph.bindKey('ctrl+x', () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.cut(cells);
    }
    return false;
  });

  graph.bindKey('backspace', () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.removeCells(cells);
    }
    return false;
  });
};
