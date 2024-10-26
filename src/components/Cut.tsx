import React from "react";
import { Box, IconButton } from "@mui/joy";
import { Grip, X } from "lucide-react";
import { Rnd } from "react-rnd";

export type CutType = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type CutProps = CutType & {
  onRemove: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (x: number, y: number, width: number, height: number) => void;
};

export const CUT_SIZE = 150;

const Cut: React.FC<CutProps> = ({
  id,
  onRemove,
  onMove,
  onResize,
  x,
  y,
  width,
  height,
}) => {
  return (
    <Rnd
      position={{
        x,
        y,
      }}
      size={{
        width,
        height,
      }}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: false, // Disable top-left resize handle
      }}
      onDragStop={(e, data) => {
        onMove(data.x, data.y);
      }}
      onResizeStop={(e, dir, ref, delta, position) => {
        const newWidth = ref.offsetWidth;
        const newHeight = ref.offsetHeight;
        const newX = position.x;
        const newY = position.y;
        onResize(newX, newY, newWidth, newHeight);
      }}
      style={{
        position: "absolute",
      }}
    >
      <IconButton
        color="primary"
        variant="solid"
        sx={{
          position: "absolute",
          top: -16,
          left: -16,
          zIndex: 1,
        }}
        onClick={onRemove}
      >
        <X />
      </IconButton>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          transition: `
              background-color ease .2s,
              backdrop-filter ease .2s,
              border-color ease .2s,
              color ease .2s
            `,
          backgroundColor: "transparent",
          backdropFilter: "brightness(0.9)",
          border: "4px solid",
          borderColor: "primary.500",
          color: "transparent",
          "&:hover": {
            backgroundColor: "rgba(199, 233, 247, 0.5)",
            backdropFilter: "brightness(1.2)",
            borderColor: "primary.500",
            color: "primary.500",
          },
        }}
      >
        {/* Corner Indicators */}
        <Box
          component={Grip}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        />
        <Box
          component={Grip}
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            zIndex: 1,
          }}
        />
        <Box
          component={Grip}
          sx={{
            position: "absolute",
            bottom: 8,
            left: 8,
            zIndex: 1,
          }}
        />
      </Box>
    </Rnd>
  );
};

export default Cut;
