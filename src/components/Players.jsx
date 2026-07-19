import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Players() {
  const [players, setPlayers] = useState([]);

  // ⭐ FIX: loadPlayers must be OUTSIDE useEffect
  async function loadPlayers() {
    // 1️⃣ Fetch all players
    const { data: playersData } = await supabase
      .from("players")
      .select("id, display_name, avatar_url, user_id");

    console.log("PLAYERS FROM SUPABASE:", playersData);

    if (!playersData) return;

    // 2️⃣ Fetch all teams
    const { data: teams } = await supabase
      .from("teams")
      .select("id, player1_id, player2_id");

    const teamPlayers = {};
    teams.forEach((t) => {
      teamPlayers[t.id] = [t.player1_id, t.player2_id];
    });

    // 3️⃣ Fetch matches
    const { data: matches } = await supabase
      .from("matches")
      .select("winner_team_id, loser_team_id");

    // Initialize stats
    const stats = {};
    playersData.forEach((p) => {
      stats[p.id] = { played: 0, wins: 0, losses: 0 };
    });

    // 4️⃣ Compute stats
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

    // 5️⃣ Build final player list
    const finalPlayers = playersData.map((p) => {
      const s = stats[p.id];
      const rating =
        s.played > 0 ? ((s.wins / s.played) * 100).toFixed(1) : "0.0";

      return {
        id: p.id,
        name: p.display_name,

        // ⭐ FIXED AVATAR FALLBACK
        avatar:
          p.avatar_url && p.avatar_url.length > 0
            ? p.avatar_url
            : `https://api.dicebear.com/7.x/notionists/svg?seed=${p.user_id}`,

        played: s.played,
        wins: s.wins,
        losses: s.losses,
        rating,
      };
    });

    setPlayers(finalPlayers);
  }

  // ⭐ useEffect only sets up listeners
  useEffect(() => {
    loadPlayers();

    const handler = () => {
      console.log("AVATAR UPDATED EVENT RECEIVED");
      loadPlayers();
    };

    window.addEventListener("avatar-updated", handler);

    return () => window.removeEventListener("avatar-updated", handler);
  }, []);

  return (
    <div className="players-page">
      <div className="players-grid">
        {players.map((p) => (
          <div key={p.id} className="player-card">
            <div className="player-top">
              <div className="player-avatar-rect">
                <img src={p.avatar} alt={p.name} />
              </div>

              <div className="player-name-fullheight">{p.name}</div>
            </div>

            <div className="player-stats">
              <div className="player-stat-box">
                <div className="player-stat-row">
                  <div className="player-stat-label">Played</div>
                  <div className="player-stat-value">{p.played}</div>
                </div>
              </div>

              <div className="player-stat-box">
                <div className="player-stat-row">
                  <div className="player-stat-label">Wins</div>
                  <div className="player-stat-value">{p.wins}</div>
                </div>
              </div>

              <div className="player-stat-box">
                <div className="player-stat-row">
                  <div className="player-stat-label">Losses</div>
                  <div className="player-stat-value">{p.losses}</div>
                </div>
              </div>

              <div className="player-stat-box">
                <div className="player-stat-row">
                  <div className="player-stat-label">Rating</div>
                  <div className="player-stat-value">{p.rating}%</div>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
