import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth";

export default function ProtectedRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="grid min-h-screen place-items-center bg-blue text-light-blue">Loading OWO…</div>;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    return <Outlet />;
}
