import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/authConfig";
import { Button } from "react-bootstrap";

const Login = ({ appName }) => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((error) => {
      console.error("Login failed:", error);
    });
  };

  return (
    <div className="login-container">
      <h2>Welcome to {appName}</h2>
      <Button onClick={handleLogin} variant="primary">
        Login with Microsoft
      </Button>
    </div>
  );
};

export default Login;
