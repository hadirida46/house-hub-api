import React from "react";
import { useNavigate } from "react-router-dom";

export default function Breadcrumb({ items }) {
    const navigate = useNavigate();

    return (
        <nav style={{
            marginBottom: "24px",
            padding: "12px 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.875rem",
            color: "#6b7280"
        }}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span style={{ color: "#d1d5db", margin: "0 4px" }}>›</span>
                    )}
                    {item.href ? (
                        <span
                            onClick={() => navigate(item.href)}
                            style={{
                                color: index === items.length - 1 ? "#1f2937" : "#3b82f6",
                                fontWeight: index === items.length - 1 ? "600" : "500",
                                cursor: index === items.length - 1 ? "default" : "pointer",
                                transition: "all 0.2s",
                                padding: "4px 8px",
                                borderRadius: "6px"
                            }}
                            onMouseEnter={(e) => {
                                if (index !== items.length - 1) {
                                    e.currentTarget.style.background = "#f3f4f6";
                                    e.currentTarget.style.color = "#2563eb";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (index !== items.length - 1) {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "#3b82f6";
                                }
                            }}
                        >
                            {item.label}
                        </span>
                    ) : (
                        <span style={{
                            color: "#1f2937",
                            fontWeight: "600"
                        }}>
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

