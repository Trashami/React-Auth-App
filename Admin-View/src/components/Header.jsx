import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { Navbar, Nav, Container, Button, Card } from "react-bootstrap";
import axios from "axios";
import { loginRequest } from "../auth/authConfig";

const Header = ({ appName, toggleSidebar, isMobile }) => {
  const { instance, accounts, inProgress } = useMsal();
  const [showUserCard, setShowUserCard] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const user = accounts[0];

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((error) => {
      console.error("Login failed:", error);
    });
  };

  const handleLogout = () => {
    instance.logoutRedirect().catch((error) => {
      console.error("Logout failed:", error);
    });
  };

  const handleUserClick = () => {
    setShowUserCard((prev) => !prev);
  };

  // Fetch profile picture from Microsoft Graph
  useEffect(() => {
    if (user && inProgress === "none") {
      instance
        .acquireTokenSilent({
          ...loginRequest,
          account: user,
        })
        .then((response) => {
          axios
            .get("https://graph.microsoft.com/v1.0/me/photo/$value", {
              headers: {
                Authorization: `Bearer ${response.accessToken}`,
              },
              responseType: "blob",
            })
            .then((imageResponse) => {
              const imageUrl = URL.createObjectURL(imageResponse.data);
              setProfilePicture(imageUrl);
            })
            .catch((error) => {
              console.error("Failed to load profile picture:", error);
            });
        })
        .catch((error) => {
          console.error("Token acquisition failed:", error);
        });
    }
  }, [user, instance, inProgress]);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
      <Container>
        <Navbar.Brand href="#home" className="text-white">
          {appName}
        </Navbar.Brand>
        {isMobile && (
          <Button
            variant="outline-light"
            onClick={toggleSidebar}
            className="me-2"
          >
            Menu
          </Button>
        )}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {user ? (
              <div className="d-flex align-items-center">
                <div
                  className="user-profile-container d-flex align-items-center"
                  onClick={handleUserClick}
                  style={{ cursor: "pointer" }}
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="User Profile"
                      className="rounded-circle me-2"
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="placeholder rounded-circle bg-secondary me-2"
                      style={{
                        width: "40px",
                        height: "40px",
                      }}
                    />
                  )}
                  <span className="text-white">
                    {user.username || user.name || user.email}
                  </span>
                </div>

                {showUserCard && (
                  <Card
                    className="user-card"
                  >
                    <Card.Body>
                      <Card.Title>{user.name || user.username}</Card.Title>
                      <Card.Text>{user.email}</Card.Text>
                      <Button variant="outline-danger" onClick={handleLogout}>
                        Sign Out
                      </Button>
                    </Card.Body>
                  </Card>
                )}
              </div>
            ) : (
              <Button variant="primary" onClick={handleLogin}>
                Login with Office 365
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
