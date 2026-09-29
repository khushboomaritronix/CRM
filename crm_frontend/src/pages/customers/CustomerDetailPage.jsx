import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchOneCustomers, deleteCustomers, selectSelected, selectLoading } from "../../features/customers/customersSlice";
import PageHeader from "../../components/common/PageHeader";
import { Badge } from "../../components/common/DataTable";
import Pencil from "@mui/icons-material/Edit"; // was lucide Pencil
import Trash2 from "@mui/icons-material/Delete"; // was lucide Trash2
import ArrowLeft from "@mui/icons-material/ArrowBack"; // was lucide ArrowLeft
import Phone from "@mui/icons-material/Phone";
import Mail from "@mui/icons-material/Email"; // was lucide Mail
import Globe from "@mui/icons-material/Public"; // was lucide Globe
import MapPin from "@mui/icons-material/LocationOn"; // was lucide MapPin
import FileText from "@mui/icons-material/Description"; // was lucide FileText

const Row=({label,value})=>value?(
  <div style={{display:"flex",gap:16,padding:"11px 0",borderBottom:"1px solid #F3F4F6"}}>
    <span style={{width:160,flexShrink:0,fontSize:13,color:"#6B7280",fontWeight:500}}>{label}</span>
    <span style={{fontSize:13.5,color:"#1E3A5F",fontWeight:500}}>{value}</span>
  </div>
):null;

export default function CustomerDetailPage() {
  const dispatch=useDispatch(); const {id}=useParams(); const navigate=useNavigate();
  const customer=useSelector(selectSelected); const loading=useSelector(selectLoading);
  useEffect(()=>{dispatch(fetchOneCustomers(id));},[dispatch,id]);

  if(loading||!customer) return <div style={{padding:60,textAlign:"center",color:"#9CA3AF"}}>Loading...</div>;

  const del=()=>{ if(!window.confirm(`Delete customer "${customer.name}"?`))return; dispatch(deleteCustomers(id)); navigate("/customers"); };

  return(
    <div>
      <PageHeader title={customer.name} subtitle={customer.company_name||""}
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Customers",path:"/customers"},{label:customer.name}]}
        actions={
          <div style={{display:"flex",gap:8}}>
            <Link to="/customers" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",border:"1.5px solid #E2E8F0",borderRadius:8,color:"#374151",fontWeight:600,fontSize:13.5,textDecoration:"none"}}><ArrowLeft size={14}/>Back</Link>
            <Link to={`/customers/${id}/edit`} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,textDecoration:"none"}}><Pencil size={14}/>Edit</Link>
            <button onClick={del} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#EF4444",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,border:"none",cursor:"pointer"}}><Trash2 size={14}/>Delete</button>
          </div>
        }
      />
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <div>
          <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:24,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#2E86AB",marginBottom:14,textTransform:"uppercase",letterSpacing:0.8}}>Contact Information</div>
            <Row label="Email" value={customer.email}/>
            <Row label="Phone" value={customer.phone}/>
            <Row label="Website" value={customer.website}/>
            <Row label="Status" value={<Badge color={customer.is_active?"green":"gray"}>{customer.is_active?"Active":"Inactive"}</Badge>}/>
          </div>
          <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:24,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#2E86AB",marginBottom:14,textTransform:"uppercase",letterSpacing:0.8}}>Billing Address</div>
            <Row label="Address" value={customer.billing_address}/>
            <Row label="City" value={customer.billing_city}/>
            <Row label="State" value={customer.billing_state}/>
            <Row label="Country" value={customer.billing_country}/>
            <Row label="Pincode" value={customer.billing_pincode}/>
          </div>
          {customer.notes&&(
            <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:24}}>
              <div style={{fontSize:12,fontWeight:700,color:"#2E86AB",marginBottom:12,textTransform:"uppercase",letterSpacing:0.8}}>Notes</div>
              <p style={{fontSize:13.5,color:"#4A5568",lineHeight:1.6,margin:0}}>{customer.notes}</p>
            </div>
          )}
        </div>
        <div>
          <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:24,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#2E86AB",marginBottom:14,textTransform:"uppercase",letterSpacing:0.8}}>Tax & Compliance</div>
            <Row label="GSTIN" value={customer.gstin}/>
            <Row label="PAN" value={customer.pan}/>
          </div>
          <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:20}}>
            <div style={{fontSize:12,fontWeight:700,color:"#2E86AB",marginBottom:14,textTransform:"uppercase",letterSpacing:0.8}}>Quick Actions</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Link to={`/invoices/new?customer=${id}`} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#F8FAFC",borderRadius:8,color:"#374151",textDecoration:"none",fontSize:13.5,fontWeight:600,border:"1px solid #E2E8F0"}}>
                <FileText size={14} color="#2E86AB"/> New Invoice
              </Link>
              <Link to={`/estimates/new?customer=${id}`} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#F8FAFC",borderRadius:8,color:"#374151",textDecoration:"none",fontSize:13.5,fontWeight:600,border:"1px solid #E2E8F0"}}>
                <FileText size={14} color="#2E86AB"/> New Estimate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
