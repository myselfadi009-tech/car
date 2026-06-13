import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import store from './redux/store.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#050505',
                color: '#fff',
                border: '1px solid #FF8A00',
                borderRadius: '12px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#FF8A00', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ff4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);
