import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Stats() {
  const [players, setPlayers] = useState([]);
  const [pA, setPA] = useState("");
  const [pB, setPB] = useState("");

  const [teamH2H, setTeamH2H] = useState(null);
  const [teammateStats, setTeammateStats] = useState(null);

  useEffect(() => {
    async function loadPlayers() {
      const { data } = await supabase
        .from("players")
        .select("id, display_name")
        .order("display_name", { ascending: true });

      setPlayers(data || []);
    }
    loadPlayers();
  }, []);

  function handlePresetSelect(playerId) {
    if (!pA) return setPA(playerId);
    if (!pB) return setPB(playerId);
  }

  function handleClear() {
    setPA("");
    setPB("");
    setTeamH2H(null);
    setTeammateStats(null);
  }

  async function handleCompare() {
    if (!pA || !pB) return;

    const { data: teams } = await supabase
      .from("teams")
      .select("id, player1_id, player2_id");

    const teamPlayers = {};
    teams.forEach((t) => {
      teamPlayers[t.id] = [t.player1_id, t.player2_id];
    });

    const { data: matches } = await supabase.from("matches").select("*");

    // ⭐ TEAM HEAD‑TO‑HEAD (opponents only)
    let totalTeamMatches = 0;
    let aTeamWins = 0;
    let bTeamWins = 0;

    matches.forEach((m) => {
      const teamAPlayers = teamPlayers[m.teamA_id];
      const teamBPlayers = teamPlayers[m.teamB_id];

      const aOnTeamA = teamAPlayers.includes(pA);
      const aOnTeamB = teamBPlayers.includes(pA);

      const bOnTeamA = teamAPlayers.includes(pB);
      const bOnTeamB = teamBPlayers.includes(pB);

      const areOpponents =
        (aOnTeamA && bOnTeamB) ||
        (aOnTeamB && bOnTeamA);

      if (areOpponents) {
        totalTeamMatches++;

        const winnerPlayers = teamPlayers[m.winner_team_id];

        if (winnerPlayers.includes(pA)) aTeamWins++;
        if (winnerPlayers.includes(pB)) bTeamWins++;
      }
    });

    setTeamH2H({
      total: totalTeamMatches,
      aWins: aTeamWins,
      bWins: bTeamWins,
    });

    // ⭐ TEAMMATE STATS (same team)
    let totalTogether = 0;
    let winsTogether = 0;
    let lossesTogether = 0;

    matches.forEach((m) => {
      const winnerPlayers = teamPlayers[m.winner_team_id];
      const loserPlayers = teamPlayers[m.loser_team_id];

      const sameTeamWinner =
        winnerPlayers.includes(pA) && winnerPlayers.includes(pB);

      const sameTeamLoser =
        loserPlayers.includes(pA) && loserPlayers.includes(pB);

      if (sameTeamWinner || sameTeamLoser) {
        totalTogether++;

        if (sameTeamWinner) winsTogether++;
        if (sameTeamLoser) lossesTogether++;
      }
    });

    setTeammateStats({
      total: totalTogether,
      wins: winsTogether,
      losses: lossesTogether,
      winPct:
        totalTogether > 0
          ? ((winsTogether / totalTogether) * 100).toFixed(1)
          : "0.0",
    });
  }

  return (
    <div className="h2h-page">

      <h2>Head‑to‑Head Stats</h2>

      {/* ⭐ PLAYER PRESET BUTTONS */}
      <div className="preset-box">
        <h3>Quick Select Players</h3>
        <div className="preset-row">
          {players.map((p) => {
            const used = [pA, pB].includes(p.id);
            if (used) return null;

            return (
              <button
                key={p.id}
                className="preset-btn"
                onClick={() => handlePresetSelect(p.id)}
              >
                {p.display_name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ⭐ PLAYER SELECT DROPDOWNS */}
      <div className="h2h-select">
        <div>
          <label>Player A</label>
          <select
            className="styled-select"
            value={pA}
            onChange={(e) => setPA(e.target.value)}
          >
            <option value="">Select</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Player B</label>
          <select
            className="styled-select"
            value={pB}
            onChange={(e) => setPB(e.target.value)}
          >
            <option value="">Select</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name}
              </option>
            ))}
          </select>
        </div>

        {/* ⭐ Compare + Clear buttons EXACT MATCH */}
        <div className="action-row">
          <button className="preset-btn" onClick={handleCompare}>
            Compare
          </button>

          <button className="preset-btn" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>

      {/* ⭐ TEAM HEAD‑TO‑HEAD */}
      {teamH2H && (
        <div className="h2h-section">
          <h3>Team Head‑to‑Head (Opponents)</h3>
          <p>Total Matches: {teamH2H.total}</p>
          <p>Player A Team Wins: {teamH2H.aWins}</p>
          <p>Player B Team Wins: {teamH2H.bWins}</p>
        </div>
      )}

      {/* ⭐ TEAMMATE STATS */}
      {teammateStats && (
        <div className="h2h-section">
          <h3>Teammate Stats (Same Team)</h3>
          <p>Total Matches Together: {teammateStats.total}</p>
          <p>Wins Together: {teammateStats.wins}</p>
          <p>Losses Together: {teammateStats.losses}</p>
          <p>Win % Together: {teammateStats.winPct}%</p>
        </div>
      )}
    </div>
  );
}
