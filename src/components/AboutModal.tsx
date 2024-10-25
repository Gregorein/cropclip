import React, { useState } from "react";
import { IconButton, Modal, Box, Typography, Link, Switch, useColorScheme } from "@mui/joy";
import { Crop, HelpCircle } from "lucide-react";
import packageJson from "../../package.json";

const AboutModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { mode, setMode } = useColorScheme();

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
    display: "flex",
    flexDirection: "column",
    gap: 2,
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
            gap: 1
          }}
          >
            <Typography level="title-lg" component="h2">
              About <Typography color="primary">CropClip</Typography>
            </Typography>
            <Box component={Crop} sx={{ ml: 0.5, strokeWidth: 3 }} size={21}  color="primary.500" />
          </Box>

          {/** description */}
          <Typography>
            CropClip is a simple tool to cut out sections from your images.
            Load your images, add cuts, adjust them, and download the cropped
            sections.
          </Typography>

          {/** keyboard shortcuts */}
          <Typography>
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

          {/** mode toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center'}}>
            <Typography sx={{ mr: 1 }}>Dark Mode</Typography>
            <Switch
              checked={mode === 'dark'}
              onChange={() => setMode(mode === 'light' ? 'dark' : 'light')}
              variant="outlined"
            />
          </Box>

          {/** patreon link */}
          <Typography>
            If you find this application helpful, please consider supporting me on{' '}
            <Link href="https://www.patreon.com/yourusername" target="_blank">
              Patreon
            </Link>.
          </Typography>

          {/** github repo link */}
          <Typography>
            <Link
              href="https://github.com/Gregorein/cropclip"
              target="_blank"
              rel="noopener"
            >
              GitHub Repository
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
