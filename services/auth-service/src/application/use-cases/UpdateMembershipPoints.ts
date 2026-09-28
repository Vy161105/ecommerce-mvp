import { UserRepository } from '../../domain/repositories/UserRepository';

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

export class InvalidMembershipPointsError extends Error {
  constructor() {
    super('membership_points must be a non-negative integer');
    this.name = 'InvalidMembershipPointsError';
  }
}

export class UpdateMembershipPoints {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    uid: string,
    membershipPoints: number
  ) {
    if (
      !Number.isInteger(membershipPoints) ||
      membershipPoints < 0
    ) {
      throw new InvalidMembershipPointsError();
    }

    const user =
      await this.userRepository.updateMembershipPoints(
        uid,
        membershipPoints
      );

    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  }
}
