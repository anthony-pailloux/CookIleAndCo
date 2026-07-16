import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute() {
    return (
        <>
        <Outlet />
        
        </>
    )
}

export default AdminRoute;