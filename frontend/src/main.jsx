import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import store from './components/Redux/store.js'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom' // ✅ Use HashRouter instead of BrowserRouter
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </HashRouter>
  </StrictMode>
)
