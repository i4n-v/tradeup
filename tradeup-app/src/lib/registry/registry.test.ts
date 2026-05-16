import { Registry } from './registry.lib';
import { AxiosHttpClientAdapter } from '@lib/http-client/axios-http-client.adapter.lib';

describe('Registry', () => {
  afterEach(() => {
    Registry.getInstance().clear();
  });

  it('should return same instance when getInstance is called twice', () => {
    const a = Registry.getInstance();
    const b = Registry.getInstance();
    expect(a).toBe(b);
  });

  it('should return same httpClient instance when registered and injected', () => {
    const registry = Registry.getInstance();
    const httpClient = new AxiosHttpClientAdapter('https://api.example.com');
    registry.register('httpClient', httpClient);
    expect(registry.inject('httpClient')).toBe(httpClient);
  });

  it('should throw when inject is called for unregistered dependency', () => {
    const registry = Registry.getInstance();
    expect(() => registry.inject('queryClient')).toThrow('Dependency not found: queryClient');
  });

  it('should throw when inject is called after clear', () => {
    const registry = Registry.getInstance();
    const httpClient = new AxiosHttpClientAdapter('https://api.example.com');
    registry.register('httpClient', httpClient);
    registry.clear();
    expect(() => registry.inject('httpClient')).toThrow('Dependency not found: httpClient');
  });
});
