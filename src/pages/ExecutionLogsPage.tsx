/**
 * Execution Logs Page - Task 1.2.5
 * Shows chronological execution logs
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getExecutionLogs } from '../services/api';
import type { ExecutionLog } from '../types/workflow';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ExecutionLogsPage() {
    const { id } = useParams<{ id: string }>();
    const [logs, setLogs] = useState<ExecutionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getExecutionLogs(id);
            setLogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={fetchLogs} />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to={`/executions/${id}`}
                    className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 mb-4"
                >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to execution
                </Link>

                <h1 className="text-3xl font-bold text-gray-100">Execution Logs</h1>
                <p className="mt-2 text-gray-400">{logs.length} log entries</p>
            </div>

            {/* Logs */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">No logs available</div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-gray-750 transition-colors font-mono text-sm">
                                <div className="flex items-start gap-4">
                                    {/* Timestamp */}
                                    <div className="shrink-0 text-gray-500 w-32">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </div>

                                    {/* Event type badge */}
                                    <div className="shrink-0">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                            {log.event_type}
                                        </span>
                                    </div>

                                    {/* Message */}
                                    <div className="flex-1 text-gray-300">
                                        {log.message}

                                        {/* Metadata */}
                                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                                            <details className="mt-2">
                                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                                                    View metadata
                                                </summary>
                                                <pre className="mt-2 text-xs text-gray-400 bg-gray-900 p-3 rounded overflow-x-auto">
                                                    {JSON.stringify(log.metadata, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
