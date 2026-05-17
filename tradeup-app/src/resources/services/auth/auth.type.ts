export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}
