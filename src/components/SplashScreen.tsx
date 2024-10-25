import React from "react";
import { Box, Typography } from "@mui/joy";
import { Crop } from "lucide-react";

type SplashScreenProps = {
  onLoadImages: () => void;
  handleOnDrag: React.DragEventHandler<HTMLDivElement>;
  handleOnDrop: React.DragEventHandler<HTMLDivElement>;
};

const SplashScreen: React.FC<SplashScreenProps> = ({
  onLoadImages,
  handleOnDrag,
  handleOnDrop,
}) => {
  return (
    <Box
      component="div"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        placeContent: "center",
        alignItems: "center",
        margin: 9,
        padding: 3,
        borderRadius: 30,
        border: "6px dotted",
        borderColor: "primary.500",
        textAlign: "center",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "background.level1",
        },
      }}
      onClick={onLoadImages}
      onDragOver={handleOnDrag}
      onDrop={handleOnDrop}
    >
      <Box
        component={Crop}
        size={80}
        color="primary.500"
      />
      <Typography color="primary" level="h3" sx={{ mt: 2 }}>
        click or drop images here
      </Typography>
      {/* Suggestion: Add a descriptive subtitle */}
      <Typography color="neutral" level="body-md" sx={{ mt: 1 }}>
        Supported formats: JPEG, PNG, GIF, etc.
      </Typography>
    </Box>
  );
};

export default SplashScreen;
