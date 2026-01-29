/**
 * Workflow Detail Page - Task 1.2.3
 * Shows workflow metadata and steps
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getWorkflow } from '../services/api';
import type { WorkflowDetail } from '../types/workflow';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function WorkflowDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300">
                        v{workflow.version}
                    </span>
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
