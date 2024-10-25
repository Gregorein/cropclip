import { saveAs } from "file-saver";
import { CutType } from "./components/Cut";
import JSZip from "jszip";

// Function to handle file selection and validation
export const handleFileSelection = (receivedFiles: File[]) => {
  const validFiles = receivedFiles.filter((file) =>
    file.type.startsWith("image/")
  );
  if (validFiles.length !== receivedFiles.length) {
    alert("Some files were not images and have been ignored.");
  }
  const initialCuts: CutType[][] = Array(validFiles.length).fill([]);
  const initialDownloadedCuts: boolean[] = Array(validFiles.length).fill(false);

  return { validFiles, initialCuts, initialDownloadedCuts };
};

// Function to convert canvas to Blob asynchronously
export const toBlobAsync = (
  canvas: HTMLCanvasElement,
  type: string
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, type);
  });
};

// Function to process cuts and save them as images
export const processCuts = async (
  img: HTMLImageElement,
  index: number,
  cuts: CutType[][],
  files: File[],
  setDownloadedCuts: React.Dispatch<React.SetStateAction<boolean[]>>,
  zip?: JSZip
) => {
  const cutsArray = cuts[index];
  const fileName = files[index].name;

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
      if (zip) {
        const cutFileName = `${fileName} (cut ${i + 1}).png`;
        zip.file(cutFileName, blob);
      } else {
        saveAs(blob, `${fileName} (cut ${i + 1}).png`);
      }
    }
  }

  // Update downloadedCuts after processing all cuts
  setDownloadedCuts((prevStatus) => {
    const newStatus = [...prevStatus];
    newStatus[index] = true;
    return newStatus;
  });
};
