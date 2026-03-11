export interface UserEntityProps {
  id: string;
  name: string;
  email: string;
  password: string;
  bornAt: Date;
}

export interface CreateUserEntityProps {
  name: string;
  email: string;
  password: string;
  bornAt: Date;
}

export class UserEntity implements UserEntityProps {
  id: string;
  name: string;
  email: string;
  password: string;
  bornAt: Date;

  private constructor({ id, name, email, password, bornAt }: UserEntityProps) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.bornAt = bornAt;
  }

  static create(props: CreateUserEntityProps): CreateUserEntityProps {
    return {
      name: props.name,
      email: props.email,
      password: props.password,
      bornAt: props.bornAt,
    };
  }

  static reconstruct(props: UserEntityProps): UserEntity {
    return new UserEntity(props);
  }
}
