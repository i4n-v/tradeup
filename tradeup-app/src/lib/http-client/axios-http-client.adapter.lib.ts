import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type {
  IConfig,
  IHttpClient,
  IRequestFulfilledCallback,
  IRequestRejectedCallback,
  IResponseFulfilledCallback,
  IResponserRejectedCallback,
} from './http-client.interface.lib';
import { HttpClientError } from '@errors/http-client.error';

export class AxiosHttpClientAdapter implements IHttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      paramsSerializer: {
        indexes: null,
      },
    });
  }

  private errorHandler(error: unknown): never {
    if (error instanceof AxiosError) {
      throw new HttpClientError(
        error.message,
        error.response?.status ?? 0,
        error.response?.data ?? null,
      );
    }

    throw error;
  }

  onRequest(
    fullfilledCallback: IRequestFulfilledCallback,
    rejectedCallback: IRequestRejectedCallback,
  ): number {
    return this.instance.interceptors.request.use(
      async (config) => {
        const newConfig = await fullfilledCallback({
          headers: config.headers || {},
          params: config.params || {},
        });

        return { ...config, ...newConfig } as InternalAxiosRequestConfig<any>;
      },
      (error) => {
        if (error instanceof AxiosError) {
          return rejectedCallback(
            new HttpClientError(
              error.message,
              error.response?.status ?? 0,
              error.response?.data ?? null,
            ),
          );
        }

        return rejectedCallback(error);
      },
      {
        synchronous: false,
      },
    );
  }

  onResponse(
    fullfilledCallback: IResponseFulfilledCallback,
    rejectedCallback: IResponserRejectedCallback,
  ): number {
    return this.instance.interceptors.response.use(fullfilledCallback, (error) => {
      if (error instanceof AxiosError) {
        return rejectedCallback(
          new HttpClientError(
            error.message,
            error.response?.status ?? 0,
            error.response?.data ?? null,
          ),
        );
      }

      return rejectedCallback(error);
    });
  }

  offRequest(interceptorId: number): void {
    this.instance.interceptors.request.eject(interceptorId);
  }

  offResponse(interceptorId: number): void {
    this.instance.interceptors.response.eject(interceptorId);
  }

  async get<T>(url: string, config?: IConfig): Promise<T> {
    try {
      const response = await this.instance.get(url, config);
      return response.data;
    } catch (error) {
      this.errorHandler(error);
    }
  }

  async post<T>(url: string, body: any, config?: IConfig): Promise<T> {
    try {
      const response = await this.instance.post(url, body, config);
      return response.data;
    } catch (error) {
      this.errorHandler(error);
    }
  }

  async put<T>(url: string, body: any, config?: IConfig): Promise<T> {
    try {
      const response = await this.instance.put(url, body, config);
      return response.data;
    } catch (error) {
      this.errorHandler(error);
    }
  }

  async delete<T>(url: string, config?: IConfig): Promise<T> {
    try {
      const response = await this.instance.delete(url, config);
      return response.data;
    } catch (error) {
      this.errorHandler(error);
    }
  }

  async patch<T>(url: string, body: any, config?: IConfig): Promise<T> {
    try {
      const response = await this.instance.patch(url, body, config);
      return response.data;
    } catch (error) {
      this.errorHandler(error);
    }
  }
}
