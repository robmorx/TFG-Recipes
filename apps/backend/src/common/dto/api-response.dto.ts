export class ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;

  constructor(data: T, message?: string, success = true) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}
