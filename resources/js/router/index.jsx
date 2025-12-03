import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import HouseHub from "../pages/HouseHub";
import Building from "../pages/Building";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/househub/:id" element={<HouseHub />} />
                <Route path="/building/:id" element={<Building />} />
            </Routes>
        </BrowserRouter>
    );
}
