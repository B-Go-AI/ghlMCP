// src/api/tasks.ts
// HighLevel Tasks API wrapper
import { HighLevelApiClient } from "./client";

export interface Task {
  /** Unique identifier for the task (required) */
  id: string;
  /** Title of the task (required) */
  title: string;
  /** Description of the task (optional) */
  description?: string;
  /** Status of the task (optional, e.g., 'open', 'completed') */
  status?: string;
  /** Due date for the task (optional, ISO 8601) */
  dueDate?: string;
  /** Priority of the task (optional, e.g., 'low', 'medium', 'high') */
  priority?: string;
  /** ID of the user assigned to the task (optional) */
  assignedToId?: string;
  /** List of user IDs assigned to the task (optional) */
  assignedUserIds?: string[];
  /** ID of the contact related to the task (optional) */
  contactId?: string;
  /** ID of the organization related to the task (optional) */
  organizationId?: string;
  /** Task type (optional, e.g., 'call', 'email', 'meeting') */
  type?: string;
  /** Task's custom fields (optional, key-value pairs) */
  customFields?: Record<string, any>;
  /** Task creation date (optional, ISO 8601) */
  createdAt?: string;
  /** Task last updated date (optional, ISO 8601) */
  updatedAt?: string;
  /** Task completion date (optional, ISO 8601) */
  completedAt?: string;
  /** Notes for the task (optional) */
  notes?: string;
  // Add more fields as the API evolves, referencing the official GoHighLevel documentation
}

export class TasksApi {
  private client: HighLevelApiClient;

  constructor(client: HighLevelApiClient) {
    this.client = client;
  }

  /**
   * List all tasks
   */
  public async list(): Promise<Task[]> {
    const res = await this.client.request<{ tasks: Task[] }>("/tasks");
    console.log("TasksApi.list() response:", res); // Log the raw response for debugging
    if (Array.isArray(res.tasks)) return res.tasks;
    if (res.data && Array.isArray(res.data.tasks)) return res.data.tasks;
    throw new Error(res.message || "Failed to fetch tasks");
  }

  /**
   * Get a task by ID
   */
  public async get(id: string): Promise<Task> {
    const res = await this.client.request<{ task: Task }>(`/tasks/${id}`);
    if (res.status === "success" && res.data) return res.data.task;
    throw new Error(res.message || "Failed to fetch task");
  }

  /**
   * Create a new task
   */
  public async create(data: Partial<Task>): Promise<Task> {
    const res = await this.client.request<{ task: Task }>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.status === "success" && res.data) return res.data.task;
    throw new Error(res.message || "Failed to create task");
  }

  /**
   * Update a task by ID
   */
  public async update(id: string, data: Partial<Task>): Promise<Task> {
    const res = await this.client.request<{ task: Task }>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.status === "success" && res.data) return res.data.task;
    throw new Error(res.message || "Failed to update task");
  }

  /**
   * Delete a task by ID
   */
  public async delete(id: string): Promise<boolean> {
    const res = await this.client.request(`/tasks/${id}`, { method: "DELETE" });
    return res.status === "success";
  }
}
