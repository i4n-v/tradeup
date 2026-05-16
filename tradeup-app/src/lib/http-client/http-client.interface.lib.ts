
type IQueryParams = Record<string, any>;

type IHeaders = Record<string, string>;

interface IConfig {
  params?: IQueryParams;
  headers?: IHeaders;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'document';
}

type IRequestFulfilledCallback = (config: IConfig) => Promise<IConfig>;

type IRequestRejectedCallback = (error: any) => Promise<any>;

type IResponseFulfilledCallback = (response: any) => Promise<any>;

type IResponserRejectedCallback = (error: any) => Promise<any>;

interface IHttpClient {
  get<T>(url: string, config?: IConfig): Promise<T>;
  post<T>(url: string, body: any, config?: IConfig): Promise<T>;
  put<T>(url: string, body: any, config?: IConfig): Promise<T>;
  delete<T>(url: string, config?: IConfig): Promise<T>;
  patch<T>(url: string, body: any, config?: IConfig): Promise<T>;
  onRequest(
    fullfilledCallback: IRequestFulfilledCallback,
    rejectedCallback?: IRequestRejectedCallback,
  ): number;
  onResponse(
    fullfilledCallback: IResponseFulfilledCallback,
    rejectedCallback?: IResponserRejectedCallback,
  ): number;
  offRequest(interceptorId: number): void;
  offResponse(interceptorId: number): void;
}

export type {
  IHttpClient,
  IQueryParams,
  IConfig,
  IRequestFulfilledCallback,
  IRequestRejectedCallback,
  IResponseFulfilledCallback,
  IResponserRejectedCallback,
};
