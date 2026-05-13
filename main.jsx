import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <Auth0Provider
    domain="SEU_DOMAIN"
    clientId="SEU_CLIENT_ID"
    authorizationParams={{
      audience: "SEU_AUDIENCE",
      redirect_uri: window.location.origin,
    }}
  >
    <App />
  </Auth0Provider>
);