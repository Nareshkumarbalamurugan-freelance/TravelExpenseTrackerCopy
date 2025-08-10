import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import NewEmployeeDashboard from './pages/NewEmployeeDashboard';
	<NewEmployeeDashboard />

createRoot(document.getElementById("root")!).render(<App />);
