import { User } from '../entities/User';

export interface UserRepository {
  existsByUsernameOrEmail(
    username: string,
    email: string
  ): Promise<boolean>;

  findByUsername(username: string): Promise<User | null>;

  findById(uid: string): Promise<User | null>;

  findCustomers(): Promise<User[]>;

  create(input: Omit<User, 'uid'>): Promise<User>;

  updateMembershipPoints(
    uid: string,
    membershipPoints: number
  ): Promise<User | null>;
}
