import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, Check, X, Save, Users, ArrowLeft } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

const ACTIONS = ["can_view","can_create","can_update","can_delete","can_export","can_import","can_print"];
const ACTION_LABELS = { can_view:"View", can_create:"Create", can_update:"Update", can_delete:"Delete", can_export:"Export", can_import:"Import", can_print:"PDF" };

export default function RoleDetailPage() {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!id || id==="new") return;
    Promise.all([
      api.get(`/roles/${id}/`),
      api.get("/modules/?page_size=50"),
      api.get("/permissions/?page_size=50"),
      api.get(`/role-permission/?role=${id}&page_size=200`),
      api.get(`/role-user/?role=${id}&page_size=100`),
    ]).then(([r,m,p,rp,ru]) => {
      setRole(r.data);
      setModules(Array.isArray(m.data)?m.data:m.data.results||[]);
      setPermissions(Array.isArray(p.data)?p.data:p.data.results||[]);
      const mat = {};
      const rpList = Array.isArray(rp.data)?rp.data:rp.data.results||[];
      rpList.forEach(rpi => {
        const key = `${rpi.module_slug||rpi.module}__${rpi.permission_codename||rpi.permission}`;
        mat[key] = rpi.id;
      });
      setMatrix(mat);
      const ruList = Array.isArray(ru.data)?ru.data:ru.data.results||[];
      setUsers(ruList);
    });
  }, [id]);

  const toggle = async (module, perm) => {
    const key = `${module.slug}__${perm.codename}`;
    const existingId = matrix[key];
    const newMatrix = {...matrix};
    if (existingId) {
      await api.delete(`/role-permission/${existingId}/`);
      delete newMatrix[key];
    } else {
      const res = await api.post("/role-permission/", { role: parseInt(id), module: module.id, permission: perm.id });
      newMatrix[key] = res.data.id;
    }
    setMatrix(newMatrix);
  };

  const hasAll = (mod) => ACTIONS.every(a => {
    const perm = permissions.find(p=>p.codename===a);
    return perm && matrix[`${mod.slug}__${a}`];
  });

  const toggleAll = async (mod) => {
    if (hasAll(mod)) {
      for (const a of ACTIONS) {
        const perm = permissions.find(p=>p.codename===a);
        if (!perm) continue;
        const key = `${mod.slug}__${a}`;
        if (matrix[key]) { await api.delete(`/role-permission/${matrix[key]}/`); }
      }
    } else {
      for (const a of ACTIONS) {
        const perm = permissions.find(p=>p.codename===a);
        if (!perm) continue;
        const key = `${mod.slug}__${a}`;
        if (!matrix[key]) {
          const res = await api.post("/role-permission/", {role:parseInt(id),module:mod.id,permission:perm.id});
          matrix[key] = res.data.id;
        }
      }
    }
    const res = await api.get(`/role-permission/?role=${id}&page_size=200`);
    const rpList = Array.isArray(res.data)?res.data:res.data.results||[];
    const mat = {};
    rpList.forEach(rpi => { mat[`${rpi.module_slug||rpi.module}__${rpi.permission_codename||rpi.permission}`] = rpi.id; });
    setMatrix({...mat});
  };

  if (id==="new") return (
    <div>
      <PageHeader title="New Role" breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Roles",path:"/roles"},{label:"New"}]}/>
      <RoleCreateForm />
    </div>
  );
  if (!role) return <div style={{padding:60,textAlign:"center",color:"#9CA3AF"}}>Loading...</div>;

  return (
    <div>
      <PageHeader title={role.name} subtitle="Manage module permissions for this role"
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Roles",path:"/roles"},{label:role.name}]}
        actions={<Link to="/roles" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",border:"1.5px solid #E2E8F0",borderRadius:8,color:"#374151",fontWeight:600,fontSize:13.5,textDecoration:"none"}}><ArrowLeft size={14}/>Back</Link>}
      />

      {/* Users in role */}
      {users.length>0 && (
        <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:"#2E86AB",marginBottom:10,textTransform:"uppercase",letterSpacing:0.8,display:"flex",alignItems:"center",gap:6}}><Users size={13}/>Users with this role ({users.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {users.map(u=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",background:"#F7FAFC",borderRadius:20,border:"1px solid #E2E8F0",fontSize:13}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"#2E86AB",color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {(u.user_email||"?")[0].toUpperCase()}
                </div>
                {u.user_full_name||u.user_email}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission Matrix */}
      <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #EDF2F7",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontWeight:700,color:"#1E3A5F",fontSize:15}}>Permission Matrix</span>
          <span style={{fontSize:12,color:"#9CA3AF"}}>Click cells to toggle • Click module name to toggle all</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"#F8FAFC"}}>
                <th style={{padding:"10px 16px",textAlign:"left",fontWeight:700,color:"#374151",borderBottom:"1px solid #E2E8F0",minWidth:160}}>Module</th>
                {ACTIONS.map(a=>(
                  <th key={a} style={{padding:"10px 12px",textAlign:"center",fontWeight:600,color:"#6B7280",borderBottom:"1px solid #E2E8F0",fontSize:11,textTransform:"uppercase",letterSpacing:0.5}}>{ACTION_LABELS[a]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod,i)=>(
                <tr key={mod.id} style={{borderBottom:"1px solid #EDF2F7",background:i%2===0?"#fff":"#FAFAFA"}}>
                  <td style={{padding:"10px 16px"}}>
                    <button onClick={()=>toggleAll(mod)} style={{background:"none",border:"none",cursor:"pointer",fontWeight:600,color:"#374151",fontSize:13,textAlign:"left",display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:hasAll(mod)?"#10B981":"#D1D5DB"}}/>
                      {mod.name}
                    </button>
                  </td>
                  {ACTIONS.map(a=>{
                    const perm = permissions.find(p=>p.codename===a);
                    if (!perm) return <td key={a} style={{textAlign:"center",padding:"10px 12px",color:"#D1D5DB"}}>—</td>;
                    const key = `${mod.slug}__${a}`;
                    const active = !!matrix[key];
                    return (
                      <td key={a} style={{textAlign:"center",padding:"10px 12px"}}>
                        <button onClick={()=>toggle(mod,perm)} style={{width:28,height:28,borderRadius:6,border:"none",cursor:"pointer",
                          background:active?"#DCFCE7":"#F3F4F6",color:active?"#16A34A":"#9CA3AF",
                          display:"inline-flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                          {active?<Check size={14}/>:<X size={13}/>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoleCreateForm() {
  const [name,setName]=useState(""); const [desc,setDesc]=useState(""); const [saving,setSaving]=useState(false);
  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await api.post("/roles/",{name,description:desc,is_active:true});
    window.location.href="/roles";
  };
  return (
    <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:24}}>
      <div style={{marginBottom:16}}>
        <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>Role Name *</label>
        <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",maxWidth:400,padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:14,outline:"none"}} placeholder="e.g. Sales Manager"/>
      </div>
      <div style={{marginBottom:20}}>
        <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>Description</label>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={2} style={{width:"100%",maxWidth:400,padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:14,outline:"none",resize:"vertical"}} placeholder="Optional description"/>
      </div>
      <button onClick={save} disabled={saving} style={{padding:"10px 24px",background:"#2E86AB",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:14,cursor:"pointer"}}>
        {saving?"Creating...":"Create Role"}
      </button>
    </div>
  );
}
