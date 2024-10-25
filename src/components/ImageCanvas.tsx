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
      {cuts.map(({ id, ...otherProps }) => (
        <Cut
          key={id}
          id={id}
          {...otherProps}
          onRemove={() => onRemoveCut(id)}
          onMove={(x, y) => onMoveCut(id, x, y)}
          onResize={(x, y, w, h) => onResizeCut(id, x, y, w, h)}
        />
      ))}
    </Box>
  );
};

export default ImageCanvas;
