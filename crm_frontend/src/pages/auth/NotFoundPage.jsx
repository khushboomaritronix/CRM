import React from "react";
import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <div style={{textAlign:"center", padding:"80px 24px"}}>
      <div style={{fontSize:80, fontWeight:900, color:"#E2E8F0"}}>404</div>
      <h2 style={{color:"#2D3748", marginBottom:8}}>Page Not Found</h2>
      <p style={{color:"#718096", marginBottom:24}}>The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" style={{color:"#2E86AB", fontWeight:600}}>← Back to Dashboard</Link>
    </div>
  );
}
