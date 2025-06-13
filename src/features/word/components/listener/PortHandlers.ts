import { Graph } from '@antv/x6';

export const setupPortHandlers = (
  graph: Graph,
  setMenuPosition: (position: { x: number; y: number }) => void,
  setIsContextMenuVisible: (visible: boolean) => void,
  currentShapeRef: React.MutableRefObject<string>,
  currentAttrRef: React.MutableRefObject<any>
) => {
  let ghostNode: any = undefined;

  // 右键菜单
  graph.on('node:port:contextmenu', ({ e, }) => {
    const { clientX, clientY } = e;
    setMenuPosition({ x: clientX, y: clientY });
    setIsContextMenuVisible(true);

    const hideMenu = () => {
      setIsContextMenuVisible(false);
      document.removeEventListener('click', hideMenu);
    };

    document.addEventListener('click', hideMenu);
  });

  // 鼠标悬停显示节点虚影
  graph.on('node:port:mouseenter', ({ node, port }) => {
    const nodeData = node.getData();
    const portPosition = node.getPorts().find((p) => p.id === port)?.group;

    // 根据端口位置决定虚影节点方向
    let x = node.position().x;
    let y = node.position().y;

    if (portPosition === 'left') {
      x -= 150;
    } else if (portPosition === 'right') {
      x += 150;
    } else if (portPosition === 'top') {
      y -= 150;
    } else if (portPosition === 'bottom') {
      y += 150;
    } else {
      // 默认右侧
      x += 150;
    }

    ghostNode = graph.addNode({
      shape: currentShapeRef.current || node.shape,
      x,
      y,
      attrs: {
        body: {
          rx: currentAttrRef.current?.rx || node.attrs?.body.rx || 0,
          ry: currentAttrRef.current?.ry || node.attrs?.body.ry || 0,
          refPoints:
            currentAttrRef.current?.refPoints ||
            node.attrs?.body.refPoints ||
            '',
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: 'rgba(95, 149, 255, 0.2)',
          strokeDasharray: '5,5',
        },
        label: {
          text: '新节点',
          fill: '#5F95FF',
        },
      },
      data: nodeData,
    });

    node.setData({ ghostNodeId: ghostNode.id });
  });

  // 鼠标离开移除虚影
  graph.on('node:port:mouseleave', ({ node }) => {
    const ghostNodeId = node.getData().ghostNodeId;
    if (ghostNodeId) {
      graph.removeNode(ghostNodeId);
      node.setData({ ghostNodeId: null });
    }
  });

  // 点击端口创建相同图形
  graph.on('node:port:click', ({ node, port }) => {
    const nodeData = node.getData();
    const portPosition = node.getPorts().find((p) => p.id === port)?.group;

    // 根据端口位置决定新节点方向
    let x = node.position().x;
    let y = node.position().y;

    if (portPosition === 'left') {
      x -= 150;
    } else if (portPosition === 'right') {
      x += 150;
    } else if (portPosition === 'top') {
      y -= 150;
    } else if (portPosition === 'bottom') {
      y += 150;
    } else {
      // 默认右侧
      x += 150;
    }

    const newNode = graph.addNode({
      shape: currentShapeRef.current || node.shape,
      x,
      y,
      attrs: {
        body: {
          rx: currentAttrRef.current?.rx || node.attrs?.body.rx || 0,
          ry: currentAttrRef.current?.ry || node.attrs?.body.ry || 0,
          refPoints:
            currentAttrRef.current?.refPoints ||
            node.attrs?.body.refPoints ||
            '',
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#EFF4FF',
        },
      },
      data: nodeData,
    });

    const newPortPosition =
      portPosition === 'left'
        ? 'right'
        : portPosition === 'right'
          ? 'left'
          : portPosition === 'top'
            ? 'bottom'
            : 'top';

    const newPort = newNode
      .getPorts()
      .find((p) => p.group === newPortPosition)?.id;

    // 自动连接新节点
    graph.addEdge({
      source: { cell: node.id, port },
      target: {
        cell: newNode.id,
        port: newPort,
      },
      attrs: {
        line: {
          stroke: '#A2B1C3',
          strokeWidth: 2,
        },
      },
    });

    currentAttrRef.current = {};
    currentShapeRef.current = '';
  });

  // 点击边时移除虚影
  graph.on('edge:mousedown', () => {
    if (ghostNode) {
      graph.removeNode(ghostNode.id);
      ghostNode = undefined;
    }
  });
};
