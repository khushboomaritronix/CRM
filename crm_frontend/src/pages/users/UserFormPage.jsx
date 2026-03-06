// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { createUsers, updateUsers, fetchOneUsers, selectSelected, selectSubmitting } from "../../features/users/usersSlice";
// import PageHeader from "../../components/common/PageHeader";
// import api from "../../services/api";

// const S = {
//   card:   { background:"#fff", borderRadius:10, border:"1px solid #E2E8F0", padding:24, marginBottom:16 },
//   sec:    { fontSize:12, fontWeight:700, color:"#2E86AB", marginBottom:14, textTransform:"uppercase", letterSpacing:0.8 },
//   grid2:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
//   label:  { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:5 },
//   inp:    { width:"100%", padding:"9px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:13.5, outline:"none", fontFamily:"inherit", boxSizing:"border-box" },
//   sel:    { width:"100%", padding:"9px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:13.5, outline:"none", fontFamily:"inherit", background:"#fff", boxSizing:"border-box" },
//   err:    { fontSize:11.5, color:"#DC2626", marginTop:3 },
//   footer: { display:"flex", justifyContent:"flex-end", gap:10, marginTop:8, paddingBottom:40 },
//   info:   { background:"#EBF8FF", border:"1px solid #90CDF4", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#2C5282", marginBottom:16 },
//   cancel: { padding:"10px 20px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontWeight:600, fontSize:14, cursor:"pointer" },
//   save:   { padding:"10px 24px", borderRadius:8, border:"none", background:"#2E86AB", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" },
// };

// // Safely extract role id from various API shapes:
// // {id, name}  OR  {role__id, role__name}  OR  plain number
// function extractRoleId(r) {
//   if (!r) return null;
//   if (typeof r === "number") return r;
//   if (typeof r === "string") return parseInt(r, 10) || null;
//   return r.id || r.role__id || null;
// }

// export default function UserFormPage() {
//   const dispatch   = useDispatch();
//   const navigate   = useNavigate();
//   const { id }     = useParams();
//   const isEdit     = !!id;
//   const selected   = useSelector(selectSelected);
//   const submitting = useSelector(selectSubmitting);
//   const { register, handleSubmit, reset, formState: { errors } } = useForm();
//   const [roles, setRoles]             = useState([]);
//   const [selectedRoleIds, setSelectedRoleIds] = useState([]);

//   useEffect(() => {
//     api.get("/roles/?page_size=100")
//       .then(r => setRoles(Array.isArray(r.data) ? r.data : r.data.results || []));
//     if (isEdit) dispatch(fetchOneUsers(id));
//   }, [dispatch, id, isEdit]);

//   useEffect(() => {
//     if (isEdit && selected) {
//       reset(selected);
//       // Handle all possible role shapes from backend
//       const ids = (selected.roles || [])
//         .map(extractRoleId)
//         .filter(Boolean);
//       setSelectedRoleIds(ids);
//     }
//   }, [selected, isEdit, reset]);

//   const toggleRole = (roleId) =>
//     setSelectedRoleIds(prev =>
//       prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
//     );

//   const onSubmit = async (data) => {
//     const payload = { ...data, role_ids: selectedRoleIds };
//     const res = isEdit
//       ? await dispatch(updateUsers({ id, data: payload }))
//       : await dispatch(createUsers(payload));
//     if (!res.error) navigate("/users");
//   };

