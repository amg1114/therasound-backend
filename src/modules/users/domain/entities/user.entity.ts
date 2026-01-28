export class UserEntity {
  id?: string;
  name: string;
  email: string;
  password: string;
  bornAt: Date;

  private constructor({
    id,
    name,
    email,
    password,
    bornAt,
  }: {
    id?: string;
    name: string;
    email: string;
    password: string;
    bornAt: Date;
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.bornAt = bornAt;
  }

  static create(props: {
    id?: string;
    name: string;
    email: string;
    password: string;
    bornAt: Date;
  }): UserEntity {
    return new UserEntity(props);
  }
}
