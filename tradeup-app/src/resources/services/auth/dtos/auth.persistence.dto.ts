export interface IUserPersistenceDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ILoginPersistenceDTO {
  token: string;
  user: IUserPersistenceDTO;
}

export interface IRegisterPersistenceDTO {
  user: IUserPersistenceDTO;
}
