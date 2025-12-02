import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [profilePic, setProfilePic] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [deletePicture, setDeletePicture] = useState(false);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/";
            return;
        }

        api.get("/profile")
            .then((response) => {
                // Assuming user data is nested under 'user' key from API response
                const userData = response.data.user || response.data;
                setName(userData.name || "");
                setEmail(userData.email || "");
                setPhone(userData.phone || "");
                setEditName(userData.name || "");
                setEditEmail(userData.email || "");
                setEditPhone(userData.phone || "");
                if (userData.profile_picture) setPreviewUrl(userData.profile_picture);
                setLoading(false);
            })
            .catch((err) => { // Enhanced error logging
                console.error("Error loading profile:", err);
                if (err.response && err.response.status === 401) {
                    setError("Session expired. Please log in again.");
                    localStorage.removeItem("token");
                    setTimeout(() => window.location.href = "/", 1500);
                } else {
                    setError("Failed to load profile data. Check console for details.");
                }
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
            setDeletePicture(false);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePicture = () => {
        setProfilePic(null);
        setPreviewUrl(null);
        setDeletePicture(true);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditName(name);
        setEditEmail(email);
        setEditPhone(phone);
        setMessage("");
        setError("");
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditName(name);
        setEditEmail(email);
        setEditPhone(phone);
        setProfilePic(null);
        setPreviewUrl(previewUrl);
        setDeletePicture(false);
        setMessage("");
        setError("");
    };

    const handleSave = () => {
        setError("");
        setMessage("");

        const formData = new FormData();
        if (editName !== name) formData.append("name", editName);
        if (editEmail !== email) formData.append("email", editEmail);
        if (editPhone !== phone) formData.append("phone", editPhone);

        if (profilePic) {
            formData.append("profile_picture", profilePic);
        } else if (deletePicture) {
            formData.append("delete_picture", "1");
        }

        api.post("/profile/update", formData, {
            headers: { "Content-Type": "multipart/form-data", "X-HTTP-Method-Override": "PATCH" },
        })
            .then((response) => {
                const updatedUser = response.data.user;
                setName(updatedUser.name);
                setEmail(updatedUser.email);
                setPhone(updatedUser.phone);
                setPreviewUrl(updatedUser.profile_picture || null);
                setProfilePic(null);
                setDeletePicture(false);
                setIsEditing(false);
                setMessage("Profile updated successfully!");
                setTimeout(() => setMessage(""), 3000);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Failed to update profile");
            });
    };

    const handleChangePassword = () => {
        setError("");
        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match");
            return;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        api.patch("/profile/update/password", {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmNewPassword
        })
            .then(() => {
                setShowPasswordModal(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setMessage("Password changed successfully!");
                setTimeout(() => setMessage(""), 3000);
            })
            .catch((err) => {
                setError(err.response?.data?.message || err.response?.data?.errors?.current_password?.[0] || "Failed to change password");
            });
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText !== "DELETE") {
            setError("Please type DELETE to confirm account deletion");
            return;
        }

        api.delete("/destroy")
            .then(() => {
                localStorage.removeItem("token");
                setMessage("Account deleted successfully. Redirecting...");
                setTimeout(() => window.location.href = "/", 2000);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Failed to delete account");
            });
    };

    const inputStyle = { width: "100%", padding: "12px 15px", borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem", outline: "none", boxSizing: "border-box" };
    const labelStyle = { display: "block", marginBottom: 8, fontWeight: 600, color: "#333", fontSize: "0.95rem" };
    const modalStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
    const modalContentStyle = { background: "#fff", padding: 30, borderRadius: 12, maxWidth: 450, width: "90%", boxShadow: "0 5px 15px rgba(0,0,0,0.3)" };
    const buttonPrimaryStyle = { padding: "12px 30px", borderRadius: 8, border: "none", background: "#3a76f2", color: "#fff", fontSize: "1rem", fontWeight: 600, cursor: "pointer" };
    const buttonDangerStyle = { ...buttonPrimaryStyle, background: "#dc3545" };

    return (
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: "100vh", background: "#f9fbff" }}>
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                    <div style={{ fontSize: "1.5rem", color: "#3a76f2" }}>Loading...</div>
                </div>
            ) : (
                <>
                    <Navbar
                        onLogout={handleLogout}
                        userName={name}
                        userEmail={email}
                        profilePictureUrl={previewUrl}
                    />
                    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
                        <div style={{ marginBottom: 30 }}>
                            <h1 style={{ fontSize: "2rem", color: "#333", marginBottom: 5 }}>Profile Settings</h1>
                            <p style={{ color: "#666", fontSize: "0.95rem" }}>Manage your personal information and security</p>
                        </div>

                        {message && <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: 8, marginBottom: 20, border: "1px solid #c3e6cb" }}>✓ {message}</div>}
                        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: 8, marginBottom: 20, border: "1px solid #f5c6cb" }}>✗ {error}</div>}

                        <div style={{ background: "#fff", borderRadius: 12, padding: 40, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0", marginBottom: 30 }}>
                            <div style={{ textAlign: "center", marginBottom: 40 }}>
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <div style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: "50%",
                                        background: previewUrl ? `url(${previewUrl}) center/cover no-repeat` : "#3a76f2",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "3rem",
                                        color: "#fff",
                                        fontWeight: 600,
                                        margin: "0 auto",
                                        border: "4px solid #fff",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                    }}>
                                        {!previewUrl && name.charAt(0).toUpperCase()}
                                    </div>
                                    {isEditing && (
                                        <label style={{ position: "absolute", bottom: 0, right: 0, background: "#3a76f2", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", border: "3px solid #fff" }}>
                                            <span style={{ color: "#fff", fontSize: "1.2rem" }}>📷</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                                        </label>
                                    )}
                                    {isEditing && previewUrl && (
                                        <button onClick={handleDeletePicture} style={{ position: "absolute", top: -10, right: -10, background: "#ff4d4f", color: "#fff", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontWeight: 600 }}>×</button>
                                    )}
                                </div>
                                {isEditing && <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 10 }}>Click the camera icon to change photo</p>}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 25 }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    {isEditing ? <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} placeholder="Enter your full name" />
                                        : <div style={{ padding: "12px 15px", background: "#f8f9fa", borderRadius: 8, color: "#333", fontSize: "1rem" }}>{name}</div>}
                                </div>

                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    {isEditing ? <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={inputStyle} placeholder="Enter your email" />
                                        : <div style={{ padding: "12px 15px", background: "#f8f9fa", borderRadius: 8, color: "#333", fontSize: "1rem" }}>{email}</div>}
                                </div>

                                <div>
                                    <label style={labelStyle}>Phone Number</label>
                                    {isEditing ? <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={inputStyle} placeholder="Enter your phone number" />
                                        : <div style={{ padding: "12px 15px", background: "#f8f9fa", borderRadius: 8, color: "#333", fontSize: "1rem" }}>{phone}</div>}
                                </div>
                            </div>

                            <div style={{ marginTop: 40, display: "flex", gap: 15, justifyContent: "flex-end" }}>
                                {isEditing ? (
                                    <>
                                        <button onClick={handleCancel} style={{ padding: "12px 30px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", color: "#333", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
                                                onMouseOver={(e) => e.currentTarget.style.background = "#f5f5f5"}
                                                onMouseOut={(e) => e.currentTarget.style.background = "#fff"}>Cancel</button>
                                        <button onClick={handleSave} style={{ ...buttonPrimaryStyle }}
                                                onMouseOver={(e) => e.currentTarget.style.background = "#2c5fd1"}
                                                onMouseOut={(e) => e.currentTarget.style.background = "#3a76f2"}>Save Changes</button>
                                    </>
                                ) : (
                                    <button onClick={handleEdit} style={{ ...buttonPrimaryStyle }}
                                            onMouseOver={(e) => e.currentTarget.style.background = "#2c5fd1"}
                                            onMouseOut={(e) => e.currentTarget.style.background = "#3a76f2"}>Edit Profile</button>
                                )}
                            </div>
                        </div>

                        <div style={{ background: "#fff", borderRadius: 12, padding: 40, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0", marginBottom: 30 }}>
                            <h3 style={{ fontSize: "1.5rem", color: "#333", marginBottom: 20 }}>Security and Actions</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                                <button onClick={() => { setShowPasswordModal(true); setError(""); setMessage(""); }}
                                        style={{ padding: "12px 20px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", color: "#333", fontSize: "1rem", fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                                        onMouseOver={(e) => e.currentTarget.style.background = "#f5f5f5"}
                                        onMouseOut={(e) => e.currentTarget.style.background = "#fff"}>
                                    Change Password
                                </button>

                                <button onClick={() => { setShowDeleteModal(true); setError(""); setMessage(""); }}
                                        style={{ padding: "12px 20px", borderRadius: 8, border: "1px solid #dc3545", background: "#fff", color: "#dc3545", fontSize: "1rem", fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                                        onMouseOver={(e) => e.currentTarget.style.background = "#f8d7da"}
                                        onMouseOut={(e) => e.currentTarget.style.background = "#fff"}>
                                    Delete Account
                                </button>

                                <button onClick={handleLogout}
                                        style={{ padding: "12px 20px", borderRadius: 8, border: "none", background: "#6c757d", color: "#fff", fontSize: "1rem", fontWeight: 600, cursor: "pointer", textAlign: "left", marginTop: 10 }}
                                        onMouseOver={(e) => e.currentTarget.style.background = "#5a6268"}
                                        onMouseOut={(e) => e.currentTarget.style.background = "#6c757d"}>
                                    Logout
                                </button>
                            </div>
                        </div>

                    </div>
                </>
            )}

            {showPasswordModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h2 style={{ marginBottom: 20 }}>Change Password</h2>
                        <div style={{ marginBottom: 15 }}>
                            <label style={labelStyle}>Current Password</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: 15 }}>
                            <label style={labelStyle}>New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Confirm New Password</label>
                            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} style={inputStyle} />
                        </div>
                        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: 8, marginBottom: 15, border: "1px solid #f5c6cb" }}>✗ {error}</div>}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button onClick={() => setShowPasswordModal(false)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>Cancel</button>
                            <button onClick={handleChangePassword} style={{ ...buttonPrimaryStyle, padding: "10px 20px" }}>Change Password</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h2 style={{ marginBottom: 20, color: "#dc3545" }}>Delete Account</h2>
                        <p style={{ marginBottom: 20 }}>This action is **irreversible**. All your data will be permanently deleted.</p>
                        <p style={{ marginBottom: 10, fontWeight: 600 }}>Please type the word <code style={{ background: '#f8f9fa', padding: '2px 5px', borderRadius: 4, border: '1px solid #e9ecef' }}>DELETE</code> to confirm.</p>
                        <div style={{ marginBottom: 20 }}>
                            <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} style={inputStyle} />
                        </div>
                        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: 8, marginBottom: 15, border: "1px solid #f5c6cb" }}>✗ {error}</div>}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>Cancel</button>
                            <button onClick={handleDeleteAccount} style={{ ...buttonDangerStyle, padding: "10px 20px" }} disabled={deleteConfirmText !== "DELETE"}>Permanently Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