//   return (
//     <div>
//       <PageHeader
//         title={isEdit ? "Edit User" : "New User"}
//         breadcrumbs={[{ label:"Dashboard", path:"/dashboard" }, { label:"Users", path:"/users" }, { label: isEdit ? "Edit" : "New" }]}
//       />
//       {!isEdit && (
//         <div style={S.info}>
//           A secure password will be auto-generated and emailed to the user.
//           If email is not configured, the password will appear in the server console/terminal.
//         </div>
//       )}
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div style={S.card}>
//           <div style={S.sec}>Account Information</div>
//           <div style={S.grid2}>
//             <div>
//               <label style={S.label}>First Name <span style={{ color:"#EF4444" }}>*</span></label>
//               <input style={{ ...S.inp, ...(errors.first_name ? { borderColor:"#EF4444" } : {}) }}
//                 {...register("first_name", { required:"First name is required" })} />
//               {errors.first_name && <div style={S.err}>{errors.first_name.message}</div>}
//             </div>
//             <div>
//               <label style={S.label}>Last Name</label>
//               <input style={S.inp} {...register("last_name")} />
//             </div>
//             <div>
//               <label style={S.label}>Email Address <span style={{ color:"#EF4444" }}>*</span></label>
//               <input style={{ ...S.inp, ...(errors.email ? { borderColor:"#EF4444" } : {}) }}
//                 type="email" {...register("email", { required:"Email is required" })} />
//               {errors.email && <div style={S.err}>{errors.email.message}</div>}
//             </div>
//             <div>
//               <label style={S.label}>Username <span style={{ color:"#EF4444" }}>*</span></label>
//               <input style={{ ...S.inp, ...(errors.username ? { borderColor:"#EF4444" } : {}) }}
//                 {...register("username", { required:"Username is required" })} />
//               {errors.username && <div style={S.err}>{errors.username.message}</div>}
//             </div>
//             <div>
//               <label style={S.label}>Phone</label>
//               <input style={S.inp} {...register("phone")} />
//             </div>
//             <div>
//               <label style={S.label}>Account Type</label>
//               <select style={S.sel} {...register("is_staff")}>
//                 <option value="false">Regular User</option>
//                 <option value="true">Staff / Admin</option>
//               </select>
//             </div>
//             <div>
//               <label style={S.label}>Status</label>
//               <select style={S.sel} {...register("is_active")}>
//                 <option value="true">Active</option>
//                 <option value="false">Inactive</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {roles.length > 0 && (
//           <div style={S.card}>
//             <div style={S.sec}>Assign Roles</div>
//             <p style={{ fontSize:13, color:"#6B7280", marginBottom:12, marginTop:0 }}>
//               Select one or more roles. Roles control what this user can access.
//             </p>
//             <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
//               {roles.map(role => {
//                 const active = selectedRoleIds.includes(role.id);
//                 return (
//                   <button key={role.id} type="button" onClick={() => toggleRole(role.id)}
//                     style={{
//                       padding:"8px 16px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13,
//                       border: active ? "2px solid #2E86AB" : "1.5px solid #E2E8F0",
//                       background: active ? "#EBF8FF" : "#fff",
//                       color: active ? "#2E86AB" : "#374151",
//                     }}>
//                     {active ? "✓ " : ""}{role.name}
//                   </button>
//                 );
//               })}
//             </div>
//             {selectedRoleIds.length === 0 && (
//               <div style={{ marginTop:10, fontSize:12.5, color:"#EF4444" }}>
//                 No role selected. This user won't have access to any module.
//               </div>
//             )}
//           </div>
//         )}

//         <div style={S.footer}>
//           <button type="button" style={S.cancel} onClick={() => navigate("/users")}>Cancel</button>
//           <button type="submit" style={{ ...S.save, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
//             {submitting ? "Saving..." : isEdit ? "Update User" : "Create User & Send Password"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createUsers, updateUsers, fetchOneUsers, selectSelected, selectSubmitting } from "../../features/users/usersSlice";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

