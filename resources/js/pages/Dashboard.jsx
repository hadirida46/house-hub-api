import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
    const [househubs, setHousehubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPictureUrl, setUserPictureUrl] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/";
            return;
        }

        api.get("/profile").then((res) => {
            const userData = res.data.user || res.data;
            setUserName(userData.name || '');
            setUserEmail(userData.email || '');
            setUserPictureUrl(userData.profile_picture || null);
        });

        api.get("/househubs").then((res) => {
            setHousehubs(res.data.househubs || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const cardHoverProps = {
        onMouseOver: (e) => {
            e.currentTarget.style.transform = "translateY(-6px)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(45, 100, 255, 0.15)";
        },
        onMouseOut: (e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.08)";
        },
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: 25,
        background: "#ffffff",
        cursor: "pointer",
        border: "1px solid #e0e0e0",
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontSize: "1.5rem", color: "#3a76f2" }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: "100vh", background: "#f9fbff" }}>
            <Navbar onLogout={handleLogout} userName={userName} userEmail={userEmail} profilePictureUrl={userPictureUrl} />

            <main style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
                <h2 style={{ marginBottom: 20, color: "#333" }}>Your HouseHubs</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
                    {househubs.map((hub) => (
                        <div key={hub.id} style={cardHoverProps} onClick={() => console.log("Navigate to Hub " + hub.id)}>
                            <h3 style={{ color: "#3a76f2" }}>{hub.name}</h3>
                            <p style={{ color: "#666" }}>{hub.description || "No description available"}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
