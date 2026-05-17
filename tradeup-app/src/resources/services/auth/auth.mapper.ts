import type { IUserPersistenceDTO } from './dtos/auth.persistence.dto';
import type { IUserDomainDTO } from './dtos/auth.domain.dto';

export class AuthMapper {
  userToDomain(persistence: IUserPersistenceDTO): IUserDomainDTO {
    return {
      id: persistence.id,
      name: persistence.name,
      email: persistence.email,
      avatarUrl: persistence.avatarUrl,
      createdAt: persistence.createdAt,
    };
  }
}
