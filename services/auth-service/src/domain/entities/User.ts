export type User = {
  uid: string;
  username: string;
  password: string;
  email: string;
  phone: string | null;
  rid: number;
  membership_points: number;
};