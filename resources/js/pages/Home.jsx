import React, { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPictureUrl, setUserPictureUrl] = useState(null);
    const [authMode, setAuthMode] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [househubs, setHousehubs] = useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            api.get("/profile", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((response) => {
                    const userData = response.data.user || response.data;
                    setUserName(userData.name || '');
                    setUserEmail(userData.email || '');
                    setUserPictureUrl(userData.profile_picture || null);
                    setIsAuthenticated(true);

                    api.get("/househubs", {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then((res) => {
                        setHousehubs(res.data.househubs || []);
                    });

                    setLoading(false);
                })
                .catch(() => {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
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

    const openAuth = (mode) => {
        setAuthMode(mode);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError("");
    };

    const closeAuth = () => {
        setAuthMode(null);
        setError("");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUserName('');
        setUserEmail('');
        setUserPictureUrl(null);
        setHousehubs([]);
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 15px",
        marginTop: 5,
        borderRadius: 8,
        border: "1px solid #ccc",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
        fontSize: "1rem",
        outline: "none",
        boxSizing: "border-box",
    };

    const buttonStyle = {
        width: "100%",
        padding: "12px",
        background: "#3a76f2",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontSize: "1.1rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "0.2s",
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (authMode === "signup") {
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }

            api.post("/register", {
                name,
                email,
                password,
                password_confirmation: confirmPassword,
            })
                .then((res) => {
                    if (res.data.access_token) {
                        localStorage.setItem("token", res.data.access_token);
                        window.location.reload();
                    }
                })
                .catch((err) => {
                    setError(err.response?.data?.message || "Something went wrong during registration");
                });
            return;
        }

        api.post("/login", { email, password })
            .then((response) => {
                localStorage.setItem("token", response.data.access_token);
                window.location.reload();
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Invalid credentials");
            });
    };

    return (
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: "100vh", background: "#f9fbff" }}>
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                    <div style={{ fontSize: "1.5rem", color: "#3a76f2" }}>Loading...</div>
                </div>
            ) : (
                <>
                    {isAuthenticated && (
                        <Navbar
                            onLogout={handleLogout}
                            userName={userName}
                            userEmail={userEmail}
                            profilePictureUrl={userPictureUrl}
                        />
                    )}

                    <div style={{ filter: authMode ? "blur(5px)" : "none", transition: "0.3s" }}>
                        <header
                            style={{
                                textAlign: "center",
                                padding: "60px 20px 80px",
                                background: "linear-gradient(135deg, #3a76f2, #6aafff)",
                                color: "#fff",
                                clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
                            }}
                        >
                            <h1 style={{ fontSize: "3rem", marginBottom: 15 }}>HouseHub</h1>
                            <h2 style={{ maxWidth: 500, margin: "0 auto", fontWeight: 300 }}>
                                The simplest way to manage your property and community.
                            </h2>

                            {!isAuthenticated && (
                                <div style={{ marginTop: 30, display: "flex", justifyContent: "center", gap: 10 }}>
                                    <button
                                        onClick={() => openAuth("signup")}
                                        style={{
                                            padding: "12px 25px",
                                            borderRadius: 50,
                                            border: "none",
                                            background: "#ffc107",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = "#ffdd47")}
                                        onMouseOut={(e) => (e.currentTarget.style.background = "#ffc107")}
                                    >
                                        Start Organizing Now
                                    </button>

                                    <button
                                        onClick={() => openAuth("signin")}
                                        style={{
                                            padding: "12px 25px",
                                            borderRadius: 50,
                                            border: "1px solid #fff",
                                            background: "transparent",
                                            color: "#fff",
                                            cursor: "pointer"
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
                                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        Sign In
                                    </button>
                                </div>
                            )}
                        </header>

                        <main style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
                            {!isAuthenticated && (
                                <section style={{ marginTop: -40 }}>
                                    <h3 style={{ textAlign: "center", marginBottom: 30, color: "#333" }}>
                                        Simplify Property Management in 3 Easy Steps
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
                                        <div style={cardHoverProps}>
                                            <h3 style={{ color: "#3a76f2" }}>1. Create Your Hub</h3>
                                            <p style={{ color: "#666" }}>Set up your building instantly. Centralize all resident, vendor, and property data in one place.</p>
                                        </div>
                                        <div style={cardHoverProps}>
                                            <h3 style={{ color: "#28a745" }}>2. Add Residents</h3>
                                            <p style={{ color: "#666" }}>Invite owners, renters, and staff with specific access roles. Communication made easy.</p>
                                        </div>
                                        <div style={cardHoverProps}>
                                            <h3 style={{ color: "#ffc107" }}>3. Start Managing</h3>
                                            <p style={{ color: "#666" }}>Utilize centralized billing, maintenance tracking, and community announcements tools.</p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {isAuthenticated && (
                                <section style={{ marginTop: 40 }}>
                                    <h2 style={{ marginBottom: 20, color: "#333" }}>Welcome Back! Your HouseHubs</h2>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
                                        {househubs.map((hub) => (
                                            <div key={hub.id} style={cardHoverProps} onClick={() => navigate(`/househub/${hub.id}`)}>
                                                <h3 style={{ color: "#3a76f2" }}>{hub.name}</h3>
                                                <p style={{ color: "#666" }}>{hub.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </main>
                    </div>

                    {authMode && (
                        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", padding: 20, zIndex: 1000 }}>
                            <div style={{ background: "#fff", padding: 30, borderRadius: 16, width: "100%", maxWidth: 400, position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,0.25)" }}>
                                <button onClick={closeAuth} style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#666" }}>×</button>

                                <h2 style={{ textAlign: "center", marginBottom: 20, color: "#3a76f2" }}>
                                    {authMode === "signin" ? "Sign In" : "Create Account"}
                                </h2>

                                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                                    {authMode === "signup" && (
                                        <div>
                                            <label style={{ display: "block", fontWeight: 500, color: "#333" }}>Name</label>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
                                        </div>
                                    )}

                                    <div>
                                        <label style={{ display: "block", fontWeight: 500, color: "#333" }}>Email</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontWeight: 500, color: "#333" }}>Password</label>
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required minLength="8" />
                                    </div>

                                    {authMode === "signup" && (
                                        <div>
                                            <label style={{ display: "block", fontWeight: 500, color: "#333" }}>Confirm Password</label>
                                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required minLength="8" />
                                        </div>
                                    )}

                                    {error && <div style={{ color: "#721c24", fontSize: "0.9rem", background: "#f8d7da", padding: "10px", borderRadius: 6, border: "1px solid #f5c6cb" }}>✗ {error}</div>}

                                    <button type="submit" style={buttonStyle}
                                            onMouseOver={(e) => (e.currentTarget.style.background = "#2c5fd1")}
                                            onMouseOut={(e) => (e.currentTarget.style.background = "#3a76f2")}>
                                        {authMode === "signin" ? "Sign In" : "Sign Up"}
                                    </button>

                                    <div style={{ textAlign: "center", marginTop: 10 }}>
                                        <span style={{ color: "#3a76f2", cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem" }} onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}>
                                            {authMode === "signin" ? "Need an account? Create one." : "Already have an account? Sign In."}
                                        </span>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
