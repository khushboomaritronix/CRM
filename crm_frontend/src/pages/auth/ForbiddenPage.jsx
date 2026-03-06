import React from "react";
import { Link } from "react-router-dom";
export default function ForbiddenPage() {
  return (
    <div style={{textAlign:"center", padding:"80px 24px"}}>
      <div style={{fontSize:80, fontWeight:900, color:"#FED7D7"}}>403</div>
      <h2 style={{color:"#2D3748", marginBottom:8}}>Access Denied</h2>
      <p style={{color:"#718096", marginBottom:24}}>You don't have permission to access this page. Contact your administrator.</p>
      <Link to="/dashboard" style={{color:"#2E86AB", fontWeight:600}}>← Back to Dashboard</Link>
    </div>
  );
}
