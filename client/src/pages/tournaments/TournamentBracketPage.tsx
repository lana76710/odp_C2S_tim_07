import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MatchesAPIService, type Match } from "../../api_services/matches/MatchesAPIService";
import { TeamsAPIService } from "../../api_services/teams/TeamsAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { StatusBadge } from "../../components/ui/UI";

export default function TournamentBracketPage() {
  const { id } = useParams<{ id: string }>();
  const tournamentId = parseInt(id ?? "0", 10);
  const { user } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [teamNames, setTeamNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [roundFilter, setRoundFilter] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await MatchesAPIService.getByTournament(tournamentId);
      setMatches(data);

      const ids = new Set<number>();
      data.forEach((m) => {
        if (m.team1_id) ids.add(m.team1_id);
        if (m.team2_id) ids.add(m.team2_id);
      });

      const names: Record<number, string> = {};
      await Promise.all(
        Array.from(ids).map(async (teamId) => {
          const r = await TeamsAPIService.getTeam(teamId);
          if (r.success && r.data) names[teamId] = `${r.data.name} (${r.data.tag})`;
        }),
      );
      setTeamNames(names);
    } catch {
      setError("Failed to load bracket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  const handleGenerate = async () => {
    if (!confirm("Generate bracket? This will create all matches from confirmed teams.")) return;
    setGenerating(true);
    try {
      await MatchesAPIService.generateBracket(tournamentId);
      await load();
    } catch {
      alert("Bracket generation failed. Make sure there are at least 2 confirmed teams.");
    } finally {
      setGenerating(false);
    }
  };

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (statusFilter && m.status !== statusFilter) return false;
      if (roundFilter && String(m.round_number) !== roundFilter) return false;
      if (teamFilter) {
        const t = parseInt(teamFilter, 10);
        if (m.team1_id !== t && m.team2_id !== t) return false;
      }
      return true;
    });
  }, [matches, statusFilter, roundFilter, teamFilter]);

  const rounds = useMemo(() => {
    const map = new Map<number, Match[]>();
    filtered.forEach((m) => {
      if (!map.has(m.round_number)) map.set(m.round_number, []);
      map.get(m.round_number)!.push(m);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const teamLabel = (teamId: number | null) =>
    teamId == null ? "TBD" : teamNames[teamId] ?? `Team #${teamId}`;

  if (loading) return <div className="p-8 text-white">Loading bracket...</div>;

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Tournament bracket</h1>
          <p className="text-sm text-white/70">Tournament #{tournamentId}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/tournaments/${tournamentId}`}
            className="px-3 py-2 rounded border border-white/15 text-sm hover:bg-white/5"
          >
            ← Tournament details
          </Link>
          {user?.role === "admin" && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {generating ? "Generating..." : matches.length > 0 ? "Regenerate bracket" : "Generate bracket"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 flex-wrap text-sm">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
        >
          <option value="">All rounds</option>
          {Array.from(new Set(matches.map((m) => m.round_number)))
            .sort((a, b) => a - b)
            .map((r) => (
              <option key={r} value={r}>
                Round {r}
              </option>
            ))}
        </select>
        <input
          type="number"
          placeholder="Filter by team ID"
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 w-40"
        />
        {(statusFilter || roundFilter || teamFilter) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setRoundFilter("");
              setTeamFilter("");
            }}
            className="px-3 py-2 rounded border border-white/15 hover:bg-white/5"
          >
            Clear
          </button>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="rounded-lg border border-white/10 p-6 bg-white/5">
          <p className="text-white/70 text-sm">
            No matches yet. {user?.role === "admin"
              ? "Generate the bracket once confirmed teams are ready."
              : "Bracket has not been generated yet."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rounds.map(([round, list]) => (
            <section key={round} className="rounded-lg border border-white/10 p-4 bg-white/5">
              <h2 className="font-semibold mb-3">Round {round}</h2>
              <ul className="space-y-2 text-sm">
                {list.map((m) => (
                  <li key={m.id} className="rounded border border-white/10 p-3">
                    <Link to={`/matches/${m.id}`} className="block hover:bg-white/5 -m-3 p-3 rounded">
                      <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
                        <span>Match #{m.match_number}</span>
                        <StatusBadge status={m.status} />
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className={m.winner_team_id === m.team1_id ? "font-semibold text-emerald-400" : ""}>
                          {teamLabel(m.team1_id)}
                        </span>
                        <span className="text-white/40">
                          {m.team1_score ?? "-"} : {m.team2_score ?? "-"}
                        </span>
                        <span className={m.winner_team_id === m.team2_id ? "font-semibold text-emerald-400" : ""}>
                          {teamLabel(m.team2_id)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
