// import React, { useEffect, useState } from "react";
// import Plus from "@mui/icons-material/Add"; // was lucide Plus
// import Trash2 from "@mui/icons-material/Delete"; // was lucide Trash2
// import Edit2 from "@mui/icons-material/ModeEditOutlineOutlined"; // was lucide Edit2
// import Check from "@mui/icons-material/Check";
// import X from "@mui/icons-material/Close"; // was lucide X
// import PageHeader from "../../components/common/PageHeader";
// import api from "../../services/api";

// const MODULES = ["customers","vendors","rfq","estimates","invoices","proforma_invoices","purchase_orders","final_invoices"];
// const FIELD_TYPES = [{v:"text",l:"Text"},{v:"number",l:"Number"},{v:"date",l:"Date"},{v:"boolean",l:"Yes/No"},{v:"select",l:"Dropdown"},{v:"textarea",l:"Textarea"},{v:"email",l:"Email"},{v:"phone",l:"Phone"}];
// const S={card:{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:20,marginBottom:12},inp:{width:"100%",padding:"8px 11px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"},sel:{padding:"8px 11px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",background:"#fff",boxSizing:"border-box"}};

// export default function CustomFieldsPage() {
//   const [fields, setFields] = useState([]);
//   const [activeModule, setActiveModule] = useState("customers");
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({label:"",field_key:"",field_type:"text",is_required:false,options:""});
//   const [editing, setEditing] = useState(null);

//   const load = () => {
//     setLoading(true);
//     api.get(`/custom-fields/?module_slug=${activeModule}&page_size=100`).then(r=>{
//       setFields(Array.isArray(r.data)?r.data:r.data.results||[]);
//       setLoading(false);
//     });
//   };
//   useEffect(load,[activeModule]);

//   const autoKey = (label) => label.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"");

//   const save = async () => {
//     const payload = {
//       ...form,
//       module_slug: activeModule,
//       options: form.options ? form.options.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>({label:l,value:l.toLowerCase().replace(/\s+/g,"_")})) : []
//     };
//     if (editing) { await api.patch(`/custom-fields/${editing}/`,payload); }
//     else { await api.post("/custom-fields/",payload); }
//     setShowForm(false); setEditing(null);
//     setForm({label:"",field_key:"",field_type:"text",is_required:false,options:""});
//     load();
//   };

//   const del = async(id) => { if(!window.confirm("Delete this field?"))return; await api.delete(`/custom-fields/${id}/`); load(); };

//   const startEdit = (f) => {
//     setForm({label:f.label,field_key:f.field_key,field_type:f.field_type,is_required:f.is_required,options:(f.options||[]).map(o=>o.label||o).join("\n")});
//     setEditing(f.id); setShowForm(true);
//   };

//   return (
//     <div>
//       <PageHeader title="Custom Fields" subtitle="Add custom data fields to any module"
//         breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Custom Fields"}]}
//         actions={<button onClick={()=>{setShowForm(!showForm);setEditing(null);setForm({label:"",field_key:"",field_type:"text",is_required:false,options:""});}} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,border:"none",cursor:"pointer"}}><Plus size={14}/>{showForm?"Cancel":"Add Field"}</button>}
//       />

//       {/* Module Tabs */}
//       <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
//         {MODULES.map(m=>(
//           <button key={m} onClick={()=>setActiveModule(m)} style={{padding:"7px 14px",borderRadius:20,border:"1.5px solid",fontSize:13,fontWeight:600,cursor:"pointer",
//             borderColor:activeModule===m?"#2E86AB":"#E2E8F0",background:activeModule===m?"#EBF8FF":"#fff",color:activeModule===m?"#2E86AB":"#6B7280"}}>
//             {m.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
//           </button>
//         ))}
//       </div>

