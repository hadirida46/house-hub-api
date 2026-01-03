import React, { useState, useEffect, useRef } from "react";
import api, { getErrorMessage } from "../api/axios";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { useNavigate, useParams } from "react-router-dom";

export default function HouseHub() {
    const { id } = useParams();
    const [houseHub, setHouseHub] = useState(null);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPictureUrl, setUserPictureUrl] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [locationResults, setLocationResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showBuildingModal, setShowBuildingModal] = useState(false);
    const [buildingName, setBuildingName] = useState("");
    const [buildingFloorsCount, setBuildingFloorsCount] = useState(1);
    const [creatingBuilding, setCreatingBuilding] = useState(false);
    const [roles, setRoles] = useState([]);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleEmail, setRoleEmail] = useState("");
    const [roleName, setRoleName] = useState("committee_member");
    const [creatingRole, setCreatingRole] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementBody, setAnnouncementBody] = useState("");
    const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
    const [canCreateAnnouncement, setCanCreateAnnouncement] = useState(false);
    const locationRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/";
            return;
        }
        api.get("/profile").then(res => {
            const userData = res.data.user || res.data;
            setUserName(userData.name || '');
            setUserEmail(userData.email || '');
            setUserPictureUrl(userData.profile_picture || null);
        }).catch(err => {
            console.error("Error fetching profile:", err);
            // Error is handled by axios interceptor for 401
        });
        fetchHouseHub();
        fetchBuildings();
        fetchRoles();
        fetchAnnouncements();
    }, []);

    // Check if user can create announcements when roles or userEmail changes
    useEffect(() => {
        if (roles.length > 0 && userEmail) {
            const currentUserRole = roles.find(r => 
                r.user?.email === userEmail && 
                (r.role === 'owner' || r.role === 'committee_member')
            );
            setCanCreateAnnouncement(!!currentUserRole);
        }
    }, [roles, userEmail]);

    const fetchHouseHub = async () => {
        try {
            const res = await api.get(`/house-hub/show/${id}`);
            const hub = res.data.househub || null;
            setHouseHub(hub);
            setName(hub?.name || '');
            setDescription(hub?.description || '');
            setLocationQuery(hub?.location || '');
            if (hub?.latitude && hub?.longitude) {
                setSelectedLocation({
                    display_name: hub.location,
                    lat: parseFloat(hub.latitude),
                    lon: parseFloat(hub.longitude)
                });
            } else {
                setSelectedLocation(null);
            }
        } catch (err) {
            console.error("Error fetching house hub:", err);
            setHouseHub(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchBuildings = async () => {
        try {
            const res = await api.get(`/house-hub/show/buildings/${id}`);
            setBuildings(Array.isArray(res.data.buildings) ? res.data.buildings : Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setBuildings([]);
        }
    };

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
            console.error("Location search error:", e);
        }
    };

    useEffect(() => {
        if (!isEditing || locationQuery.length < 3) {
            setLocationResults([]);
            return;
        }
        const handler = setTimeout(() => searchLocation(locationQuery), 300);
        return () => clearTimeout(handler);
    }, [locationQuery, isEditing]);

    const saveHouseHub = async () => {
        if (!name || !selectedLocation) {
            alert("Please enter a name and select a location from the dropdown.");
            return;
        }

        const lat = selectedLocation.lat?.toString() || null;
        const lon = selectedLocation.lon?.toString() || null;

        setSaving(true);
        try {
            const res = await api.patch(`/house-hub/update/${id}`, {
                name,
                description,
                location: selectedLocation.display_name,
                latitude: lat,
                longitude: lon
            });
            setHouseHub(res.data.house_hub);
            alert("HouseHub updated successfully.");
            setIsEditing(false);
            fetchHouseHub();
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset form to original values
        setName(houseHub?.name || '');
        setDescription(houseHub?.description || '');
        setLocationQuery(houseHub?.location || '');
        if (houseHub?.latitude && houseHub?.longitude) {
            setSelectedLocation({
                display_name: houseHub.location,
                lat: parseFloat(houseHub.latitude),
                lon: parseFloat(houseHub.longitude)
            });
        } else {
            setSelectedLocation(null);
        }
        setLocationResults([]);
        setIsEditing(false);
    };

    const deleteHouseHub = async () => {
        setDeleting(true);
        try {
            await api.delete(`/house-hub/destroy/${id}`);
            alert("HouseHub deleted successfully.");
            navigate("/dashboard");
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await api.get(`/roles/show/${id}`);
            
            // Handle different response structures
            let rolesList = [];
            if (Array.isArray(res.data)) {
                rolesList = res.data;
            } else if (res.data && Array.isArray(res.data.users_with_roles)) {
                rolesList = res.data.users_with_roles;
            } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                rolesList = res.data.data;
            } else if (res.data && res.data.data && Array.isArray(res.data.data.users_with_roles)) {
                rolesList = res.data.data.users_with_roles;
            }
            
            setRoles(rolesList);
        } catch (err) {
            console.error("Error fetching roles:", err);
            setRoles([]);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const createBuilding = async () => {
        if (!buildingName || !buildingFloorsCount || buildingFloorsCount < 1) {
            alert("Please enter a building name and a valid number of floors (at least 1).");
            return;
        }

        setCreatingBuilding(true);
        try {
            const res = await api.post("/buildings/store", {
                house_hub_id: parseInt(id),
                name: buildingName,
                floors_count: parseInt(buildingFloorsCount)
            });
            setBuildings((prev) => [...prev, res.data.data]);
            setShowBuildingModal(false);
            setBuildingName("");
            setBuildingFloorsCount(1);
            fetchBuildings();
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setCreatingBuilding(false);
        }
    };

    const createRole = async () => {
        if (!roleEmail) {
            alert("Please enter an email address.");
            return;
        }

        if (!validateEmail(roleEmail)) {
            alert("Please enter a valid email address (format: something@example.com).");
            return;
        }

        if (!roleName) {
            alert("Please select a role.");
            return;
        }

        setCreatingRole(true);
        try {
            const res = await api.post("/roles/store", {
                househub_id: parseInt(id),
                email: roleEmail,
                name: roleName
            });
            setShowRoleModal(false);
            setRoleEmail("");
            setRoleName("committee_member");
            await fetchRoles();
            alert(res.data.message || "Invitation sent successfully!");
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setCreatingRole(false);
        }
    };

    const deleteRole = async (roleId) => {
        if (!window.confirm("Are you sure you want to remove this role?")) {
            return;
        }
        try {
            await api.delete(`/roles/destroy/${roleId}`);
            alert("Role removed successfully.");
            await fetchRoles();
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get(`/househubs/${id}/announcements`);
            
            // Handle different response structures
            let announcementsList = [];
            if (Array.isArray(res.data)) {
                announcementsList = res.data;
            } else if (res.data && Array.isArray(res.data.announcements)) {
                announcementsList = res.data.announcements;
            } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                announcementsList = res.data.data;
            } else if (res.data && res.data.data && Array.isArray(res.data.data.announcements)) {
                announcementsList = res.data.data.announcements;
            }
            
            setAnnouncements(announcementsList);
        } catch (err) {
            console.error("Error fetching announcements:", err);
            setAnnouncements([]);
        }
    };

    const createAnnouncement = async () => {
        if (!announcementTitle || !announcementTitle.trim()) {
            alert("Please enter a title for the announcement.");
            return;
        }

        if (!announcementBody || !announcementBody.trim()) {
            alert("Please enter the announcement content.");
            return;
        }

        setCreatingAnnouncement(true);
        try {
            const res = await api.post(`/househubs/${id}/announcements`, {
                title: announcementTitle.trim(),
                body: announcementBody.trim()
            });
            setShowAnnouncementModal(false);
            setAnnouncementTitle("");
            setAnnouncementBody("");
            await fetchAnnouncements();
            alert(res.data.message || "Announcement created successfully!");
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setCreatingAnnouncement(false);
        }
    };

    if (loading || !houseHub) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontSize: "1.5rem", color: "#3a76f2" }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: "100vh", background: "#f9fbff" }}>
            <Navbar onLogout={() => { localStorage.removeItem("token"); window.location.href = "/"; }} userName={userName} userEmail={userEmail} profilePictureUrl={userPictureUrl} />

            <main style={{ padding: "24px 20px", maxWidth: "1200px", margin: "0 auto" }}>
                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: houseHub.name || "HouseHub" }
                ]} />

                {/* Page Type Indicator */}
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "0.8125rem",
                    fontWeight: "600",
                    marginBottom: "20px",
                    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)"
                }}>
                    <span>🏘️</span>
                    <span>HOUSEHUB</span>
                </div>

                {/* HouseHub Header Card */}
                <div style={{ 
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", 
                    borderRadius: "20px", 
                    padding: "40px", 
                    marginBottom: "32px",
                    color: "#fff",
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(60px)" }}></div>
                    <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "150px", height: "150px", background: "rgba(255,255,255,0.08)", borderRadius: "50%", filter: "blur(50px)" }}></div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
                            <div style={{ flex: 1, minWidth: "300px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                    <div style={{
                                        width: "56px",
                                        height: "56px",
                                        borderRadius: "14px",
                                        background: "rgba(255,255,255,0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1.75rem",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(255,255,255,0.3)"
                                    }}>
                                        🏘️
                                    </div>
                                    <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700", letterSpacing: "-0.5px" }}>{houseHub.name || "HouseHub"}</h1>
                                </div>
                                <p style={{ margin: "0 0 24px 0", opacity: 0.95, fontSize: "1.125rem", lineHeight: "1.6", paddingLeft: "68px" }}>{houseHub.description || "No description provided"}</p>
                                <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <span style={{ opacity: 0.85, fontSize: "0.875rem", fontWeight: "500" }}>Location</span>
                                        <div style={{ fontWeight: "600", fontSize: "1rem", marginTop: "2px" }}>{houseHub.location || "Not set"}</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <span style={{ opacity: 0.85, fontSize: "0.875rem", fontWeight: "500" }}>Buildings</span>
                                        <div style={{ fontWeight: "600", fontSize: "1rem", marginTop: "2px" }}>{buildings.length}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                {showDeleteConfirm ? (
                                    <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.15)", padding: "12px 16px", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
                                        <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>Confirm delete?</span>
                                        <button 
                                            onClick={deleteHouseHub}
                                            disabled={deleting}
                                            style={{ 
                                                padding: "8px 16px", 
                                                background: "#ef4444", 
                                                color: "#fff", 
                                                border: "none", 
                                                borderRadius: "8px", 
                                                cursor: deleting ? "not-allowed" : "pointer",
                                                fontWeight: "600",
                                                fontSize: "0.875rem",
                                                transition: "all 0.2s",
                                                opacity: deleting ? 0.7 : 1
                                            }}
                                            onMouseEnter={(e) => !deleting && (e.currentTarget.style.background = "#dc2626")}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "#ef4444"}
                                        >
                                            {deleting ? "Deleting..." : "Yes, Delete"}
                                        </button>
                                        <button 
                                            onClick={() => setShowDeleteConfirm(false)}
                                            style={{ 
                                                padding: "8px 16px", 
                                                background: "rgba(255,255,255,0.25)", 
                                                color: "#fff", 
                                                border: "none", 
                                                borderRadius: "8px", 
                                                cursor: "pointer",
                                                fontWeight: "600",
                                                fontSize: "0.875rem",
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.35)"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        style={{ 
                                            padding: "12px 24px", 
                                            background: "rgba(255,255,255,0.2)", 
                                            color: "#fff", 
                                            border: "1px solid rgba(255,255,255,0.3)", 
                                            borderRadius: "12px", 
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            fontSize: "0.875rem",
                                            transition: "all 0.2s",
                                            backdropFilter: "blur(10px)"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                                            e.currentTarget.style.transform = "translateY(0)";
                                        }}
                                    >
                                        Delete HouseHub
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Update Form Section */}
                <div style={{ 
                    background: "#fff", 
                    borderRadius: "16px", 
                    padding: "32px", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    margin: "0 auto 32px auto",
                    maxWidth: "640px",
                    border: "1px solid #f0f0f0"
                }}>
                    <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "2px solid #f3f4f6" }}>
                        <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.3px" }}>HouseHub Details</h2>
                        <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "0.9375rem" }}>Manage your HouseHub information and settings</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "10px", color: "#374151", fontWeight: "600", fontSize: "0.9375rem" }}>Name</label>
                            <input 
                                placeholder="HouseHub Name" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                disabled={!isEditing}
                                style={{ 
                                    width: "100%",
                                    padding: "14px 16px", 
                                    borderRadius: "10px", 
                                    border: isEditing ? "2px solid #e5e7eb" : "2px solid #f3f4f6",
                                    fontSize: "1rem",
                                    boxSizing: "border-box",
                                    background: isEditing ? "#fff" : "#f9fafb",
                                    cursor: isEditing ? "text" : "not-allowed",
                                    color: isEditing ? "#111827" : "#9ca3af",
                                    transition: "all 0.2s",
                                    outline: "none"
                                }}
                                onFocus={(e) => isEditing && (e.currentTarget.style.borderColor = "#3b82f6")}
                                onBlur={(e) => isEditing && (e.currentTarget.style.borderColor = "#e5e7eb")}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "10px", color: "#374151", fontWeight: "600", fontSize: "0.9375rem" }}>Description</label>
                            <textarea 
                                placeholder="HouseHub Description" 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                disabled={!isEditing}
                                style={{ 
                                    width: "100%",
                                    padding: "14px 16px", 
                                    borderRadius: "10px", 
                                    border: isEditing ? "2px solid #e5e7eb" : "2px solid #f3f4f6",
                                    resize: "none", 
                                    height: "120px",
                                    fontSize: "1rem",
                                    boxSizing: "border-box",
                                    fontFamily: "inherit",
                                    background: isEditing ? "#fff" : "#f9fafb",
                                    cursor: isEditing ? "text" : "not-allowed",
                                    color: isEditing ? "#111827" : "#9ca3af",
                                    transition: "all 0.2s",
                                    outline: "none",
                                    lineHeight: "1.5"
                                }}
                                onFocus={(e) => isEditing && (e.currentTarget.style.borderColor = "#3b82f6")}
                                onBlur={(e) => isEditing && (e.currentTarget.style.borderColor = "#e5e7eb")}
                            />
                        </div>
                        <div ref={locationRef} style={{ position: "relative" }}>
                            <label style={{ display: "block", marginBottom: "10px", color: "#374151", fontWeight: "600", fontSize: "0.9375rem" }}>Location</label>
                            <input 
                                placeholder="Search location..." 
                                value={locationQuery} 
                                onChange={e => { setLocationQuery(e.target.value); setSelectedLocation(null); }} 
                                disabled={!isEditing}
                                style={{ 
                                    width: "100%",
                                    padding: "14px 16px", 
                                    borderRadius: "10px", 
                                    border: isEditing ? "2px solid #e5e7eb" : "2px solid #f3f4f6",
                                    fontSize: "1rem",
                                    boxSizing: "border-box",
                                    background: isEditing ? "#fff" : "#f9fafb",
                                    cursor: isEditing ? "text" : "not-allowed",
                                    color: isEditing ? "#111827" : "#9ca3af",
                                    transition: "all 0.2s",
                                    outline: "none"
                                }}
                                onFocus={(e) => isEditing && (e.currentTarget.style.borderColor = "#3b82f6")}
                                onBlur={(e) => isEditing && (e.currentTarget.style.borderColor = "#e5e7eb")}
                            />
                            {isEditing && locationResults.length > 0 && (
                                <div style={{ 
                                    position: "absolute", 
                                    top: "100%", 
                                    left: 0, 
                                    width: "100%", 
                                    maxHeight: "220px", 
                                    overflowY: "auto", 
                                    background: "#fff", 
                                    border: "2px solid #e5e7eb", 
                                    borderRadius: "10px", 
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", 
                                    zIndex: 3000,
                                    marginTop: "6px"
                                }}>
                                    {locationResults.map(loc => (
                                        <div 
                                            key={loc.place_id} 
                                            style={{ 
                                                padding: "14px 16px", 
                                                cursor: "pointer", 
                                                borderBottom: "1px solid #f3f4f6",
                                                transition: "all 0.15s",
                                                fontSize: "0.9375rem"
                                            }} 
                                            onClick={() => { 
                                                setSelectedLocation({ display_name: loc.display_name, lat: parseFloat(loc.lat), lon: parseFloat(loc.lon) }); 
                                                setLocationQuery(loc.display_name); 
                                                setLocationResults([]); 
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#f9fafb";
                                                e.currentTarget.style.paddingLeft = "20px";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "#fff";
                                                e.currentTarget.style.paddingLeft = "16px";
                                            }}
                                        >
                                            {loc.display_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {isEditing ? (
                            <div style={{ display: "flex", gap: "12px", marginTop: "8px", paddingTop: "20px", borderTop: "2px solid #f3f4f6" }}>
                                <button 
                                    onClick={saveHouseHub} 
                                    disabled={saving || !name || !selectedLocation} 
                                    style={{ 
                                        flex: 1,
                                        padding: "14px 28px", 
                                        background: saving || !name || !selectedLocation ? "#d1d5db" : "#3b82f6", 
                                        color: "#fff", 
                                        border: "none", 
                                        borderRadius: "10px", 
                                        cursor: saving || !name || !selectedLocation ? "not-allowed" : "pointer",
                                        fontWeight: "600",
                                        fontSize: "1rem",
                                        transition: "all 0.2s",
                                        boxShadow: saving || !name || !selectedLocation ? "none" : "0 4px 12px rgba(59, 130, 246, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!saving && name && selectedLocation) {
                                            e.currentTarget.style.background = "#2563eb";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!saving && name && selectedLocation) {
                                            e.currentTarget.style.background = "#3b82f6";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                                        }
                                    }}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button 
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    style={{ 
                                        padding: "14px 28px", 
                                        background: "#6b7280", 
                                        color: "#fff", 
                                        border: "none", 
                                        borderRadius: "10px", 
                                        cursor: saving ? "not-allowed" : "pointer",
                                        fontWeight: "600",
                                        fontSize: "1rem",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!saving) {
                                            e.currentTarget.style.background = "#4b5563";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#6b7280";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginTop: "8px", paddingTop: "20px", borderTop: "2px solid #f3f4f6" }}>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    style={{ 
                                        width: "100%",
                                        padding: "14px 28px", 
                                        background: "#3b82f6", 
                                        color: "#fff", 
                                        border: "none", 
                                        borderRadius: "10px", 
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        fontSize: "1rem",
                                        transition: "all 0.2s",
                                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#2563eb";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#3b82f6";
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                                    }}
                                >
                                    Edit Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Buildings Section */}
                <div style={{ 
                    background: "#fff", 
                    borderRadius: "16px", 
                    padding: "32px", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    border: "1px solid #f0f0f0"
                }}>
                    <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "2px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                            <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.3px" }}>Buildings</h2>
                            <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "0.9375rem" }}>
                                {buildings.length === 0 ? "No buildings in this HouseHub" : `${buildings.length} building${buildings.length !== 1 ? 's' : ''} found`}
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowBuildingModal(true)}
                            style={{ 
                                padding: "12px 24px", 
                                background: "#3b82f6", 
                                color: "#fff", 
                                border: "none", 
                                borderRadius: "10px", 
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "0.9375rem",
                                transition: "all 0.2s",
                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                                whiteSpace: "nowrap"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#2563eb";
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#3b82f6";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                            }}
                        >
                            + Create Building
                        </button>
                    </div>
                    {buildings.length === 0 ? (
                        <div style={{ 
                            padding: "60px 40px", 
                            textAlign: "center", 
                            color: "#6b7280",
                            background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                            borderRadius: "12px",
                            border: "2px dashed #e5e7eb"
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.5 }}>🏢</div>
                            <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: "500" }}>No buildings found</p>
                            <p style={{ margin: "8px 0 0 0", fontSize: "0.9375rem", opacity: 0.8 }}>Buildings will appear here once they are added to this HouseHub</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                            {buildings.map(b => (
                                <div 
                                    key={b.id} 
                                    onClick={() => navigate(`/building/${b.id}`)}
                                    style={{ 
                                        padding: "24px", 
                                        background: "#f9fafb", 
                                        borderRadius: "12px", 
                                        border: "2px solid #e5e7eb",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        cursor: "pointer"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#fff";
                                        e.currentTarget.style.borderColor = "#3b82f6";
                                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(59, 130, 246, 0.12)";
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#f9fafb";
                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <h4 style={{ margin: "0 0 12px 0", color: "#3b82f6", fontSize: "1.25rem", fontWeight: "700" }}>{b.name}</h4>
                                    {b.description && (
                                        <p style={{ margin: "0 0 12px 0", color: "#6b7280", fontSize: "0.9375rem", lineHeight: "1.6" }}>{b.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Roles Section */}
                <div style={{ 
                    background: "#fff", 
                    borderRadius: "16px", 
                    padding: "32px", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    border: "1px solid #f0f0f0",
                    marginTop: "32px"
                }}>
                    <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "2px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                            <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.3px" }}>Roles & Members</h2>
                            <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "0.9375rem" }}>
                                {roles.length === 0 ? "No roles assigned in this HouseHub" : `${roles.length} role${roles.length !== 1 ? 's' : ''} assigned`}
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowRoleModal(true)}
                            style={{ 
                                padding: "12px 24px", 
                                background: "#3b82f6", 
                                color: "#fff", 
                                border: "none", 
                                borderRadius: "10px", 
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "0.9375rem",
                                transition: "all 0.2s",
                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                                whiteSpace: "nowrap"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#2563eb";
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#3b82f6";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                            }}
                        >
                            + Add Role
                        </button>
                    </div>
                    {roles.length === 0 ? (
                        <div style={{ 
                            padding: "60px 40px", 
                            textAlign: "center", 
                            color: "#6b7280",
                            background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                            borderRadius: "12px",
                            border: "2px dashed #e5e7eb"
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.5 }}>👥</div>
                            <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: "500" }}>No roles found</p>
                            <p style={{ margin: "8px 0 0 0", fontSize: "0.9375rem", opacity: 0.8 }}>Roles will appear here once they are assigned to users</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                            {roles.map(r => (
                                <div 
                                    key={r.role_id || r.id} 
                                    style={{ 
                                        padding: "24px", 
                                        background: "#f9fafb", 
                                        borderRadius: "12px", 
                                        border: "2px solid #e5e7eb",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        position: "relative"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: "0 0 8px 0", color: "#3b82f6", fontSize: "1.25rem", fontWeight: "700" }}>
                                                {r.user?.name || r.user?.email || `User ${r.user?.id || ''}`}
                                            </h4>
                                            <div style={{ 
                                                display: "inline-block",
                                                padding: "4px 12px",
                                                background: "#dbeafe",
                                                color: "#1e40af",
                                                borderRadius: "6px",
                                                fontSize: "0.8125rem",
                                                fontWeight: "600",
                                                textTransform: "capitalize"
                                            }}>
                                                {r.role || r.name}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteRole(r.role_id || r.id)}
                                            style={{
                                                padding: "6px 12px",
                                                background: "#ef4444",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                fontWeight: "600",
                                                fontSize: "0.8125rem",
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#dc2626";
                                                e.currentTarget.style.transform = "scale(1.05)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "#ef4444";
                                                e.currentTarget.style.transform = "scale(1)";
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    {r.user?.email && (
                                        <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "0.9375rem", lineHeight: "1.6" }}>
                                            {r.user.email}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Announcements Section */}
                <div style={{ 
                    background: "#fff", 
                    borderRadius: "16px", 
                    padding: "32px", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    border: "1px solid #f0f0f0",
                    marginTop: "32px"
                }}>
                    <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "2px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                            <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.3px" }}>Announcements</h2>
                            <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "0.9375rem" }}>
                                {announcements.length === 0 ? "No announcements yet" : `${announcements.length} announcement${announcements.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                        {canCreateAnnouncement && (
                            <button 
                                onClick={() => setShowAnnouncementModal(true)}
                                style={{ 
                                    padding: "12px 24px", 
                                    background: "#3b82f6", 
                                    color: "#fff", 
                                    border: "none", 
                                    borderRadius: "10px", 
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "0.9375rem",
                                    transition: "all 0.2s",
                                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                                    whiteSpace: "nowrap"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#2563eb";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#3b82f6";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                                }}
                            >
                                + Create Announcement
                            </button>
                        )}
                    </div>
                    {announcements.length === 0 ? (
                        <div style={{ 
                            padding: "60px 40px", 
                            textAlign: "center", 
                            color: "#6b7280",
                            background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                            borderRadius: "12px",
                            border: "2px dashed #e5e7eb"
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.5 }}>📢</div>
                            <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: "500" }}>No announcements yet</p>
                            <p style={{ margin: "8px 0 0 0", fontSize: "0.9375rem", opacity: 0.8 }}>Announcements will appear here once they are created</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {announcements.map(announcement => (
                                <div 
                                    key={announcement.id} 
                                    style={{ 
                                        padding: "24px", 
                                        background: "#f9fafb", 
                                        borderRadius: "12px", 
                                        border: "2px solid #e5e7eb",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#fff";
                                        e.currentTarget.style.borderColor = "#3b82f6";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#f9fafb";
                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: "0 0 8px 0", color: "#1f2937", fontSize: "1.25rem", fontWeight: "700" }}>
                                                {announcement.title}
                                            </h3>
                                            {announcement.user && (
                                                <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontSize: "0.875rem" }}>
                                                    By {announcement.user.name || announcement.user.email || "Unknown"}
                                                </p>
                                            )}
                                            {announcement.created_at && (
                                                <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.8125rem" }}>
                                                    {new Date(announcement.created_at).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        marginTop: "16px", 
                                        paddingTop: "16px", 
                                        borderTop: "1px solid #e5e7eb",
                                        color: "#374151",
                                        fontSize: "0.9375rem",
                                        lineHeight: "1.7",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word"
                                    }}>
                                        {announcement.body}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Building Modal */}
                {showBuildingModal && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backdropFilter: "blur(3px)",
                        zIndex: 1000
                    }}>
                        <div style={{
                            position: "relative",
                            background: "#fff",
                            padding: "32px",
                            borderRadius: "16px",
                            width: "100%",
                            maxWidth: "480px",
                            boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                        }}>
                            <button 
                                onClick={() => {
                                    setShowBuildingModal(false);
                                    setBuildingName("");
                                    setBuildingFloorsCount(1);
                                }}
                                style={{ 
                                    position: "absolute", 
                                    top: "16px", 
                                    right: "16px", 
                                    background: "transparent", 
                                    border: "none", 
                                    fontSize: "1.5rem", 
                                    cursor: "pointer", 
                                    color: "#666",
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "8px",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#f3f4f6";
                                    e.currentTarget.style.color = "#333";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "#666";
                                }}
                            >
                                ×
                            </button>

                            <h2 style={{ marginBottom: "24px", color: "#3b82f6", fontWeight: "700", fontSize: "1.5rem" }}>Create Building</h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9375rem", color: "#374151", fontWeight: "600" }}>Building Name *</label>
                                    <input 
                                        placeholder="Building name" 
                                        value={buildingName} 
                                        onChange={(e) => setBuildingName(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            marginBottom: 0,
                                            border: "2px solid #e5e7eb",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            boxSizing: "border-box",
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                                        onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9375rem", color: "#374151", fontWeight: "600" }}>Number of Floors *</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        placeholder="Number of floors" 
                                        value={buildingFloorsCount} 
                                        onChange={(e) => setBuildingFloorsCount(parseInt(e.target.value) || 1)}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            marginBottom: 0,
                                            border: "2px solid #e5e7eb",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            boxSizing: "border-box",
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                                        onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                                    <button 
                                        onClick={createBuilding}
                                        disabled={creatingBuilding || !buildingName || !buildingFloorsCount || buildingFloorsCount < 1} 
                                        style={{
                                            flex: 1,
                                            padding: "14px 28px",
                                            background: (!buildingName || !buildingFloorsCount || buildingFloorsCount < 1) ? "#d1d5db" : "#3b82f6",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "10px",
                                            cursor: creatingBuilding || !buildingName || !buildingFloorsCount || buildingFloorsCount < 1 ? "not-allowed" : "pointer",
                                            fontWeight: "600",
                                            fontSize: "1rem",
                                            transition: "all 0.2s",
                                            boxShadow: (!buildingName || !buildingFloorsCount || buildingFloorsCount < 1) ? "none" : "0 4px 12px rgba(59, 130, 246, 0.3)"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!creatingBuilding && buildingName && buildingFloorsCount && buildingFloorsCount >= 1) {
                                                e.currentTarget.style.background = "#2563eb";
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!creatingBuilding && buildingName && buildingFloorsCount && buildingFloorsCount >= 1) {
                                                e.currentTarget.style.background = "#3b82f6";
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                                            }
                                        }}
                                    >
                                        {creatingBuilding ? "Creating..." : "Create Building"}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowBuildingModal(false);
                                            setBuildingName("");
                                            setBuildingFloorsCount(1);
                                        }}
                                        style={{
                                            padding: "14px 28px",
                                            background: "#f3f4f6",
                                            color: "#374151",
                                            border: "none",
                                            borderRadius: "10px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            fontSize: "1rem",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "#e5e7eb";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "#f3f4f6";
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Role Modal */}
                {showRoleModal && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backdropFilter: "blur(3px)",
                        zIndex: 1000
                    }}>
                        <div style={{
                            position: "relative",
                            background: "#fff",
                            padding: "32px",
                            borderRadius: "16px",
                            width: "100%",
                            maxWidth: "480px",
                            boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                        }}>
                            <button 
                                onClick={() => {
                                    setShowRoleModal(false);
                                    setRoleEmail("");
                                    setRoleName("committee_member");
                                }}
                                style={{ 
                                    position: "absolute", 
                                    top: "16px", 
                                    right: "16px", 
                                    background: "transparent", 
                                    border: "none", 
                                    fontSize: "1.5rem", 
                                    cursor: "pointer", 
                                    color: "#666",
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "8px",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#f3f4f6";
                                    e.currentTarget.style.color = "#333";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "#666";
                                }}
                            >
                                ×
                            </button>

                            <h2 style={{ marginBottom: "24px", color: "#3b82f6", fontWeight: "700", fontSize: "1.5rem" }}>Add Role</h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9375rem", color: "#374151", fontWeight: "600" }}>User Email *</label>
                                    <input 
                                        type="email"
                                        placeholder="user@example.com" 
                                        value={roleEmail} 
                                        onChange={(e) => setRoleEmail(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            marginBottom: 0,
                                            border: roleEmail && !validateEmail(roleEmail) ? "2px solid #ef4444" : "2px solid #e5e7eb",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            boxSizing: "border-box",
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = roleEmail && !validateEmail(roleEmail) ? "#ef4444" : "#3b82f6"}
                                        onBlur={(e) => e.currentTarget.style.borderColor = roleEmail && !validateEmail(roleEmail) ? "#ef4444" : "#e5e7eb"}
                                    />
                                    {roleEmail && !validateEmail(roleEmail) && (
                                        <p style={{ margin: "8px 0 0 0", fontSize: "0.8125rem", color: "#ef4444" }}>
                                            Please enter a valid email address (format: something@example.com)
                                        </p>
                                    )}
                                    {(!roleEmail || validateEmail(roleEmail)) && (
                                        <p style={{ margin: "8px 0 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>
                                            If the user doesn't exist, they will be created and receive an invitation email.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9375rem", color: "#374151", fontWeight: "600" }}>Role *</label>
                                    <select
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            marginBottom: 0,
                                            border: "2px solid #e5e7eb",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            boxSizing: "border-box",
                                            outline: "none",
                                            transition: "all 0.2s",
                                            background: "#fff",
                                            cursor: "pointer"
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                                        onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                                    >
                                        <option value="owner">Owner</option>
                                        <option value="committee_member">Committee Member</option>
                                        <option value="janitor">Janitor</option>
                                        <option value="security">Security</option>
                                    </select>
                                    <p style={{ margin: "8px 0 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>
                                        Select the role to assign to this user
                                    </p>
                                </div>

                                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                                    <button 
                                        onClick={createRole}
                                        disabled={creatingRole || !roleEmail || !validateEmail(roleEmail) || !roleName} 
                                        style={{
                                            flex: 1,
                                            padding: "14px 28px",
                                            background: (!roleEmail || !validateEmail(roleEmail) || !roleName) ? "#d1d5db" : "#3b82f6",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "10px",
                                            cursor: creatingRole || !roleEmail || !validateEmail(roleEmail) || !roleName ? "not-allowed" : "pointer",
                                            fontWeight: "600",
                                            fontSize: "1rem",
                                            transition: "all 0.2s",
                                            boxShadow: (!roleEmail || !validateEmail(roleEmail) || !roleName) ? "none" : "0 4px 12px rgba(59, 130, 246, 0.3)"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!creatingRole && roleEmail && validateEmail(roleEmail) && roleName) {
                                                e.currentTarget.style.background = "#2563eb";
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!creatingRole && roleEmail && validateEmail(roleEmail) && roleName) {
                                                e.currentTarget.style.background = "#3b82f6";
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                                            }
                                        }}
                                    >
                                        {creatingRole ? "Sending..." : "Send Invitation"}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowRoleModal(false);
                                            setRoleEmail("");
                                            setRoleName("committee_member");
                                        }}
                                        style={{
                                            padding: "14px 28px",
                                            background: "#f3f4f6",
                                            color: "#374151",
                                            border: "none",
                                            borderRadius: "10px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            fontSize: "1rem",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "#e5e7eb";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "#f3f4f6";
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Announcement Modal */}
                {showAnnouncementModal && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backdropFilter: "blur(3px)",
                        zIndex: 1000
                    }}>
                        <div style={{
                            position: "relative",
                            background: "#fff",
                            padding: "32px",
                            borderRadius: "16px",
                            width: "100%",
                            maxWidth: "600px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                        }}>
                            <button 
                                onClick={() => {
                                    setShowAnnouncementModal(false);
                                    setAnnouncementTitle("");
                                    setAnnouncementBody("");
                                }}
                                style={{ 
                                    position: "absolute", 
                                    top: "16px", 
                                    right: "16px", 
                                    background: "transparent", 
                                    border: "none", 
                                    fontSize: "1.5rem", 
                                    cursor: "pointer", 
                                    color: "#666",
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "8px",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#f3f4f6";
                                    e.currentTarget.style.color = "#333";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "#666";
                                }}
                            >
                                ×
                            </button>

                            <h2 style={{ marginBottom: "24px", color: "#3b82f6", fontWeight: "700", fontSize: "1.5rem" }}>Create Announcement</h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9375rem", color: "#374151", fontWeight: "600" }}>Title *</label>
                                    <input 
                                        placeholder="Announcement title" 
                                        value={announcementTitle} 
                                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                                        maxLength={255}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            marginBottom: 0,
                                            border: "2px solid #e5e7eb",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            boxSizing: "border-box",
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                                        onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                                    />
                                    <p style={{ margin: "8px 0 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>
                                        {announcementTitle.length}/255 characters
                                    </p>
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9375rem", color: "#374151", fontWeight: "600" }}>Content *</label>
                                    <textarea 
                                        placeholder="Announcement content..." 
                                        value={announcementBody} 
                                        onChange={(e) => setAnnouncementBody(e.target.value)}
                                        rows={8}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            marginBottom: 0,
                                            border: "2px solid #e5e7eb",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            boxSizing: "border-box",
                                            outline: "none",
                                            transition: "all 0.2s",
                                            resize: "vertical",
                                            fontFamily: "inherit"
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                                        onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                                    />
                                    <p style={{ margin: "8px 0 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>
                                        Enter the announcement details
                                    </p>
                                </div>

                                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                                    <button 
                                        onClick={createAnnouncement}
                                        disabled={creatingAnnouncement || !announcementTitle.trim() || !announcementBody.trim()} 
                                        style={{
                                            flex: 1,
                                            padding: "14px 28px",
                                            background: (!announcementTitle.trim() || !announcementBody.trim()) ? "#d1d5db" : "#3b82f6",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "10px",
                                            cursor: creatingAnnouncement || !announcementTitle.trim() || !announcementBody.trim() ? "not-allowed" : "pointer",
                                            fontWeight: "600",
                                            fontSize: "1rem",
                                            transition: "all 0.2s",
                                            boxShadow: (!announcementTitle.trim() || !announcementBody.trim()) ? "none" : "0 4px 12px rgba(59, 130, 246, 0.3)"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!creatingAnnouncement && announcementTitle.trim() && announcementBody.trim()) {
                                                e.currentTarget.style.background = "#2563eb";
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!creatingAnnouncement && announcementTitle.trim() && announcementBody.trim()) {
                                                e.currentTarget.style.background = "#3b82f6";
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                                            }
                                        }}
                                    >
                                        {creatingAnnouncement ? "Creating..." : "Create Announcement"}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowAnnouncementModal(false);
                                            setAnnouncementTitle("");
                                            setAnnouncementBody("");
                                        }}
                                        style={{
                                            padding: "14px 28px",
                                            background: "#f3f4f6",
                                            color: "#374151",
                                            border: "none",
                                            borderRadius: "10px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            fontSize: "1rem",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "#e5e7eb";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "#f3f4f6";
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
