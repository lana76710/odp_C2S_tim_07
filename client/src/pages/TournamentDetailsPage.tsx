import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TournamentsAPIService, type Tournament } from "../api_services/tournaments/TournamentsAPIService";

export default function TournamentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<{ team_id: number; status: string; registered_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    if (!id) return;
    const tournamentId = parseInt(id, 10);

    const load = async () => {
      setLoading(true);
      try {
        const t = await TournamentsAPIService.getById(tournamentId);
        setTournament(t);
        const regs = await TournamentsAPIService.getRegistrations(tournamentId);
        setRegistrations(regs);
      } catch {
        setError("Tournament not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleWatch = async () => {
    if (!tournament) return;
    try {
      if (watching) {
        await TournamentsAPIService.unwatch(tournament.id);
        setWatching(false);
      } else {
        await TournamentsAPIService.watch(tournament.id);
        setWatching(true);
      }
    } catch {
      alert("Action failed");
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error || !tournament) return <div className="p-8 text-white">{error}</div>;

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <Link to="/tournaments" className="text-blue-400 hover:underline mb-4 inline-block">
        ← Back to tournaments
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <button
            onClick={handleWatch}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
          >
            {watching ? "Unwatch" : "Watch"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-zinc-400">Format:</span> {tournament.format}</div>
          <div><span className="text-zinc-400">Status:</span> <span className="text-blue-400">{tournament.status}</span></div>
          <div><span className="text-zinc-400">Max teams:</span> {tournament.max_teams}</div>
          <div><span className="text-zinc-400">Prize pool:</span> ${tournament.prize_pool ?? 0}</div>
          <div><span className="text-zinc-400">Registration deadline:</span> {new Date(tournament.registration_deadline).toLocaleString()}</div>
          <div><span className="text-zinc-400">Start date:</span> {new Date(tournament.start_date).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Registered Teams ({registrations.length})</h2>
        {registrations.length === 0 ? (
          <p className="text-zinc-400">No teams registered yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-zinc-400 text-left">
              <tr>
                <th className="py-2">Team ID</th>
                <th className="py-2">Status</th>
                <th className="py-2">Registered at</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.team_id} className="border-t border-zinc-800">
                  <td className="py-2">{r.team_id}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      r.status === "confirmed" ? "bg-green-700" :
                      r.status === "disqualified" ? "bg-red-700" : "bg-yellow-700"
                    }`}>{r.status}</span>
                  </td>
                  <td className="py-2">{new Date(r.registered_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}