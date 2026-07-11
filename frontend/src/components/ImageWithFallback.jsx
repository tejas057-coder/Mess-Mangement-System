import React, { useState } from "react";

/**
 * ImageWithFallback renders an <img> and displays a fallback UI if the image fails to load.
 * Props:
 *  - src: image source URL (required)
 *  - alt: alternative text (optional)
 *  - style: inline style object for the img element (optional)
 *  - fallback: React element to display when image loading fails (optional)
 */
export default function ImageWithFallback({ src, alt = "image", style = {}, fallback = null }) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => setHasError(true);

  if (hasError && fallback) {
    return fallback;
  }

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      onError={handleError}
    />
  );
}
