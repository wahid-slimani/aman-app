import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from "@/lib/constants/app";

type AccessPayload = {
  sub: string;
  role: string;
  sessionId: string;
};

function getSecret(name: string) {
  const secret = process.env[name];
  if (!secret) {
    throw new Error(`Missing secret: ${name}`);
  }

  return secret;
}

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, getSecret("JWT_ACCESS_SECRET"), {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS
  });
}

export function signRefreshToken(payload: AccessPayload) {
  return jwt.sign(payload, getSecret("JWT_REFRESH_SECRET"), {
    expiresIn: REFRESH_TOKEN_TTL_SECONDS
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, getSecret("JWT_ACCESS_SECRET")) as AccessPayload;
}

export function verifyRefreshToken(token: string): AccessPayload {
  return jwt.verify(token, getSecret("JWT_REFRESH_SECRET")) as AccessPayload;
}
