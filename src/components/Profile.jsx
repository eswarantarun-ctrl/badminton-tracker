import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Profile() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      setEmail(user.email);

      const { data: player } = await supabase
        .from("players")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      if (player) setDisplayName(player.display_name);
    }

    loadProfile();
  }, []);

  return (
    <div className="profile-page">
      <h2 className="title">My Profile</h2>

      <div className="profile-box">
        <div className="profile-row">
          <label>Email:</label>
          <div className="profile-value">{email}</div>
        </div>

        <div className="profile-row">
          <label>Display Name:</label>
          <div className="profile-value">{displayName}</div>
        </div>
      </div>
    </div>
  );
}
