// src/validators/memberSchema.ts
import { z } from 'zod';

export const MemberCreateSchema = z.object({
  membershipType: z.string().nonempty(),
  membershipStartDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
  membershipExpirationDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
  status: z.string().nonempty(),
  membershipSource: z.string().nonempty(),
  autoRenew: z.boolean().optional(),
  related: z.array(z.string()).optional(),
});

export type MemberCreateInput = z.infer<typeof MemberCreateSchema>;
