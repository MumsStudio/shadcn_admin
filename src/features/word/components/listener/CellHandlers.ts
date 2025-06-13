import { Graph } from '@antv/x6';

export const setupCellHandlers = (
  graph: Graph,
  editor: any,
  getPos: () => number,
  node: any,
  setCurrentEditingNode: (node: any) => void,
  setCurrentLabel: (label: string) => void,
  setIsLabelModalOpen: (open: boolean) => void
) => {
  // 保存数据的函数
  const saveData = () => {
    const data = graph.toJSON();
    editor.commands.command(({ tr }: any) => {
      const pos = getPos();
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        data,
      });
      return true;
    });
  };

  // 监听单元格变化
  graph.on('cell:changed', saveData);
  graph.on('cell:added', saveData);
  graph.on('cell:removed', saveData);

  // 双击节点编辑标签
  graph.on('node:dblclick', ({ node }: any) => {
    setCurrentEditingNode(node);
    setCurrentLabel(node.label || node.attrs.text.text);
    setIsLabelModalOpen(true);
  });

  return () => {
    graph.off('cell:changed', saveData);
    graph.off('cell:added', saveData);
    graph.off('cell:removed', saveData);
    graph.off('node:dblclick');
  };
};
