import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to auth page but save the attempted location
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Check if user is admin
    if (user?.role !== "admin") {
        // User is logged in but not an admin - redirect to home with error
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