//       {/* Add/Edit Form */}
//       {showForm && (
//         <div style={{...S.card,border:"1.5px solid #2E86AB",background:"#F8FCFF",marginBottom:16}}>
//           <div style={{fontSize:13,fontWeight:700,color:"#2E86AB",marginBottom:14,textTransform:"uppercase",letterSpacing:0.8}}>{editing?"Edit Field":"New Custom Field"}</div>
//           <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:12,alignItems:"end",flexWrap:"wrap"}}>
//             <div>
//               <label style={{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:4}}>Field Label *</label>
//               <input style={S.inp} value={form.label} onChange={e=>setForm(p=>({...p,label:e.target.value,field_key:editing?p.field_key:autoKey(e.target.value)}))} placeholder="e.g. Lead Source"/>
//             </div>
//             <div>
//               <label style={{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:4}}>Field Key *</label>
//               <input style={S.inp} value={form.field_key} onChange={e=>setForm(p=>({...p,field_key:e.target.value}))} placeholder="e.g. lead_source"/>
//             </div>
//             <div>
//               <label style={{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:4}}>Field Type</label>
//               <select style={{...S.sel,width:"100%"}} value={form.field_type} onChange={e=>setForm(p=>({...p,field_type:e.target.value}))}>
//                 {FIELD_TYPES.map(ft=><option key={ft.v} value={ft.v}>{ft.l}</option>)}
//               </select>
//             </div>
//             <div style={{display:"flex",alignItems:"center",gap:6,paddingBottom:2}}>
//               <input type="checkbox" id="req" checked={form.is_required} onChange={e=>setForm(p=>({...p,is_required:e.target.checked}))} style={{width:16,height:16}}/>
//               <label htmlFor="req" style={{fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer"}}>Required</label>
//             </div>
//           </div>
//           {form.field_type==="select"&&(
//             <div style={{marginTop:12}}>
//               <label style={{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:4}}>Options (one per line)</label>
//               <textarea style={{...S.inp,resize:"vertical"}} rows={4} value={form.options} onChange={e=>setForm(p=>({...p,options:e.target.value}))} placeholder="Option 1&#10;Option 2&#10;Option 3"/>
//             </div>
//           )}
//           <div style={{display:"flex",gap:8,marginTop:14}}>
//             <button onClick={save} style={{padding:"8px 20px",background:"#2E86AB",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13.5,cursor:"pointer"}}>
//               {editing?"Update Field":"Create Field"}
//             </button>
//             <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{padding:"8px 16px",background:"#fff",color:"#374151",border:"1.5px solid #E2E8F0",borderRadius:8,fontWeight:600,fontSize:13.5,cursor:"pointer"}}>Cancel</button>
//           </div>
//         </div>
//       )}

//       {/* Fields List */}
//       {loading ? <div style={{textAlign:"center",padding:40,color:"#9CA3AF"}}>Loading...</div>
//       : fields.length===0 ? (
//         <div style={{...S.card,textAlign:"center",padding:48}}>
//           <div style={{fontSize:32,marginBottom:12}}>⚙️</div>
//           <div style={{fontWeight:700,color:"#374151",marginBottom:6}}>No custom fields yet</div>
//           <div style={{color:"#9CA3AF",fontSize:13.5}}>Click "Add Field" to create your first custom field for this module.</div>
//         </div>
//       ) : (
//         <div style={{...S.card,padding:0,overflow:"hidden"}}>
//           <table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}>
//             <thead>
//               <tr style={{background:"#F8FAFC"}}>
//                 {["Label","Field Key","Type","Required",""].map(h=>(
//                   <th key={h} style={{padding:"11px 16px",textAlign:"left",fontWeight:600,color:"#6B7280",borderBottom:"1px solid #E2E8F0",fontSize:12}}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {fields.map((f,i)=>(
//                 <tr key={f.id} style={{borderBottom:"1px solid #EDF2F7",background:i%2===0?"#fff":"#FAFAFA"}}>
//                   <td style={{padding:"11px 16px",fontWeight:600,color:"#1E3A5F"}}>{f.label}</td>
//                   <td style={{padding:"11px 16px"}}><code style={{background:"#F3F4F6",padding:"2px 8px",borderRadius:4,fontSize:12,color:"#6B7280"}}>{f.field_key}</code></td>
//                   <td style={{padding:"11px 16px",color:"#6B7280",textTransform:"capitalize"}}>{f.field_type}</td>
//                   <td style={{padding:"11px 16px"}}>{f.is_required?<span style={{color:"#059669",fontWeight:600}}>✓ Yes</span>:<span style={{color:"#9CA3AF"}}>No</span>}</td>
//                   <td style={{padding:"11px 12px"}}>
//                     <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
//                       <button onClick={()=>startEdit(f)} style={{background:"none",border:"1px solid #E2E8F0",borderRadius:6,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Edit2 size={12}/></button>
//                       <button onClick={()=>del(f.id)} style={{background:"none",border:"1px solid #FEB2B2",borderRadius:6,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#E53E3E"}}><Trash2 size={12}/></button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Plus from "@mui/icons-material/Add";
import Trash2 from "@mui/icons-material/Delete";
import Edit2 from "@mui/icons-material/ModeEditOutlineOutlined";
import { selectHasPermission } from "../../features/auth/authSlice";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

const FIELD_TYPES = [
  { v: "text", l: "Text" },
  { v: "number", l: "Number" },
  { v: "date", l: "Date" },
  { v: "boolean", l: "Yes/No" },
  { v: "select", l: "Dropdown" },
  { v: "textarea", l: "Textarea" },
  { v: "email", l: "Email" },
  { v: "phone", l: "Phone" },
];

