import React,{useEffect,useState,useRef}from"react";
import{useDispatch,useSelector}from"react-redux";
import{useNavigate,useParams}from"react-router-dom";
import{useForm}from"react-hook-form";
import{fetchOneCustomerPos,selectSelected,selectSubmitting}from"../../features/customerPos/customerPosSlice";
import PageHeader from"../../components/common/PageHeader";
import CustomerAddressBlock from"../../components/common/CustomerAddressBlock";
import api from"../../services/api";
import Upload from "@mui/icons-material/Upload";
import X from "@mui/icons-material/Close";
import FileText from "@mui/icons-material/Description";
import Download from "@mui/icons-material/Download";

const Cs={background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:22,marginBottom:14};
const Ss={fontSize:11.5,fontWeight:700,color:"#2E86AB",marginBottom:13,textTransform:"uppercase",letterSpacing:0.8};
const G2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:14};
const G3={display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14};
const Ls={display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4};
const Is={width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
const Sl={...Is,background:"#fff"};
const Ta={...Is,resize:"vertical"};
const STATS=["received","processing","fulfilled","cancelled"];
const CURRENCIES=["INR","USD","EUR","GBP","AED","SGD","JPY"];
const ALLOWED_ATTACHMENT_EXTENSIONS=["pdf","xlsx","xls","csv","doc","docx"];
const MAX_ATTACHMENT_SIZE_BYTES=10*1024*1024;

function validateAttachment(file){
  const ext=file.name.split(".").pop()?.toLowerCase();
  if(!ext||!ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)){
    alert(`Unsupported file type. Allowed: ${ALLOWED_ATTACHMENT_EXTENSIONS.join(", ")}`);
    return false;
  }
  if(file.size>MAX_ATTACHMENT_SIZE_BYTES){
    alert("File size must not exceed 10 MB.");
    return false;
  }
  return true;
}

