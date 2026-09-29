import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Plus from "@mui/icons-material/Add"; // was lucide Plus
import Pencil from "@mui/icons-material/Edit"; // was lucide Pencil
import Trash2 from "@mui/icons-material/Delete"; // was lucide Trash2
import { fetchDebitNotes, deleteDebitNotes, selectList, selectLoading, selectPagination } from "../../features/debitNotes/debitNotesSlice";
import { selectHasPermission } from "../../features/auth/authSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import DocLineItems from "../../components/common/DocLineItems";
import api from "../../services/api";

const BC={green:{background:"#F0FFF4",color:"#276749",border:"1px solid #9AE6B4"},blue:{background:"#EBF8FF",color:"#2C5282",border:"1px solid #90CDF4"},gray:{background:"#F7FAFC",color:"#4A5568",border:"1px solid #E2E8F0"},red:{background:"#FFF5F5",color:"#9B2C2C",border:"1px solid #FEB2B2"},yellow:{background:"#FFFFF0",color:"#744210",border:"1px solid #FAF089"},orange:{background:"#FFFAF0",color:"#7B341E",border:"1px solid #FBBF24"},purple:{background:"#FAF5FF",color:"#553C9A",border:"1px solid #D6BCFA"}};
const SC={draft:"gray",issued:"blue",applied:"green",cancelled:"red",pending:"yellow",approved:"green",received:"green",rejected:"red",closed:"gray",completed:"green",failed:"red"};
const Bdg=({color="gray",children})=><span style={{display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:20,fontSize:11.5,fontWeight:600,...BC[color]}}>{children}</span>;

export default function DebitNoteListPage() {
  const dispatch=useDispatch(); const navigate=useNavigate();
  const list=useSelector(selectList); const loading=useSelector(selectLoading); const pagination=useSelector(selectPagination);
  const canCreate=useSelector(selectHasPermission("debit_notes","can_create"));
  const canUpdate=useSelector(selectHasPermission("debit_notes","can_update"));
  const canDelete=useSelector(selectHasPermission("debit_notes","can_delete"));
  const[search,setSearch]=useState(""); const[status,setStatus]=useState(""); const[page,setPage]=useState(1);
  useEffect(()=>{dispatch(fetchDebitNotes({search,status,page}))},[dispatch,search,status,page]);
  const del=(id,n)=>{if(window.confirm(`Delete "${n||id}"?`))dispatch(deleteDebitNotes(id));};

  const columns=[
    {key:"debit_number",label:"Number",render:(v,row)=><Link to={`/debit-notes/${row.id}/edit`} style={{color:"#2E86AB",fontWeight:700,textDecoration:"none"}}>{v||`#${row.id}`}</Link>},
    {key:"customer",label:"Vendor",render:(v,row)=>row.vendor_name||row.vendor_name||"—"},
    {key:"date",label:"Date",render:v=>v?new Date(v).toLocaleDateString():"—"},
    {key:"total",label:"Total",render:(v,row)=><span style={{fontWeight:700}}>{row.currency||"INR"} {parseFloat(v||0).toLocaleString("en-IN",{minimumFractionDigits:2})}</span>},
    {key:"status",label:"Status",render:v=><Bdg color={SC[v]||"gray"}>{v?v[0].toUpperCase()+v.slice(1):"—"}</Bdg>},
    
  ];

  return(
    <div>
      <PageHeader title="Debit Notes" subtitle={`${pagination.count} records`}
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Debit Notes"}]}
        actions={canCreate && <Link to="/debit-notes/new" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,textDecoration:"none",border:"none",cursor:"pointer"}}><Plus size={14}/> New Debit Note</Link>}
      />
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <input style={{maxWidth:360,padding:"9px 13px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:14,outline:"none",width:"100%"}}
          placeholder="Search..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
        <select value={status} onChange={e=>setStatus(e.target.value)} style={{padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:14,background:"#fff",outline:"none"}}>
          <option value="">All Status</option>
          <option value="draft">Draft</option><option value="issued">Issued</option><option value="applied">Applied</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <DataTable columns={columns} data={list} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No records found."
        actions={row=>(
          <div style={{display:"flex",gap:4}}>
            {canUpdate && <button onClick={()=>navigate(`/debit-notes/${row.id}/edit`)} style={{background:"none",border:"1px solid #E2E8F0",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Pencil size={13}/></button>}
            {canDelete && <button onClick={()=>del(row.id,row.debit_number)} style={{background:"none",border:"1px solid #FEB2B2",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#E53E3E"}}><Trash2 size={13}/></button>}
          </div>
        )}
      />
    </div>
  );
}
