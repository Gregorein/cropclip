import {
  useRef,
  useState,
  useEffect,
  useCallback,
  DragEvent,
  ChangeEvent,
} from "react";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Main from "./components/Main";
import SplashScreen from "./components/SplashScreen";
import Editor from "./components/Editor";
import { CutType, CUT_SIZE } from "./components/Cut";
import AboutModal from "./components/AboutModal";
import { handleFileSelection, processCuts } from "./utils";
import SettingsModal from "./components/SettingsModal";

const App = () => {
  // State declarations
  const [files, setFiles] = useState<File[]>([]);
  const [cuts, setCuts] = useState<CutType[][]>([]);
  const [downloadedCuts, setDownloadedCuts] = useState<boolean[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const cutsRef = useRef<HTMLDivElement>(null);
  const cutsContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file selection
  const handleReceivedFiles = (receivedFiles: File[]) => {
    const {
      validFiles,
      initialCuts,
      initialDownloadedCuts,
    } = handleFileSelection(receivedFiles);

    setFiles(validFiles);
    setCuts(initialCuts);
    setDownloadedCuts(initialDownloadedCuts);
  };

  // Image navigation handlers
  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % files.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex(
      (prevIndex) => (prevIndex - 1 + files.length) % files.length
    );
  };

  const handleSelectImage = (index: number) => {
    setActiveImageIndex(index);
  };

  // File input handlers
  const handleOnInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    handleReceivedFiles(Array.from(event.target.files));
  };

  const handleOnDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleOnDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleReceivedFiles(Array.from(event.dataTransfer.files));
  };

  // Load and display the current image
  useEffect(() => {
    if (!files.length || !canvasRef.current) {
      return;
    }

    const img = new Image();
    img.onload = () => {
      canvasRef.current!.height = img.naturalHeight;
      canvasRef.current!.width = img.naturalWidth;

      setCanvasWidth(img.naturalWidth);
      setCanvasHeight(img.naturalHeight);

      const context = canvasRef.current!.getContext("2d");
      context?.drawImage(img, 0, 0);

      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(files[activeImageIndex]);

    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [files, activeImageIndex]);

  // Cut manipulation handlers
  const handleAddCut = () => {
    const id = uuidv4();

    const containerRect = cutsRef.current?.getBoundingClientRect();
    const containerX = containerRect?.left || 0;
    const containerY = containerRect?.top || 0;

    const x = window.innerWidth / 2 - containerX - CUT_SIZE;
    const y = window.innerHeight / 2 - containerY - CUT_SIZE;

    setCuts((cuts) => {
      const newCuts = [...cuts];
      newCuts[activeImageIndex] = [
        ...newCuts[activeImageIndex],
        {
          id,
          x,
          y,
          width: CUT_SIZE * 2,
          height: CUT_SIZE * 2,
        },
      ];
      return newCuts;
    });

    resetDownloadedStatus(activeImageIndex);
  };

  const handleRemoveCut = (imageIndex: number, cutId: string) => {
    setCuts((cuts) => {
      const newCuts = cuts.map((cutsArray, index) => {
        if (index !== imageIndex) return cutsArray;
        return cutsArray.filter((cut) => cut.id !== cutId);
      });
      return newCuts;
    });

    resetDownloadedStatus(imageIndex);
  };

  const handleMoveCut = (cutId: string, x: number, y: number) => {
    setCuts((cuts) => {
      const newCuts = [...cuts];

      newCuts[activeImageIndex] = newCuts[activeImageIndex].map((cut) => {
        if (cut.id !== cutId) {
          return cut;
        }
        return {
          ...cut,
          x,
          y,
        };
      });

      return newCuts;
    });

    resetDownloadedStatus(activeImageIndex);
  };

  const handleResizeCut = (
    cutId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    setCuts((cuts) => {
      const newCuts = [...cuts];

      newCuts[activeImageIndex] = newCuts[activeImageIndex].map((cut) => {
        if (cut.id !== cutId) {
          return cut;
        }
        return {
          ...cut,
          x,
          y,
          width,
          height,
        };
      });

      return newCuts;
    });

    resetDownloadedStatus(activeImageIndex);
  };

  // Reset download status for an image
  const resetDownloadedStatus = (index: number) => {
    setDownloadedCuts((prevStatus) => {
      const newStatus = [...prevStatus];
      newStatus[index] = false;
      return newStatus;
    });
  };

  // Download handlers
  const handleDownload = async (index: number) => {
    const img = new Image();
    img.onload = async () => {
      await processCuts(img, index, cuts, files, setDownloadedCuts);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${files[index].name}`);
    };
    img.src = URL.createObjectURL(files[index]);
  };

  const handleDownloadAll = () => {
    const zip = new JSZip();

    const imagePromises = files.map((file, index) => {
      return new Promise<void>((resolve, reject) => {
        if (cuts[index]?.length === 0) {
          resolve(); // Skip images without cuts
          return;
        }
        const img = new Image();
        img.onload = async () => {
          await processCuts(img, index, cuts, files, setDownloadedCuts, zip);
          URL.revokeObjectURL(img.src);
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${file.name}`);
          reject();
        };
        img.src = URL.createObjectURL(file);
      });
    });
  
    Promise.all(imagePromises)
      .then(() => {
        // Generate the ZIP file and trigger download
        zip.generateAsync({ type: "blob" }).then((content) => {
          saveAs(content, "all_cuts.zip");
        });
      })
      .catch((error) => {
        console.error("Error processing cuts:", error);
      });
  };

  // Zoom functions
  const handleZoom = (zoomFactor: number) => {
    setZoom((prevZoom) => {
      const newZoom = prevZoom * zoomFactor;
      return Math.min(Math.max(newZoom, 0.1), 4); // Min 10%, Max 400%
    });
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const fitToWindow = () => {
    if (!canvasRef.current || !cutsContainerRef.current) return;

    const canvas = canvasRef.current;
    const container = cutsContainerRef.current;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const imageWidth = canvas.width;
    const imageHeight = canvas.height;

    const widthRatio = containerWidth / imageWidth;
    const heightRatio = containerHeight / imageHeight;

    const newZoom = Math.min(widthRatio, heightRatio);

    setZoom(newZoom);
  };

  // Keyboard shortcuts
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevImage();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextImage();
      }
      if (e.code === "Space") {
        e.preventDefault();
        handleAddCut();
      }
    },
    [files.length] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  const handleLoadImages = () => {
    inputRef.current?.click();
  };

  return (
    <Main>
      <input
        ref={inputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleOnInput}
        multiple
        accept="image/*"
      />

      {files.length === 0 ? (
        <SplashScreen
          onLoadImages={handleLoadImages}
          handleOnDrag={handleOnDrag}
          handleOnDrop={handleOnDrop}
        />
      ) : (
        <Editor
          files={files}
          cuts={cuts}
          downloadedCuts={downloadedCuts}
          activeImageIndex={activeImageIndex}
          zoom={zoom}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          cutsRef={cutsRef}
          cutsContainerRef={cutsContainerRef}
          canvasRef={canvasRef}
          handleLoadImages={handleLoadImages}
          handleAddCut={handleAddCut}
          handlePrevImage={handlePrevImage}
          handleNextImage={handleNextImage}
          handleZoom={handleZoom}
          resetZoom={resetZoom}
          fitToWindow={fitToWindow}
          handleDownload={handleDownload}
          handleDownloadAll={handleDownloadAll}
          handleRemoveCut={handleRemoveCut}
          handleMoveCut={handleMoveCut}
          handleResizeCut={handleResizeCut}
          handleSelectImage={handleSelectImage}
        />
      )}

      <AboutModal />
      <SettingsModal />
    </Main>
  );
};

export default App;
