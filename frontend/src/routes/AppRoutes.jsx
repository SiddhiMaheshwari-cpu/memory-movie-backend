import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Studio from "../pages/Studio/Studio";
import Preview from "../pages/Preview/Preview";
import Upload from "../pages/upload/upload";
import SignOut from "../pages/SignOut/SignOut";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>

            <Route path="/" element={<Landing />} />

            <Route path="/login" element={<Login />} />

            {/* Support both /register and /signup */}
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />

            {/* Synchronized with backend logout route */}
            <Route
                path="/logout"
                element={
                    <ProtectedRoute>
                        <SignOut />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/studio"
                element={
                    <ProtectedRoute>
                        <Studio />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/preview"
                element={
                    <ProtectedRoute>
                        <Preview />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/upload"
                element={
                    <ProtectedRoute>
                        <Upload />
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}

export default AppRoutes;