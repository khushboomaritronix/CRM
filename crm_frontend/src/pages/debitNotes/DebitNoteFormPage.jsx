import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createDebitNotes, updateDebitNotes, fetchOneDebitNotes, selectSelected, selectSubmitting } from "../../features/debitNotes/debitNotesSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import DocLineItems from "../../components/common/DocLineItems";
import api from "../../services/api";


const Cs={background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:22,marginBottom:14};
const Ss={fontSize:11.5,fontWeight:700,color:"#2E86AB",marginBottom:13,textTransform:"uppercase",letterSpacing:0.8};
const G2s={display:"grid",gridTemplateColumns:"1fr 1fr",gap:14};
const Ls={display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4};
const Is={width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
const Sl={width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",background:"#fff",boxSizing:"border-box"};
const Ta={width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"};

export default function DebitNoteFormPage() {
  const dispatch=useDispatch(); const navigate=useNavigate(); const{id}=useParams();
  const isEdit=!!id; const selected=useSelector(selectSelected); const submitting=useSelector(selectSubmitting);
  const{register:reg,handleSubmit,reset,watch,formState:{errors:e}}=useForm({defaultValues:{currency:"INR",status:"draft"}});
  const[parties,setParties]=useState([]);
  const[items,setItems]=useState([{description:"",quantity:1,unit:"",unit_price:0,tax_percent:0,amount:"0.00"}]);

  useEffect(()=>{
    api.get("/vendors/?page_size=200").then(r=>setParties(Array.isArray(r.data)?r.data:r.data.results||[]));
    if(isEdit)dispatch(fetchOneDebitNotes(id));
  },[dispatch,id,isEdit]);

  useEffect(()=>{
    if(isEdit&&selected){
      reset(selected);
      if(selected.items?.length>0)setItems(selected.items);
    }
  },[selected,isEdit,reset]);

  const onSubmit=async(data)=>{
    const payload={...data,items};
    const res=isEdit?await dispatch(updateDebitNotes({id,data:payload})):await dispatch(createDebitNotes(payload));
    if(!res.error)navigate("/debit-notes");
  };

  return(
    <div>
      <PageHeader title={isEdit?"Edit Debit Note":"New Debit Note"}
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Debit Note",path:"/debit-notes"},{label:isEdit?"Edit":"New"}]}/>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={Cs}>
          <div style={Ss}>Details</div>
          <div style={G2s}>
            <div>
              <label style={Ls}>Number <span style={{color:"#EF4444"}}>*</span></label>
              <input style={{...Is,...(e.debit_number?{borderColor:"#EF4444"}:{})}} placeholder="e.g. DN-001" {...reg("debit_number",{required:"Number is required"})}/>
              {e.debit_number&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{e.debit_number.message}</div>}
            </div>
            <div>
              <label style={Ls}>Vendor <span style={{color:"#EF4444"}}>*</span></label>
              <select style={Sl} {...reg("vendor",{required:"Vendor is required"})}>
                <option value="">Select Vendor...</option>
                {parties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {e.vendor&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{e.vendor.message}</div>}
            </div>
            <div><label style={Ls}>Date <span style={{color:"#EF4444"}}>*</span></label>
              <input type="date" style={{...Is,...(e.date?{borderColor:"#EF4444"}:{})}} {...reg("date",{required:"Date is required"})}/>
              {e.date&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{e.date.message}</div>}
            </div>
            <div><label style={Ls}>Status</label>
              <select style={Sl} {...reg("status")}>
                <option value="draft">Draft</option><option value="issued">Issued</option><option value="applied">Applied</option><option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div><label style={Ls}>Currency</label>
              <select style={Sl} {...reg("currency")}>
                {["INR","USD","EUR","GBP","AED"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
          </div>
        </div>
        
        <DocLineItems items={items} setItems={setItems} currency={watch("currency")||"INR"}/>

        <div style={Cs}>
          <div style={Ss}>Notes & Reason</div>
          <div style={G2s}>
            <div><label style={Ls}>Reason</label><textarea rows={2} style={Ta} {...reg("reason")}/></div>
            <div><label style={Ls}>Notes</label><textarea rows={2} style={Ta} {...reg("notes")}/></div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingBottom:36}}>
          <button type="button" style={{padding:"10px 20px",borderRadius:8,border:"1.5px solid #E2E8F0",background:"#fff",color:"#374151",fontWeight:600,fontSize:14,cursor:"pointer"}} onClick={()=>navigate("/debit-notes")}>Cancel</button>
          <button type="submit" style={{...{padding:"10px 24px",borderRadius:8,border:"none",background:"#2E86AB",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"},opacity:submitting?.7:1}} disabled={submitting}>
            {submitting?"Saving...":isEdit?"Update Debit Note":"Create Debit Note"}
          </button>
        </div>
      </form>
    </div>
  );
}
