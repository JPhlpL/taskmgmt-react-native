export interface Task {
  id: string
  email: string
  details: string
  created_at: string
  updated_at: string
}

export interface CreateTaskRequest {
  email: string
  details: string
}

export interface UpdateTaskRequest {
  email: string
  details: string
}
