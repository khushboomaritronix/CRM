import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Plus from "@mui/icons-material/Add"; // was lucide Plus
import Pencil from "@mui/icons-material/Edit"; // was lucide Pencil
import Trash2 from "@mui/icons-material/Delete"; // was lucide Trash2
import Download from "@mui/icons-material/Download";
import { fetchVendors, deleteVendors, selectList, selectLoading, selectPagination } from "../../features/vendors/vendorsSlice";
import { selectHasPermission } from "../../features/auth/authSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable, { Badge } from "../../components/common/DataTable";
import api from "../../services/api";

export default function VendorListPage() {
  const dispatch = useDispatch(); const navigate = useNavigate();
  const list = useSelector(selectList); const loading = useSelector(selectLoading); const pagination = useSelector(selectPagination);
  const canCreate = useSelector(selectHasPermission("vendors","can_create"));
  const canUpdate = useSelector(selectHasPermission("vendors","can_update"));
  const canDelete = useSelector(selectHasPermission("vendors","can_delete"));
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  useEffect(() => { dispatch(fetchVendors({search,page})); }, [dispatch,search,page]);

  const handleDelete = (id,name) => {
    if (!window.confirm(`Delete vendor "${name}"?`)) return;
    dispatch(deleteVendors(id));
  };
  const handleExport = async () => {
    const {data} = await api.get("/bulk/export/vendors/",{responseType:"blob"});
    const url = URL.createObjectURL(data); const a = document.createElement("a");
    a.href=url; a.download="vendors_export.csv"; a.click();
  };

  const columns = [
    {key:"name",label:"Name",sortable:true,render:(v,row)=><Link to={`/vendors/${row.id}/edit`} style={{color:"#2E86AB",fontWeight:600,textDecoration:"none"}}>{v}</Link>},
    {key:"company_name",label:"Company",render:v=>v||"—"},
    {key:"email",label:"Email"},
    {key:"phone",label:"Phone",render:v=>v||"—"},
    {key:"gstin",label:"GSTIN",render:v=>v||"—"},
    {key:"is_active",label:"Status",render:v=><Badge color={v?"green":"gray"}>{v?"Active":"Inactive"}</Badge>},
    {key:"created_at",label:"Created",render:v=>new Date(v).toLocaleDateString()},
  ];
  return (
    <div>
      <PageHeader title="Vendors" subtitle={`${pagination.count} vendors`}
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Vendors"}]}
        actions={<div style={{display:"flex",gap:8}}>
          <button onClick={handleExport} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 14px",background:"#fff",color:"#374151",borderRadius:8,fontWeight:600,fontSize:13.5,border:"1px solid #E2E8F0",cursor:"pointer"}}><Download size={14}/>Export</button>
          {canCreate && <Link to="/vendors/new" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,textDecoration:"none"}}><Plus size={14}/>New Vendor</Link>}
        </div>}
      />
      <div style={{marginBottom:14}}>
        <input style={{width:"100%",maxWidth:440,padding:"9px 13px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:14,outline:"none"}}
          placeholder="Search vendors..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
      </div>
      <DataTable columns={columns} data={list} loading={loading} pagination={pagination} onPageChange={setPage}
        emptyMessage="No vendors found."
        actions={row=>(
          <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
            {canUpdate && <button onClick={()=>navigate(`/vendors/${row.id}/edit`)} style={{background:"none",border:"1px solid #E2E8F0",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Pencil size={13}/></button>}
            {canDelete && <button onClick={()=>handleDelete(row.id,row.name)} style={{background:"none",border:"1px solid #FEB2B2",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#E53E3E"}}><Trash2 size={13}/></button>}
          </div>
        )}
      />
    </div>
  );
}
