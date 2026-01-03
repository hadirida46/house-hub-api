import React, { useState, useEffect } from "react";
import api, { getErrorMessage } from "../api/axios";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { useNavigate, useParams } from "react-router-dom";

export default function Apartment() {
    const { id } = useParams();
    const [apartment, setApartment] = useState(null);
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPictureUrl, setUserPictureUrl] = useState(null);
    const [name, setName] = useState("");
    const [floor, setFloor] = useState(1);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showResidentModal, setShowResidentModal] = useState(false);
    const [residentEmail, setResidentEmail] = useState("");
    const [creatingResident, setCreatingResident] = useState(false);
    const [building, setBuildingInfo] = useState(null);
    const [houseHub, setHouseHub] = useState(null);
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
        fetchApartment();
        fetchResidents();
    }, []);

    const fetchApartment = async () => {
        try {
            const res = await api.get(`/apartments/show/${id}`);
            const apt = res.data.apartment || null;
            setApartment(apt);
            setName(apt?.name || '');
            setFloor(apt?.floor || 1);
            
            // Fetch Building and HouseHub info for breadcrumb
            if (apt?.building_id) {
                try {
                    const buildingRes = await api.get(`/buildings/show/${apt.building_id}`);
                    const bldg = buildingRes.data.building || null;
                    setBuildingInfo(bldg);
                    
                    if (bldg?.house_hub_id) {
                        try {
                            const hubRes = await api.get(`/house-hub/show/${bldg.house_hub_id}`);
                            setHouseHub(hubRes.data.househub || null);
                        } catch (err) {
                            console.error("Error fetching househub:", err);
                        }
                    }
                } catch (err) {
                    console.error("Error fetching building:", err);
                }
            }
        } catch (err) {
            console.error("Error fetching apartment:", err);
            setApartment(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchResidents = async () => {
        try {
            const res = await api.get(`/apartments/show/residents/${id}`);
            
            // Handle different response structures
            let residentsList = [];
            if (Array.isArray(res.data)) {
                residentsList = res.data;
            } else if (res.data && Array.isArray(res.data.residents)) {
                residentsList = res.data.residents;
            } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                residentsList = res.data.data;
            } else if (res.data && res.data.data && Array.isArray(res.data.data.residents)) {
                residentsList = res.data.data.residents;
            } else if (res.data && res.data.residents && !Array.isArray(res.data.residents)) {
                residentsList = Object.values(res.data.residents);
            }
            
            setResidents(residentsList);
        } catch (err) {
            console.error("Error fetching residents:", err);
            setResidents([]);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const saveApartment = async () => {
        if (!name || !floor || floor < 1) {
            alert("Please enter a name and a valid floor number (at least 1).");
            return;
        }

        setSaving(true);
        try {
            const res = await api.patch(`/apartments/update/${id}`, {
                name,
                floor: parseInt(floor),
                building_id: apartment?.building_id
            });
            setApartment(res.data.apartment);
            alert("Apartment updated successfully.");
            setIsEditing(false);
            fetchApartment();
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setName(apartment?.name || '');
        setFloor(apartment?.floor || 1);
        setIsEditing(false);
    };

    const deleteApartment = async () => {
        setDeleting(true);
        try {
            await api.delete(`/apartments/destroy/${id}`);
            alert("Apartment deleted successfully.");
            // Navigate back to the Building page
            if (apartment?.building_id) {
                navigate(`/building/${apartment.building_id}`);
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const createResident = async () => {
        if (!residentEmail) {
            alert("Please enter a resident email address.");
            return;
        }

        if (!validateEmail(residentEmail)) {
            alert("Please enter a valid email address (format: something@example.com).");
            return;
        }

        setCreatingResident(true);
        try {
            const res = await api.post("/residents/store", {
                apartment_id: parseInt(id),
                email: residentEmail
            });
            setShowResidentModal(false);
            setResidentEmail("");
            await fetchResidents();
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setCreatingResident(false);
        }
    };

    const deleteResident = async (residentId) => {
        if (!window.confirm("Are you sure you want to remove this resident?")) {
            return;
        }
        try {
            await api.delete(`/residents/destroy/${residentId}`);
            alert("Resident removed successfully.");
            await fetchResidents();
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        }
    };

    if (loading || !apartment) {
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
                    ...(houseHub ? [{ label: houseHub.name, href: `/househub/${houseHub.id}` }] : []),
                    ...(building ? [{ label: building.name, href: `/building/${building.id}` }] : []),
                    { label: apartment.name || "Apartment" }
                ]} />

                {/* Page Type Indicator */}
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "0.8125rem",
                    fontWeight: "600",
                    marginBottom: "20px",
                    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.2)"
                }}>
                    <span>🏠</span>
                    <span>APARTMENT</span>
                </div>

                {/* Apartment Header Card */}
                <div style={{ 
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
                    borderRadius: "20px", 
                    padding: "40px", 
                    marginBottom: "32px",
                    color: "#fff",
                    boxShadow: "0 20px 40px rgba(245, 158, 11, 0.15)",
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
                                        🏠
                                    </div>
                                    <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700", letterSpacing: "-0.5px" }}>{apartment.name || "Apartment"}</h1>
                                </div>
                                <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", marginTop: "24px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <span style={{ opacity: 0.85, fontSize: "0.875rem", fontWeight: "500" }}>Floor</span>
                                        <div style={{ fontWeight: "600", fontSize: "1rem", marginTop: "2px" }}>{apartment.floor || 0}</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <span style={{ opacity: 0.85, fontSize: "0.875rem", fontWeight: "500" }}>Residents</span>
                                        <div style={{ fontWeight: "600", fontSize: "1rem", marginTop: "2px" }}>{residents.length}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                {showDeleteConfirm ? (
                                    <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.15)", padding: "12px 16px", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
                                        <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>Confirm delete?</span>
                                        <button 
                                            onClick={deleteApartment}
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
                                        Delete Apartment
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
                        <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.3px" }}>Apartment Details</h2>
                        <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "0.9375rem" }}>Manage your apartment information and settings</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "10px", color: "#374151", fontWeight: "600", fontSize: "0.9375rem" }}>Name</label>
                            <input 
                                placeholder="Apartment Name" 
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
                                onFocus={(e) => isEditing && (e.currentTarget.style.borderColor = "#f59e0b")}
                                onBlur={(e) => isEditing && (e.currentTarget.style.borderColor = "#e5e7eb")}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "10px", color: "#374151", fontWeight: "600", fontSize: "0.9375rem" }}>Floor Number</label>
                            <input 
                                type="number"
                                min="1"
                                placeholder="Floor number" 
                                value={floor} 
                                onChange={e => setFloor(parseInt(e.target.value) || 1)} 
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
                                onFocus={(e) => isEditing && (e.currentTarget.style.borderColor = "#f59e0b")}
                                onBlur={(e) => isEditing && (e.currentTarget.style.borderColor = "#e5e7eb")}
                            />
                        </div>
                        {isEditing ? (
                            <div style={{ display: "flex", gap: "12px", marginTop: "8px", paddingTop: "20px", borderTop: "2px solid #f3f4f6" }}>
                                <button 
                                    onClick={saveApartment} 
                                    disabled={saving || !name || !floor || floor < 1} 
                                    style={{ 
                                        flex: 1,
                                        padding: "14px 28px", 
                                        background: saving || !name || !floor || floor < 1 ? "#d1d5db" : "#f59e0b", 
                                        color: "#fff", 
                                        border: "none", 
                                        borderRadius: "10px", 
                                        cursor: saving || !name || !floor || floor < 1 ? "not-allowed" : "pointer",
                                        fontWeight: "600",
                                        fontSize: "1rem",
                                        transition: "all 0.2s",
                                        boxShadow: saving || !name || !floor || floor < 1 ? "none" : "0 4px 12px rgba(245, 158, 11, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!saving && name && floor && floor >= 1) {
                                            e.currentTarget.style.background = "#d97706";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(245, 158, 11, 0.4)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!saving && name && floor && floor >= 1) {
                                            e.currentTarget.style.background = "#f59e0b";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
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
                                        background: "#f59e0b", 
                                        color: "#fff", 
                                        border: "none", 
                                        borderRadius: "10px", 
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        fontSize: "1rem",
                                        transition: "all 0.2s",
                                        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#2563eb";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(245, 158, 11, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#3b82f6";
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
                                    }}
                                >
                                    Edit Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Residents Section */}
                <div style={{ 
                    background: "#fff", 
                    borderRadius: "16px", 
                    padding: "32px", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    border: "1px solid #f0f0f0"
                }}>
                    <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "2px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                            <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.3px" }}>Residents</h2>
                            <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "0.9375rem" }}>
                                {residents.length === 0 ? "No residents in this apartment" : `${residents.length} resident${residents.length !== 1 ? 's' : ''} found`}
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowResidentModal(true)}
                            style={{ 
                                padding: "12px 24px", 
                                background: "#f59e0b", 
                                color: "#fff", 
                                border: "none", 
                                borderRadius: "10px", 
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "0.9375rem",
                                transition: "all 0.2s",
                                        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                                whiteSpace: "nowrap"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#2563eb";
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(245, 158, 11, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#3b82f6";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
                            }}
                        >
                            + Add Resident
                        </button>
                    </div>
                    {residents.length === 0 ? (
                        <div style={{ 
                            padding: "60px 40px", 
                            textAlign: "center", 
                            color: "#6b7280",
                            background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                            borderRadius: "12px",
                            border: "2px dashed #e5e7eb"
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.5 }}>👥</div>
                            <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: "500" }}>No residents found</p>
                            <p style={{ margin: "8px 0 0 0", fontSize: "0.9375rem", opacity: 0.8 }}>Residents will appear here once they are added to this apartment</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                            {residents.map(r => (
                                <div 
                                    key={r.id} 
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
                                        <h4 style={{ margin: 0, color: "#f59e0b", fontSize: "1.25rem", fontWeight: "700" }}>
                                            {r.user?.name || r.user?.email || `Resident ${r.id}`}
                                        </h4>
                                        <button
                                            onClick={() => deleteResident(r.id)}
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
                                        <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "0.9375rem", lineHeight: "1.6" }}>
                                            {r.user.email}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Resident Modal */}
                {showResidentModal && (
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
                                    setShowResidentModal(false);
                                    setResidentEmail("");
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

                            <h2 style={{ marginBottom: "24px", color: "#f59e0b", fontWeight: "700", fontSize: "1.5rem" }}>Add Resident</h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9375rem", color: "#374151", fontWeight: "600" }}>Resident Email *</label>
                                    <input 
                                        type="email"
                                        placeholder="resident@example.com" 
                                        value={residentEmail} 
                                        onChange={(e) => setResidentEmail(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            marginBottom: 0,
                                            border: residentEmail && !validateEmail(residentEmail) ? "2px solid #ef4444" : "2px solid #e5e7eb",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            boxSizing: "border-box",
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = residentEmail && !validateEmail(residentEmail) ? "#ef4444" : "#f59e0b"}
                                        onBlur={(e) => e.currentTarget.style.borderColor = residentEmail && !validateEmail(residentEmail) ? "#ef4444" : "#e5e7eb"}
                                    />
                                    {residentEmail && !validateEmail(residentEmail) && (
                                        <p style={{ margin: "8px 0 0 0", fontSize: "0.8125rem", color: "#ef4444" }}>
                                            Please enter a valid email address (format: something@example.com)
                                        </p>
                                    )}
                                    {(!residentEmail || validateEmail(residentEmail)) && (
                                        <p style={{ margin: "8px 0 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>
                                            If the user doesn't exist, they will be created and receive an invitation email.
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                                    <button 
                                        onClick={createResident}
                                        disabled={creatingResident || !residentEmail || !validateEmail(residentEmail)} 
                                        style={{
                                            flex: 1,
                                            padding: "14px 28px",
                                            background: (!residentEmail || !validateEmail(residentEmail)) ? "#d1d5db" : "#3b82f6",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "10px",
                                            cursor: creatingResident || !residentEmail || !validateEmail(residentEmail) ? "not-allowed" : "pointer",
                                            fontWeight: "600",
                                            fontSize: "1rem",
                                            transition: "all 0.2s",
                                            boxShadow: (!residentEmail || !validateEmail(residentEmail)) ? "none" : "0 4px 12px rgba(245, 158, 11, 0.3)"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!creatingResident && residentEmail && validateEmail(residentEmail)) {
                                                e.currentTarget.style.background = "#d97706";
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(245, 158, 11, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!creatingResident && residentEmail && validateEmail(residentEmail)) {
                                                e.currentTarget.style.background = "#f59e0b";
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
                                            }
                                        }}
                                    >
                                        {creatingResident ? "Adding..." : "Add Resident"}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowResidentModal(false);
                                            setResidentEmail("");
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