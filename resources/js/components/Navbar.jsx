import React, { useState } from "react";

export default function Navbar({ onLogout, userName, userEmail, profilePictureUrl }) {
    const [showDropdown, setShowDropdown] = useState(false);

    const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

    const navigate = (path) => {
        window.location.href = path;
    };

    const isActive = (path) => window.location.pathname === path;

    const navLinkStyle = (path) => ({
        color: isActive(path) ? "#3a76f2" : "#333",
        textDecoration: "none",
        fontWeight: isActive(path) ? 600 : 500,
        transition: "all 0.2s",
        padding: "8px 16px",
        borderRadius: 6,
        background: isActive(path) ? "#e8f0fe" : "transparent",
        cursor: "pointer"
    });

    const profileIconStyle = {
        width: 36,
        height: 36,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 600,
        fontSize: "0.9rem",
        boxShadow: "0 2px 6px rgba(58, 118, 242, 0.3)",
        background: profilePictureUrl
            ? `url(${profilePictureUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #3a76f2, #6aafff)",
    };

    return (
        <nav style={{
            background: "#ffffff",
            borderBottom: "1px solid #e0e0e0",
            padding: "15px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            position: "sticky",
            top: 0,
            zIndex: 100
        }}>
            <div
                onClick={() => navigate("/")}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer"
                }}>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #3a76f2, #6aafff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1.2rem"
                }}>
                    H
                </div>
                <h2 style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#3a76f2",
                    margin: 0
                }}>
                    HouseHub
                </h2>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div
                    onClick={() => navigate("/")}
                    style={navLinkStyle("/")}
                    onMouseOver={(e) => {
                        if (!isActive("/")) {
                            e.currentTarget.style.background = "#f8f9fa";
                            e.currentTarget.style.color = "#3a76f2";
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!isActive("/")) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#333";
                        }
                    }}
                >
                    🏠 Home
                </div>
                <div
                    onClick={() => navigate("/dashboard")}
                    style={navLinkStyle("/dashboard")}
                    onMouseOver={(e) => {
                        if (!isActive("/dashboard")) {
                            e.currentTarget.style.background = "#f8f9fa";
                            e.currentTarget.style.color = "#3a76f2";
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!isActive("/dashboard")) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#333";
                        }
                    }}
                >
                    📊 Dashboard
                </div>
            </div>

            <div style={{ position: "relative" }}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: showDropdown ? "#f8f9fa" : "transparent",
                        border: showDropdown ? "1px solid #e0e0e0" : "1px solid transparent",
                        cursor: "pointer",
                        padding: "8px 12px",
                        borderRadius: 8,
                        transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                        if (!showDropdown) {
                            e.currentTarget.style.background = "#f8f9fa";
                            e.currentTarget.style.borderColor = "#e0e0e0";
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!showDropdown) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                        }
                    }}
                >
                    <div style={profileIconStyle}>
                        {!profilePictureUrl && userInitial}
                    </div>
                    <span style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        fontWeight: 500,
                        transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s"
                    }}>
                        ▼
                    </span>
                </button>

                {showDropdown && (
                    <>
                        <div
                            onClick={() => setShowDropdown(false)}
                            style={{
                                position: "fixed",
                                inset: 0,
                                zIndex: 999
                            }}
                        />
                        <div style={{
                            position: "absolute",
                            top: "calc(100% + 10px)",
                            right: 0,
                            background: "#fff",
                            border: "1px solid #e0e0e0",
                            borderRadius: 12,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            minWidth: 220,
                            overflow: "hidden",
                            zIndex: 1000,
                            animation: "slideDown 0.2s ease"
                        }}>
                            <div style={{
                                padding: "16px",
                                borderBottom: "1px solid #f0f0f0",
                                background: "#f8f9fa"
                            }}>
                                <div style={{ fontWeight: 600, color: "#333", fontSize: "0.95rem" }}>{userName || "Guest"}</div>
                                <div style={{ fontSize: "0.8rem", color: "#666", marginTop: 4 }}>
                                    {userEmail || "N/A"}
                                </div>
                            </div>

                            <div
                                onClick={() => {
                                    setShowDropdown(false);
                                    navigate("/profile");
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "12px 16px",
                                    color: "#333",
                                    cursor: "pointer",
                                    transition: "background 0.2s",
                                    fontSize: "0.95rem"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = "#f8f9fa"}
                                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                <span style={{ fontSize: "1.2rem" }}>👤</span>
                                <span>My Profile</span>
                            </div>

                            <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 4 }}>
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        onLogout();
                                    }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "12px 16px",
                                        border: "none",
                                        background: "transparent",
                                        color: "#dc3545",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        fontSize: "0.95rem",
                                        transition: "background 0.2s",
                                        fontWeight: 500
                                    }}
                                    onMouseOver={(e) => e.target.style.background = "#fff5f5"}
                                    onMouseOut={(e) => e.target.style.background = "transparent"}
                                >
                                    <span style={{ fontSize: "1.2rem" }}>🚪</span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </nav>
    );
}
