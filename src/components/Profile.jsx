import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Profile() {
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user.id;

      const { data: player } = await supabase
        .from("players")
        .select("display_name")
        .eq("user_id", userId)
        .single();

      if (player) setDisplayName(player.display_name);
    }

    loadProfile();
  }, []);

  async function handleSave() {
    setMessage("Saving...");

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user.id;

    // Update players table
    const { error } = await supabase
      .from("players")
      .update({ display_name: displayName })
      .eq("user_id", userId);

    if (error) {
      setMessage("Error updating display name.");
      console.log(error);
      return;
    }

    setMessage("Display name updated!");
  }

  return (
    <div className="profile-page">
      <h2>Profile</h2>

      <label>Display Name</label>
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="login-input"
      />

      <button onClick={handleSave}>Save</button>

      {message && <p>{message}</p>}
    </div>
  );
}
