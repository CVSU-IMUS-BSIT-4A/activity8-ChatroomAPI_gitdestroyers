export interface Room {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export interface Message {
  id: string;
  roomId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message?: string;
}
