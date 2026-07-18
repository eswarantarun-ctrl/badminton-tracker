import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import PlayerLeaderboard from "./PlayerLeaderboard";

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("teams");
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    loadTeams();
    loadPlayers();
  }, []);

  /* ---------------- TEAM LEADERBOARD ---------------- */
  async function loadTeams() {
    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, team_name");

    const { data: matches } = await supabase
      .from("matches")
      .select("winner_team_id, loser_team_id");

    const stats = {};

    // initialize stats
    teamsData.forEach((t) => {
      stats[t.id] = { played: 0, wins: 0, losses: 0 };
    });

    // compute stats
    matches?.forEach((m) => {
      if (stats[m.winner_team_id]) {
        stats[m.winner_team_id].played++;
        stats[m.winner_team_id].wins++;
      }
      if (stats[m.loser_team_id]) {
        stats[m.loser_team_id].played++;
        stats[m.loser_team_id].losses++;
      }
    });

    // build final list + filter out teams with no games
    const finalTeams = teamsData
      .map((t) => ({
        id: t.id,
        name: t.team_name,
        played: stats[t.id].played,
        wins: stats[t.id].wins,
        losses: stats[t.id].losses,
      }))
      .filter((t) => t.played > 0); // ⭐ only teams who played

    setTeams(finalTeams);
  }

  /* ---------------- PLAYER LEADERBOARD ---------------- */
  async function loadPlayers() {
    const { data: playersData } = await supabase
      .from("players")
      .select("id, display_name");

    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, player1_id, player2_id");

    const { data: matches } = await supabase
      .from("matches")
      .select("winner_team_id, loser_team_id");

    const teamPlayers = {};
    teamsData.forEach((t) => {
      teamPlayers[t.id] = [t.player1_id, t.player2_id];
    });

    const stats = {};
    playersData.forEach((p) => {
      stats[p.id] = { played: 0, wins: 0, losses: 0 };
    });

    matches?.forEach((m) => {
      const winners = teamPlayers[m.winner_team_id] || [];
      const losers = teamPlayers[m.loser_team_id] || [];

      winners.forEach((pid) => {
        if (pid && stats[pid]) {
          stats[pid].played++;
          stats[pid].wins++;
        }
      });

      losers.forEach((pid) => {
        if (pid && stats[pid]) {
          stats[pid].played++;
          stats[pid].losses++;
        }
      });
    });

    const finalPlayers = playersData.map((p) => {
      const s = stats[p.id];
      const rating =
        s.played > 0 ? ((s.wins / s.played) * 100).toFixed(1) : "0.0";

      return {
        id: p.id,
        name: p.display_name,
        played: s.played,
        wins: s.wins,
        losses: s.losses,
        rating,
      };
    });

    setPlayers(finalPlayers);
  }

  /* ---------------- RENDER ---------------- */
  /* ---------------- RENDER ---------------- */
return (
  <div className="leaderboard-page">

    {/* Tabs */}
    <div className="leaderboard-tabs">
      <button
        className={`tab-btn ${activeTab === "teams" ? "active" : ""}`}
        onClick={() => setActiveTab("teams")}
      >
        Teams
      </button>

      <button
        className={`tab-btn ${activeTab === "players" ? "active" : ""}`}
        onClick={() => setActiveTab("players")}
      >
        Players
      </button>
    </div>

    {/* Content */}
    <div className="leaderboard-content">

      {/* ⭐ Scrollable wrapper */}
      <div className="leaderboard-scroll">

        {/* TEAM LEADERBOARD */}
        {activeTab === "teams" && (
          <div className="team-leaderboard">

            {/* COLUMN HEADERS */}
            <div className="leaderboard-header leaderboard-row">
              <div className="leaderboard-rank">#</div>
              <div className="leaderboard-name">Team</div>
              <div className="leaderboard-stat">Played</div>
              <div className="leaderboard-stat">Wins</div>
              <div className="leaderboard-stat">Losses</div>
              <div className="leaderboard-stat">Win %</div>
            </div>

            {teams.sort((a, b) => b.wins - a.wins).map((t, index) => (
              <div key={t.id} className="leaderboard-row">
                <div className="leaderboard-rank">{index + 1}</div>
                <div className="leaderboard-name">{t.name}</div>
                <div className="leaderboard-stat">{t.played}</div>
                <div className="leaderboard-stat">{t.wins}</div>
                <div className="leaderboard-stat">{t.losses}</div>
                <div className="leaderboard-stat">
                  {((t.wins / t.played) * 100).toFixed(1)}%
                </div>
              </div>
            ))}

          </div>
        )}

        {/* PLAYER LEADERBOARD */}
        {activeTab === "players" && (
          <PlayerLeaderboard players={players} />
        )}

      </div> {/* END leaderboard-scroll */}

    </div> {/* END leaderboard-content */}

  </div> /* END leaderboard-page */
);

}
