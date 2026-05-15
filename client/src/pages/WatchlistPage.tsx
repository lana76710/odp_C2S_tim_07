import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { type Tournament } from "../api_services/tournaments/TournamentsAPIService";

export default function WatchlistPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get("/api/v1/tournaments/watchlist/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTournaments(res.data.data);
      } catch {
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ minHeight: "100%", padding: "32px", fontFamily: "Inter,Arial,sans-serif", color: "#fff" }}>
      <div style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,40,120,0.7)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ display: "inline-block", width: "20px", height: "1px", background: "rgba(255,40,120,0.6)" }} />
        ARENA / WATCHLIST
      </div>

      <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "8px" }}>
        My Watchlist<span style={{ color: "rgba(255,40,120,0.9)" }}>.</span>
      </h1>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "32px" }}>
        Tournaments you're tracking.
      </p>

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
      ) : tournaments.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.3)" }}>You aren't watching any tournaments yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {tournaments.map((t) => (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              style={{
                position: "relative",
                padding: "20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                textDecoration: "none",
                color: "#fff",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,40,120,0.4)";
                e.currentTarget.style.background = "rgba(255,40,120,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, width: "8px", height: "8px", borderTop: "1px solid rgba(255,40,120,0.65)", borderLeft: "1px solid rgba(255,40,120,0.65)" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: "8px", height: "8px", borderTop: "1px solid rgba(255,40,120,0.65)", borderRight: "1px solid rgba(255,40,120,0.65)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "8px", height: "8px", borderBottom: "1px solid rgba(255,40,120,0.65)", borderLeft: "1px solid rgba(255,40,120,0.65)" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "8px", height: "8px", borderBottom: "1px solid rgba(255,40,120,0.65)", borderRight: "1px solid rgba(255,40,120,0.65)" }} />

              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,40,120,0.7)", marginBottom: "8px" }}>
                {t.format.toUpperCase().replace(/_/g, " ")}
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", letterSpacing: "-0.3px" }}>{t.name}</h2>
              <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}>
                <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#ff2878", marginRight: "8px", verticalAlign: "2px" }} />
                {t.status.toUpperCase().replace(/_/g, " ")}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
