import React from 'react'

const ImagePlaceholder = ({ 
  width = 200, 
  height = 200, 
  text = "Image", 
  bgColor = "#f3f4f6",
  textColor = "#6b7280",
  className = ""
}) => {
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500'
      }}
    >
      {text}
    </div>
  )
}

export default ImagePlaceholder
