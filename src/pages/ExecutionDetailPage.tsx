/**
 * Execution Detail Page - Task 1.2.4
 * Shows execution status and step executions timeline
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getExecution } from '../services/api';
import type { WorkflowExecution } from '../types/workflow';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';

export default function ExecutionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [execution, setExecution] = useState<WorkflowExecution | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchExecution = async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getExecution(id);
            setExecution(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch execution');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchExecution();
    }, [id]);

    // Polling for running executions
    useEffect(() => {
        if (!execution) return;

        // Only poll if execution is in a non-terminal state
        const isRunning = execution.status === 'RUNNING' || execution.status === 'PENDING';
        if (!isRunning) return;

        const pollInterval = setInterval(() => {
            fetchExecution();
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(pollInterval);
    }, [execution?.status, id]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={fetchExecution} />;
    if (!execution) return <ErrorMessage message="Execution not found" />;

    const duration = execution.finished_at
        ? new Date(execution.finished_at).getTime() - new Date(execution.started_at).getTime()
        : null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 mb-4"
                >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to workflows
                </Link>

                <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-100">Execution Details</h1>
                    <StatusBadge status={execution.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Started</span>
                        <p className="text-gray-300 mt-1">
                            {new Date(execution.started_at).toLocaleString()}
                        </p>
                    </div>
                    {execution.finished_at && (
                        <>
                            <div>
                                <span className="text-gray-500">Finished</span>
                                <p className="text-gray-300 mt-1">
                                    {new Date(execution.finished_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Duration</span>
                                <p className="text-gray-300 mt-1">
                                    {duration ? `${(duration / 1000).toFixed(2)}s` : 'N/A'}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <Link
                    to={`/executions/${id}/logs`}
                    className="inline-flex items-center mt-4 text-sm text-blue-400 hover:text-blue-300"
                >
                    View execution logs
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* Execution Result Banner */}
            {execution.status === 'SUCCESS' && (
                <div className="mb-6 p-4 rounded-lg bg-green-900/30 border border-green-700/50 flex items-start gap-3">
                    <svg className="h-6 w-6 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="text-green-300 font-semibold">Execution Successful</h3>
                        <p className="text-green-400/80 text-sm mt-1">
                            Workflow completed successfully at {execution.finished_at ? new Date(execution.finished_at).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                </div>
            )}

            {execution.status === 'FAILED' && (
                <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700/50 flex items-start gap-3">
                    <svg className="h-6 w-6 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="text-red-300 font-semibold">Execution Failed</h3>
                        <p className="text-red-400/80 text-sm mt-1">
                            Workflow failed at {execution.finished_at ? new Date(execution.finished_at).toLocaleString() : 'N/A'}. Check step executions below for details.
                        </p>
                    </div>
                </div>
            )}

            {/* Step Executions Timeline */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-6">Step Executions</h2>

                {execution.step_executions.length === 0 ? (
                    <p className="text-gray-400">No step executions</p>
                ) : (
                    <div className="space-y-4">
                        {execution.step_executions.map((stepExec, index) => {
                            const stepDuration = stepExec.started_at && stepExec.finished_at
                                ? new Date(stepExec.finished_at).getTime() - new Date(stepExec.started_at).getTime()
                                : null;

                            return (
                                <div key={stepExec.id} className="relative pl-8 pb-8 last:pb-0">
                                    {/* Timeline line */}
                                    {index < execution.step_executions.length - 1 && (
                                        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-700" />
                                    )}

                                    {/* Timeline dot */}
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gray-900 border-2 border-blue-500 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    </div>

                                    {/* Step content */}
                                    <div className="bg-gray-900 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-gray-100 font-medium">Step {index + 1}</h3>
                                            <StatusBadge status={stepExec.status} />
                                        </div>

                                        {stepExec.started_at && (
                                            <div className="text-xs text-gray-500 mb-2">
                                                Started: {new Date(stepExec.started_at).toLocaleTimeString()}
                                                {stepDuration && ` • Duration: ${(stepDuration / 1000).toFixed(2)}s`}
                                            </div>
                                        )}

                                        {stepExec.error && (
                                            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded">
                                                {/* Error Type Badge */}
                                                {stepExec.error_type && (
                                                    <div className="mb-2">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${stepExec.error_type === 'transient'
                                                                ? 'bg-orange-900/30 border border-orange-700/50 text-orange-400'
                                                                : 'bg-red-900/30 border border-red-700/50 text-red-400'
                                                            }`}>
                                                            {stepExec.error_type === 'transient' ? '⚠️ Transient' : '❌ Permanent'}
                                                        </span>
                                                    </div>
                                                )}
                                                {/* Error Message */}
                                                <div className="text-sm text-red-400">
                                                    {stepExec.error}
                                                </div>
                                            </div>
                                        )}

                                        {stepExec.output && Object.keys(stepExec.output).length > 0 && (
                                            <details className="mt-2">
                                                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                                                    View output
                                                </summary>
                                                <pre className="mt-2 text-xs text-gray-400 bg-gray-950 p-3 rounded overflow-x-auto">
                                                    {JSON.stringify(stepExec.output, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
