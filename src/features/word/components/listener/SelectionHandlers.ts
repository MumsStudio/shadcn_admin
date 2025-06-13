import { Graph } from '@antv/x6';

export const setupSelectionHandlers = (
  graph: Graph,
  setSelectedNodes: (nodes: any[]) => void,
  setCurrentColor: (color: string) => void,
  setCurrentTextColor: (color: string) => void
) => {
  const selectionHandler = () => {
    const selected =
      graph.getSelectedCells().filter((cell) => cell.isNode()) || [];
    setSelectedNodes(selected);

    if (selected.length > 0) {
      const firstNode = selected[0];
      setCurrentColor(firstNode.attr('body/fill') || '#EFF4FF');
      // 获取字体颜色
      setCurrentTextColor(
        firstNode.attr('text/fill') ||
        firstNode.attr('label/fill') ||
        '#000000'
      );
    }
  };

  graph.on('selection:changed', selectionHandler);

  return () => {
    graph.off('selection:changed', selectionHandler);
  };
};
