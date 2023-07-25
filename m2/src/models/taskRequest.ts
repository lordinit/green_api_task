export interface TaskRequest {
    task: string;
    data: {
      key: string;
    };
    messageId?: string;
  }