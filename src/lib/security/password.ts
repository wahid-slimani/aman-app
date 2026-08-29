import { hash, verify } from "@node-rs/argon2";

export async function hashPassword(password: string) {
  return hash(password, {
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1
  });
}

export async function verifyPassword(password: string, passwordHash: string) {
  return verify(passwordHash, password);
}
