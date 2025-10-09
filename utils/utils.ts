import jwt from "jsonwebtoken";

export function getJWT(): string {
  return jwt.sign(
    { exp: Math.floor(Date.now() / 100) + 60 * 60, data: "auth_cachelab" },
    process.env.JWT_SECRET_KEY ?? "privateKey"
  );
}

export function verifyJWT(token: string): boolean {
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY ?? "privateKey");
  return decoded ? true : false;
}
