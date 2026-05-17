import type { IDashboardDomainDTO } from './dtos/dashboard.domain.dto';
import type { IDashboardPersistenceDTO } from './dtos/dashboard.persistence.dto';

export class DashboardMapper {
  toDomain(persistence: IDashboardPersistenceDTO): IDashboardDomainDTO {
    return {
      brlBalance: persistence.brlBalance,
      btcBalance: persistence.btcBalance,
      btcPriceBrl: persistence.btcPriceBrl,
    };
  }
}