const S = {
  card: {
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    padding: 20,
    marginBottom: 12,
  },
  inp: {
    width: "100%",
    padding: "8px 11px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 7,
    fontSize: 13.5,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  sel: {
    padding: "8px 11px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 7,
    fontSize: 13.5,
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    boxSizing: "border-box",
  },
};

export default function CustomFieldsPage() {
  const canCreate = useSelector(selectHasPermission("custom_fields", "can_create"));
  const canUpdate = useSelector(selectHasPermission("custom_fields", "can_update"));
  const canDelete = useSelector(selectHasPermission("custom_fields", "can_delete"));
  const [fields, setFields] = useState([]);
  const [modules, setModules] = useState([]); // Store modules from API
  const [activeModule, setActiveModule] = useState(null); // Store the active module object
  const [loading, setLoading] = useState(false);
  const [modulesLoading, setModulesLoading] = useState(true); // Add loading state for modules
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "",
    field_key: "",
    field_type: "text",
    is_required: false,
    options: "",
  });
  const [editing, setEditing] = useState(null);

  // Fetch modules on component mount
  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setModulesLoading(true);
    try {
      const response = await api.get("/modules/");
      // Handle different response formats
      let modulesData = [];
      if (Array.isArray(response.data)) {
        modulesData = response.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        modulesData = response.data.results;
      } else if (response.data && typeof response.data === 'object') {
        // If it's a single object, wrap it in an array
        modulesData = [response.data];
      }
      
      setModules(modulesData);
      // Set first module as active by default
      if (modulesData.length > 0) {
        setActiveModule(modulesData[0]);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      setModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  // Load custom fields when active module changes
  const load = () => {
    if (!activeModule) return;
    
    setLoading(true);
    api
      .get(`/custom-fields/?module=${activeModule.id}&page_size=100`)
      .then((r) => {
        // Handle different response formats
        if (Array.isArray(r.data)) {
          setFields(r.data);
        } else if (r.data?.results && Array.isArray(r.data.results)) {
          setFields(r.data.results);
        } else {
          setFields([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setFields([]);
        setLoading(false);
      });
  };
  
  useEffect(load, [activeModule]);

  const autoKey = (label) =>
    label
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  const save = async () => {
    if (!activeModule) {
      alert("Please select a module");
      return;
    }

    const payload = {
      label: form.label,
      field_key: form.field_key,
      field_type: form.field_type,
      is_required: form.is_required,
      module: activeModule.id, // Send the module ID (primary key)
      options: form.options
        ? form.options
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => ({
              label: l,
              value: l.toLowerCase().replace(/\s+/g, "_"),
            }))
        : [],
    };
    
    try {
      if (editing) {
        const id = typeof editing === 'string' ? parseInt(editing, 10) : editing;
        await api.patch(`/custom-fields/${id}/`, payload);
      } else {
        await api.post("/custom-fields/", payload);
      }
      
      setShowForm(false);
      setEditing(null);
      setForm({
        label: "",
        field_key: "",
        field_type: "text",
        is_required: false,
        options: "",
      });
      load();
    } catch (error) {
      console.error("Error saving custom field:", error);
      alert("Error saving custom field. Please check the form and try again.");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this field?")) return;
    try {
      await api.delete(`/custom-fields/${id}/`);
      load();
    } catch (error) {
      console.error("Error deleting custom field:", error);
      alert("Error deleting custom field.");
    }
  };

  const startEdit = (f) => {
    setForm({
      label: f.label,
      field_key: f.field_key,
      field_type: f.field_type,
      is_required: f.is_required,
      options: (f.options || []).map((o) => o.label || o).join("\n"),
    });
    setEditing(f.id);
    setShowForm(true);
  };

  // Show loading state for modules
  if (modulesLoading) {
    return (
      <div>
        <PageHeader
          title="Custom Fields"
          subtitle="Add custom data fields to any module"
          breadcrumbs={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Custom Fields" },
          ]}
        />
        <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>
          Loading modules...
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Custom Fields"
        subtitle="Add custom data fields to any module"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Custom Fields" },
        ]}
        actions={
          canCreate && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditing(null);
                setForm({
                  label: "",
                  field_key: "",
                  field_type: "text",
                  is_required: false,
                  options: "",
                });
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                background: "#2E86AB",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13.5,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
              {showForm ? "Cancel" : "Add Field"}
            </button>
          )
        }
      />

      {/* Module Tabs - Now using data from API */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        {modules.length > 0 ? (
          modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: "1.5px solid",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                borderColor: activeModule?.id === module.id ? "#2E86AB" : "#E2E8F0",
                background: activeModule?.id === module.id ? "#EBF8FF" : "#fff",
                color: activeModule?.id === module.id ? "#2E86AB" : "#6B7280",
              }}
            >
              {module.name || module.slug?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown"}
            </button>
          ))
        ) : (
          <div style={{ color: "#9CA3AF", padding: "7px 14px" }}>
            No modules available
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && activeModule && (
        <div
          style={{
            ...S.card,
            border: "1.5px solid #2E86AB",
            background: "#F8FCFF",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#2E86AB",
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            {editing ? "Edit Field" : `New Custom Field for ${activeModule.name || activeModule.slug}`}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: 12,
              alignItems: "end",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Field Label *
              </label>
              <input
                style={S.inp}
                value={form.label}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    label: e.target.value,
                    field_key: editing ? p.field_key : autoKey(e.target.value),
                  }))
                }
                placeholder="e.g. Lead Source"
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Field Key *
              </label>
              <input
                style={S.inp}
                value={form.field_key}
                onChange={(e) =>
                  setForm((p) => ({ ...p, field_key: e.target.value }))
                }
                placeholder="e.g. lead_source"
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Field Type
              </label>
              <select
                style={{ ...S.sel, width: "100%" }}
                value={form.field_type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, field_type: e.target.value }))
                }
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.v} value={ft.v}>
                    {ft.l}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                paddingBottom: 2,
              }}
            >
              <input
                type="checkbox"
                id="req"
                checked={form.is_required}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_required: e.target.checked }))
                }
                style={{ width: 16, height: 16 }}
              />
              <label
                htmlFor="req"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Required
              </label>
            </div>
          </div>
          {form.field_type === "select" && (
            <div style={{ marginTop: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Options (one per line)
              </label>
              <textarea
                style={{ ...S.inp, resize: "vertical" }}
                rows={4}
                value={form.options}
                onChange={(e) =>
                  setForm((p) => ({ ...p, options: e.target.value }))
                }
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              onClick={save}
              style={{
                padding: "8px 20px",
                background: "#2E86AB",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              {editing ? "Update Field" : "Create Field"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              style={{
                padding: "8px 16px",
                background: "#fff",
                color: "#374151",
                border: "1.5px solid #E2E8F0",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Fields List */}
      {!activeModule ? (
        <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
          <div style={{ fontWeight: 700, color: "#374151", marginBottom: 6 }}>
            No modules found
          </div>
          <div style={{ color: "#9CA3AF", fontSize: 13.5 }}>
            Please ensure modules are configured in the system.
          </div>
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>
          Loading...
        </div>
      ) : fields.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
          <div style={{ fontWeight: 700, color: "#374151", marginBottom: 6 }}>
            No custom fields yet
          </div>
          <div style={{ color: "#9CA3AF", fontSize: 13.5 }}>
            Click "Add Field" to create your first custom field for {activeModule.name || activeModule.slug}.
          </div>
        </div>
      ) : (
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13.5,
            }}
          >
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Label", "Field Key", "Type", "Required", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#6B7280",
                      borderBottom: "1px solid #E2E8F0",
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => (
                <tr
                  key={f.id}
                  style={{
                    borderBottom: "1px solid #EDF2F7",
                    background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                  }}
                >
                  <td
                    style={{
                      padding: "11px 16px",
                      fontWeight: 600,
                      color: "#1E3A5F",
                    }}
                  >
                    {f.label}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <code
                      style={{
                        background: "#F3F4F6",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        color: "#6B7280",
                      }}
                    >
                      {f.field_key}
                    </code>
                  </td>
                  <td
                    style={{
                      padding: "11px 16px",
                      color: "#6B7280",
                      textTransform: "capitalize",
                    }}
                  >
                    {f.field_type}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    {f.is_required ? (
                      <span style={{ color: "#059669", fontWeight: 600 }}>
                        ✓ Yes
                      </span>
                    ) : (
                      <span style={{ color: "#9CA3AF" }}>No</span>
                    )}
                  </td>
                  <td style={{ padding: "11px 12px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        justifyContent: "flex-end",
                      }}
                    >
                      {canUpdate && (
                        <button
                          onClick={() => startEdit(f)}
                          style={{
                            background: "none",
                            border: "1px solid #E2E8F0",
                            borderRadius: 6,
                            width: 28,
                            height: 28,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => del(f.id)}
                          style={{
                            background: "none",
                            border: "1px solid #FEB2B2",
                            borderRadius: 6,
                            width: 28,
                            height: 28,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#E53E3E",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
