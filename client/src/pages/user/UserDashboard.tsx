import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader eyebrow="Overview" title={`Welcome, ${user?.gamer_tag}`} />
      <p className="text-white/70 text-sm mb-4">Najnoviji mečevi iz watchliste.</p>
      <ul className="text-sm space-y-2">
        <li><Link to="/matches/1" className="underline">Match #1</Link></li>
        <li><Link to="/matches/2" className="underline">Match #2</Link></li>
      </ul>
      <div className="mt-4">
        <Link to="/profile" className="underline text-sm">Idi na profil</Link>
      </div>
    </div>
  );
}