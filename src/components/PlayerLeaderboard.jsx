export default function PlayerLeaderboard({ players }) {
  return (
    <div className="player-leaderboard">

      {/* COLUMN HEADERS */}
      <div className="leaderboard-header leaderboard-row">
        <div className="leaderboard-rank">#</div>
        <div className="leaderboard-name">Player</div>
        <div className="leaderboard-stat">Played</div>
        <div className="leaderboard-stat">Wins</div>
        <div className="leaderboard-stat">Losses</div>
        <div className="leaderboard-stat">Rating</div>
      </div>

      {/* SORTED PLAYER ROWS */}
      {players.sort((a, b) => b.rating - a.rating).map((p, index) => (
        <div key={p.id} className="leaderboard-row">
            <div className="leaderboard-rank">{index + 1}</div>
            <div className="leaderboard-name">{p.name}</div>
            <div className="leaderboard-stat">{p.played}</div>
            <div className="leaderboard-stat">{p.wins}</div>
            <div className="leaderboard-stat">{p.losses}</div>
            <div className="leaderboard-stat">{p.rating}%</div>
        </div>
))}
    </div>
  );
}
