import { CssVarsProvider } from '@mui/joy'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import "./style.css"

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <StrictMode>
		<CssVarsProvider defaultMode="light">
			<App />
		</CssVarsProvider>
  </StrictMode>
)
