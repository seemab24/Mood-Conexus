import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import store from './components/Redux/store.js'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom' // ✅ Add this
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/Mood-Conexus/">  {/* ✅ Important */}
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
)
