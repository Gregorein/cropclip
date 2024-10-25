import React, { useState, useEffect } from "react";
import { Box } from "@mui/joy";
import Toolbar from "./Toolbar";
import ImageCanvas from "./ImageCanvas";
import ImageNavigator from "./ImageNavigator";
import { CutType } from "./Cut";

type EditorProps = {
  files: File[];
  cuts: CutType[][];
  downloadedCuts: boolean[];
  activeImageIndex: number;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  cutsRef: React.RefObject<HTMLDivElement>;
  cutsContainerRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  handleLoadImages: () => void;
  handleAddCut: () => void;
  handlePrevImage: () => void;
  handleNextImage: () => void;
  handleZoom: (zoomFactor: number) => void;
  resetZoom: () => void;
  fitToWindow: () => void;
  handleDownload: (index: number) => void;
  handleDownloadAll: () => void;
  handleRemoveCut: (cutId: string) => void;
  handleMoveCut: (cutId: string, x: number, y: number) => void;
  handleResizeCut: (
    cutId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => void;
  handleSelectImage: (index: number) => void;
};

const Editor: React.FC<EditorProps> = ({
  files,
  cuts,
  downloadedCuts,
  activeImageIndex,
  zoom,
  canvasWidth,
  canvasHeight,
  cutsRef,
  cutsContainerRef,
  canvasRef,
  handleLoadImages,
  handleAddCut,
  handlePrevImage,
  handleNextImage,
  handleZoom,
  resetZoom,
  fitToWindow,
  handleDownload,
  handleDownloadAll,
  handleRemoveCut,
  handleMoveCut,
  handleResizeCut,
  handleSelectImage,
}) => {
  const [viewport, setViewport] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateViewport = () => {
      if (!cutsContainerRef.current || !cutsRef.current) return;

      const container = cutsContainerRef.current;

      const containerRect = container.getBoundingClientRect();

      const scrollLeft = container.scrollLeft;
      const scrollTop = container.scrollTop;

      const x = scrollLeft / zoom;
      const y = scrollTop / zoom;
      const width = containerRect.width / zoom;
      const height = containerRect.height / zoom;

      setViewport({ x, y, width, height });
    };

    updateViewport();

    const container = cutsContainerRef.current;
    container!.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);

    return () => {
      container!.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, [cutsContainerRef, zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update viewport when zoom changes
  useEffect(() => {
    if (cutsContainerRef.current) {
      cutsContainerRef.current.dispatchEvent(new Event("scroll"));
    }
  }, [zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Toolbar
        onLoadImages={handleLoadImages}
        onAddCut={handleAddCut}
        onZoomIn={() => handleZoom(1.1)}
        onZoomOut={() => handleZoom(0.9)}
        onResetZoom={resetZoom}
        onFitToWindow={fitToWindow}
        zoomLevel={zoom}
      />

      <Box
        sx={{
          padding: 3,
          display: "block",
          flex: 1,
          overflow: "auto",
          alignItems: "center",
          justifyContent: "center",
        }}
        ref={cutsContainerRef}
      >
        <ImageCanvas
          cuts={cuts[activeImageIndex]}
          onRemoveCut={handleRemoveCut}
          onMoveCut={handleMoveCut}
          onResizeCut={handleResizeCut}
          canvasRef={canvasRef}
          cutsRef={cutsRef}
          canvasWidth={canvasWidth * zoom}
          canvasHeight={canvasHeight * zoom}
        />
      </Box>

      <ImageNavigator
        cutsContainerRef={cutsContainerRef}
        zoom={zoom}
        files={files}
        activeImageIndex={activeImageIndex}
        onPrevImage={handlePrevImage}
        onNextImage={handleNextImage}
        onSelectImage={handleSelectImage}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        viewport={viewport}
        cuts={cuts}
        downloadedCuts={downloadedCuts}
        handleDownload={handleDownload}
        handleDownloadAll={handleDownloadAll}
        hasCuts={cuts[activeImageIndex]?.length > 0}
        hasCutsInAnyImage={cuts.some((cuts) => cuts.length > 0)}
      />
    </>
  );
};

export default Editor;