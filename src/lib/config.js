import "server-only";
import { z } from "zod";
const schema = z.object({
  MIKROTIK_HOST: z.string().optional(),
  PROXMOX_HOST: z.string().optional(),
  DOCKER_HOST: z.string().optional(),
  MOCK: z.string().optional(),
});
export const env = schema.parse(process.env);
export const isMock = env.MOCK === "true";
