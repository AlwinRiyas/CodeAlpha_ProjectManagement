import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './design-system.css';
import './product-ui.css';
import './navigation.css';
import App from './App';
import { installProjectFlowNavigation } from './navigation-bridge';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
installProjectFlowNavigation();
