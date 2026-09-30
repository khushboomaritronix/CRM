import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Plus from "@mui/icons-material/Add";
import Pencil from "@mui/icons-material/Edit";
import Trash2 from "@mui/icons-material/Delete";
import { fetchItemGroups, createItemGroups, updateItemGroups, deleteItemGroups, selectList, selectLoading } from "../../features/inventory/itemGroupsSlice";
import { selectHasPermission } from "../../features/auth/authSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";

const BC={green:{background:"#F0FFF4",color:"#276749",border:"1px solid #9AE6B4"},gray:{background:"#F7FAFC",color:"#4A5568",border:"1px solid #E2E8F0"}};
const Bdg=({color="gray",children})=><span style={{display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:20,fontSize:11.5,fontWeight:600,...BC[color]}}>{children}</span>;
const Is={width:"100%",padding:"9px 11px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
const DEF={name:"",is_active:true};

export default function ItemGroupsPage() {
  const dispatch=useDispatch();
  const list=useSelector(selectList); const loading=useSelector(selectLoading);
  const canCreate=useSelector(selectHasPermission("inventory","can_create"));
  const canUpdate=useSelector(selectHasPermission("inventory","can_update"));
  const canDelete=useSelector(selectHasPermission("inventory","can_delete"));
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({...DEF});
  const[editing,setEditing]=useState(null);
  useEffect(()=>{dispatch(fetchItemGroups({}))},[dispatch]);

  const save=async()=>{
    if(!form.name.trim())return;
    if(editing)await dispatch(updateItemGroups({id:editing,data:form}));
    else await dispatch(createItemGroups(form));
    setShowForm(false); setEditing(null); setForm({...DEF});
  };
  const startEdit=(c)=>{
    setForm({name:c.name,is_active:c.is_active});
    setEditing(c.id); setShowForm(true);
  };

  const columns=[
    {key:"name",label:"Group Name",render:v=><span style={{fontWeight:600,color:"#1E3A5F"}}>{v}</span>},
    {key:"is_active",label:"Status",render:v=><Bdg color={v?"green":"gray"}>{v?"Active":"Inactive"}</Bdg>},
  ];

  return(
    <div>
      <PageHeader title="Item Groups" subtitle="Manage item groups"
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Inventory",path:"/inventory/items"},{label:"Item Groups"}]}
        actions={
          canCreate && (
            <button onClick={()=>{setShowForm(!showForm);if(showForm){setEditing(null);setForm({...DEF});}}}
              style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,border:"none",cursor:"pointer"}}>
              <Plus size={14}/> {showForm?"Cancel":"Add Item Group"}
            </button>
          )
        }
      />

      {showForm&&(
        <div style={{background:"#F8FCFF",borderRadius:10,border:"1.5px solid #2E86AB",padding:20,marginBottom:14}}>
          <div style={{fontSize:11.5,fontWeight:700,color:"#2E86AB",marginBottom:13,textTransform:"uppercase",letterSpacing:0.8}}>
            {editing?"Edit Item Group":"New Item Group"}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:4}}>Name *</label>
              <input style={Is} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Raw Materials, Finished Goods"/>
            </div>
          </div>
          <div style={{display:"flex",gap:20,marginBottom:14}}>
            <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13.5,fontWeight:500}}>
              <input type="checkbox" style={{width:15,height:15}} checked={form.is_active} onChange={e=>setForm(p=>({...p,is_active:e.target.checked}))}/>
              Active
            </label>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{padding:"9px 22px",background:"#2E86AB",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:14,cursor:"pointer"}}>
              {editing?"Update":"Add"} Item Group
            </button>
            <button onClick={()=>{setShowForm(false);setEditing(null);setForm({...DEF});}} style={{padding:"9px 18px",background:"#fff",color:"#374151",border:"1.5px solid #E2E8F0",borderRadius:8,fontWeight:600,fontSize:14,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={list} loading={loading} emptyMessage="No item groups yet. Add one to categorize your items."
        actions={row=>(
          <div style={{display:"flex",gap:4}}>
            {canUpdate && <button onClick={()=>startEdit(row)} style={{background:"none",border:"1px solid #E2E8F0",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Pencil size={13}/></button>}
            {canDelete && <button onClick={()=>window.confirm("Delete this item group?")&&dispatch(deleteItemGroups(row.id))} style={{background:"none",border:"1px solid #FEB2B2",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#E53E3E"}}><Trash2 size={13}/></button>}
          </div>
        )}
      />
    </div>
  );
}
