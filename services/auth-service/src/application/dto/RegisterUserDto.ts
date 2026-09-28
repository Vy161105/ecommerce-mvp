import { z } from 'zod';

export const RegisterUserSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional().nullable()
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
