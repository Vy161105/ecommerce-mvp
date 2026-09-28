export interface AuthUser {
  uid: string;
  username: string;
  email: string;
  phone: string | null;
  rid: number;
  membership_points: number;
}

export class AuthClient {
  private readonly baseUrl =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

  async getUserById(userId: string): Promise<AuthUser> {
    const response = await fetch(
      `${this.baseUrl}/api/auth/users/${userId}`
    );

    if (!response.ok) {
      throw new Error('User not found');
    }

    return (await response.json()) as AuthUser;
  }
}