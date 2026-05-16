import type { QueryClient } from '@tanstack/react-query';
import type { IHttpClient } from '../http-client/http-client.interface.lib';

interface RegistryMap {
  queryClient: QueryClient;
  httpClient: IHttpClient;
}

class Registry {
  private dependencies: RegistryMap = {} as RegistryMap;
  static instance: Registry;

  private constructor() {}

  register<T extends keyof RegistryMap>(name: T, dependency: RegistryMap[T]) {
    this.dependencies[name] = dependency;
  }

  inject<T extends keyof RegistryMap>(name: T): RegistryMap[T] {
    const dependency = this.dependencies[name];

    if (!dependency) throw new Error(`Dependency not found: ${name}`);

    return dependency;
  }

  clear() {
    this.dependencies = {} as RegistryMap;
  }

  static getInstance() {
    if (!Registry.instance) {
      Registry.instance = new Registry();
    }

    return Registry.instance;
  }
}

export type { RegistryMap };
export { Registry };
