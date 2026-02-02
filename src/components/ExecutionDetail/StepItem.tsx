import React, { useState } from 'react';
import StatusBadge from '../StatusBadge';

interface StepItemProps {
    stepExec: any; // Using any for simplicity in Phase 1, ideally StepExecution type
    index: number;
    isLast: boolean;
    executionId: string;
    onRetryTriggered: () => void;
}

export default function StepItem({ stepExec, index, isLast, executionId, onRetryTriggered }: StepItemProps) {
    const [retrying, setRetrying] = useState(false);
    const [retryError, setRetryError] = useState<string | null>(null);

    const handleRetry = async () => {
        try {
            setRetrying(true);
            setRetryError(null);

            // Call Retry API
            const response = await fetch(`http://localhost:8000/api/executions/${executionId}/steps/${stepExec.id}/retry`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Retry failed');
            }

            // Trigger refresh on parent
            onRetryTriggered();

        } catch (err) {
            setRetryError(err instanceof Error ? err.message : 'Retry failed');
        } finally {
            setRetrying(false);
        }
    };

    const stepDuration = stepExec.started_at && stepExec.finished_at
        ? new Date(stepExec.finished_at).getTime() - new Date(stepExec.started_at).getTime()
        : null;

    return (
        <div key={stepExec.id} className="relative pl-8 pb-8 last:pb-0">
            {/* Timeline line */}
            {!isLast && (
                <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-700" />
            )}

            {/* Timeline dot */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${stepExec.status?.toUpperCase() === 'RUNNING' ? 'bg-gray-900 border-yellow-500 animate-pulse' :
                    stepExec.status?.toUpperCase() === 'SUCCESS' ? 'bg-gray-900 border-green-500' :
                        stepExec.status?.toUpperCase() === 'FAILED' ? 'bg-gray-900 border-red-500' :
                            'bg-gray-900 border-blue-500'
                }`}>
                <div className={`w-2 h-2 rounded-full ${stepExec.status?.toUpperCase() === 'RUNNING' ? 'bg-yellow-500' :
                        stepExec.status?.toUpperCase() === 'SUCCESS' ? 'bg-green-500' :
                            stepExec.status?.toUpperCase() === 'FAILED' ? 'bg-red-500' :
                                'bg-blue-500'
                    }`} />
            </div>

            {/* Step content */}
            <div className="bg-gray-900 rounded-lg p-4 transition-all hover:bg-gray-800/50">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-gray-100 font-medium">Step {index + 1}</h3>
                        {stepExec.is_retry && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">
                                Retry #{stepExec.retry_count}
                            </span>
                        )}
                    </div>
                    <StatusBadge status={stepExec.status} />
                </div>

                {stepExec.started_at && (
                    <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-2">
                        <span>Started: {new Date(stepExec.started_at).toLocaleTimeString()}</span>
                        {stepDuration && <span>• Duration: {(stepDuration / 1000).toFixed(2)}s</span>}
                    </div>
                )}

                {stepExec.error && (
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded group relative">
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
                        <div className="text-sm text-red-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                            {stepExec.error}
                        </div>

                        {/* Manual Retry Button - Only show for FAILED steps */}
                        {stepExec.status?.toUpperCase() === 'FAILED' && (
                            <div className="mt-3 pt-3 border-t border-red-500/20 flex items-center justify-between">
                                <button
                                    onClick={handleRetry}
                                    disabled={retrying}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg
                                        className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {retrying ? 'Retrying...' : 'Retry Step'}
                                </button>

                                {retryError && (
                                    <span className="text-red-400 text-xs">{retryError}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {stepExec.output && Object.keys(stepExec.output).length > 0 && (
                    <details className="mt-2 group">
                        <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 select-none">
                            View output
                        </summary>
                        <pre className="mt-2 text-xs text-gray-400 bg-gray-950 p-3 rounded overflow-x-auto border border-gray-800">
                            {JSON.stringify(stepExec.output, null, 2)}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
}
