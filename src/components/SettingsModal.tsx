import { useState, SyntheticEvent } from "react";
import { IconButton, Modal, Box, Typography, Switch, Select, Option, Tooltip } from "@mui/joy";
import { Settings, Cog } from "lucide-react"; // Use a suitable settings icon
import { useColorScheme } from "@mui/joy/styles";
import { useTranslation } from "react-i18next";

const SettingsModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { mode, setMode } = useColorScheme();
  const { t, i18n } = useTranslation();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleLanguageChange = (
    _: SyntheticEvent | null,
    value: string | null
  ) => {
    if (!value) return;

    i18n.changeLanguage(value);
  };

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
      <Tooltip title={t('settings.tooltip')} placement="top">
        <IconButton
          variant="solid"
          color="primary"
          onClick={handleOpen}
          aria-label={t('settings.tooltip')}
          sx={{
            position: "fixed",
            bottom: 24,
            left: 80, // Adjust based on the About Icon Button's position and size
            zIndex: 1000,
          }}
        >
          <Cog />
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
              {t('settings.title')}
            </Typography>
            <Box component={Settings} sx={{ ml: 0.5, strokeWidth: 3 }} size={21} color="primary.500" />
          </Box>

          {/** Theme Toggle */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography sx={{ mr: 1 }}>{t('settings.darkMode')}</Typography>
            <Switch
              checked={mode === 'dark'}
              onChange={() => setMode(mode === 'light' ? 'dark' : 'light')}
              variant="outlined"
            />
          </Box>

          {/** Language Selector */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <Typography sx={{ mr: 1 }}>{t('settings.language')}</Typography>
            <Select
              value={i18n.language}
              defaultValue="en"
              onChange={handleLanguageChange}
              variant="outlined"
              aria-label={t('settings.language')}
            >
              <Option value="en">English</Option>
              <Option value="pl">Polski</Option>
              <Option value="de">Deutsch</Option>
              <Option value="fr">Français</Option>
              <Option value="es">Español</Option>
              <Option value="pt">Português</Option>
              <Option value="it">Italiano</Option>
              <Option value="sv">Svenska</Option>
              <Option value="ja">日本語</Option>
              <Option value="ko">한국어</Option>
              <Option value="hi">हिन्दी</Option>
              <Option value="zh-TW">繁體中文</Option>
              <Option value="id">Bahasa Indonesia</Option>
              <Option value="ar">العربية</Option>
              <Option value="tr">Türkçe</Option>
              <Option value="uk">Украінська</Option>
              <Option value="ru">Русский</Option>
            </Select>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default SettingsModal;
