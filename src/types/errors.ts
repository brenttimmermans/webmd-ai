export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'SESSION_NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR';

export interface ApiErrorPayload {
  error: string;
  code: ApiErrorCode;
}
