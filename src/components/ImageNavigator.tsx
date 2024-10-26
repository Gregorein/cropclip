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
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  CircularProgress,
} from "@mui/joy";
import { ArrowLeft, ArrowRight, FileArchive, ImageDown, XCircle } from "lucide-react";
import { useTheme } from "@mui/joy/styles";
import { CutType } from "./Cut";
import { useTranslation } from "react-i18next";

type ImageNavigatorProps = {
  files: File[];
  activeImageIndex: number;
  onPrevImage: () => void;
  onNextImage: () => void;
  onSelectImage: (index: number) => void;
  viewport: { x: number; y: number; width: number; height: number };
  cutsContainerRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  cuts: CutType[][];
  downloadedCuts: boolean[];
  handleDownload: (index: number) => void;
  handleDownloadAll: () => void;
  hasCuts: boolean;
  hasCutsInAnyImage: boolean;
  handleRemoveCut: (index: number, cutId: string) => void;
};

const ImageNavigator: React.FC<ImageNavigatorProps> = ({
  files,
  activeImageIndex,
  onPrevImage,
  onNextImage,
  onSelectImage,
  viewport,
  cutsContainerRef,
  zoom,
  cuts,
  downloadedCuts,
  handleDownload,
  handleDownloadAll,
  hasCuts,
  hasCutsInAnyImage,
  handleRemoveCut,
}) => {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const devicePixelRatio = window.devicePixelRatio || 1;
  const [cutPreviews, setCutPreviews] = useState<{ [key: string]: string }>({});
  const [expandedAccordions, setExpandedAccordions] = useState<number[]>([]);

  useEffect(() => {
    setExpandedAccordions([activeImageIndex]);
  }, [activeImageIndex]);

  const handleAccordionChange = (index: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions((prevExpanded) => {
      if (isExpanded) {
        return [...prevExpanded, index];
      } else {
        return prevExpanded.filter((i) => i !== index);
      }
    });
  };

  useEffect(() => {
    return () => {
      // Clean up all object URLs
      Object.values(cutPreviews).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [cutPreviews]);  

  const getCutPreviewUrl = (imageIndex: number, cut: CutType): string => {
    const key = `${imageIndex}-${cut.id}-${cut.x}-${cut.y}-${cut.width}-${cut.height}`;
    if (cutPreviews[key]) {
      return cutPreviews[key];
    } else {
      generateCutPreview(imageIndex, cut, key);
      return "";
    }
  };

  const generateCutPreview = (imageIndex: number, cut: CutType, key: string) => {
    const file = files[imageIndex];
    const objectUrl = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      const { x, y, width, height } = cut;

      canvas.width = 32;
      canvas.height = 32;

      // Calculate scale to fit the cut into the preview size
      const scale = Math.min(32 / width, 32 / height);

      const drawWidth = width * scale;
      const drawHeight = height * scale;

      context.drawImage(
        img,
        x,
        y,
        width,
        height,
        (32 - drawWidth) / 2,
        (32 - drawHeight) / 2,
        drawWidth,
        drawHeight
      );

      const dataUrl = canvas.toDataURL("image/png");

      setCutPreviews((prev) => ({
        ...prev,
        [key]: dataUrl,
      }));

      // Revoke the object URL after image has loaded
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      console.error("Failed to load cut preview.");
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  useEffect(() => {
    if (!previewRef.current || files.length === 0) return;

    const file = files[activeImageIndex];
    const objectUrl = URL.createObjectURL(file);

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
    img.onerror = () => {
      console.error("Failed to load image preview.");
    };
    img.src = objectUrl;

    return () => {
      // Clean up the object URL
      URL.revokeObjectURL(objectUrl);
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
        maxHeight: "calc(100vh - 32px)",
        overflow: "hidden",
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
        <Tooltip title={t('imageNavigator.previousImage')} placement="top">
          <IconButton
            onClick={onPrevImage}
            variant="outlined"
            aria-label={t('imageNavigator.previousImage')}
            disabled={activeImageIndex === 0}
          >
            <ArrowLeft />
          </IconButton>
        </Tooltip>
        <Typography sx={{ textAlign: "center", fontSize: "14px" }}>
          {activeImageIndex + 1} / {files.length}
        </Typography>
        <Tooltip title={t('imageNavigator.nextImage')} placement="top">
          <IconButton
            onClick={onNextImage}
            variant="outlined"
            aria-label={t('imageNavigator.nextImage')}
            disabled={activeImageIndex === files.length - 1}
          >
            <ArrowRight />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Scrollable List of Image Names */}
      <List
        sx={{
          "--ListItem-minHeight": "32px",
          overflowY: "auto",
          flex: 1,
        }}
      >
        {files.map((file, index) => {
          const cutsCount = cuts[index]?.length || 0;
          const hasCuts = cutsCount > 0;

          return (
            <React.Fragment key={index}>
              {hasCuts ? (
                <Accordion
                  sx={{ bgcolor: downloadedCuts[index] ? "success.200" : "transparent" }}
                  expanded={expandedAccordions.includes(index)}
                  onChange={handleAccordionChange(index)}
                >
                  <AccordionSummary>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography
                        noWrap
                        sx={{ fontSize: "12px", flexGrow: 1 }}
                        onClick={() => onSelectImage(index)}
                      >
                        {file.name}
                      </Typography>
                      <Badge
                        badgeContent={cutsCount}
                        color="primary"
                        size="sm"
                        variant={index === activeImageIndex ? "solid" : "outlined"}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ padding: 0 }}>
                    <List>
                      {cuts[index].map((cut, cutIndex) => {
                        const preview = getCutPreviewUrl(index, cut);
                        return (
                          <ListItem key={cut.id} sx={{ padding: "4px 8px" }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              {/* Cut Image Preview */}
                              {preview ? (
                                <Avatar
                                  src={preview}
                                  sx={{
                                    mr: 1,
                                    borderRadius: 4,
                                    width: 32,
                                    height: 32,
                                  }}
                                />
                              ) : (
                                <CircularProgress 
                                  sx={{
                                    mr: 1,
                                  }}
                                />
                              )}
                              <Typography sx={{ fontSize: "12px", flexGrow: 1 }}>
                                {t('imageNavigator.cutLabel', { number: cutIndex + 1 })}
                              </Typography>
                              {/* Remove Cut Button */}
                              <IconButton
                                size="sm"
                                variant="plain"
                                color="danger"
                                onClick={() => handleRemoveCut(index, cut.id)}
                                aria-label={t('common.close')}
                              >
                                <XCircle size={16} />
                              </IconButton>
                            </Box>
                          </ListItem>
                        );
                      })}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ) : (
                // Simple List Item for images without cuts
                <ListItem>
                  <ListItemButton
                    selected={index === activeImageIndex}
                    onClick={() => onSelectImage(index)}
                    sx={{
                      padding: "4px 8px",
                      bgcolor: downloadedCuts[index] ? "success.200" : "transparent",
                    }}
                  >
                    <Typography noWrap sx={{ fontSize: "12px", flexGrow: 1 }}>
                      {file.name}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          );
        })}
      </List>

      {/* Download Buttons */}
      <ButtonGroup variant="soft" orientation="vertical">
        <Tooltip title={t('imageNavigator.cutCurrentImage')} placement="left">
          <Button
            startDecorator={<ImageDown />}
            onClick={() => handleDownload(activeImageIndex)}
            disabled={!hasCuts}
            fullWidth
            aria-label={t('imageNavigator.cutCurrentImage')}
          >
            {t('imageNavigator.cutCurrentImage')}
          </Button>
        </Tooltip>
        {hasCutsInAnyImage && (
          <Tooltip title={t('imageNavigator.cutAndZipAllImages')} placement="left">
            <Button
              onClick={() => handleDownloadAll()}
              startDecorator={<FileArchive />}
              disabled={!hasCutsInAnyImage}
              color="success"
              fullWidth
              aria-label={t('imageNavigator.cutAndZipAllImages')}
            >
              {t('imageNavigator.cutAndZipAllImages')}
            </Button>
          </Tooltip>
        )}
      </ButtonGroup>
    </Box>
  );
};

export default ImageNavigator;
