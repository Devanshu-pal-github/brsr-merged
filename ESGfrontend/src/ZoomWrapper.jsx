import { useState, useEffect } from 'react';

const ZoomWrapper = ({ children }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const updateZoomLevel = () => {
    // Detect zoom level by comparing the window's inner width to its expected width
    // This is an approximation and may need adjustment based on your app's needs
    const defaultWidth = window.screen.availWidth; // Screen width at 100% zoom
    const currentWidth = window.innerWidth; // Current viewport width
    const detectedZoom = defaultWidth / currentWidth;

    // Ensure zoomLevel is never 0 to avoid division by zero
    const safeZoom = Math.max(detectedZoom, 0.1);
    setZoomLevel(safeZoom);
  };

  useEffect(() => {
    // Initial zoom level
    updateZoomLevel();

    // Update zoom level on resize (which includes zoom changes)
    window.addEventListener('resize', updateZoomLevel);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateZoomLevel);
    };
  }, []);

  // Calculate inverse scale: if zoomLevel is 1.5 (zoom in), scale should be 1/1.5 = 0.67
  const inverseScale = 1 / zoomLevel;

  return (
    <div
      style={{
        transform: `scale(${inverseScale})`,
        transformOrigin: 'top left',
        width: `${zoomLevel * 100}%`, // Adjust width to counteract the scaling
        height: `${zoomLevel * 100}%`, // Adjust height to counteract the scaling
        transition: 'transform 0.2s ease-in-out', // Smooth transition
      }}
    >
      {children}
    </div>
  );
};

export default ZoomWrapper;