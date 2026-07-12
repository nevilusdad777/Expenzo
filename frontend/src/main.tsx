import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 1000 * 30,
			refetchOnWindowFocus: false,
		},
	},
});

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Root element not found - check index.html for <div id="root">');
}

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
			<Toaster
				position="top-right"
				toastOptions={{
					style: {
						background: '#1c1c26',
						color: '#f4f4f5',
						border: '1px solid #26262f',
					},
				}}
			/>
		</QueryClientProvider>
	</StrictMode>
);
