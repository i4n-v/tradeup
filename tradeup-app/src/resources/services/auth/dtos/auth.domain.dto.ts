export interface IUserDomainDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ILoginDomainDTO {
  token: string;
  user: IUserDomainDTO;
}
