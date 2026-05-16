import { QueryClient } from '@tanstack/react-query';
import { Registry } from '@lib/registry/registry.lib';
import { AxiosHttpClientAdapter } from '@lib/http-client/axios-http-client.adapter.lib';
import { queryClientConfig } from '@configs/query-client.config';

const API_BASE_URL = 'https://api.example.com';

const registry = Registry.getInstance();
const queryClient = new QueryClient(queryClientConfig);
const httpClient = new AxiosHttpClientAdapter(API_BASE_URL);

registry.register('queryClient', queryClient);
registry.register('httpClient', httpClient);
