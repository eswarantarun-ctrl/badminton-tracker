import { useState } from "react";
import "./styles.css";

import Leaderboard from "./components/Leaderboard";
import MonthlyRanking from "./components/MonthlyRanking";
import Stats from "./components/Stats";
import Teams from "./components/Teams";
import Players from "./components/Players";
import Login from "./components/Login";
import AddGame from "./components/AddGame";
import Profile from "./components/Profile";
import DailyRanking from "./components/DailyRanking";
import Have4Morph from "./components/Have4Morph";



export default function App() {
  const [selected, setSelected] = useState("Leaderboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    "Leaderboard",
    "Daily Ranking",
    "Monthly Ranking",
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
      case "Daily Ranking":        // ⭐ ADD THIS
        return <DailyRanking />;
      case "Monthly Ranking":
        return <MonthlyRanking />;
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
        {/* Hamburger (mobile) */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="ham-line"></span>
          <span className="ham-line"></span>
          <span className="ham-line"></span>
        </button>

        {/* Sidebar */}
        <div className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-header">
            <Have4Morph />
          </div>



          {menuItems.map((item) => {
            const active = selected === item;
            return (
              <div
                key={item}
                onClick={() => {
                  setSelected(item);
                  setMenuOpen(false);
                }}
                className={active ? "menu-item menu-item-active" : "menu-item"}
              >
                <span className="menu-label">{item}</span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="content">{renderPage()}</div>
      </div>
    </div>
  );
}
