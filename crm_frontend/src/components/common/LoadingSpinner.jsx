import React from "react";
export default function LoadingSpinner({ fullPage }) {
  if (fullPage) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
      <div style={{width:40,height:40,border:"3px solid #E2E8F0",borderTop:"3px solid #2E86AB",borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return <div style={{width:20,height:20,border:"2px solid #E2E8F0",borderTop:"2px solid #2E86AB",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
}
