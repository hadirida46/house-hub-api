import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
    const [househubs, setHousehubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPictureUrl, setUserPictureUrl] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [locationResults, setLocationResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [role, setRole] = useState("committee_member");
    const [creating, setCreating] = useState(false);
    const locationRef = useRef(null);

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

    useEffect(() => {
        if (locationQuery.length < 3) {
            setLocationResults([]);
            return;
        }
        const handler = setTimeout(() => {
            searchLocation(locationQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [locationQuery]);

    const searchLocation = async (query) => {
        if (selectedLocation && selectedLocation.display_name !== query) {
            setSelectedLocation(null);
        }
        if (query.length < 3) {
            setLocationResults([]);
            return;
        }
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Lebanon')}&format=json&limit=5&addressdetails=1`;
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "househub-app/1.0",
                    "Accept-Language": "en"
                }
            });
            const data = await res.json();
            setLocationResults(data);
        } catch (e) {
            console.log(e);
        }
    };

    const createHouseHub = async () => {
        if (!name || !selectedLocation) {
            alert("Please enter a name and select a location from the dropdown.");
            return;
        }

        const lat = selectedLocation.lat.toString();
        const lon = selectedLocation.lon.toString();

        setCreating(true);

        try {
            const res = await api.post("/house-hub/store", {
                name,
                description,
                location: selectedLocation.display_name,
                latitude: lat,
                longitude: lon,
                role
            });

            setHousehubs((prev) => [...prev, res.data.data.houseHub]);

            setShowModal(false);
            setName("");
            setDescription("");
            setLocationQuery("");
            setLocationResults([]);
            setSelectedLocation(null);
            setRole("owner");
        } catch (err) {
            console.error("Error creating househub:", err.response?.data || err.message);
            alert(JSON.stringify(err.response?.data || err.message));
        } finally {
            setCreating(false);
        }
    };

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

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontSize: "1.5rem", color: "#3a76f2" }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: "100vh", background: "#f9fbff" }}>
            <Navbar onLogout={() => { localStorage.removeItem("token"); window.location.href = "/"; }} userName={userName} userEmail={userEmail} profilePictureUrl={userPictureUrl} />

            <main style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ marginBottom: 20, color: "#333" }}>Your HouseHubs</h2>
                    <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", background: "#3a76f2", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "1rem" }}>
                        + Create HouseHub
                    </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
                    {househubs.map((hub) => (
                        <div key={hub.id} style={cardHoverProps}>
                            <h3 style={{ color: "#3a76f2" }}>{hub.name}</h3>
                            <p style={{ color: "#666" }}>{hub.description || "No description available"}</p>
                        </div>
                    ))}
                </div>
            </main>

            {showModal && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(3px)", zIndex: 1000 }}>
                    <div style={{ position: "relative", background: "#fff", padding: 30, borderRadius: 14, width: 420, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}>
                        <h2 style={{ marginBottom: 20, color: "#3a76f2", fontWeight: 600 }}>Create HouseHub</h2>

                        <label style={{ fontSize: 14, color: "#444" }}>Name *</label>
                        <input placeholder="HouseHub name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 15, border: "1px solid #ccc", borderRadius: 8 }} />

                        <label style={{ fontSize: 14, color: "#444" }}>Description</label>
                        <textarea placeholder="Optional description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 15, border: "1px solid #ccc", borderRadius: 8, resize: "none", height: 80 }} />

                        <label style={{ fontSize: 14, color: "#444" }}>Location *</label>
                        <div ref={locationRef} style={{ position: "relative", marginBottom: 15 }}>
                            <input
                                placeholder="Search in Lebanon..."
                                value={locationQuery}
                                onChange={(e) => {
                                    setLocationQuery(e.target.value);
                                    setSelectedLocation(null);
                                }}
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                            />
                            {locationResults.length > 0 && (
                                <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", maxHeight: 200, overflowY: "auto", background: "#fff", border: "1px solid #ddd", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 3000 }}>
                                    {locationResults.map((loc) => (
                                        <div
                                            key={loc.place_id}
                                            style={{ padding: 10, cursor: "pointer", borderBottom: "1px solid #eee" }}
                                            onClick={() => {
                                                setSelectedLocation({
                                                    display_name: loc.display_name,
                                                    lat: parseFloat(loc.lat),
                                                    lon: parseFloat(loc.lon)
                                                });
                                                setLocationQuery(loc.display_name);
                                                setLocationResults([]);
                                            }}
                                        >
                                            {loc.display_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <label style={{ fontSize: 14, color: "#444" }}>Your Role *</label>
                            <div style={{ marginTop: 8 }}>
                                <label><input type="radio" value="committee_member" checked={role === "committee_member"} onChange={() => setRole("committee_member")} /> Committee Member</label>
                                <label style={{ marginRight: 15 }}><input type="radio" value="owner" checked={role === "owner"} onChange={() => setRole("owner")} /> Owner</label>
                            </div>
                        </div>

                        <button onClick={createHouseHub} disabled={creating || !name || (!selectedLocation && !locationQuery)} style={{ width: "100%", padding: 12, background: (!name || (!selectedLocation && !locationQuery)) ? "#9bb7ff" : "#3a76f2", color: "#fff", border: "none", borderRadius: 8, marginTop: 25, cursor: creating || !name || (!selectedLocation && !locationQuery) ? "not-allowed" : "pointer" }}>
                            {creating ? "Creating..." : "Create HouseHub"}
                        </button>

                        <button onClick={() => setShowModal(false)} style={{ width: "100%", padding: 12, background: "#eee", border: "none", borderRadius: 8, marginTop: 10, cursor: "pointer" }}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
