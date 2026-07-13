import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './app/App.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 서버 오류(5xx)만 라우트 ErrorBoundary로 승격. 4xx(검증·404 등)는 각 페이지가 개별 처리.
      throwOnError: (error) => (error?.response?.status ?? 0) >= 500,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
