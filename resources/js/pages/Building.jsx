import React, { useState, useEffect } from "react";
import api, { getErrorMessage } from "../api/axios";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { useNavigate, useParams } from "react-router-dom";

export default function Building() {
    const { id } = useParams();
    const [building, setBuilding] = useState(null);
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPictureUrl, setUserPictureUrl] = useState(null);
    const [name, setName] = useState("");
    const [floorsCount, setFloorsCount] = useState(1);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showApartmentModal, setShowApartmentModal] = useState(false);
    const [apartmentName, setApartmentName] = useState("");
    const [apartmentFloor, setApartmentFloor] = useState(1);
    const [ownerEmail, setOwnerEmail] = useState("");
    const [creatingApartment, setCreatingApartment] = useState(false);
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
        fetchBuilding();
        fetchApartments();
    }, []);

    const fetchBuilding = async () => {
        try {
            const res = await api.get(`/buildings/show/${id}`);
            const bldg = res.data.building || null;
            setBuilding(bldg);
            setName(bldg?.name || '');
            setFloorsCount(bldg?.floors_count || 1);
            
            // Fetch HouseHub info for breadcrumb
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
            setBuilding(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchApartments = async () => {
        try {
            const res = await api.get(`/buildings/show/apartments/${id}`);
            
            // Handle different response structures
            let apartmentsList = [];
            if (Array.isArray(res.data)) {
                apartmentsList = res.data;
            } else if (res.data && Array.isArray(res.data.apartments)) {
                apartmentsList = res.data.apartments;
            } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                apartmentsList = res.data.data;
            } else if (res.data && res.data.data && Array.isArray(res.data.data.apartments)) {
                apartmentsList = res.data.data.apartments;
            } else if (res.data && res.data.apartments && !Array.isArray(res.data.apartments)) {
                // If apartments is an object (like a collection), convert to array
                apartmentsList = Object.values(res.data.apartments);
            }
            
            setApartments(apartmentsList);
        } catch (err) {
            console.error("Error fetching apartments:", err);
            setApartments([]);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const saveBuilding = async () => {
        if (!name || !floorsCount || floorsCount < 1) {
            alert("Please enter a name and a valid number of floors (at least 1).");
            return;
        }

        setSaving(true);
        try {
            const res = await api.patch(`/buildings/update/${id}`, {
                name,
                floors_count: parseInt(floorsCount)
            });
            setBuilding(res.data.building);
            alert("Building updated successfully.");
            setIsEditing(false);
            fetchBuilding();
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset form to original values
        setName(building?.name || '');
        setFloorsCount(building?.floors_count || 1);
        setIsEditing(false);
    };

    const deleteBuilding = async () => {
        setDeleting(true);
        try {
            await api.delete(`/buildings/destroy/${id}`);
            alert("Building deleted successfully.");
            // Navigate back to the HouseHub page
            if (building?.house_hub_id) {
                navigate(`/househub/${building.house_hub_id}`);
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

    const createApartment = async () => {
        if (!apartmentName || !apartmentFloor || apartmentFloor < 1 || !ownerEmail) {
            alert("Please fill in all fields: apartment name, floor number (at least 1), and owner email.");
            return;
        }

        if (!validateEmail(ownerEmail)) {
            alert("Please enter a valid email address (format: something@example.com).");
            return;
        }

        if (apartmentFloor > building.floors_count) {
            alert(`Floor number cannot exceed the building's total floors (${building.floors_count}).`);
            return;
        }

        setCreatingApartment(true);
        try {
            const res = await api.post("/apartments/store", {
                building_id: parseInt(id),
                name: apartmentName,
                floor: parseInt(apartmentFloor),
                email: ownerEmail
            });
            setShowApartmentModal(false);
            setApartmentName("");
            setApartmentFloor(1);
            setOwnerEmail("");
            // Always refetch to ensure we have the latest data
            await fetchApartments();
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setCreatingApartment(false);
        }
    };

    if (loading || !building) {
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
                    { label: building.name || "Building" }
                ]} />

                {/* Page Type Indicator */}
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "0.8125rem",
                    fontWeight: "600",
                    marginBottom: "20px",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)"
                }}>
                    <span>🏢</span>
                    <span>BUILDING</span>
                </div>

                {/* Building Header Card */}
                <div style={{ 
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                    borderRadius: "20px", 
                    padding: "40px", 
                    marginBottom: "32px",
                    color: "#fff",
                    boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)",
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
                                        🏢
                                    </div>
                                    <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700", letterSpacing: "-0.5px" }}>{building.name || "Building"}</h1>
                                </div>
                                <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", marginTop: "24px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <span style={{ opacity: 0.85, fontSize: "0.875rem", fontWeight: "500" }}>Floors</span>
                                        <div style={{ fontWeight: "600", fontSize: "1rem", marginTop: "2px" }}>{building.floors_count || 0}</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <span style={{ opacity: 0.85, fontSize: "0.875rem", fontWeight: "500" }}>Apartments</span>
                                        <div style={{ fontWeight: "600", fontSize: "1rem", marginTop: "2px" }}>{apartments.length}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                {showDeleteConfirm ? (
                                    <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.15)", padding: "12px 16px", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
                                        <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>Confirm delete?</span>
                                        <button 
                                            onClick={deleteBuilding}
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
                                        Delete Building
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
                        <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.3px" }}>Building Details</h2>
                        <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "0.9375rem" }}>Manage your building information and settings</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "10px", color: "#374151", fontWeight: "600", fontSize: "0.9375rem" }}>Name</label>
                            <input 
                                placeholder="Building Name" 
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
                                onFocus={(e) => isEditing && (e.currentTarget.style.borderColor = "#10b981")}
                                onBlur={(e) => isEditing && (e.currentTarget.style.borderColor = "#e5e7eb")}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "10px", color: "#374151", fontWeight: "600", fontSize: "0.9375rem" }}>Number of Floors</label>
                            <input 
                                type="number"
                                min="1"
                                placeholder="Number of floors" 
                                value={floorsCount} 
                                onChange={e => setFloorsCount(parseInt(e.target.value) || 1)} 
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
                                onFocus={(e) => isEditing && (e.currentTarget.style.borderColor = "#10b981")}
                                onBlur={(e) => isEditing && (e.currentTarget.style.borderColor = "#e5e7eb")}
                            />
                        </div>
                        {isEditing ? (
                            <div style={{ display: "flex", gap: "12px", marginTop: "8px", paddingTop: "20px", borderTop: "2px solid #f3f4f6" }}>
                                <button 
                                    onClick={saveBuilding} 
                                    disabled={saving || !name || !floorsCount || floorsCount < 1} 
                                    style={{ 
                                        flex: 1,
                                        padding: "14px 28px", 
                                        background: saving || !name || !floorsCount || floorsCount < 1 ? "#d1d5db" : "#10b981", 
                                        color: "#fff", 
                                        border: "none", 
                                        borderRadius: "10px", 
                                        cursor: saving || !name || !floorsCount || floorsCount < 1 ? "not-allowed" : "pointer",
                                        fontWeight: "600",
                                        fontSize: "1rem",
                                        transition: "all 0.2s",
                                        boxShadow: saving || !name || !floorsCount || floorsCount < 1 ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!saving && name && floorsCount && floorsCount >= 1) {
                                            e.currentTarget.style.background = "#059669";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!saving && name && floorsCount && floorsCount >= 1) {
                                            e.currentTarget.style.background = "#10b981";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
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
                                        background: "#10b981", 
                                        color: "#fff", 
                                        border: "none", 
                                        borderRadius: "10px", 
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        fontSize: "1rem",
                                        transition: "all 0.2s",
                                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#2563eb";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#3b82f6";
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                                    }}
                                >
                                    Edit Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Apartments Section */}
                <div style={{ 
                    background: "#fff", 
                    borderRadius: "16px", 
                    padding: "32px", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    border: "1px solid #f0f0f0"
                }}>
                    <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "2px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                            <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.3px" }}>Apartments</h2>
                            <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "0.9375rem" }}>
                                {apartments.length === 0 ? "No apartments in this building" : `${apartments.length} apartment${apartments.length !== 1 ? 's' : ''} found`}
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowApartmentModal(true)}
                            style={{ 
                                padding: "12px 24px", 
                                background: "#10b981", 
                                color: "#fff", 
                                border: "none", 
                                borderRadius: "10px", 
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "0.9375rem",
                                transition: "all 0.2s",
                                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                                whiteSpace: "nowrap"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#2563eb";
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#3b82f6";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                            }}
                        >
                            + Create Apartment
                        </button>
                    </div>
                    {apartments.length === 0 ? (
                        <div style={{ 
                            padding: "60px 40px", 
                            textAlign: "center", 
                            color: "#6b7280",
                            background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                            borderRadius: "12px",
                            border: "2px dashed #e5e7eb"
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.5 }}>🏠</div>
                            <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: "500" }}>No apartments found</p>
                            <p style={{ margin: "8px 0 0 0", fontSize: "0.9375rem", opacity: 0.8 }}>Apartments will appear here once they are added to this building</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                            {apartments.map(a => (
                                <div 
                                    key={a.id} 
                                    onClick={() => navigate(`/apartment/${a.id}`)}
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
                                        e.currentTarget.style.borderColor = "#10b981";
                                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(16, 185, 129, 0.12)";
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#f9fafb";
                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <h4 style={{ margin: "0 0 12px 0", color: "#10b981", fontSize: "1.25rem", fontWeight: "700" }}>{a.name || `Apartment ${a.id}`}</h4>
                                    {(a.floor || a.floor_number) && (
                                        <p style={{ margin: "0 0 12px 0", color: "#6b7280", fontSize: "0.9375rem", lineHeight: "1.6" }}>Floor: {a.floor || a.floor_number}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Apartment Modal */}
                {showApartmentModal && (
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
                                    setShowApartmentModal(false);
                                    setApartmentName("");
                                    setApartmentFloor(1);
                                    setOwnerEmail("");
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

                            <h2 style={{ marginBottom: "24px", color: "#10b981", fontWeight: "700", fontSize: "1.5rem" }}>Create Apartment</h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9375rem", color: "#374151", fontWeight: "600" }}>Apartment Name *</label>
                                    <input 
                                        placeholder="Apartment name" 
                                        value={apartmentName} 
                                        onChange={(e) => setApartmentName(e.target.value)}
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
                                        onFocus={(e) => e.currentTarget.style.borderColor = "#10b981"}
                                        onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9375rem", color: "#374151", fontWeight: "600" }}>
                                        Floor Number * 
                                        <span style={{ color: "#6b7280", fontWeight: "400", fontSize: "0.875rem", marginLeft: "8px" }}>
                                            (Max: {building.floors_count})
                                        </span>
                                    </label>
                                    <input 
                                        type="number"
                                        min="1"
                                        max={building.floors_count}
                                        placeholder="Floor number" 
                                        value={apartmentFloor} 
                                        onChange={(e) => setApartmentFloor(parseInt(e.target.value) || 1)}
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
                                        onFocus={(e) => e.currentTarget.style.borderColor = "#10b981"}
                                        onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9375rem", color: "#374151", fontWeight: "600" }}>Owner Email *</label>
                                    <input 
                                        type="email"
                                        placeholder="owner@example.com" 
                                        value={ownerEmail} 
                                        onChange={(e) => setOwnerEmail(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            marginBottom: 0,
                                            border: ownerEmail && !validateEmail(ownerEmail) ? "2px solid #ef4444" : "2px solid #e5e7eb",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            boxSizing: "border-box",
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = ownerEmail && !validateEmail(ownerEmail) ? "#ef4444" : "#10b981"}
                                        onBlur={(e) => e.currentTarget.style.borderColor = ownerEmail && !validateEmail(ownerEmail) ? "#ef4444" : "#e5e7eb"}
                                    />
                                    {ownerEmail && !validateEmail(ownerEmail) && (
                                        <p style={{ margin: "8px 0 0 0", fontSize: "0.8125rem", color: "#ef4444" }}>
                                            Please enter a valid email address (format: something@example.com)
                                        </p>
                                    )}
                                    {(!ownerEmail || validateEmail(ownerEmail)) && (
                                        <p style={{ margin: "8px 0 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>
                                            If the user doesn't exist, they will be created and receive an invitation email.
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                                    <button 
                                        onClick={createApartment}
                                        disabled={creatingApartment || !apartmentName || !apartmentFloor || apartmentFloor < 1 || apartmentFloor > building.floors_count || !ownerEmail || !validateEmail(ownerEmail)} 
                                        style={{
                                            flex: 1,
                                            padding: "14px 28px",
                                            background: (!apartmentName || !apartmentFloor || apartmentFloor < 1 || apartmentFloor > building.floors_count || !ownerEmail || !validateEmail(ownerEmail)) ? "#d1d5db" : "#3b82f6",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "10px",
                                            cursor: creatingApartment || !apartmentName || !apartmentFloor || apartmentFloor < 1 || apartmentFloor > building.floors_count || !ownerEmail || !validateEmail(ownerEmail) ? "not-allowed" : "pointer",
                                            fontWeight: "600",
                                            fontSize: "1rem",
                                            transition: "all 0.2s",
                                            boxShadow: (!apartmentName || !apartmentFloor || apartmentFloor < 1 || apartmentFloor > building.floors_count || !ownerEmail || !validateEmail(ownerEmail)) ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!creatingApartment && apartmentName && apartmentFloor && apartmentFloor >= 1 && apartmentFloor <= building.floors_count && ownerEmail && validateEmail(ownerEmail)) {
                                                e.currentTarget.style.background = "#059669";
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!creatingApartment && apartmentName && apartmentFloor && apartmentFloor >= 1 && apartmentFloor <= building.floors_count && ownerEmail && validateEmail(ownerEmail)) {
                                                e.currentTarget.style.background = "#10b981";
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                                            }
                                        }}
                                    >
                                        {creatingApartment ? "Creating..." : "Create Apartment"}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowApartmentModal(false);
                                            setApartmentName("");
                                            setApartmentFloor(1);
                                            setOwnerEmail("");
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

