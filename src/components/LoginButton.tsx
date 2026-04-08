import { redirectToLogin } from "../services/auth";

export default function LoginButton() {
  return <button onClick={redirectToLogin}>Login with Upstox</button>;
}
