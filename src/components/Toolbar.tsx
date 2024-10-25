import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/joy";
import {
  Image as ImageIcon,
  ScissorsLineDashed,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
  Maximize,
} from "lucide-react";

type ToolbarProps = {
  onLoadImages: () => void;
  onAddCut: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToWindow: () => void;
  zoomLevel: number;
};

const Toolbar: React.FC<ToolbarProps> = ({
  onLoadImages,
  onAddCut,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToWindow,
  zoomLevel,
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        left: 16,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        zIndex: 1000,
        backgroundColor: "background.surface",
        padding: 1,
        borderRadius: "md",
        boxShadow: "md",
      }}
    >
      <Tooltip title="Load image(s)" placement="right">
        <IconButton onClick={onLoadImages} variant="outlined">
          <ImageIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add a new cut (Shortcut: Space)" placement="right">
        <IconButton onClick={onAddCut} variant="solid" color="success">
          <ScissorsLineDashed />
        </IconButton>
      </Tooltip>

      <Tooltip title="Zoom In" placement="right">
        <IconButton onClick={onZoomIn}>
          <ZoomIn />
        </IconButton>
      </Tooltip>

      <Typography sx={{ textAlign: "center", fontSize: "12px", paddingX: 0.5 }}>
        {Math.round(zoomLevel * 100)}%
      </Typography>

      <Tooltip title="Zoom Out" placement="right">
        <IconButton onClick={onZoomOut}>
          <ZoomOut />
        </IconButton>
      </Tooltip>

      <Tooltip title="Reset Zoom" placement="right">
        <IconButton onClick={onResetZoom}>
          <RefreshCcw />
        </IconButton>
      </Tooltip>

      <Tooltip title="Fit to Window" placement="right">
        <IconButton onClick={onFitToWindow}>
          <Maximize />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Toolbar;
