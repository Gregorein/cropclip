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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      <Tooltip title={t('toolbar.loadImages')} placement="right">
        <IconButton onClick={onLoadImages} variant="outlined" aria-label={t('toolbar.loadImages')}>
          <ImageIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title={t('toolbar.addCut')} placement="right">
        <IconButton onClick={onAddCut} variant="solid" color="success" aria-label={t('toolbar.addCut')}>
          <ScissorsLineDashed />
        </IconButton>
      </Tooltip>

      <Tooltip title={t('toolbar.zoomIn')} placement="right">
        <IconButton onClick={onZoomIn} aria-label={t('toolbar.zoomIn')}>
          <ZoomIn />
        </IconButton>
      </Tooltip>

      <Typography sx={{ textAlign: "center", fontSize: "12px", paddingX: 0.5 }}>
        {Math.round(zoomLevel * 100)}%
      </Typography>

      <Tooltip title={t('toolbar.zoomOut')} placement="right">
        <IconButton onClick={onZoomOut} aria-label={t('toolbar.zoomOut')}>
          <ZoomOut />
        </IconButton>
      </Tooltip>

      <Tooltip title={t('toolbar.resetZoom')} placement="right">
        <IconButton onClick={onResetZoom} aria-label={t('toolbar.resetZoom')}>
          <RefreshCcw />
        </IconButton>
      </Tooltip>

      <Tooltip title={t('toolbar.fitToWindow')} placement="right">
        <IconButton onClick={onFitToWindow} aria-label={t('toolbar.fitToWindow')}>
          <Maximize />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Toolbar;
