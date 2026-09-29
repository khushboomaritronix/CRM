import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Plus from "@mui/icons-material/Add"; // was lucide Plus
import Shield from "@mui/icons-material/Shield";
import Pencil from "@mui/icons-material/Edit"; // was lucide Pencil
import Trash2 from "@mui/icons-material/Delete"; // was lucide Trash2
import Users from "@mui/icons-material/People"; // was lucide Users
import { fetchRoles, deleteRoles, selectList, selectLoading } from "../../features/roles/rolesSlice";
import { selectHasPermission } from "../../features/auth/authSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable, { Badge } from "../../components/common/DataTable";

export default function RoleListPage() {
  const dispatch = useDispatch();
  const list = useSelector(selectList); const loading = useSelector(selectLoading);
  const canCreate = useSelector(selectHasPermission("roles", "can_create"));
  const canUpdate = useSelector(selectHasPermission("roles", "can_update"));
  const canDelete = useSelector(selectHasPermission("roles", "can_delete"));
  const [search, setSearch] = useState("");
  useEffect(() => { dispatch(fetchRoles({search})); }, [dispatch,search]);

  const columns = [
    {key:"name",label:"Role Name",sortable:true,render:(v,row)=>(
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:"#EBF8FF",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Shield size={15} color="#2E86AB"/>
        </div>
        <div>
          <Link to={`/roles/${row.id}`} style={{color:"#1E3A5F",fontWeight:700,textDecoration:"none",display:"block"}}>{v}</Link>
          <span style={{fontSize:12,color:"#9CA3AF"}}>{row.description||"No description"}</span>
        </div>
      </div>
    )},
    {key:"is_active",label:"Status",render:v=><Badge color={v?"green":"gray"}>{v?"Active":"Inactive"}</Badge>},
    {key:"created_at",label:"Created",render:v=>new Date(v).toLocaleDateString()},
  ];

  return (
    <div>
      <PageHeader title="Roles" subtitle="Manage roles and their permissions"
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Roles"}]}
        actions={
          canCreate && (
            <Link to="/roles/new" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,textDecoration:"none"}}>
              <Plus size={14}/> New Role
            </Link>
          )
        }
      />
      <div style={{marginBottom:14}}>
        <input style={{width:"100%",maxWidth:400,padding:"9px 13px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:14,outline:"none"}}
          placeholder="Search roles..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      <DataTable columns={columns} data={list} loading={loading} emptyMessage="No roles found."
        actions={row=>(
          <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
            {canUpdate && <Link to={`/roles/${row.id}`} style={{background:"none",border:"1px solid #E2E8F0",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:"#4A5568"}}><Pencil size={13}/></Link>}
            {canDelete && <button onClick={()=>window.confirm("Delete role?")&&dispatch(deleteRoles(row.id))} style={{background:"none",border:"1px solid #FEB2B2",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#E53E3E"}}><Trash2 size={13}/></button>}
          </div>
        )}
      />
    </div>
  );
}
