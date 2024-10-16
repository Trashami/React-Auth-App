import { Nav } from "react-bootstrap";
import {
  BsFillHouseDoorFill,
  BsFillPersonFill,
  BsGearFill,
  BsFillQuestionCircleFill,
  BsDoorClosedFill,
  BsArrowsExpandVertical,
} from "react-icons/bs";

const Sidebar = ({ setActiveView, isExpanded, toggleSidebar }) => {
  const isMobile = window.innerWidth <= 768;

  return (
    <div className={`sidebar bg-dark ${isExpanded ? "expanded" : ""}`}>
      <div className="sidebar-content">
        <Nav className="flex-column">
          <Nav.Link
            href="#home"
            className="nav-item"
            onClick={() => setActiveView("home")}
          >
            <BsFillHouseDoorFill className="nav-icon" />
            {(!isMobile || isExpanded) && <span className="nav-text">Home</span>}
          </Nav.Link>
          <Nav.Link
            href="#profile"
            className="nav-item"
            onClick={() => setActiveView("profile")}
          >
            <BsFillPersonFill className="nav-icon" />
            {(!isMobile || isExpanded) && <span className="nav-text">Profile</span>}
          </Nav.Link>
          <Nav.Link
            href="#settings"
            className="nav-item"
            onClick={() => setActiveView("settings")}
          >
            <BsGearFill className="nav-icon" />
            {(!isMobile || isExpanded) && <span className="nav-text">Settings</span>}
          </Nav.Link>
          <Nav.Link
            href="#help"
            className="nav-item"
            onClick={() => setActiveView("help")}
          >
            <BsFillQuestionCircleFill className="nav-icon" />
            {(!isMobile || isExpanded) && <span className="nav-text">Help</span>}
          </Nav.Link>
          <Nav.Link
            href="#logout"
            className="nav-item"
            onClick={() => setActiveView("logout")}
          >
            <BsDoorClosedFill className="nav-icon" />
            {(!isMobile || isExpanded) && <span className="nav-text">Logout</span>}
          </Nav.Link>
        </Nav>
      </div>
      {!isMobile && (
        <div className="toggle-button-container">
          <button className="toggle-button" onClick={toggleSidebar}>
            <BsArrowsExpandVertical
              className="nav-icon"
              style={{
                transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
