import { z } from "zod";
import { ALLOWED_RADIUS_KM } from "@/lib/constants/app";

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128)
});

export const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().refine((value) => ALLOWED_RADIUS_KM.includes(value as (typeof ALLOWED_RADIUS_KM)[number]), {
    message: "validation.invalidRadius"
  })
});
