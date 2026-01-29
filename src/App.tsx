/**
 * Main App component with routing
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WorkflowListPage from './pages/WorkflowListPage';
import WorkflowDetailPage from './pages/WorkflowDetailPage';
import ExecutionDetailPage from './pages/ExecutionDetailPage';
import ExecutionLogsPage from './pages/ExecutionLogsPage';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-900 text-gray-100">
                <Routes>
                    <Route path="/" element={<WorkflowListPage />} />
                    <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
                    <Route path="/executions/:id" element={<ExecutionDetailPage />} />
                    <Route path="/executions/:id/logs" element={<ExecutionLogsPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
