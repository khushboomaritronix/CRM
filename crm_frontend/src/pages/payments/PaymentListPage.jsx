import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { fetchPayments, deletePayments, selectList, selectLoading, selectPagination } from "../../features/payments/paymentsSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";

const BC={green:{background:"#F0FFF4",color:"#276749",border:"1px solid #9AE6B4"},blue:{background:"#EBF8FF",color:"#2C5282",border:"1px solid #90CDF4"},gray:{background:"#F7FAFC",color:"#4A5568",border:"1px solid #E2E8F0"},red:{background:"#FFF5F5",color:"#9B2C2C",border:"1px solid #FEB2B2"},yellow:{background:"#FFFFF0",color:"#744210",border:"1px solid #FAF089"}};
const SC={pending:"yellow",completed:"green",failed:"red",cancelled:"gray"};
const Bdg=({color="gray",children})=><span style={{display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:20,fontSize:11.5,fontWeight:600,...BC[color]}}>{children}</span>;
const IBTN={background:"none",border:"1px solid #E2E8F0",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"};

export default function PaymentListPage() {
  const dispatch=useDispatch(); const navigate=useNavigate();
  const list=useSelector(selectList); const loading=useSelector(selectLoading); const pagination=useSelector(selectPagination);
  const[search,setSearch]=useState(""); const[type,setType]=useState(""); const[page,setPage]=useState(1);

  // Compute totals
  const totalReceived = list.filter(p=>p.payment_type==="received").reduce((a,p)=>a+parseFloat(p.amount||0),0);
  const totalMade = list.filter(p=>p.payment_type==="made").reduce((a,p)=>a+parseFloat(p.amount||0),0);

  useEffect(()=>{dispatch(fetchPayments({search,payment_type:type,page}))},[dispatch,search,type,page]);

  const columns=[
    {key:"payment_number",label:"#",render:(v,row)=><Link to={`/payments/${row.id}/edit`} style={{color:"#2E86AB",fontWeight:700,textDecoration:"none"}}>{v}</Link>},
    {key:"payment_type",label:"Type",render:v=>v==="received"
      ?<span style={{display:"inline-flex",alignItems:"center",gap:4,color:"#276749",fontWeight:600,fontSize:12}}><ArrowDownLeft size={12}/>Received</span>
      :<span style={{display:"inline-flex",alignItems:"center",gap:4,color:"#2C5282",fontWeight:600,fontSize:12}}><ArrowUpRight size={12}/>Made</span>},
    {key:"customer",label:"Party",render:(v,row)=>row.customer_name||row.vendor_name||"—"},
    {key:"payment_date",label:"Date",render:v=>v?new Date(v).toLocaleDateString():"—"},
    {key:"payment_method",label:"Method",render:v=>v?v.replace(/_/g," ").toUpperCase():"—"},
    {key:"invoice_ref",label:"Reference",render:v=>v||"—"},
    {key:"amount",label:"Amount",render:(v,row)=>(
      <span style={{fontWeight:700,color:row.payment_type==="received"?"#276749":"#2C5282"}}>
        {row.currency||"INR"} {parseFloat(v||0).toLocaleString("en-IN",{minimumFractionDigits:2})}
      </span>
    )},
    {key:"status",label:"Status",render:v=><Bdg color={SC[v]||"gray"}>{v?v[0].toUpperCase()+v.slice(1):"—"}</Bdg>},
  ];

  return (
    <div>
      <PageHeader title="Payments" subtitle={`${pagination.count} payments`}
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Payments"}]}
        actions={<Link to="/payments/new" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,textDecoration:"none"}}><Plus size={14}/> Record Payment</Link>}
      />

      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
        <div style={{background:"#F0FFF4",border:"1px solid #9AE6B4",borderRadius:10,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:10,background:"#276749",display:"flex",alignItems:"center",justifyContent:"center"}}><ArrowDownLeft size={18} color="#fff"/></div>
          <div>
            <div style={{fontSize:12,color:"#276749",fontWeight:600,marginBottom:2}}>TOTAL RECEIVED</div>
            <div style={{fontSize:20,fontWeight:800,color:"#276749"}}>INR {totalReceived.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
          </div>
        </div>
        <div style={{background:"#EBF8FF",border:"1px solid #90CDF4",borderRadius:10,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:10,background:"#2C5282",display:"flex",alignItems:"center",justifyContent:"center"}}><ArrowUpRight size={18} color="#fff"/></div>
          <div>
            <div style={{fontSize:12,color:"#2C5282",fontWeight:600,marginBottom:2}}>TOTAL PAID OUT</div>
            <div style={{fontSize:20,fontWeight:800,color:"#2C5282"}}>INR {totalMade.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <input style={{maxWidth:360,padding:"9px 13px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:14,outline:"none",width:"100%"}} placeholder="Search by #, party, invoice ref..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
        <select value={type} onChange={e=>setType(e.target.value)} style={{padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:14,background:"#fff",outline:"none"}}>
          <option value="">All Types</option>
          <option value="received">Received (from customers)</option>
          <option value="made">Made (to vendors)</option>
        </select>
      </div>

      <DataTable columns={columns} data={list} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No payments recorded."
        actions={row=>(
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>navigate(`/payments/${row.id}/edit`)} style={IBTN}><Pencil size={13}/></button>
            <button onClick={()=>window.confirm("Delete payment?")&&dispatch(deletePayments(row.id))} style={{...IBTN,border:"1px solid #FEB2B2",color:"#E53E3E"}}><Trash2 size={13}/></button>
          </div>
        )}
      />
    </div>
  );
}
