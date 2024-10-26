import React from "react";
import { Box } from "@mui/joy";
import Cut, { CutType } from "./Cut";

type ImageCanvasProps = {
  cuts: CutType[];
  onRemoveCut: (cutId: string) => void;
  onMoveCut: (cutId: string, x: number, y: number) => void;
  onResizeCut: (
    cutId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  cutsRef: React.RefObject<HTMLDivElement>;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number; // Add zoom prop
};

const ImageCanvas: React.FC<ImageCanvasProps> = ({
  cuts,
  onRemoveCut,
  onMoveCut,
  onResizeCut,
  canvasRef,
  cutsRef,
  canvasWidth,
  canvasHeight,
  zoom,
}) => {
  return (
    <Box
      ref={cutsRef}
      sx={{
        margin: "0 auto",
        position: "relative",
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        minWidth: `${canvasWidth}px`,
        minHeight: `${canvasHeight}px`,
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{
          pointerEvents: "none",
          width: "100%",
          height: "100%",
        }}
      />
      {cuts.map(({ id, x, y, width, height }) => (
        <Cut
          key={id}
          id={id}
          x={x * zoom}
          y={y * zoom}
          width={width * zoom}
          height={height * zoom}
          onRemove={() => onRemoveCut(id)}
          onMove={(newX, newY) => onMoveCut(id, newX / zoom, newY / zoom)}
          onResize={(newX, newY, newWidth, newHeight) =>
            onResizeCut(id, newX / zoom, newY / zoom, newWidth / zoom, newHeight / zoom)
          }
        />
      ))}
    </Box>
  );
};

export default ImageCanvas;
