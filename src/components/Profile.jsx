import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Profile() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // All Notionist avatar seeds
  const notionSeeds = [
    "alex", "sam", "jordan", "taylor", "morgan", "riley",
    "casey", "jamie", "chris", "devon", "sky", "sage",
    "phoenix", "nova", "river", "ash", "kai", "leo",
    "aria", "luna"
  ];

  // Build avatar URLs
  const avatarOptions = notionSeeds.map(seed =>
    `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`
  );

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      setEmail(user.email);

      const { data: player } = await supabase
        .from("players")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (player) {
        setDisplayName(player.display_name);
        setAvatarUrl(player.avatar_url || "");
      }
    }

    loadProfile();
  }, []);

  const saveAvatar = async () => {
  setSaving(true);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.log("AUTH ERROR:", userError);
    setSaving(false);
    return;
  }

  const user = userData.user;

  const { error: updateError } = await supabase
    .from("players")
    .update({ avatar_url: avatarUrl })
    .eq("user_id", user.id);

  console.log("UPDATE RESULT:", updateError || "OK");
  console.log("LOGGED IN USER:", user.id);


  // 🔔 Notify Players page
  window.dispatchEvent(new Event("avatar-updated"));

  setSaving(false);
};


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

        <div className="avatar-section">

          <img
            src={avatarUrl || avatarOptions[0]}
            alt="avatar"
            className="avatar-preview"
          />

          <div className="avatar-scroll">
            <div className="avatar-grid">
              {avatarOptions.map((url) => (
                <img
                  key={url}
                  src={url}
                  className={`avatar-choice ${avatarUrl === url ? "selected" : ""}`}
                  onClick={() => setAvatarUrl(url)}
                />
              ))}
            </div>
          </div>

          <button className="save-avatar-btn" onClick={saveAvatar}>
            
            {saving ? "Saving..." : "Save Avatar"}
          </button>

        </div>
      </div>
    </div>
  );
}
