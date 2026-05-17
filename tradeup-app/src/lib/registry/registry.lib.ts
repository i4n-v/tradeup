import type { QueryClient } from '@tanstack/react-query';

import type { IHttpClient } from '../http-client/http-client.interface.lib';
import type { AuthService } from '../../resources/services/auth/auth.service';
import type { AuthQueryKeys } from '../../resources/services/auth/auth.query-key';
import type { AuthSession } from '../../application/session/auth-session';
import type { DashboardService } from '../../resources/services/dashboard/dashboard.service';
import type { DashboardQueryKeys } from '../../resources/services/dashboard/dashboard.query-key';
import type { TradeService } from '../../resources/services/trade/trade.service';
import type { HistoryService } from '../../resources/services/history/history.service';
import type { HistoryQueryKeys } from '../../resources/services/history/history.query-key';
import type { ProfileService } from '../../resources/services/profile/profile.service';
import type { ProfileQueryKeys } from '../../resources/services/profile/profile.query-key';

interface RegistryMap {
  queryClient: QueryClient;
  httpClient: IHttpClient;
  // Auth
  authService: AuthService;
  authQueryKeys: AuthQueryKeys;
  // Session (app layer — token + bearer)
  authSession: AuthSession;
  // Dashboard
  dashboardService: DashboardService;
  dashboardQueryKeys: DashboardQueryKeys;
  // Trade
  tradeService: TradeService;
  // History
  historyService: HistoryService;
  historyQueryKeys: HistoryQueryKeys;
  // Profile
  profileService: ProfileService;
  profileQueryKeys: ProfileQueryKeys;
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
