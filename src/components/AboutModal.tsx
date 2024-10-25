import React, { useState } from "react";
import { IconButton, Modal, Box, Typography, Link } from "@mui/joy";
import { Crop, HelpCircle } from "lucide-react";
import packageJson from "../../package.json";

const AboutModal: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    minWidth: 300,
    maxWidth: "80%",
    bgcolor: "background.surface",
    borderRadius: "md",
    boxShadow: "lg",
    p: 3,
  };

  return (
    <>
      <IconButton
        variant="solid"
        color="primary"
        onClick={handleOpen}
        sx={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 1000,
        }}
      >
        <HelpCircle />
      </IconButton>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box
            sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
          }}
          >
            <Typography level="title-lg" component="h2">
              About <Typography color="primary">CropClip</Typography>
            </Typography>
            <Box component={Crop} sx={{ ml: 0.5, strokeWidth: 3 }} size={21}  color="primary.500" />
          </Box>
          <Typography sx={{ mb: 2 }}>
            CropClip is a simple tool to cut out sections from your images.
            Load your images, add cuts, adjust them, and download the cropped
            sections.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Keyboard Shortcuts:
            <ul>
              <li>
                <strong>Space:</strong> Add a new cut
              </li>
              <li>
                <strong>Arrow Left/Right:</strong> Navigate between images
              </li>
            </ul>
          </Typography>
          <Typography sx={{ mb: 2 }}>
            <Link
              href="https://github.com/Gregorein/cropclip"
              target="_blank"
              rel="noopener"
            >
              Visit our GitHub Repository
            </Link>
          </Typography>
          <Typography level="body-md">
            Version: {packageJson.version}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default AboutModal;
