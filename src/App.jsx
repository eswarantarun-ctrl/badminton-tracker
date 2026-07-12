import { useState } from "react";
import "./styles.css";

import Leaderboard from "./components/Leaderboard";
import WeeklyRanking from "./components/WeeklyRanking";
import Stats from "./components/Stats";
import Teams from "./components/Teams";
import Players from "./components/Players";
import Login from "./components/Login";
import AddGame from "./components/AddGame";
import Profile from "./components/Profile";

export default function App() {
  const [selected, setSelected] = useState("Leaderboard");
  const [menuOpen, setMenuOpen] = useState(false);   // ⭐ REQUIRED

  const menuItems = [
    "Leaderboard",
    "Weekly Ranking",
    "Stats",
    "Teams",
    "Players",
    "Login",
    "Add Game",
    "Profile"
  ];

  const renderPage = () => {
    switch (selected) {
      case "Leaderboard":
        return <Leaderboard />;
      case "Weekly Ranking":
        return <WeeklyRanking />;
      case "Stats":
        return <Stats />;
      case "Teams":
        return <Teams />;
      case "Players":
        return <Players />;
      case "Login":
        return <Login />;
      case "Add Game":
        return <AddGame />;
      case "Profile":
        return <Profile />;
      default:
        return <Leaderboard />;
    }
  };

  return (
    <div className="page">
      <div className="frame">

        {/* ⭐ HAMBURGER BUTTON (mobile only) */}
         <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="ham-line"></span>
          <span className="ham-line"></span>
          <span className="ham-line"></span>
        </button>

        {/* ⭐ SIDEBAR WITH MOBILE OPEN/CLOSE */}
        <div className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-header">Badminton Hub</div>

          {menuItems.map((item) => {
            const active = selected === item;

            return (
              <div
                key={item}
                onClick={() => {
                  setSelected(item);
                  setMenuOpen(false);   // ⭐ Close menu after selecting
                }}
                className={active ? "menu-item menu-item-active" : "menu-item"}
              >
                {item}
              </div>
            );
          })}
        </div>

        {/* RIGHT CONTENT */}
        <div className="content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
