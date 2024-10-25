import { Box, Button, ButtonGroup, IconButton, Typography } from "@mui/joy";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ScissorsLineDashed,
  Image as ImageIcon,
} from "lucide-react";
import { DragEvent, ChangeEvent, useRef, useState, useEffect, useCallback } from "react";
import Cut, { CUT_SIZE, CutType } from "./components/Cut";
import Main from "./components/Main";
import { saveAs } from "file-saver";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [cuts, setCuts] = useState<CutType[][]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const cutsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleReceivedFiles = (receivedFiles: File[]) => {
    const validFiles = receivedFiles.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== receivedFiles.length) {
      alert("Some files were not images and have been ignored.");
    }
    setFiles(validFiles);
    setCuts(Array(validFiles.length).fill([]));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % files.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex - 1 + files.length) % files.length);
  };

  const handleOnInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    handleReceivedFiles(Array.from(event.target.files));
  };

  const handleOnDrag = (event: DragEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  const handleOnDrop = (event: DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleReceivedFiles(Array.from(event.dataTransfer!.files));
  };

  useEffect(() => {
    if (!files.length || !canvasRef.current) {
      return;
    }

    const img = new Image();
    img.onload = () => {
      canvasRef.current!.height = img.naturalHeight;
      canvasRef.current!.width = img.naturalWidth;

      const context = canvasRef.current!.getContext("2d");
      context?.drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(files[activeImageIndex]);

    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [files, activeImageIndex]);

  const handleRemoveCut = (cutId: string) => {
    setCuts((cuts) => {
      const newCuts = cuts.map((cutsArray, index) => {
        if (index !== activeImageIndex) return cutsArray;
        return cutsArray.filter((cut) => cut.id !== cutId);
      });
      return newCuts;
    });
  };

  const handleAddCut = () => {
    const id = uuidv4();

    setCuts((cuts) => {
      const newCuts = [...cuts];
      newCuts[activeImageIndex] = [
        ...newCuts[activeImageIndex],
        {
          id,
          x: cutsRef.current!.clientWidth / 2 + window.scrollX - CUT_SIZE,
          y: window.innerHeight / 2 + window.scrollY - CUT_SIZE,
          width: CUT_SIZE * 2,
          height: CUT_SIZE * 2,
        },
      ];
      return newCuts;
    });
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
  };

  const handleResizeCut = (cutId: string, x: number, y: number, width: number, height: number) => {
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
  };

  const toBlobAsync = (canvas: HTMLCanvasElement, type: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, type);
    });
  };

	const processCuts = async (
		img: HTMLImageElement,
		cutsArray: CutType[],
		fileName: string
	) => {
		for (let i = 0; i < cutsArray.length; i++) {
			const { x: cutX, y: cutY, width, height } = cutsArray[i];
	
			let w = width;
			let h = height;
			let x = cutX;
			let y = cutY;
	
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d") as CanvasRenderingContext2D;
	
			// Out of bounds check
			if (x < 0) {
				w += x;
				x = 0;
			}
			if (y < 0) {
				h += y;
				y = 0;
			}
			if (x + w > img.naturalWidth) {
				w = img.naturalWidth - x;
			}
			if (y + h > img.naturalHeight) {
				h = img.naturalHeight - y;
			}
	
			canvas.width = w;
			canvas.height = h;
			context.fillStyle = "white";
			context.fillRect(0, 0, w, h);
			context.drawImage(img, -x, -y);
	
			const blob = await toBlobAsync(canvas, "image/png");
			if (blob) {
				saveAs(blob, `${fileName} (cut ${i + 1}).png`);
			}
		}
	};	

  const handleDownload = async (index: number) => {
    const img = new Image();
    img.onload = async () => {
      await processCuts(img, cuts[index], files[index].name);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${files[index].name}`);
    };
    img.src = URL.createObjectURL(files[index]);
  };

  const handleDownloadAll = () => {
    files.forEach((file, index) => {
      const img = new Image();
      img.onload = async () => {
        await processCuts(img, cuts[index], file.name);
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${file.name}`);
      };
      img.src = URL.createObjectURL(file);
    });
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
        <Box
          component="div"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            placeContent: "center",
            margin: 3,
            padding: 3,
            borderRadius: 8,
            border: "4px dotted",
            borderColor: "primary.500",
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleOnDrag}
          onDrop={handleOnDrop}
        >
          <Typography color="primary" level="title-lg">
            Click or Drag an image(s) here
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            component="header"
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              padding: 3,
              gap: 3,
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              zIndex: 1000,
              backgroundColor: "primary.50",
            }}
          >
            <Button
              color="neutral"
              variant="outlined"
              startDecorator={<ImageIcon />}
              onClick={() => inputRef.current?.click()}
            >
              Load image
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Button
                aria-label="Add a new cut (Shortcut: Space)"
                title="Add a new cut (Shortcut: Space)"
                color="success"
                startDecorator={<ScissorsLineDashed />}
                onClick={handleAddCut}
              >
                Add cut
              </Button>

              {files.length > 1 && (
                <ButtonGroup color="primary">
                  <IconButton onClick={handlePrevImage}>
                    <ArrowLeft />
                  </IconButton>

                  <Button
                    sx={{
                      pointerEvents: "none",
                    }}
                  >
                    {activeImageIndex + 1} / {files.length}
                  </Button>

                  <IconButton onClick={handleNextImage}>
                    <ArrowRight />
                  </IconButton>
                </ButtonGroup>
              )}
            </Box>

            <ButtonGroup>
              <Button
                startDecorator={<Download />}
                onClick={() => handleDownload(activeImageIndex)}
                color="primary"
                disabled={cuts[activeImageIndex].length === 0}
              >
                Cut this image
              </Button>

              {cuts.some((cutsArray) => cutsArray.length > 0) && (
                <Button startDecorator={<Download />} color="success" onClick={handleDownloadAll}>
                  Cut all images
                </Button>
              )}
            </ButtonGroup>
          </Box>

          <Box
            sx={{
              marginTop: "84px",
              padding: 3,
              display: "flex",
              flex: 1,
            }}
          >
            <Box
              ref={cutsRef}
              sx={{
                margin: "0 auto",
                position: "relative",
              }}
            >
              {cuts[activeImageIndex].map(({ id, ...otherProps }) => (
                <Cut
                  key={id}
                  id={id}
                  {...otherProps}
                  onRemove={() => handleRemoveCut(id)}
                  onMove={(x, y) => handleMoveCut(id, x, y)}
                  onResize={(x, y, w, h) => handleResizeCut(id, x, y, w, h)}
                />
              ))}
              <Box
                component="canvas"
                ref={canvasRef}
                sx={{
                  pointerEvents: "none",
                }}
              />
            </Box>
          </Box>
        </>
      )}
    </Main>
  );
};

export default App;
