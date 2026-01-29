/**
 * Workflow List Page - Task 1.2.2
 * Displays all workflows as clickable cards
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWorkflows } from '../services/api';
import type { Workflow } from '../types/workflow';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function WorkflowListPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getWorkflows();
            setWorkflows(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch workflows');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={fetchWorkflows} />;

    if (workflows.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-200 mb-2">No workflows found</h3>
                    <p className="text-gray-400">Create a workflow to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-100">Workflows</h1>
                <p className="mt-2 text-gray-400">Manage and execute your automation workflows</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((workflow) => (
                    <Link
                        key={workflow.id}
                        to={`/workflows/${workflow.id}`}
                        className="block group"
                    >
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                                    {workflow.name}
                                </h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                                    v{workflow.version}
                                </span>
                            </div>

                            {workflow.description && (
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {workflow.description}
                                </p>
                            )}

                            <div className="flex items-center text-xs text-gray-500">
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
                    </Link>
                ))}
            </div>
        </div>
    );
}
