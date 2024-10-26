import React, { useState } from "react";
import { IconButton, Modal, Box, Typography, Link, Tooltip } from "@mui/joy";
import { Crop, HelpCircle } from "lucide-react";
import packageJson from "../../package.json";
import { useTranslation } from "react-i18next";

const AboutModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

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
      <Tooltip title={t('about.tooltip')} placement="top">
        <IconButton
          variant="solid"
          color="primary"
          onClick={handleOpen}
          aria-label={t('about.tooltip')}
          sx={{
            position: "fixed",
            bottom: 24,
            left: 24,
            zIndex: 1000,
          }}
        >
          <HelpCircle />
        </IconButton>
      </Tooltip>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography level="title-lg" component="h2">
              {t('about.title')}
            </Typography>
            <Box component={Crop} sx={{ ml: 0.5, strokeWidth: 3 }} size={21} color="primary.500" />
          </Box>

          {/** Description */}
          <Typography>
            {t('about.description')}
          </Typography>

          {/** Keyboard Shortcuts */}
          <Typography>
            {t('about.keyboardShortcuts')}
            <ul>
              <li>
                <strong>{t('about.shortcut1')}</strong>
              </li>
              <li>
                <strong>{t('about.shortcut2')}</strong>
              </li>
            </ul>
          </Typography>

          {/** Patreon Link */}
          <Typography>
            {t('about.support')}{" "}
            <Link href="https://www.patreon.com/yourusername" target="_blank">
              {t('common.supportPatreon')}
            </Link>.
          </Typography>

          {/** GitHub Repo Link */}
          <Typography>
            <Link
              href="https://github.com/Gregorein/cropclip"
              target="_blank"
              rel="noopener"
            >
              {t('common.githubRepo')}
            </Link>
          </Typography>
          <Typography level="body-md">
            {t('about.version', { version: packageJson.version })}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default AboutModal;
