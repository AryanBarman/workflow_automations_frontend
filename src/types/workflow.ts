/**
 * TypeScript types matching backend Pydantic schemas
 */

export interface Workflow {
    id: string;
    name: string;
    version: number;
    description?: string;
    created_at: string;
}

export interface Step {
    id: string;
    workflow_id: string;
    type: string;
    order: number;
    config?: Record<string, any>;
}

export interface WorkflowDetail {
    id: string;
    name: string;
    version: number;
    description?: string;
    created_at: string;
    steps: Step[];
}

export interface StepExecution {
    id: string;
    step_id: string;
    status: string;
    input?: Record<string, any>;
    output?: Record<string, any>;
    error?: string;
    error_type?: string;  // "transient" | "permanent"
    started_at?: string;
    finished_at?: string;
}

export interface WorkflowExecution {
    id: string;
    workflow_id: string;
    status: string;
    started_at: string;
    finished_at?: string;
    step_executions: StepExecution[];
}

export interface ExecutionLog {
    id: string;
    workflow_execution_id: string;
    step_execution_id?: string;
    event_type: string;
    message: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface ExecuteWorkflowRequest {
    trigger_input?: Record<string, any>;
}

export interface ExecuteWorkflowResponse {
    execution_id: string;
    workflow_id: string;
    status: string;
    started_at: string;
}
