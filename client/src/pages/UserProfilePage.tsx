import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ACCENT = "#ff2878";
const GRID_LINES = [1, 2, 3, 4, 5, 6, 7];

const corners: React.CSSProperties[] = [
  { top: "36px", left: "36px", borderWidth: "1px 0 0 1px" },
  { top: "36px", right: "36px", borderWidth: "1px 1px 0 0" },
  { bottom: "32px", left: "36px", borderWidth: "0 0 1px 1px" },
  { bottom: "32px", right: "36px", borderWidth: "0 1px 1px 0" },
];

interface UserProfile {
  id: number;
  gamer_tag: string;
  full_name: string;
  email: string;
  role: string;
  profile_image: string | null;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`/api/v1/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.data);
      } catch {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div style={{ padding: "32px", color: "#fff" }}>Loading...</div>;
  if (error || !profile) return <div style={{ padding: "32px", color: "#fff" }}>{error}</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#06040f", fontFamily: "Inter,Arial,sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      {GRID_LINES.map(i => <div key={`h${i}`} style={{ position: "fixed", left: 0, right: 0, top: `${i * 100 / 8}%`, height: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}
      {GRID_LINES.map(i => <div key={`v${i}`} style={{ position: "fixed", top: 0, bottom: 0, left: `${i * 100 / 8}%`, width: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}
      {corners.map((pos, i) => <div key={i} style={{ position: "fixed", width: "14px", height: "14px", borderColor: "rgba(255,40,120,0.35)", borderStyle: "solid", ...pos, pointerEvents: "none" }} />)}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "820px", margin: "0 auto", padding: "56px 32px 60px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,40,120,0.7)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ display: "inline-block", width: "20px", height: "1px", background: "rgba(255,40,120,0.6)" }} />
          ARENA / USER PROFILE
        </div>

        <div style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "32px" }}>
          <span style={{ position: "absolute", top: 0, right: 0, width: "10px", height: "10px", borderTop: "1px solid rgba(255,40,120,0.55)", borderRight: "1px solid rgba(255,40,120,0.55)" }} />
          <span style={{ position: "absolute", bottom: 0, left: 0, width: "10px", height: "10px", borderBottom: "1px solid rgba(255,40,120,0.55)", borderLeft: "1px solid rgba(255,40,120,0.55)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "26px", marginBottom: "34px" }}>
            <div style={{ width: "104px", height: "104px", border: "1px solid rgba(255,40,120,0.35)", background: "rgba(255,40,120,0.08)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {profile.profile_image ? (
                <img src={profile.profile_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "36px", fontWeight: 800, color: ACCENT }}>
                  {profile.gamer_tag[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h1 style={{ fontSize: "34px", lineHeight: 1, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 8px" }}>
                {profile.gamer_tag}<span style={{ color: ACCENT }}>.</span>
              </h1>
              <div style={{ color: "rgba(255,255,255,0.42)", fontSize: "14px", marginBottom: "12px" }}>
                {profile.full_name}
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 10px", border: "1px solid rgba(255,40,120,0.35)", background: "rgba(255,40,120,0.08)", color: ACCENT, fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ACCENT }} />
                {profile.role}
              </span>
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,40,120,0.15)", marginBottom: "24px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(180px, 1fr))", gap: "22px 36px" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>EMAIL</div>
              <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>{profile.email}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>USER ID</div>
              <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>#{profile.id}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>GAMER TAG</div>
              <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>{profile.gamer_tag}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>ROLE</div>
              <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>{profile.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
