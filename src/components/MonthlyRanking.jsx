import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function MonthlyRanking() {
  const [monthIndex, setMonthIndex] = useState(0);
  const [monthKeys, setMonthKeys] = useState([]);

  const [activeTab, setActiveTab] = useState("teams");
  const [teamStats, setTeamStats] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);

  const getMonthKey = (createdAtValue) => {
    const year = createdAtValue.slice(0, 4);
    const month = createdAtValue.slice(5, 7);
    return `${year}-${month}`;
  };

  const getMonthLabel = (monthKey) => {
    if (!monthKey) return "";
    const [year, monthStr] = monthKey.split("-");
    const monthNum = parseInt(monthStr, 10);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return `${monthNames[monthNum - 1]} ${year}`;
  };

  useEffect(() => {
    const fetchMonths = async () => {
      const { data: matches } = await supabase.from("matches").select("*");
      if (!matches || !matches.length) return;

      const keys = [...new Set(matches.map((m) => getMonthKey(m.created_at)))];

      keys.sort((a, b) => {
        const [ay, am] = a.split("-").map(Number);
        const [by, bm] = b.split("-").map(Number);
        if (ay !== by) return ay - by;
        return am - bm;
      });

      setMonthKeys(keys);
      processMonthStats(matches, keys[0]);
    };

    fetchMonths();
  }, []);

  useEffect(() => {
    const fetchMonthStats = async () => {
      const { data: matches } = await supabase.from("matches").select("*");
      if (!matches || !matches.length) return;

      const currentMonthKey = monthKeys[monthIndex];
      if (!currentMonthKey) return;

      processMonthStats(matches, currentMonthKey);
    };

    fetchMonthStats();
  }, [monthIndex, monthKeys]);

  const processMonthStats = async (matches, monthKey) => {
    const filtered = matches.filter(
      (m) => getMonthKey(m.created_at) === monthKey
    );

    const teamStatsMap = {};

    filtered.forEach((match) => {
      const winner = match.winner_team_id;
      const loser = match.loser_team_id;

      if (!teamStatsMap[winner]) {
        teamStatsMap[winner] = { team_id: winner, wins: 0, losses: 0, played: 0 };
      }
      if (!teamStatsMap[loser]) {
        teamStatsMap[loser] = { team_id: loser, wins: 0, losses: 0, played: 0 };
      }

      teamStatsMap[winner].wins++;
      teamStatsMap[winner].played++;

      teamStatsMap[loser].losses++;
      teamStatsMap[loser].played++;
    });

    const teamIds = Object.values(teamStatsMap).map((t) => t.team_id);

    const { data: teams } = await supabase
      .from("teams")
      .select("id, team_name, player1_id, player2_id")
      .in("id", teamIds);

    const nameMap = {};
    const teamPlayers = {};

    (teams || []).forEach((t) => {
      nameMap[t.id] = t.team_name;
      teamPlayers[t.id] = [t.player1_id, t.player2_id];
    });

    const finalTeamStats = Object.values(teamStatsMap).map((t) => ({
      team_id: t.team_id,
      team_name: nameMap[t.team_id] || "Unknown Team",
      wins: t.wins,
      losses: t.losses,
      played: t.played,
      winPct: t.played > 0 ? ((t.wins / t.played) * 100).toFixed(1) : "0.0",
    }));

    finalTeamStats.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winPct - a.winPct;
    });

    setTeamStats(finalTeamStats);

    const playerStatsMap = {};

    filtered.forEach((match) => {
      const winners = teamPlayers[match.winner_team_id] || [];
      const losers = teamPlayers[match.loser_team_id] || [];

      winners.forEach((pid) => {
        if (!playerStatsMap[pid]) {
          playerStatsMap[pid] = { player_id: pid, wins: 0, losses: 0, played: 0 };
        }
        playerStatsMap[pid].played++;
        playerStatsMap[pid].wins++;
      });

      losers.forEach((pid) => {
        if (!playerStatsMap[pid]) {
          playerStatsMap[pid] = { player_id: pid, wins: 0, losses: 0, played: 0 };
        }
        playerStatsMap[pid].played++;
        playerStatsMap[pid].losses++;
      });
    });

    const playerIds = Object.keys(playerStatsMap);

    const { data: players } = await supabase
      .from("players")
      .select("id, display_name")
      .in("id", playerIds);

    const playerNameMap = {};
    (players || []).forEach((p) => {
      playerNameMap[p.id] = p.display_name;
    });

    const finalPlayerStats = Object.values(playerStatsMap).map((p) => ({
      player_id: p.player_id,
      name: playerNameMap[p.player_id] || "Unknown Player",
      wins: p.wins,
      losses: p.losses,
      played: p.played,
      winPct: p.played > 0 ? ((p.wins / p.played) * 100).toFixed(1) : "0.0",
    }));

    finalPlayerStats.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winPct - a.winPct;
    });

    setPlayerStats(finalPlayerStats);
  };

  const currentMonthLabel = getMonthLabel(monthKeys[monthIndex]);

  return (
    <div>

      {/* ⭐ Tabs */}
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

      {/* ⭐ Month navigation */}
      <div className="month-toggle">
        <button
          className="month-arrow"
          onClick={() => setMonthIndex((i) => Math.max(0, i - 1))}
        >
          ‹
        </button>

        <span className="month-label">{currentMonthLabel}</span>

        <button
          className="month-arrow"
          onClick={() =>
            setMonthIndex((i) => Math.min(monthKeys.length - 1, i + 1))
          }
        >
          ›
        </button>
      </div>

      {/* ⭐ TEAM TAB */}
      {activeTab === "teams" && (
        <div className="month-scroll">
          <div className="monthly-header">
            <div>#</div>
            <div>Team</div>
            <div>Played</div>
            <div>Wins</div>
            <div>Losses</div>
            <div>Win %</div>
          </div>

          {teamStats.map((team, index) => (
            <div key={team.team_id} className="monthly-row">
              <div className="month-rank">{index + 1}</div>
              <div className="month-team">{team.team_name}</div>
              <div className="month-stat">{team.played}</div>
              <div className="month-stat">{team.wins}</div>
              <div className="month-stat">{team.losses}</div>
              <div className="month-stat">{team.winPct}%</div>
            </div>
          ))}
        </div>
      )}

      {/* ⭐ PLAYER TAB */}
      {activeTab === "players" && (
        <div className="month-scroll">
          <div className="monthly-header">
            <div>#</div>
            <div>Player</div>
            <div>Played</div>
            <div>Wins</div>
            <div>Losses</div>
            <div>Win %</div>
          </div>

          {playerStats.map((p, index) => (
            <div key={p.player_id} className="monthly-row">
              <div className="month-rank">{index + 1}</div>
              <div className="month-team">{p.name}</div>
              <div className="month-stat">{p.played}</div>
              <div className="month-stat">{p.wins}</div>
              <div className="month-stat">{p.losses}</div>
              <div className="month-stat">{p.winPct}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
