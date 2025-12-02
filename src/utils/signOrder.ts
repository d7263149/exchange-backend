import crypto from "crypto";

export function signQuery(query: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(query).digest("hex");
}
