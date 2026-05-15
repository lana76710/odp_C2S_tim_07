import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TournamentsAPIService } from "../../api_services/tournaments/TournamentsAPIService";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import type { GameDto } from "../../models/game/GameTypes";

export default function AdminTournamentCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState<number>(1);
  const [games, setGames] = useState<GameDto[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [format, setFormat] = useState("single_elimination");
  const [maxTeams, setMaxTeams] = useState<number>(8);
  const [prizePool, setPrizePool] = useState<string>("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

  useEffect(() => {
    setGamesLoading(true);
    gamesApi.getAll()
      .then((res) => {
        if (res.success && res.data?.length) {
          setGames(res.data);
          setGameId(res.data[0].id);
        } else if (!res.success) {
          setError(res.message ?? "Failed to load games");
        }
      })
      .finally(() => setGamesLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("Tournament name must be at least 3 characters.");
      return;
    }

    if (!Number.isInteger(maxTeams) || maxTeams < 2 || maxTeams > 256 || !isPowerOfTwo(maxTeams)) {
      setError("Max teams must be a power of 2 (2, 4, 8, 16, 32...) and between 2 and 256.");
      return;
    }

    setSubmitting(true);
    try {
      const parsedPrizePool = prizePool.trim() === "" ? undefined : parseFloat(prizePool);

      await TournamentsAPIService.create({
        name,
        game_id: gameId,
        format,
        max_teams: maxTeams,
        prize_pool: Number.isNaN(parsedPrizePool) ? undefined : parsedPrizePool,
        registration_deadline: registrationDeadline,
        start_date: startDate,
      });
      navigate("/tournaments");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? "Failed to create tournament"
          : "Failed to create tournament"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 text-white max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Tournament</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-4 text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Game</label>
          {gamesLoading ? (
            <div className="text-sm text-zinc-400">Loading games...</div>
          ) : games.length === 0 ? (
            <div className="text-sm text-red-300">No games found. Create a game first.</div>
          ) : (
            <select
              value={gameId}
              onChange={(e) => setGameId(parseInt(e.target.value, 10))}
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name} (id: {game.id})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          >
            <option value="single_elimination">Single elimination</option>
            <option value="double_elimination">Double elimination</option>
            <option value="round_robin">Round robin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Max teams</label>
          <input
            type="number"
            value={maxTeams}
            onChange={(e) => setMaxTeams(parseInt(e.target.value, 10))}
            required
            min={2}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
          <p className="mt-1 text-xs text-zinc-500">Must be a power of two: 2, 4, 8, 16, 32...</p>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Prize pool ($)</label>
          <input
            type="number"
            value={prizePool}
            onChange={(e) => setPrizePool(e.target.value)}
            placeholder="Optional"
            min={0}
            step={0.01}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Registration deadline</label>
          <input
            type="datetime-local"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Start date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || gamesLoading || games.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded font-semibold"
        >
          {submitting ? "Creating..." : "Create tournament"}
        </button>
      </form>
    </div>
  );
}