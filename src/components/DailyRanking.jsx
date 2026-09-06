import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function DailyRanking() {
  const [activeTab, setActiveTab] = useState("teams");
  const [day, setDay] = useState("");
  const [days, setDays] = useState([]);

  const [teamStats, setTeamStats] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);

  // ⭐ Correct Wisconsin date normalization
  function normalizeDate(d) {
    if (!d) return "";

    const local = new Date(d).toLocaleString("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });

    const [mm, dd, yyyy] = local.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  useEffect(() => {
    async function loadDays() {
      const { data } = await supabase.from("matches").select("date");

      const uniqueDays = [...new Set(
        data.map(m => normalizeDate(m.date))
      )].sort();

      setDays(uniqueDays);
      if (uniqueDays.length > 0) setDay(uniqueDays.at(-1));
    }

    loadDays();
  }, []);

  useEffect(() => {
    if (!day) return;

    async function loadStats() {
      const { data: players } = await supabase
        .from("players")
        .select("id, display_name");

      const { data: teams } = await supabase
        .from("teams")
        .select("id, team_name, player1_id, player2_id");

      const { data: matches } = await supabase
        .from("matches")
        .select("winner_team_id, loser_team_id, date");

      // ⭐ Filter using normalized Wisconsin date
      const todaysMatches = matches.filter(
        m => normalizeDate(m.date) === day
      );

      const teamStatsMap = {};

      todaysMatches.forEach(m => {
        if (!teamStatsMap[m.winner_team_id]) {
          teamStatsMap[m.winner_team_id] = { played: 0, wins: 0, losses: 0 };
        }
        if (!teamStatsMap[m.loser_team_id]) {
          teamStatsMap[m.loser_team_id] = { played: 0, wins: 0, losses: 0 };
        }

        teamStatsMap[m.winner_team_id].played++;
        teamStatsMap[m.winner_team_id].wins++;

        teamStatsMap[m.loser_team_id].played++;
        teamStatsMap[m.loser_team_id].losses++;
      });

      const finalTeamStats = Object.keys(teamStatsMap).map(teamId => {
        const t = teams.find(x => x.id === teamId);
        if (!t) return null;

        const s = teamStatsMap[teamId];
        const winPct = ((s.wins / s.played) * 100).toFixed(1);

        return {
          id: t.id,
          name: t.team_name,
          played: s.played,
          wins: s.wins,
          losses: s.losses,
          winPct,
        };
      }).filter(Boolean);

      finalTeamStats.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.winPct - a.winPct;
      });

      setTeamStats(finalTeamStats);

      const teamPlayers = {};
      teams.forEach(t => {
        teamPlayers[t.id] = [t.player1_id, t.player2_id];
      });

      const playerStatsMap = {};

      todaysMatches.forEach(m => {
        const winners = teamPlayers[m.winner_team_id] || [];
        const losers = teamPlayers[m.loser_team_id] || [];

        winners.forEach(pid => {
          if (!playerStatsMap[pid]) {
            playerStatsMap[pid] = { played: 0, wins: 0, losses: 0 };
          }
          playerStatsMap[pid].played++;
          playerStatsMap[pid].wins++;
        });

        losers.forEach(pid => {
          if (!playerStatsMap[pid]) {
            playerStatsMap[pid] = { played: 0, wins: 0, losses: 0 };
          }
          playerStatsMap[pid].played++;
          playerStatsMap[pid].losses++;
        });
      });

      const finalPlayerStats = Object.keys(playerStatsMap).map(pid => {
        const p = players.find(x => x.id === pid);
        if (!p) return null;

        const s = playerStatsMap[pid];
        const winPct = ((s.wins / s.played) * 100).toFixed(1);

        return {
          id: p.id,
          name: p.display_name,
          played: s.played,
          wins: s.wins,
          losses: s.losses,
          winPct,
        };
      }).filter(Boolean);

      finalPlayerStats.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.winPct - a.winPct;
      });

      setPlayerStats(finalPlayerStats);
    }

    loadStats();
  }, [day]);

  const currentIndex = days.indexOf(day);

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

      {/* Date navigation */}
      <div className="month-toggle">
        <button
          className="month-arrow"
          onClick={() => currentIndex > 0 && setDay(days[currentIndex - 1])}
        >
          ‹
        </button>

        <span className="month-label">{day}</span>

        <button
          className="month-arrow"
          onClick={() =>
            currentIndex < days.length - 1 && setDay(days[currentIndex + 1])
          }
        >
          ›
        </button>
      </div>

      {/* TEAM DAILY TAB */}
      {activeTab === "teams" && (
        <div className="leaderboard-scroll">
          <div className="leaderboard-header leaderboard-row">
            <div>#</div>
            <div>Team</div>
            <div>Played</div>
            <div>Wins</div>
            <div>Losses</div>
            <div>Win %</div>
          </div>

          {teamStats.map((t, index) => (
            <div key={t.id} className="leaderboard-row">
              <div className="leaderboard-rank">{index + 1}</div>
              <div className="leaderboard-name">{t.name}</div>
              <div className="leaderboard-stat">{t.played}</div>
              <div className="leaderboard-stat">{t.wins}</div>
              <div className="leaderboard-stat">{t.losses}</div>
              <div className="leaderboard-stat">{t.winPct}%</div>
            </div>
          ))}
        </div>
      )}

      {/* PLAYER DAILY TAB */}
      {activeTab === "players" && (
        <div className="leaderboard-scroll">
          <div className="leaderboard-header leaderboard-row">
            <div>#</div>
            <div>Player</div>
            <div>Played</div>
            <div>Wins</div>
            <div>Losses</div>
            <div>Win %</div>
          </div>

          {playerStats.map((p, index) => (
            <div key={p.id} className="leaderboard-row">
              <div className="leaderboard-rank">{index + 1}</div>
              <div className="leaderboard-name">{p.name}</div>
              <div className="leaderboard-stat">{p.played}</div>
              <div className="leaderboard-stat">{p.wins}</div>
              <div className="leaderboard-stat">{p.losses}</div>
              <div className="leaderboard-stat">{p.winPct}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
