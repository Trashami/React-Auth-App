import { useState, useEffect } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import BodyContent from "./components/BodyContent";
import Login from "./components/Login";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  const [activeView, setActiveView] = useState("home");
  const [appConfig, setAppConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/appconfig.json");
        if (!response.ok) {
          throw new Error("Failed to load configuration");
        }
        const config = await response.json();
        setAppConfig(config);
      } catch (error) {
        console.error("Error loading app configuration:", error);
      }
      setLoading(false);
    };

    fetchConfig();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!appConfig) {
    return <div>Error loading configuration</div>;
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <>
          <Header
            appName={appConfig.appName}
            toggleSidebar={toggleSidebar}
            isMobile={window.innerWidth <= 768}
          />
          <div className="app-container">
            <Sidebar
              setActiveView={setActiveView}
              isExpanded={isSidebarExpanded}
              toggleSidebar={toggleSidebar}
            />
            <main className="main-content">
              <BodyContent activeView={activeView} appConfig={appConfig} />
            </main>
          </div>
        </>
      ) : (
        <Login appName={appConfig.appName} />
      )}
    </div>
  );
};

export default App;
