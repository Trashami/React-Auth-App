import React from "react";
import Home from "./Home";
import Profile from "./Profile";

const BodyContent = ({ activeView, appConfig }) => {
  switch (activeView) {
    case "home":
      return <Home appName={appConfig.appName} />;
    case "profile":
      return <Profile userApi={appConfig.apiSources.userApi} />;
    default:
      return <Home appName={appConfig.appName} />;
  }
};

export default BodyContent;
