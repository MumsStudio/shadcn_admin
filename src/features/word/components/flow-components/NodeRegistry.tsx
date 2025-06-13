import { Graph } from '@antv/x6';


const switchCenter = {
  x: 35,
  y: -2,
}
const switchOpen = `rotate(-30 ${switchCenter.x} ${switchCenter.y})`
const switchClose = `rotate(-12 ${switchCenter.x} ${switchCenter.y})`
export const registerCustomNodes = (graph: Graph) => {
  const ports = {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      right: {
        position: 'right',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      bottom: {
        position: 'bottom',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      left: {
        position: 'left',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
    },
    items: [
      { group: 'top' },
      { group: 'right' },
      { group: 'bottom' },
      { group: 'left' },
    ],
  }

  Graph.registerNode(
    'custom-rect',
    {
      inherit: 'rect',
      width: 66,
      height: 36,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
        },
      },
      ports: { ...ports },
    },
    true
  )

  Graph.registerNode(
    'custom-polygon',
    {
      inherit: 'polygon',
      width: 66,
      height: 36,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
        },
      },
      ports: {
        ...ports,
        items: [{ group: 'top' }, { group: 'bottom' }],
      },
    },
    true
  )

  Graph.registerNode(
    'custom-circle',
    {
      inherit: 'circle',
      width: 45,
      height: 45,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
        },
      },
      ports: { ...ports },
    },
    true
  )

  Graph.registerNode(
    'custom-image',
    {
      inherit: 'rect',
      width: 52,
      height: 52,
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'image' },
        { tagName: 'text', selector: 'label' },
      ],
      attrs: {
        body: {
          stroke: '#5F95FF',
          fill: '#5F95FF',
        },
        image: {
          width: 26,
          height: 26,
          refX: 13,
          refY: 16,
        },
        label: {
          refX: 3,
          refY: 2,
          textAnchor: 'left',
          textVerticalAnchor: 'top',
          fontSize: 12,
          fill: '#fff',
        },
      },
      ports: { ...ports },
    },
    true
  )
  Graph.registerNode(
    'ellipse',
    {
      inherit: 'ellipse',
      width: 60,
      height: 30,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
      },
      ports: { ...ports },
    },
    true
  )
  Graph.registerNode(
    'path',
    {
      inherit: 'path',
      width: 50,
      height: 40,
      path: 'M 0 5 10 0 C 20 0 20 20 10 20 L 0 15 Z',
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
      },
      ports: { ...ports },
    },
    true
  )
  Graph.registerNode(
    'like',
    {
      inherit: 'path',
      width: 50,
      height: 50,
      path: 'M24.85,10.126c2.018-4.783,6.628-8.125,11.99-8.125c7.223,0,12.425,6.179,13.079,13.543c0,0,0.353,1.828-0.424,5.119c-1.058,4.482-3.545,8.464-6.898,11.503L24.85,48L7.402,32.165c-3.353-3.038-5.84-7.021-6.898-11.503c-0.777-3.291-0.424-5.119-0.424-5.119C0.734,8.179,5.936,2,13.159,2C18.522,2,22.832,5.343,24.85,10.126z',
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
      },
      ports: { ...ports },
    },
    true
  )
  Graph.registerNode(
    'star',
    {
      inherit: 'path',
      width: 50,
      height: 50,
      path: 'M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956C22.602,0.567,25.338,0.567,26.285,2.486z',
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
      },
      ports: { ...ports },
    },
    true
  )
  Graph.registerNode(
    'music',
    {
      inherit: 'path',
      width: 50,
      height: 50,
      path: 'M52.104,0.249c-0.216-0.189-0.501-0.275-0.789-0.241l-31,4.011c-0.499,0.065-0.872,0.489-0.872,0.992v6.017v4.212v26.035C17.706,39.285,14.997,38,11.944,38c-5.247,0-9.5,3.781-9.5,8.444s4.253,8.444,9.5,8.444s9.5-3.781,9.5-8.444c0-0.332-0.027-0.658-0.069-0.981c0.04-0.108,0.069-0.221,0.069-0.343V16.118l29-3.753v18.909C48.706,29.285,45.997,28,42.944,28c-5.247,0-9.5,3.781-9.5,8.444s4.253,8.444,9.5,8.444s9.5-3.781,9.5-8.444c0-0.092-0.012-0.181-0.015-0.272c0.002-0.027,0.015-0.05,0.015-0.077V11.227V7.016V1C52.444,0.712,52.32,0.438,52.104,0.249z',
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
      },
      ports: { ...ports },
    },
    true
  )
  Graph.registerNode(
    'switch',
    {
      width: 100,
      height: 10,
      markup: [
        {
          tagName: 'g',
          selector: 'left-group',
          children: [
            {
              tagName: 'rect',
              selector: 'left',
              groupSelector: 'line',
              attrs: {
                x: 0,
                y: 0,
              },
            },
            {
              tagName: 'circle',
              selector: 'lco',
              groupSelector: 'co',
              attrs: {
                cx: 30,
              },
            },
            {
              tagName: 'circle',
              selector: 'lci',
              groupSelector: 'ci',
              attrs: {
                cx: 30,
              },
            },
          ],
        },
        {
          tagName: 'rect',
          selector: 'switch',
          groupSelector: 'line',
        },
        {
          tagName: 'g',
          selector: 'right-group',
          children: [
            {
              tagName: 'rect',
              selector: 'right',
              groupSelector: 'line',
              attrs: {
                x: 70,
                y: 0,
              },
            },
            {
              tagName: 'circle',
              selector: 'rco',
              groupSelector: 'co',
              attrs: {
                cx: 70,
              },
            },
            {
              tagName: 'circle',
              selector: 'rci',
              groupSelector: 'ci',
              attrs: {
                cx: 70,
              },
            },
          ],
        },
      ],
      attrs: {
        line: {
          width: 30,
          height: 2,
          strokeWidth: 1,
          stroke: '#5F95FF',
        },
        co: {
          r: 8,
          fill: '#EFF4FF',
        },
        ci: {
          r: 4,
          fill: '#5F95FF',
        },
        switch: {
          ...switchCenter,
          width: 35,
          transform: switchOpen,
        },
      },
      ports: { ...ports },
    },
    true
  )
}