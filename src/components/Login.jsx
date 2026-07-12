import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Load current user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (data.user) {
        // Fetch display name from players table
        const { data: player } = await supabase
          .from("players")
          .select("display_name")
          .eq("user_id", data.user.id)
          .single();

        setProfile(player);
      }
    }

    loadUser();
  }, []);

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Invalid login credentials");
      return;
    }

    setUser(data.user);

    // Load profile
    const { data: player } = await supabase
      .from("players")
      .select("display_name")
      .eq("user_id", data.user.id)
      .single();

    setProfile(player);
  }

  async function handleSignup() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage("Signup failed: " + error.message);
      return;
    }

    // Insert into players table
    await supabase.from("players").insert({
      user_id: data.user.id,
      display_name: displayName || email.split("@")[0],
    });

    setMessage("Signup successful! Check your email.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  // ⭐ If logged in, show logged-in UI
  if (user) {
    return (
      <div className="login-page">
        <h2 className="title">Logged In</h2>
        <p className="subtitle">
          Logged in as <strong>{profile?.display_name}</strong>
        </p>

        <button className="login-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  // ⭐ Otherwise show login/signup form
  return (
    <div className="login-page">
      <h2 className="title">{isSignup ? "Sign Up" : "Login"}</h2>

      <input
        className="login-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="login-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isSignup && (
        <input
          className="login-input"
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      )}

      <button className="login-button" onClick={isSignup ? handleSignup : handleLogin}>
        {isSignup ? "Create Account" : "Login"}
      </button>

      <p className="subtitle" style={{ cursor: "pointer" }} onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </p>

      <p className="status-msg">{message}</p>
    </div>
  );
}
