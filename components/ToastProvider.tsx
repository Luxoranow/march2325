'use client';

import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ToastProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Use Portal to render the ToastContainer into the #toast-container div
  // This avoids hydration issues with the ToastContainer
  return mounted
    ? createPortal(
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            fontFamily: 'var(--font-geist-mono)',
            borderRadius: '0',
            border: '1px solid #000',
          }}
        />,
        document.getElementById('toast-container') as HTMLElement
      )
    : null;
} 