export default function CustomerPOFormPage(){
  const dispatch=useDispatch();const navigate=useNavigate();const{id}=useParams();
  const isEdit=!!id;
  const selected=useSelector(selectSelected);const submitting=useSelector(selectSubmitting);
  const{register:reg,handleSubmit,reset,watch,formState:{errors:e},setValue}=useForm({defaultValues:{currency:"INR",status:"received"}});
  const[customers,setCustomers]=useState([]);
  const[selectedCustomer,setSelectedCustomer]=useState(null);
  const[attachFile,setAttachFile]=useState(null);
  const[existingAttachment,setExistingAttachment]=useState(null);
  const[isSubmitting,setIsSubmitting]=useState(false);
  const fileRef=useRef();
  const watchedCustomer=watch("customer");

  useEffect(()=>{
    api.get("/customers/?page_size=200").then(r=>setCustomers(Array.isArray(r.data)?r.data:r.data.results||[]));
    if(isEdit)dispatch(fetchOneCustomerPos(id));
  },[dispatch,id,isEdit]);

  useEffect(()=>{
    if(watchedCustomer){const c=customers.find(x=>String(x.id)===String(watchedCustomer));setSelectedCustomer(c||null);}
    else setSelectedCustomer(null);
  },[watchedCustomer,customers]);

  useEffect(()=>{
    if(isEdit&&selected){
      reset(selected);
      if(selected.attachment_url)setExistingAttachment(selected.attachment_url);
    }
  },[selected,isEdit,reset]);

  const onFileChange=(ev)=>{
    const file=ev.target.files?.[0];
    if(file&&validateAttachment(file))setAttachFile(file);
  };

  const onSubmit=async(data)=>{
    setIsSubmitting(true);
    const fd=new FormData();
    Object.entries(data).forEach(([k,v])=>{if(v!==null&&v!==undefined)fd.append(k,v);});
    if(attachFile){fd.append("attachment",attachFile);fd.append("attachment_name",attachFile.name);}

    try{
      if(isEdit){
        await api.patch(`/customer-pos/${id}/`,fd,{headers:{"Content-Type":"multipart/form-data"}});
      }else{
        await api.post("/customer-pos/",fd,{headers:{"Content-Type":"multipart/form-data"}});
      }
      navigate("/customer-pos");
    }catch(err){
      alert("Failed: "+(err.response?.data?.detail||JSON.stringify(err.response?.data)||err.message));
    }finally{setIsSubmitting(false);}
  };

  return(
    <div>
      <PageHeader title={isEdit?"Edit Customer PO":"New Customer PO"}
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Customer POs",path:"/customer-pos"},{label:isEdit?"Edit":"New"}]}/>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={Cs}>
          <div style={Ss}>Customer PO Details</div>
          <div style={G3}>
            <div>
              <label style={Ls}>Customer <span style={{color:"#EF4444"}}>*</span></label>
              <select style={{...Sl,...(e.customer?{borderColor:"#EF4444"}:{})}} {...reg("customer",{required:"Required"})}
                onChange={(ev)=>{reg("customer").onChange(ev);const cust=customers.find(c=>String(c.id)===ev.target.value);if(cust?.currency_code)setValue("currency",cust.currency_code);}}>
                <option value="">Select customer...</option>
                {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {e.customer&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{e.customer.message}</div>}
            </div>
            <div>
              <label style={Ls}>Customer PO Number <span style={{color:"#EF4444"}}>*</span></label>
              <input style={{...Is,...(e.po_number?{borderColor:"#EF4444"}:{})}} placeholder="e.g. CUST-PO-001" {...reg("po_number",{required:"Required"})}/>
              {e.po_number&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{e.po_number.message}</div>}
            </div>
            <div>
              <label style={Ls}>Our Reference</label>
              <input style={Is} placeholder="Internal ref number" {...reg("our_reference")}/>
            </div>
            <div><label style={Ls}>PO Date <span style={{color:"#EF4444"}}>*</span></label>
              <input type="date" style={Is} {...reg("date",{required:"Required"})}/>
            </div>
            <div><label style={Ls}>Due Date</label><input type="date" style={Is} {...reg("due_date")}/></div>
            <div><label style={Ls}>Status</label>
              <select style={Sl} {...reg("status")}>
                {STATS.map(s=><option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
            <div><label style={Ls}>Amount</label>
              <input type="number" min="0" step="0.01" style={Is} placeholder="0.00" {...reg("amount")}/>
            </div>
            <div><label style={Ls}>Currency</label>
              <select style={Sl} {...reg("currency")}>{CURRENCIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
            </div>
          </div>
          <CustomerAddressBlock customer={selectedCustomer}/>
        </div>

        {/* File Upload Section */}
        <div style={Cs}>
          <div style={Ss}>PO Document Upload</div>
          <div style={{fontSize:13,color:"#6B7280",marginBottom:14}}>Upload the customer's PO document (PDF or Excel). This will be stored and searchable.</div>

          {/* Existing attachment */}
          {existingAttachment&&!attachFile&&(
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,marginBottom:14}}>
              <FileText size={18} color="#2563EB"/>
              <span style={{fontSize:13,color:"#1D4ED8",fontWeight:600,flex:1}}>Existing attachment</span>
              <a href={existingAttachment} target="_blank" rel="noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 10px",background:"#2563EB",color:"#fff",borderRadius:6,fontSize:12,fontWeight:600,textDecoration:"none"}}>
                <Download size={12}/> Open
              </a>
            </div>
          )}

          {/* File drop zone */}
          <div
            onClick={()=>fileRef.current?.click()}
            style={{border:"2px dashed #CBD5E0",borderRadius:10,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:"#F8FAFC",transition:"all 0.2s"}}
            onDragOver={ev=>{ev.preventDefault();ev.currentTarget.style.borderColor="#2E86AB";ev.currentTarget.style.background="#EFF6FF";}}
            onDragLeave={ev=>{ev.currentTarget.style.borderColor="#CBD5E0";ev.currentTarget.style.background="#F8FAFC";}}
            onDrop={ev=>{ev.preventDefault();const f=ev.dataTransfer.files?.[0];if(f&&validateAttachment(f))setAttachFile(f);ev.currentTarget.style.borderColor="#CBD5E0";ev.currentTarget.style.background="#F8FAFC";}}>
            <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv,.doc,.docx" style={{display:"none"}} onChange={onFileChange}/>
            <Upload size={28} color="#94A3B8" style={{marginBottom:8}}/>
            <div style={{fontSize:14,fontWeight:600,color:"#374151",marginBottom:4}}>
              {attachFile?"File selected — click to change":"Click or drag & drop to upload"}
            </div>
            <div style={{fontSize:12.5,color:"#6B7280"}}>PDF, Excel (.xlsx/.xls), CSV, Word supported</div>
          </div>

          {attachFile&&(
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"#F0FFF4",border:"1px solid #9AE6B4",borderRadius:8,marginTop:10}}>
              <FileText size={16} color="#059669"/>
              <span style={{fontSize:13,color:"#065F46",fontWeight:600,flex:1}}>{attachFile.name}</span>
              <span style={{fontSize:12,color:"#6B7280"}}>{(attachFile.size/1024).toFixed(1)} KB</span>
              <button type="button" onClick={()=>setAttachFile(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#EF4444",padding:4}}>
                <X size={14}/>
              </button>
            </div>
          )}
        </div>

        <div style={Cs}>
          <div style={Ss}>Additional Information</div>
          <div style={G2}>
            <div><label style={Ls}>Description</label><textarea rows={2} style={Ta} placeholder="Brief description of PO scope..." {...reg("description")}/></div>
            <div><label style={Ls}>Notes</label><textarea rows={2} style={Ta} {...reg("notes")}/></div>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingBottom:36}}>
          <button type="button" style={{padding:"10px 20px",borderRadius:8,border:"1.5px solid #E2E8F0",background:"#fff",color:"#374151",fontWeight:600,fontSize:14,cursor:"pointer"}} onClick={()=>navigate("/customer-pos")}>Cancel</button>
          <button type="submit" style={{padding:"10px 24px",borderRadius:8,border:"none",background:"#2E86AB",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",opacity:isSubmitting?.7:1}} disabled={isSubmitting}>
            {isSubmitting?"Saving...":isEdit?"Update Customer PO":"Save Customer PO"}
          </button>
        </div>
      </form>
    </div>
  );
}
