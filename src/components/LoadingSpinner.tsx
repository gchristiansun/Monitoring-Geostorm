import React from "react";

interface LoadingSpinnerProps {
  size?: number;      // diameter spinner
  color?: string;     // warna spinner
  thickness?: number; // ketebalan garis
}

export default function LoadingSpinner({ size = 40, color = "#ff7300", thickness = 4 }: LoadingSpinnerProps) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    border: `${thickness}px solid ${color}33`, // 33 = 20% opacity
    borderTop: `${thickness}px solid ${color}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "auto",
  };

  return (
    <>
      <div style={style}></div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}