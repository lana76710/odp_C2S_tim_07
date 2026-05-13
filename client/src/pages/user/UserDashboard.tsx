import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader eyebrow="Overview" title={`Welcome, ${user?.gamer_tag}`} />

      <p className="text-white/70 text-sm mb-6">
        Jump into a tournament or check the teams you manage.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
        <Link
          to="/tournaments"
          className="rounded-lg border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition"
        >
          <p className="text-white font-medium">Tournaments</p>
          <p className="text-xs text-white/50 mt-1">Browse and register your team.</p>
        </Link>

        <Link
          to="/teams"
          className="rounded-lg border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition"
        >
          <p className="text-white font-medium">My teams</p>
          <p className="text-xs text-white/50 mt-1">Manage your rosters and invites.</p>
        </Link>

        <Link
          to="/watchlist"
          className="rounded-lg border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition"
        >
          <p className="text-white font-medium">Watchlist</p>
          <p className="text-xs text-white/50 mt-1">Tournaments you are following.</p>
        </Link>

        <Link
          to={`/users/${user?.id}`}
          className="rounded-lg border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition"
        >
          <p className="text-white font-medium">My profile</p>
          <p className="text-xs text-white/50 mt-1">View and edit your profile.</p>
        </Link>
      </div>
    </div>
  );
}
