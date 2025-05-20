// 生成网络错误码枚举使用enum  生成
interface ErrorInfo {
  code: number;
  message: string;
}

export const ErrorMessages: Record<number, ErrorInfo> = {
  400: { code: 400, message: 'Bad Request' },
  401: { code: 401, message: 'Unauthorized' },
  403: { code: 403, message: 'Forbidden' },
  404: { code: 404, message: 'Not Found' },
  405: { code: 405, message: 'Method Not Allowed' },
  408: { code: 408, message: 'Request Timeout' },
  409: { code: 409, message: 'Conflict' },
  500: { code: 500, message: 'Internal Server Error' },
  501: { code: 501, message: 'Not Implemented' },
  502: { code: 502, message: 'Bad Gateway' },
  503: { code: 503, message: 'Service Unavailable' },
  504: { code: 504, message: 'Gateway Timeout' },
};
