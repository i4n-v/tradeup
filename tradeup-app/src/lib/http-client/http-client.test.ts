import axios, { type AxiosInstance } from 'axios';
import type { IConfig, IHttpClient } from './http-client.interface.lib';
import { AxiosHttpClientAdapter } from './axios-http-client.adapter.lib';

jest.mock('axios');

const emptyConfig: IConfig = { params: {}, headers: {} };

type HttpClientMocks = {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
  patch: jest.Mock;
};

type AdapterSetup = {
  adapter: IHttpClient;
  mocks: HttpClientMocks;
};

type GetSetup = () => { adapter: IHttpClient; mocks: HttpClientMocks };

function runHttpClientAdapterTests(
  adapterName: string,
  createSetup: () => AdapterSetup,
  extraTests?: (getSetup: GetSetup) => void,
) {
  describe(adapterName, () => {
    let adapter: IHttpClient;
    let mocks: HttpClientMocks;

    beforeEach(() => {
      const setup = createSetup();
      adapter = setup.adapter;
      mocks = setup.mocks;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const getSetup: GetSetup = () => ({ adapter, mocks });

    it('should call instance get and return result', async () => {
      const data = { id: 1 };
      mocks.get.mockResolvedValue({ data });
      const result = await adapter.get('/users', emptyConfig);
      expect(mocks.get).toHaveBeenCalledWith('/users', emptyConfig);
      expect(result).toEqual(data);
    });

    it('should call instance post with url body and config', async () => {
      const body = { name: 'test' };
      mocks.post.mockResolvedValue({ data: body });
      const result = await adapter.post('/users', body, emptyConfig);
      expect(mocks.post).toHaveBeenCalledWith('/users', body, emptyConfig);
      expect(result).toEqual(body);
    });

    it('should call instance put with url body and config', async () => {
      const body = { name: 'updated' };
      mocks.put.mockResolvedValue({ data: body });
      const result = await adapter.put('/users/1', body, emptyConfig);
      expect(mocks.put).toHaveBeenCalledWith('/users/1', body, emptyConfig);
      expect(result).toEqual(body);
    });

    it('should call instance delete with url and config', async () => {
      mocks.delete.mockResolvedValue({ data: null });
      const result = await adapter.delete('/users/1', emptyConfig);
      expect(mocks.delete).toHaveBeenCalledWith('/users/1', emptyConfig);
      expect(result).toBeNull();
    });

    it('should call instance patch with url body and config', async () => {
      const body = { name: 'patched' };
      mocks.patch.mockResolvedValue({ data: body });
      const result = await adapter.patch('/users/1', body, emptyConfig);
      expect(mocks.patch).toHaveBeenCalledWith('/users/1', body, emptyConfig);
      expect(result).toEqual(body);
    });

    it('should reject with same error when instance get rejects', async () => {
      const error = new Error('Network error');
      mocks.get.mockRejectedValue(error);
      await expect(adapter.get('/users', emptyConfig)).rejects.toThrow('Network error');
    });

    if (extraTests) extraTests(getSetup);
  });
}

describe('HttpClient adapters', () => {
  const adapters: Array<{
    name: string;
    createSetup: () => AdapterSetup;
    extraTests?: (getSetup: GetSetup) => void;
  }> = [
    {
      name: 'AxiosHttpClientAdapter',
      createSetup: () => {
        const mockGet = jest.fn();
        const mockPost = jest.fn();
        const mockPut = jest.fn();
        const mockDelete = jest.fn();
        const mockPatch = jest.fn();

        const mockRequestUse = jest.fn().mockReturnValue(1);
        const mockRequestEject = jest.fn();
        const mockResponseUse = jest.fn().mockReturnValue(2);
        const mockResponseEject = jest.fn();

        jest.mocked(axios.create).mockReturnValue({
          get: mockGet,
          post: mockPost,
          put: mockPut,
          delete: mockDelete,
          patch: mockPatch,
          interceptors: {
            request: { use: mockRequestUse, eject: mockRequestEject },
            response: { use: mockResponseUse, eject: mockResponseEject },
          },
        } as unknown as AxiosInstance);

        return {
          adapter: new AxiosHttpClientAdapter('https://api.example.com'),
          mocks: {
            get: mockGet,
            post: mockPost,
            put: mockPut,
            delete: mockDelete,
            patch: mockPatch,
            requestUse: mockRequestUse,
            requestEject: mockRequestEject,
            responseUse: mockResponseUse,
            responseEject: mockResponseEject,
          },
        };
      },
      extraTests: (getSetup) => {
        it('should call axios.create with baseURL on constructor', () => {
          new AxiosHttpClientAdapter('https://api.example.com');
          expect(axios.create).toHaveBeenCalledWith({
            baseURL: 'https://api.example.com',
            paramsSerializer: { indexes: null },
          });
        });

        it('should eject request interceptor when offRequest is called with id from onRequest', () => {
          const { adapter: client, mocks: clientMocks } = getSetup();
          const id = client.onRequest(
            (c) => Promise.resolve(c),
            (e) => Promise.reject(e),
          );
          client.offRequest(id);
          const axiosMocks = clientMocks as HttpClientMocks & {
            requestUse: jest.Mock;
            requestEject: jest.Mock;
          };
          expect(axiosMocks.requestUse).toHaveBeenCalled();
          expect(axiosMocks.requestEject).toHaveBeenCalledWith(1);
        });

        it('should eject response interceptor when offResponse is called with id from onResponse', () => {
          const { adapter: client, mocks: clientMocks } = getSetup();
          const id = client.onResponse(
            (r) => Promise.resolve(r),
            (e) => Promise.reject(e),
          );
          client.offResponse(id);
          const axiosMocks = clientMocks as HttpClientMocks & {
            responseUse: jest.Mock;
            responseEject: jest.Mock;
          };
          expect(axiosMocks.responseUse).toHaveBeenCalled();
          expect(axiosMocks.responseEject).toHaveBeenCalledWith(2);
        });
      },
    },
  ];

  adapters.forEach(({ name, createSetup, extraTests }) => {
    runHttpClientAdapterTests(name, createSetup, extraTests);
  });
});