const S = {
  card:   { background:"#fff", borderRadius:10, border:"1px solid #E2E8F0", padding:24, marginBottom:16 },
  sec:    { fontSize:12, fontWeight:700, color:"#2E86AB", marginBottom:14, textTransform:"uppercase", letterSpacing:0.8 },
  grid2:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  label:  { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:5 },
  inp:    { width:"100%", padding:"9px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:13.5, outline:"none", fontFamily:"inherit", boxSizing:"border-box" },
  sel:    { width:"100%", padding:"9px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:13.5, outline:"none", fontFamily:"inherit", background:"#fff", boxSizing:"border-box" },
  err:    { fontSize:11.5, color:"#DC2626", marginTop:3 },
  footer: { display:"flex", justifyContent:"flex-end", gap:10, marginTop:8, paddingBottom:40 },
  info:   { background:"#EBF8FF", border:"1px solid #90CDF4", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#2C5282", marginBottom:16 },
  cancel: { padding:"10px 20px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontWeight:600, fontSize:14, cursor:"pointer" },
  save:   { padding:"10px 24px", borderRadius:8, border:"none", background:"#2E86AB", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" },
  requiredStar: { color:"#EF4444", marginLeft:2 },
  helpText: { fontSize:11, color:"#718096", marginTop:2, fontStyle:"italic" },
  errStyle: { fontSize:11.5, color:"#DC2626", marginTop:3 },
};

// Helper to extract role id
function extractRoleId(r) {
  if (!r) return null;
  if (typeof r === "number") return r;
  if (typeof r === "string") return parseInt(r, 10) || null;
  return r.id || r.role__id || null;
}

// Custom Field Component
const CustomField = ({ field, register, errors, defaultValue }) => {
  const fieldName = `custom_field_values.${field.field_key}`;
  const options = Array.isArray(field.options) ? field.options : [];
  const placeholder = field.placeholder || `Enter ${field.label.toLowerCase()}`;

  const reservedFields = [
    'id', 'username', 'email', 'first_name', 'last_name', 'phone', 'is_staff', 'is_active',
    'created_at', 'updated_at', 'custom_field_values', 'roles', 'password', 'last_login'
  ];
  if (reservedFields.includes(field.field_key)) return null;

  const renderField = () => {
    switch (field.field_type) {
      case 'textarea':
        return <textarea style={{...S.inp, ...(errors[fieldName]?{borderColor:"#EF4444"}:{})}} rows={3} placeholder={placeholder} defaultValue={defaultValue} {...register(fieldName, { required: field.is_required ? `${field.label} is required` : false })} />;
      case 'select':
        return (
          <select style={{...S.sel, ...(errors[fieldName]?{borderColor:"#EF4444"}:{})}} defaultValue={defaultValue} {...register(fieldName, { required: field.is_required ? `${field.label} is required` : false })}>
            <option value="">Select {field.label}</option>
            {options.map((opt, idx) => <option key={idx} value={opt.value || opt}>{opt.label || opt}</option>)}
          </select>
        );
      case 'boolean':
        return (
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="checkbox" defaultChecked={defaultValue===true||defaultValue==="true"||defaultValue===1} {...register(fieldName)} style={{width:16,height:16,cursor:"pointer"}} />
            <span style={{fontSize:13,color:"#4A5568"}}>Yes</span>
          </div>
        );
      case 'number':
        return <input style={{...S.inp, ...(errors[fieldName]?{borderColor:"#EF4444"}:{})}} type="number" step="any" placeholder={placeholder} defaultValue={defaultValue} {...register(fieldName, { required: field.is_required ? `${field.label} is required` : false, valueAsNumber: true })} />;
      case 'date':
        return <input style={{...S.inp, ...(errors[fieldName]?{borderColor:"#EF4444"}:{})}} type="date" placeholder={placeholder} defaultValue={defaultValue} {...register(fieldName, { required: field.is_required ? `${field.label} is required` : false })} />;
      case 'email':
        return <input style={{...S.inp, ...(errors[fieldName]?{borderColor:"#EF4444"}:{})}} type="email" placeholder={placeholder} defaultValue={defaultValue} {...register(fieldName, { required: field.is_required ? `${field.label} is required` : false, pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" } })} />;
      case 'phone':
        return <input style={{...S.inp, ...(errors[fieldName]?{borderColor:"#EF4444"}:{})}} type="tel" placeholder={placeholder} defaultValue={defaultValue} {...register(fieldName, { required: field.is_required ? `${field.label} is required` : false })} />;
      case 'url':
        return <input style={{...S.inp, ...(errors[fieldName]?{borderColor:"#EF4444"}:{})}} type="url" placeholder="https://example.com" defaultValue={defaultValue} {...register(fieldName, { required: field.is_required ? `${field.label} is required` : false, pattern: { value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i, message: "Invalid URL" } })} />;
      default:
        return <input style={{...S.inp, ...(errors[fieldName]?{borderColor:"#EF4444"}:{})}} type="text" placeholder={placeholder} defaultValue={defaultValue} {...register(fieldName, { required: field.is_required ? `${field.label} is required` : false })} />;
    }
  };

  return (
    <div>
      <label style={S.label}>{field.label}{field.is_required && <span style={S.requiredStar}>*</span>}<span style={{fontSize:11,color:"#9CA3AF",marginLeft:4}}>({field.field_type})</span></label>
      {renderField()}
      {field.placeholder && !field.is_required && <div style={S.helpText}>e.g. {field.placeholder}</div>}
      {errors[fieldName] && <div style={S.errStyle}>{errors[fieldName].message}</div>}
    </div>
  );
};

export default function UserFormPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { id }     = useParams();
  const isEdit     = !!id;
  const selected   = useSelector(selectSelected);
  const submitting = useSelector(selectSubmitting);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { custom_field_values: {} }
  });
  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loadingCustomFields, setLoadingCustomFields] = useState(false);
  const [userModule, setUserModule] = useState(null);

  // Fetch modules and get user module ID
  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await api.get("/modules/");
        const modules = Array.isArray(res.data) ? res.data : res.data?.results || [];
        const module = modules.find(m => m.slug === "users" || m.name?.toLowerCase() === "users");
        if (module) setUserModule(module);
      } catch (error) { console.error("Error fetching modules:", error); }
    };
    fetchModule();
  }, []);

  // Fetch custom fields when module is known
  useEffect(() => {
    if (!userModule) return;
    setLoadingCustomFields(true);
    api.get(`/custom-fields/?module=${userModule.id}&is_active=true`)
      .then(r => {
        let fields = Array.isArray(r.data) ? r.data : r.data?.results || [];
        const reserved = ['id','username','email','first_name','last_name','phone','is_staff','is_active','created_at','updated_at','custom_field_values','roles'];
        fields = fields.filter(f => !reserved.includes(f.field_key)).sort((a,b) => (a.order||0)-(b.order||0));
        setCustomFields(fields);
      })
      .catch(console.error)
      .finally(() => setLoadingCustomFields(false));
  }, [userModule]);

  useEffect(() => {
    api.get("/roles/?page_size=100").then(r => setRoles(Array.isArray(r.data) ? r.data : r.data.results || []));
    if (isEdit) dispatch(fetchOneUsers(id));
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && selected) {
      const { custom_field_values, ...regular } = selected;
      reset({ ...regular, custom_field_values: custom_field_values || {} });
      const ids = (selected.roles || []).map(extractRoleId).filter(Boolean);
      setSelectedRoleIds(ids);
    }
  }, [selected, isEdit, reset]);

  const toggleRole = (roleId) =>
    setSelectedRoleIds(prev => prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]);

  const onSubmit = async (data) => {
    const { custom_field_values, ...regularData } = data;
    const payload = { ...regularData, role_ids: selectedRoleIds, custom_field_values: custom_field_values || {} };
    const res = isEdit ? await dispatch(updateUsers({ id, data: payload })) : await dispatch(createUsers(payload));
    if (!res.error) navigate("/users");
  };

  return (
    <div>
      <PageHeader title={isEdit ? "Edit User" : "New User"} breadcrumbs={[{ label:"Dashboard", path:"/dashboard" }, { label:"Users", path:"/users" }, { label: isEdit ? "Edit" : "New" }]} />
      {!isEdit && <div style={S.info}>A secure password will be auto-generated and emailed to the user.</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={S.card}>
          <div style={S.sec}>Account Information</div>
          <div style={S.grid2}>
            {/* existing fields */}
            <div>
              <label style={S.label}>First Name <span style={S.requiredStar}>*</span></label>
              <input style={{ ...S.inp, ...(errors.first_name ? { borderColor:"#EF4444" } : {}) }} {...register("first_name", { required:"First name is required" })} />
              {errors.first_name && <div style={S.err}>{errors.first_name.message}</div>}
            </div>
            <div>
              <label style={S.label}>Last Name</label>
              <input style={S.inp} {...register("last_name")} />
            </div>
            <div>
              <label style={S.label}>Email Address <span style={S.requiredStar}>*</span></label>
              <input style={{ ...S.inp, ...(errors.email ? { borderColor:"#EF4444" } : {}) }} type="email" {...register("email", { required:"Email is required" })} />
              {errors.email && <div style={S.err}>{errors.email.message}</div>}
            </div>
            <div>
              <label style={S.label}>Username <span style={S.requiredStar}>*</span></label>
              <input style={{ ...S.inp, ...(errors.username ? { borderColor:"#EF4444" } : {}) }} {...register("username", { required:"Username is required" })} />
              {errors.username && <div style={S.err}>{errors.username.message}</div>}
            </div>
            <div>
              <label style={S.label}>Phone</label>
              <input style={S.inp} {...register("phone")} />
            </div>
            <div>
              <label style={S.label}>Account Type</label>
              <select style={S.sel} {...register("is_staff")}>
                <option value="false">Regular User</option>
                <option value="true">Staff / Admin</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Status</label>
              <select style={S.sel} {...register("is_active")}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {roles.length > 0 && (
          <div style={S.card}>
            <div style={S.sec}>Assign Roles</div>
            <p style={{ fontSize:13, color:"#6B7280", marginBottom:12 }}>Select one or more roles.</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {roles.map(role => {
                const active = selectedRoleIds.includes(role.id);
                return (
                  <button key={role.id} type="button" onClick={() => toggleRole(role.id)}
                    style={{ padding:"8px 16px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13,
                      border: active ? "2px solid #2E86AB" : "1.5px solid #E2E8F0",
                      background: active ? "#EBF8FF" : "#fff",
                      color: active ? "#2E86AB" : "#374151"
                    }}>
                    {active ? "✓ " : ""}{role.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Fields Section */}
        {customFields.length > 0 && (
          <div style={S.card}>
            <div style={S.sec}>Custom Fields</div>
            {loadingCustomFields ? (
              <div style={{ textAlign:"center", padding:20, color:"#9CA3AF" }}>Loading custom fields...</div>
            ) : (
              <div style={S.grid2}>
                {customFields.map(field => (
                  <CustomField
                    key={field.id}
                    field={field}
                    register={register}
                    errors={errors}
                    defaultValue={selected?.custom_field_values?.[field.field_key]}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div style={S.footer}>
          <button type="button" style={S.cancel} onClick={() => navigate("/users")}>Cancel</button>
          <button type="submit" style={{ ...S.save, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Update User" : "Create User & Send Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
