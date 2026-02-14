/**
 * Workflow Detail Page - Task 1.2.3 & 1.3.1
 * Shows workflow metadata, steps, and trigger button
 */

import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getWorkflow, executeWorkflow } from '../services/api';
import type { WorkflowDetail } from '../types/workflow';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function WorkflowDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Execution state
    const [isExecuting, setIsExecuting] = useState(false);
    const [executeError, setExecuteError] = useState<string | null>(null);
    const [triggerInput, setTriggerInput] = useState('{\n  "text": ""\n}');
    const [triggerInputError, setTriggerInputError] = useState<string | null>(null);

    const fetchWorkflow = async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getWorkflow(id);
            setWorkflow(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch workflow');
        } finally {
            setLoading(false);
        }
    };

    const handleRunWorkflow = async () => {
        if (!id) return;
        try {
            setIsExecuting(true);
            setExecuteError(null);
            let parsedInput: Record<string, unknown> | undefined = undefined;
            if (triggerInput.trim().length > 0) {
                try {
                    parsedInput = JSON.parse(triggerInput);
                    setTriggerInputError(null);
                } catch (err) {
                    setTriggerInputError(err instanceof Error ? err.message : 'Invalid JSON');
                    setIsExecuting(false);
                    return;
                }
            } else {
                setTriggerInputError(null);
            }
            const result = await executeWorkflow(id, { trigger_input: parsedInput ?? {} });
            // Navigate to execution detail page
            navigate(`/executions/${result.execution_id}`);
        } catch (err) {
            setExecuteError(err instanceof Error ? err.message : 'Failed to execute workflow');
            setIsExecuting(false);
        }
    };

    useEffect(() => {
        fetchWorkflow();
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={fetchWorkflow} />;
    if (!workflow) return <ErrorMessage message="Workflow not found" />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 mb-4"
                >
                    <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back to workflows
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-100">{workflow.name}</h1>
                        {workflow.description && (
                            <p className="mt-2 text-gray-400">{workflow.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRunWorkflow}
                            disabled={isExecuting}
                            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExecuting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Running...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Run Workflow
                                </>
                            )}
                        </button>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300">
                            v{workflow.version}
                        </span>
                    </div>
                </div>

                {/* Execution error message */}
                {executeError && (
                    <div className="mt-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-300 text-sm">
                        {executeError}
                    </div>
                )}

                {/* Trigger input */}
                <div className="mt-6 bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-200">Trigger Input (JSON)</h3>
                        <button
                            type="button"
                            className="text-xs text-gray-400 hover:text-gray-200"
                            onClick={() => setTriggerInput('{\n  "text": ""\n}')}
                        >
                            Reset
                        </button>
                    </div>
                    <textarea
                        value={triggerInput}
                        onChange={(e) => setTriggerInput(e.target.value)}
                        rows={6}
                        className="w-full text-xs text-gray-200 bg-gray-950 border border-gray-700 rounded p-3 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder='{\n  "text": "Summarize this..." \n}'
                    />
                    {triggerInputError && (
                        <div className="mt-2 text-xs text-red-300">
                            Invalid JSON: {triggerInputError}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center text-sm text-gray-500">
                    <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    Created {new Date(workflow.created_at).toLocaleDateString()}
                </div>
            </div>

            {/* Steps */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Steps</h2>

                {workflow.steps.length === 0 ? (
                    <p className="text-gray-400">No steps defined</p>
                ) : (
                    <div className="space-y-4">
                        {workflow.steps.map((step, index) => (
                            <div
                                key={step.id}
                                className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg"
                            >
                                {/* Step number badge */}
                                <div className="shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Step details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-gray-100 font-medium">Step {step.order}</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                            {step.type}
                                        </span>
                                    </div>

                                    {/* Config preview */}
                                    {step.config && Object.keys(step.config).length > 0 && (
                                        <details className="mt-2">
                                            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                                                View configuration
                                            </summary>
                                            <pre className="mt-2 text-xs text-gray-400 bg-gray-950 p-3 rounded overflow-x-auto">
                                                {JSON.stringify(step.config, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

