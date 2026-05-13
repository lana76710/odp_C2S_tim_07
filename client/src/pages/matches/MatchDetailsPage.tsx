import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MatchesAPIService,
  type Match,
  type MatchPlayer,
} from "../../api_services/matches/MatchesAPIService";
import { TeamsAPIService } from "../../api_services/teams/TeamsAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";

type TeamInfo = { id: number; name: string; tag: string };

type MemberOption = { user_id: number; gamer_tag: string; team_id: number };

export default function MatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const matchId = parseInt(id ?? "0", 10);
  const { user } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<MatchPlayer[]>([]);
  const [team1, setTeam1] = useState<TeamInfo | null>(null);
  const [team2, setTeam2] = useState<TeamInfo | null>(null);
  const [team1Members, setTeam1Members] = useState<MemberOption[]>([]);
  const [team2Members, setTeam2Members] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [team1Score, setTeam1Score] = useState<string>("");
  const [team2Score, setTeam2Score] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");

    let m: Match;
    try {
      m = await MatchesAPIService.getById(matchId);
    } catch (err) {
      console.error("getById failed", err);
      setError("Match not found");
      setLoading(false);
      return;
    }

    setMatch(m);
    setTeam1Score(m.team1_score?.toString() ?? "");
    setTeam2Score(m.team2_score?.toString() ?? "");

    try {
      const pls = await MatchesAPIService.getPlayers(matchId);
      setPlayers(pls);
    } catch (err) {
      console.error("getPlayers failed", err);
      setPlayers([]);
    }

    if (m.team1_id) {
      try {
        const r = await TeamsAPIService.getTeam(m.team1_id);
        if (r.success && r.data) setTeam1({ id: r.data.id, name: r.data.name, tag: r.data.tag });
      } catch (err) { console.error("getTeam1 failed", err); }
      try {
        const members = await TeamsAPIService.getMembers(m.team1_id);
        if (members.success && members.data) {
          setTeam1Members(
            members.data.map((mm) => ({
              user_id: mm.user_id,
              gamer_tag: mm.gamer_tag ?? `User #${mm.user_id}`,
              team_id: m.team1_id!,
            })),
          );
        }
      } catch (err) { console.error("getMembers1 failed", err); }
    }
    if (m.team2_id) {
      try {
        const r = await TeamsAPIService.getTeam(m.team2_id);
        if (r.success && r.data) setTeam2({ id: r.data.id, name: r.data.name, tag: r.data.tag });
      } catch (err) { console.error("getTeam2 failed", err); }
      try {
        const members = await TeamsAPIService.getMembers(m.team2_id);
        if (members.success && members.data) {
          setTeam2Members(
            members.data.map((mm) => ({
              user_id: mm.user_id,
              gamer_tag: mm.gamer_tag ?? `User #${mm.user_id}`,
              team_id: m.team2_id!,
            })),
          );
        }
      } catch (err) { console.error("getMembers2 failed", err); }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (matchId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const handleSubmitResult = async () => {
    if (!match || match.team1_id == null || match.team2_id == null) return;
    const s1 = parseInt(team1Score, 10);
    const s2 = parseInt(team2Score, 10);
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      alert("Enter valid non-negative integers (format X:Y).");
      return;
    }
    if (s1 === s2) {
      alert("Result must have a clear winner — scores cannot be equal.");
      return;
    }
    const winner_team_id = s1 > s2 ? match.team1_id : match.team2_id;
    setSubmitting(true);
    try {
      await MatchesAPIService.updateResult(match.id, {
        team1_score: s1,
        team2_score: s2,
        winner_team_id,
      });
      await load();
    } catch {
      alert("Failed to update result");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPlayer = async (userId: number, teamId: number) => {
    try {
      await MatchesAPIService.addPlayers(matchId, [{ user_id: userId, team_id: teamId }]);
      const pls = await MatchesAPIService.getPlayers(matchId);
      setPlayers(pls);
    } catch {
      alert("Failed to add player. Only the team captain can lineup players.");
    }
  };

  const handleRemovePlayer = async (userId: number) => {
    try {
      await MatchesAPIService.removePlayer(matchId, userId);
      const pls = await MatchesAPIService.getPlayers(matchId);
      setPlayers(pls);
    } catch {
      alert("Failed to remove player. Only the team captain can edit lineup.");
    }
  };

  if (loading) return <p className="text-sm text-white/70">Loading match details...</p>;
  if (error || !match) {
    return (
      <div className="space-y-3 text-white">
        <h1 className="text-2xl font-semibold">Match not found</h1>
        <p className="text-sm text-white/70">No data for match #{matchId}.</p>
        <Link className="underline text-sm text-blue-400" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const teamLabel = (info: TeamInfo | null, fallbackId: number | null) =>
    info ? `${info.name} (${info.tag})` : fallbackId == null ? "TBD" : `Team #${fallbackId}`;

  const renderRoster = (
    teamInfo: TeamInfo | null,
    teamId: number | null,
    members: MemberOption[],
  ) => {
    const active = players.filter((p) => p.team_id === teamId);
    const activeIds = new Set(active.map((p) => p.user_id));
    const benched = members.filter((m) => !activeIds.has(m.user_id));

    return (
      <article className="rounded-lg border border-white/10 p-4 bg-white/5 space-y-3">
        <h2 className="font-semibold">{teamLabel(teamInfo, teamId)}</h2>

        <div>
          <p className="text-xs uppercase tracking-wider text-white/40 mb-2">
            Active in match
          </p>
          {active.length === 0 ? (
            <p className="text-sm text-white/50">No players assigned yet.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {active.map((p) => {
                const member = members.find((m) => m.user_id === p.user_id);
                return (
                  <li key={p.user_id} className="flex justify-between items-center">
                    <span>{member?.gamer_tag ?? `User #${p.user_id}`}</span>
                    {user && (
                      <button
                        onClick={() => handleRemovePlayer(p.user_id)}
                        className="text-xs text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {user && teamId != null && benched.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40 mb-2">
              Add player (captain only)
            </p>
            <ul className="text-sm space-y-1">
              {benched.map((m) => (
                <li key={m.user_id} className="flex justify-between items-center">
                  <span>{m.gamer_tag}</span>
                  <button
                    onClick={() => handleAddPlayer(m.user_id, teamId)}
                    className="text-xs text-blue-300 hover:text-blue-200"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">
            {teamLabel(team1, match.team1_id)} vs {teamLabel(team2, match.team2_id)}
          </h1>
          <p className="text-sm text-white/70">
            Match #{match.id} • Round {match.round_number} • Match {match.match_number} • Status:{" "}
            {match.status}
          </p>
        </div>
        <Link
          to={`/tournaments/${match.tournament_id}/bracket`}
          className="px-3 py-2 rounded border border-white/15 text-sm hover:bg-white/5"
        >
          ← Bracket
        </Link>
      </div>

      <section className="rounded-lg border border-white/10 p-4 bg-white/5">
        <h2 className="font-semibold mb-2">Score</h2>
        <p className="text-lg">
          {teamLabel(team1, match.team1_id)}{" "}
          <span className="text-emerald-400">{match.team1_score ?? "-"}</span> :{" "}
          <span className="text-emerald-400">{match.team2_score ?? "-"}</span>{" "}
          {teamLabel(team2, match.team2_id)}
        </p>
        {match.winner_team_id && (
          <p className="text-sm text-white/70 mt-1">
            Winner:{" "}
            {match.winner_team_id === match.team1_id
              ? teamLabel(team1, match.team1_id)
              : teamLabel(team2, match.team2_id)}
          </p>
        )}

        {user?.role === "admin" && match.team1_id != null && match.team2_id != null && (
          <div className="mt-4 flex gap-2 items-center">
            <input
              type="number"
              min={0}
              value={team1Score}
              onChange={(e) => setTeam1Score(e.target.value)}
              className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1"
              placeholder="0"
            />
            <span>:</span>
            <input
              type="number"
              min={0}
              value={team2Score}
              onChange={(e) => setTeam2Score(e.target.value)}
              className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1"
              placeholder="0"
            />
            <button
              onClick={handleSubmitResult}
              disabled={submitting}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {submitting ? "Saving..." : "Save result"}
            </button>
          </div>
        )}
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {renderRoster(team1, match.team1_id, team1Members)}
        {renderRoster(team2, match.team2_id, team2Members)}
      </section>
    </div>
  );
}
