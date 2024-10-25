import { CssVarsProvider } from '@mui/joy';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./style.css";
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider, useThemeMode } from './ThemeContext';

const AppWithTheme = () => {
  const { mode } = useThemeMode();

  return (
    <CssVarsProvider defaultMode={mode} modeStorageKey="themeMode">
      <App />
    </CssVarsProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
    <Analytics />
  </StrictMode>
);
