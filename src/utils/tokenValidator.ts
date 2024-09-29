import { jwtDecode } from "jwt-decode";

export function isTokenValid(token: string): boolean {
  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
}
