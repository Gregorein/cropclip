import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Tooltip,
  Badge,
  ButtonGroup,
  Button,
} from "@mui/joy";
import { ArrowLeft, ArrowRight, ImageDown } from "lucide-react";
import { useTheme } from "@mui/joy/styles";
import { CutType } from "./Cut";

type ImageNavigatorProps = {
  files: File[];
  activeImageIndex: number;
  onPrevImage: () => void;
  onNextImage: () => void;
  onSelectImage: (index: number) => void;
  canvasWidth: number;
  canvasHeight: number;
  viewport: { x: number; y: number; width: number; height: number };
  cutsContainerRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  cuts: CutType[][];
  downloadedCuts: boolean[];
  handleDownload: (index: number) => void;
  handleDownloadAll: () => void;
  hasCuts: boolean;
  hasCutsInAnyImage: boolean;
};

const ImageNavigator: React.FC<ImageNavigatorProps> = ({
  files,
  activeImageIndex,
  onPrevImage,
  onNextImage,
  onSelectImage,
  canvasWidth,
  canvasHeight,
  viewport,
  cutsContainerRef,
  zoom,
  cuts,
  downloadedCuts,
  handleDownload,
  handleDownloadAll,
  hasCuts,
  hasCutsInAnyImage,
}) => {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const devicePixelRatio = window.devicePixelRatio || 1;

  useEffect(() => {
    if (!previewRef.current || files.length === 0) return;

    const img = new Image();
    img.onload = () => {
      setImgElement(img);

      const canvas = previewRef.current!;
      const context = canvas.getContext("2d")!;

      const canvasDisplayWidth = 200; // Desired display width
      const canvasDisplayHeight = (img.height / img.width) * canvasDisplayWidth;

      canvas.width = canvasDisplayWidth * devicePixelRatio;
      canvas.height = canvasDisplayHeight * devicePixelRatio;

      canvas.style.width = `${canvasDisplayWidth}px`;
      canvas.style.height = `${canvasDisplayHeight}px`;

      context.scale(devicePixelRatio, devicePixelRatio);

      context.clearRect(0, 0, canvasDisplayWidth, canvasDisplayHeight);
      context.drawImage(img, 0, 0, canvasDisplayWidth, canvasDisplayHeight);

      // Draw the viewport rectangle
      const rectX = (viewport.x / img.width) * canvasDisplayWidth;
      const rectY = (viewport.y / img.height) * canvasDisplayHeight;
      const rectWidth = (viewport.width / img.width) * canvasDisplayWidth;
      const rectHeight = (viewport.height / img.height) * canvasDisplayHeight;

      context.strokeStyle = theme.palette.primary[500];
      context.lineWidth = 4;
      context.strokeRect(rectX, rectY, rectWidth, rectHeight);

      context.fillStyle = "rgba(0, 123, 255, 0.2)";
      context.fillRect(rectX, rectY, rectWidth, rectHeight);
    };
    img.src = URL.createObjectURL(files[activeImageIndex]);

    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [files, activeImageIndex, viewport, theme, devicePixelRatio]);

  // Mouse event handlers
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!previewRef.current || !imgElement) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const canvasWidth = previewRef.current.width / devicePixelRatio;
    const canvasHeight = previewRef.current.height / devicePixelRatio;

    const rectX = (viewport.x / imgElement.width) * canvasWidth;
    const rectY = (viewport.y / imgElement.height) * canvasHeight;
    const rectWidth = (viewport.width / imgElement.width) * canvasWidth;
    const rectHeight = (viewport.height / imgElement.height) * canvasHeight;

    // Check if the click is inside the viewport rectangle
    if (
      x >= rectX &&
      x <= rectX + rectWidth &&
      y >= rectY &&
      y <= rectY + rectHeight
    ) {
      setIsDragging(true);
      setDragStart({ x, y });
      previewRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !cutsContainerRef.current || !imgElement) return;

    const rect = previewRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const deltaX = x - dragStart!.x;
    const deltaY = y - dragStart!.y;

    const canvasWidth = previewRef.current!.width / devicePixelRatio;
    const canvasHeight = previewRef.current!.height / devicePixelRatio;

    const imgWidth = imgElement.width;
    const imgHeight = imgElement.height;

    const scaleX = imgWidth / canvasWidth;
    const scaleY = imgHeight / canvasHeight;

    cutsContainerRef.current.scrollLeft += deltaX * scaleX * zoom;
    cutsContainerRef.current.scrollTop += deltaY * scaleY * zoom;

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (previewRef.current) {
      previewRef.current.style.cursor = "grab";
    }
  };

  const handleMouseOver = () => {
    if (previewRef.current && !isDragging) {
      previewRef.current.style.cursor = "grab";
    }
  };

  const handleMouseOut = () => {
    setIsDragging(false);
    if (previewRef.current) {
      previewRef.current.style.cursor = "default";
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        zIndex: 1000,
        backgroundColor: "background.surface",
        padding: 1,
        borderRadius: "md",
        boxShadow: "md",
        width: 220,
        maxHeight: "80vh",
      }}
    >
      {/* Image Preview Section */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "auto",
          backgroundColor: "background.level1",
          borderRadius: "sm",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={previewRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          style={{ display: "block" }}
        />
      </Box>

      {/* Image Navigation Controls */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Tooltip title="Previous Image" placement="top">
          <IconButton
            onClick={onPrevImage}
            disabled={activeImageIndex === 0}
            variant="outlined"
          >
            <ArrowLeft />
          </IconButton>
        </Tooltip>
        <Typography sx={{ textAlign: "center", fontSize: "14px" }}>
          {activeImageIndex + 1} / {files.length}
        </Typography>
        <Tooltip title="Next Image" placement="top">
          <IconButton
            onClick={onNextImage}
            disabled={activeImageIndex === files.length - 1}
            variant="outlined"
          >
            <ArrowRight />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Scrollable List of Image Names */}
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        <List
          sx={{
            "--ListItem-minHeight": "32px",
          }}
        >
          {files.map((file, index) => (
            <ListItem key={index}>
              <ListItemButton
                selected={index === activeImageIndex}
                onClick={() => onSelectImage(index)}
              >
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <Typography noWrap sx={{ fontSize: "12px", flexGrow: 1 }}>
                  {file.name}
                </Typography>
                {cuts[index]?.length > 0 && (
                  <Badge
                    badgeContent={cuts[index].length}
                    color="primary"
                    size="sm"
                    variant={(index === activeImageIndex) ? "solid" : "outlined"}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <ButtonGroup variant="soft">
        <Button
          startDecorator={<ImageDown />}
          onClick={() => handleDownload(activeImageIndex)}
          // disabled={!hasCuts}
          fullWidth
          sx={{
            whiteSpace: "nowrap",
          }}
        >
          Cut image
        </Button>
        {/* {hasCutsInAnyImage && ( */}
          <Button
            onClick={() => handleDownloadAll()}
            // disabled={!hasCuts}
            color="success"
            fullWidth
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Cut all
          </Button>
        {/* )} */}
      </ButtonGroup>
    </Box>
  );
};

export default ImageNavigator;
