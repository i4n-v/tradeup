/* eslint-disable @typescript-eslint/no-explicit-any */

export class HttpClientError extends Error {
  code: number;
  response: any;

  constructor(message: string, code: number, response: any) {
    super(message);
    this.name = 'HttpClientError';
    this.code = code;
    this.response = response;
  }
}
