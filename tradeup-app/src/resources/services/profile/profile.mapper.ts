import type { IProfilePersistenceDTO } from './dtos/profile.persistence.dto';
import type { IProfileDomainDTO } from './dtos/profile.domain.dto';

export class ProfileMapper {
  toDomain(p: IProfilePersistenceDTO): IProfileDomainDTO {
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      avatarUrl: p.avatarUrl,
      createdAt: p.createdAt,
    };
  }
}
