import { Graph } from '@antv/x6'

export const setupPortVisibility = (graph: Graph) => {
  const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
    for (let i = 0, len = ports.length; i < len; i += 1) {
      ports[i].style.visibility = show ? 'visible' : 'hidden'
    }
  }

  graph.on('node:mouseenter', () => {
    const ports = graph.container.querySelectorAll(
      '.x6-port-body'
    ) as NodeListOf<SVGElement>
    showPorts(ports, true)
  })

  graph.on('node:mouseleave', () => {
    const ports = graph.container.querySelectorAll(
      '.x6-port-body'
    ) as NodeListOf<SVGElement>
    showPorts(ports, false)
  })
}
