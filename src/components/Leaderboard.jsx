import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function loadLeaderboard() {
      // Get all matches
      const { data: matches, error } = await supabase
        .from("matches")
        .select("winner_team_id, loser_team_id");

      if (error) {
        console.log(error);
        return;
      }

      // Count wins, losses, games played
      const winCount = {};
      const lossCount = {};
      const gamesPlayed = {};

      matches.forEach((m) => {
        // Wins
        winCount[m.winner_team_id] = (winCount[m.winner_team_id] || 0) + 1;

        // Losses
        lossCount[m.loser_team_id] = (lossCount[m.loser_team_id] || 0) + 1;

        // Games played (winner)
        gamesPlayed[m.winner_team_id] = (gamesPlayed[m.winner_team_id] || 0) + 1;

        // Games played (loser)
        gamesPlayed[m.loser_team_id] = (gamesPlayed[m.loser_team_id] || 0) + 1;
      });

      // Teams who actually played
      const playedTeams = new Set();
      matches.forEach((m) => {
        playedTeams.add(m.winner_team_id);
        playedTeams.add(m.loser_team_id);
      });

      // Fetch only teams who played
      const { data: teams } = await supabase
        .from("teams")
        .select("*")
        .in("id", Array.from(playedTeams));

      // Build leaderboard rows
      const leaderboard = teams.map((team) => {
        const wins = winCount[team.id] || 0;
        const losses = lossCount[team.id] || 0;
        const played = gamesPlayed[team.id] || 0;

        const winPercentage =
          played > 0 ? ((wins / played) * 100).toFixed(1) : "0.0";

        return {
          id: team.id,
          team_name: team.team_name,
          wins,
          losses,
          played,
          winPercentage,
        };
      });

      // Sort by wins
      leaderboard.sort((a, b) => b.wins - a.wins);

      setRows(leaderboard);
    }

    loadLeaderboard();
  }, []);

  return (
    <div className="leaderboard-wrapper">

      {/* TABLE CARD */}
      <div className="leaderboard-card">

        {/* COLUMN HEADERS */}
        <div className="leaderboard-header">
          <div className="rank">Rank</div>
          <div className="team-name">Team</div>
          <div className="wins">Wins</div>
          <div className="played">Played</div>
          <div className="losses">Losses</div>
          <div className="percent">Win %</div>
        </div>

        {/* EMPTY STATE */}
        {rows.length === 0 && (
          <div className="leaderboard-empty">No games recorded yet.</div>
        )}

        {/* ROWS */}
        {rows.map((row, index) => (
          <div key={row.id} className="leaderboard-row">
            <div className="rank">{index + 1}</div>
            <div className="team-name">{row.team_name}</div>
            <div className="wins">{row.wins}</div>
            <div className="played">{row.played}</div>
            <div className="losses">{row.losses}</div>
            <div className="percent">{row.winPercentage}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
