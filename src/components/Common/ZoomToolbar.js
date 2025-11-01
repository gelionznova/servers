import { useZoom } from '@embedpdf/plugin-zoom/react'
 
export const ZoomToolbar = () => {
  const { provides: zoom, state } = useZoom()
 
  if (!zoom) {
    return null
  }
 
  return (
    <div className="toolbar">
      {/* Display current zoom */}
      <span>{Math.round(state.currentZoomLevel * 100)}%</span>
 
      {/* Buttons to control zoom */}
      <button onClick={zoom.zoomOut}>-</button>
      <button onClick={zoom.zoomIn}>+</button>
      <button onClick={() => zoom.requestZoom(1.0)}>Reset</button>
 
      {/* Button to toggle area zoom mode */}
      <button onClick={zoom.toggleMarqueeZoom}>Area Zoom</button>
    </div>
  )
}