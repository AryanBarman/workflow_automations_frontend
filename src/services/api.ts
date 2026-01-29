/**
 * API client for workflow automation backend
 * Base URL: http://localhost:8000
 */

import type {
    Workflow,
    WorkflowDetail,
    WorkflowExecution,
    ExecutionLog,
    ExecuteWorkflowRequest,
    ExecuteWorkflowResponse,
} from '../types/workflow';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * Get all workflows
 */
export async function getWorkflows(): Promise<Workflow[]> {
    return fetchAPI<Workflow[]>('/api/workflows');
}

/**
 * Get workflow by ID with steps
 */
export async function getWorkflow(id: string): Promise<WorkflowDetail> {
    return fetchAPI<WorkflowDetail>(`/api/workflows/${id}`);
}

/**
 * Execute a workflow
 */
export async function executeWorkflow(
    id: string,
    request: ExecuteWorkflowRequest
): Promise<ExecuteWorkflowResponse> {
    return fetchAPI<ExecuteWorkflowResponse>(`/api/workflows/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

/**
 * Get execution by ID
 */
export async function getExecution(id: string): Promise<WorkflowExecution> {
    return fetchAPI<WorkflowExecution>(`/api/executions/${id}`);
}

/**
 * Get execution logs
 */
export async function getExecutionLogs(id: string): Promise<ExecutionLog[]> {
    return fetchAPI<ExecutionLog[]>(`/api/executions/${id}/logs`);
}
