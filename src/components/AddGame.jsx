import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function AddGame() {
  const [players, setPlayers] = useState([]);

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [p4, setP4] = useState("");

  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPlayers() {
      const { data, error } = await supabase.from("players").select("*");
      if (error) console.log(error);
      else setPlayers(data);
    }
    loadPlayers();
  }, []);

  // Helper: filter out already selected players
  function availablePlayers(excludeIds = []) {
    return players.filter(p => !excludeIds.includes(String(p.id)));
  }

  async function getOrCreateTeam(playerA, playerB) {
    const [pp1, pp2] = [playerA, playerB].sort();

    const { data: existingTeam } = await supabase
      .from("teams")
      .select("*")
      .eq("player1_id", pp1)
      .eq("player2_id", pp2)
      .single();

    if (existingTeam) return existingTeam;

    const { data: playersData } = await supabase
      .from("players")
      .select("id, display_name")
      .in("id", [pp1, pp2]);

    const name1 = playersData.find(p => p.id === pp1).display_name;
    const name2 = playersData.find(p => p.id === pp2).display_name;

    const { data: newTeam, error } = await supabase
      .from("teams")
      .insert({
        player1_id: pp1,
        player2_id: pp2,
        team_name: `${name1} & ${name2}`,
      })
      .select()
      .single();

    if (error) {
      console.log("TEAM CREATE ERROR:", error);
      return null;
    }

    return newTeam;
  }

  async function handleSave() {
    setMessage("Saving...");

    if (!p1 || !p2 || !p3 || !p4) {
      setMessage("Please select all 4 players.");
      return;
    }

    if (scoreA === "" || scoreB === "") {
      setMessage("Please enter both scores.");
      return;
    }

    const sA = parseInt(scoreA);
    const sB = parseInt(scoreB);

    if (sA < 0 || sB < 0) {
      setMessage("Scores cannot be negative.");
      return;
    }

    if (sA < 21 && sB < 21) {
      setMessage("One team must reach 21 points.");
      return;
    }

    if (sA === sB) {
      setMessage("Scores cannot be equal.");
      return;
    }

    const teamA = await getOrCreateTeam(p1, p2);
    const teamB = await getOrCreateTeam(p3, p4);

    if (!teamA || !teamB) {
      setMessage("Error creating teams.");
      return;
    }

    let winnerTeamId = null;
    let loserTeamId = null;

    if (sA >= 21 && sA > sB) {
      winnerTeamId = teamA.id;
      loserTeamId = teamB.id;
    } else {
      winnerTeamId = teamB.id;
      loserTeamId = teamA.id;
    }

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .insert({
        teamA_id: teamA.id,
        teamB_id: teamB.id,
        winner_team_id: winnerTeamId,
        loser_team_id: loserTeamId,
        date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (matchError) {
      console.log("MATCH ERROR:", matchError);
      console.log("TEAM A:", teamA);
      console.log("TEAM B:", teamB);
      setMessage("Error saving match.");
      return;
    }

    const { error: gameError } = await supabase.from("games").insert({
      match_id: match.id,
      game_number: 1,
      scoreA: sA,
      scoreB: sB,
    });

    if (gameError) {
      console.log(gameError);
      setMessage("Error saving game.");
      return;
    }

    setMessage("Game saved successfully!");
  }

  return (
    <div className="add-game-page">
      <div className="teams-box">
        <div className="team-row">
          <div className="team-block">
            <label>Player 1</label>
            <select value={p1} onChange={(e) => setP1(e.target.value)}>
              <option value="">Select</option>
              {availablePlayers([p2, p3, p4]).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="ampersand">&</div>

          <div className="team-block">
            <label>Player 2</label>
            <select value={p2} onChange={(e) => setP2(e.target.value)}>
              <option value="">Select</option>
              {availablePlayers([p1, p3, p4]).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="vs-text">VS</div>

        <div className="team-row">
          <div className="team-block">
            <label>Player 3</label>
            <select value={p3} onChange={(e) => setP3(e.target.value)}>
              <option value="">Select</option>
              {availablePlayers([p1, p2, p4]).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="ampersand">&</div>

          <div className="team-block">
            <label>Player 4</label>
            <select value={p4} onChange={(e) => setP4(e.target.value)}>
              <option value="">Select</option>
              {availablePlayers([p1, p2, p3]).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="score-box">
        <div className="score-row">
          <label>Score (Team 1)</label>
          <input
            type="number"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
          />
        </div>

        <div className="score-row">
          <label>Score (Team 2)</label>
          <input
            type="number"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
          />
        </div>
      </div>

      <button className="save-btn" onClick={handleSave}>
        Save Game
      </button>

      {message && <p className="status-msg">{message}</p>}
    </div>
  );
}
