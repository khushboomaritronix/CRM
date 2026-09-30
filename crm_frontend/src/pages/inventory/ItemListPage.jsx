import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Plus from "@mui/icons-material/Add";
import Pencil from "@mui/icons-material/Edit";
import Trash2 from "@mui/icons-material/Delete";
import { fetchItems, deleteItems, selectList, selectLoading, selectPagination } from "../../features/inventory/itemsSlice";
import { selectHasPermission } from "../../features/auth/authSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable, { Badge } from "../../components/common/DataTable";

export default function ItemListPage() {
  const dispatch = useDispatch(); const navigate = useNavigate();
  const list = useSelector(selectList); const loading = useSelector(selectLoading); const pagination = useSelector(selectPagination);
  const canCreate = useSelector(selectHasPermission("inventory","can_create"));
  const canUpdate = useSelector(selectHasPermission("inventory","can_update"));
  const canDelete = useSelector(selectHasPermission("inventory","can_delete"));
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  useEffect(() => { dispatch(fetchItems({search,page})); }, [dispatch,search,page]);

  const handleDelete = (id,name) => {
    if (!window.confirm(`Delete item "${name}"?`)) return;
    dispatch(deleteItems(id));
  };

  const columns = [
    {key:"name",label:"Name",sortable:true,render:(v,row)=><Link to={`/inventory/items/${row.id}/edit`} style={{color:"#2E86AB",fontWeight:600,textDecoration:"none"}}>{v}</Link>},
    {key:"item_group_name",label:"Item Group",render:v=>v||"—"},
    {key:"unit",label:"Unit",render:v=>v||"—"},
    {key:"description",label:"Description",render:v=>v||"—"},
    {key:"is_active",label:"Status",render:v=><Badge color={v?"green":"gray"}>{v?"Active":"Inactive"}</Badge>},
  ];
  return (
    <div>
      <PageHeader title="Inventory" subtitle={`${pagination.count} items`}
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Inventory"}]}
        actions={<div style={{display:"flex",gap:8}}>
          <Link to="/inventory/item-groups" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 14px",background:"#fff",color:"#374151",borderRadius:8,fontWeight:600,fontSize:13.5,border:"1px solid #E2E8F0",textDecoration:"none"}}>Manage Item Groups</Link>
          {canCreate && <Link to="/inventory/items/new" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,textDecoration:"none"}}><Plus size={14}/>New Item</Link>}
        </div>}
      />
      <div style={{marginBottom:14}}>
        <input style={{width:"100%",maxWidth:440,padding:"9px 13px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:14,outline:"none"}}
          placeholder="Search items..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
      </div>
      <DataTable columns={columns} data={list} loading={loading} pagination={pagination} onPageChange={setPage}
        emptyMessage="No items found."
        actions={row=>(
          <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
            {canUpdate && <button onClick={()=>navigate(`/inventory/items/${row.id}/edit`)} style={{background:"none",border:"1px solid #E2E8F0",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Pencil size={13}/></button>}
            {canDelete && <button onClick={()=>handleDelete(row.id,row.name)} style={{background:"none",border:"1px solid #FEB2B2",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#E53E3E"}}><Trash2 size={13}/></button>}
          </div>
        )}
      />
    </div>
  );
}
