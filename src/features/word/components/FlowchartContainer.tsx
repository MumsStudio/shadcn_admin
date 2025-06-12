import React from 'react'

interface FlowchartContainerProps {
  width: string
  height: string
  showStencil: boolean
  stencilWidth: string
  toggleStencil: () => void
  toggleFullscreen: () => void
  containerRef: React.RefObject<HTMLDivElement> | null
  stencilContainerRef: React.RefObject<HTMLDivElement>
  graphContainerRef: React.RefObject<HTMLDivElement>
}

export const FlowchartContainer: React.FC<FlowchartContainerProps> = ({
  width,
  height,
  showStencil,
  stencilWidth,
  toggleStencil,
  containerRef,
  stencilContainerRef,
  graphContainerRef,
}) => {
  return (
    <div
      ref={containerRef}
      className='flowchart-container'
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        border: '1px solid #dfe3e8',
      }}
    >
      <div
        ref={stencilContainerRef}
        className='flowchart-stencil'
        data-show-stencil={showStencil}
        style={{
          width: showStencil ? stencilWidth : '0px',
          height: '100%',
          position: 'relative',
          borderRight: '1px solid #dfe3e8',
          overflow: 'hidden',
        }}
      />
      <div
        ref={graphContainerRef}
        className='x6-graph'
        style={{
          width: showStencil ? `calc(100% - ${stencilWidth})` : '100%',
          height: '100%',
        }}
      />
      <button
        onClick={toggleStencil}
        style={{
          position: 'absolute',
          top: '10px',
          left: showStencil ? `calc(${stencilWidth} + 10px)` : '10px',
          zIndex: 10,
          padding: '5px 10px',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {showStencil ? 'Hide Stencil' : 'Show Stencil'}
      </button>
    </div>
  )
}
