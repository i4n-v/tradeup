import { QueryClient } from '@tanstack/react-query';
import { API_BASE_URL, STORAGE_BASE_URL } from '@env';

import { Registry } from '@lib/registry/registry.lib';
import { AxiosHttpClientAdapter } from '@lib/http-client/axios-http-client.adapter.lib';
import { AuthSession } from '@/application/session/auth-session';
import { AuthQueryKeys } from '@/resources/services/auth/auth.query-key';
import { AuthService } from '@/resources/services/auth/auth.service';
import { DashboardQueryKeys } from '@/resources/services/dashboard/dashboard.query-key';
import { DashboardService } from '@/resources/services/dashboard/dashboard.service';
import { TradeService } from '@/resources/services/trade/trade.service';
import { HistoryQueryKeys } from '@/resources/services/history/history.query-key';
import { HistoryService } from '@/resources/services/history/history.service';
import { ProfileQueryKeys } from '@/resources/services/profile/profile.query-key';
import { ProfileService } from '@/resources/services/profile/profile.service';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

const registry = Registry.getInstance();
const httpClient = new AxiosHttpClientAdapter(API_BASE_URL);

registry.register('queryClient', queryClient);
registry.register('httpClient', httpClient);

registry.register('authService', new AuthService(httpClient));
registry.register('authQueryKeys', new AuthQueryKeys());

const authSession = new AuthSession(httpClient);
registry.register('authSession', authSession);
authSession.setupBearerInterceptor();

registry.register('dashboardService', new DashboardService(httpClient));
registry.register('dashboardQueryKeys', new DashboardQueryKeys());

registry.register('tradeService', new TradeService(httpClient));

registry.register('historyService', new HistoryService(httpClient));
registry.register('historyQueryKeys', new HistoryQueryKeys());

registry.register('profileService', new ProfileService(httpClient, STORAGE_BASE_URL));
registry.register('profileQueryKeys', new ProfileQueryKeys());
