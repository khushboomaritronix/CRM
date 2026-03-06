import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createRfq, updateRfq, fetchOneRfq, selectSelected, selectSubmitting } from "../../features/rfq/rfqSlice";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";
import { Plus, Trash2 } from "lucide-react";

const S={card:{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:24,marginBottom:16},sec:{fontSize:12,fontWeight:700,color:"#2E86AB",marginBottom:14,textTransform:"uppercase",letterSpacing:0.8},grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},label:{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5},inp:{width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"},sel:{width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",background:"#fff",boxSizing:"border-box"},ta:{width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"},footer:{display:"flex",justifyContent:"flex-end",gap:10,paddingBottom:40,marginTop:4},btnC:{padding:"10px 20px",borderRadius:8,border:"1.5px solid #E2E8F0",background:"#fff",color:"#374151",fontWeight:600,fontSize:14,cursor:"pointer"},btnS:{padding:"10px 24px",borderRadius:8,border:"none",background:"#2E86AB",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"},btnAdd:{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13,border:"none",cursor:"pointer"}};
const DI={description:"",quantity:1,unit:"",unit_price:0,tax_percent:0,amount:"0.00"};
const STATS=[{"value": "draft", "label": "Draft"}, {"value": "sent", "label": "Sent"}, {"value": "received", "label": "Received"}, {"value": "cancelled", "label": "Cancelled"}];
const CURR=[{v:"INR",l:"INR"},{v:"USD",l:"USD"},{v:"EUR",l:"EUR"}];

export default function RFQFormPage() {
  const dispatch=useDispatch();const navigate=useNavigate();const{id}=useParams();
  const isEdit=!!id;const selected=useSelector(selectSelected);const submitting=useSelector(selectSubmitting);
  const{register:reg,handleSubmit,reset,watch,formState:{errors:errs}}=useForm({defaultValues:{currency:"INR",status:"draft"}});
  const[items,setItems]=useState([{...DI}]);
  const[parties,setParties]=useState([]);
  const[totals,setTotals]=useState({sub:"0.00",tax:"0.00",tot:"0.00"});

  useEffect(()=>{
    api.get("/vendors/?page_size=200").then(r=>setParties(Array.isArray(r.data)?r.data:r.data.results||[]));
    if(isEdit)dispatch(fetchOneRfq(id));
  },[dispatch,id,isEdit]);

  useEffect(()=>{if(isEdit&&selected){reset(selected);if(selected.items?.length>0)setItems(selected.items);}},[selected,isEdit,reset]);

  useEffect(()=>{
    const sub=items.reduce((a,i)=>a+(+i.quantity||0)*(+i.unit_price||0),0);
    const tax=items.reduce((a,i)=>{const am=(+i.quantity||0)*(+i.unit_price||0);return a+am*((+i.tax_percent||0)/100);},0);
    setTotals({sub:sub.toFixed(2),tax:tax.toFixed(2),tot:(sub+tax).toFixed(2)});
  },[items]);

  const upd=(idx,f,v)=>setItems(p=>p.map((it,i)=>{
    if(i!==idx)return it;const u={...it,[f]:v};u.amount=((+u.quantity||0)*(+u.unit_price||0)).toFixed(2);return u;
  }));

  const onSubmit=async(data)=>{
    const payload={...data,items};
    const res=isEdit?await dispatch(updateRfq({id,data:payload})):await dispatch(createRfq(payload));
    if(!res.error)navigate("/rfq");
  };
  const cur=watch("currency")||"INR";

  return(
    <div>
      <PageHeader title={isEdit?"Edit RFQ":"New RFQ"}
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"RFQ",path:"/rfq"},{label:isEdit?"Edit":"New"}]}/>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={S.card}>
          <div style={S.sec}>Document Details</div>
          <div style={S.grid2}>
            <div>
              <label style={S.label}>RFQ Number <span style={{color:"#EF4444"}}>*</span></label>
              <input style={{...S.inp,...(errs.rfq_number?{borderColor:"#EF4444"}:{})}} placeholder="e.g. RFQ-001" {...reg("rfq_number",{required:"RFQ Number is required"})}/>
              {errs.rfq_number&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{errs.rfq_number.message}</div>}
            </div>
            <div>
              <label style={S.label}>Vendor <span style={{color:"#EF4444"}}>*</span></label>
              <select style={S.sel} {...reg("vendor",{required:"Vendor is required"})}>
                <option value="">Select Vendor...</option>
                {parties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errs.vendor&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{errs.vendor.message}</div>}
            </div>
            <div><label style={S.label}>Date <span style={{color:"#EF4444"}}>*</span></label>
              <input type="date" style={S.inp} {...reg("date",{required:"Date is required"})}/>
              {errs.date&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{errs.date.message}</div>}
            </div>
            <div><label style={S.label}>Due Date</label><input type="date" style={S.inp} {...reg("due_date")}/></div>
            <div><label style={S.label}>Status</label>
              <select style={S.sel} {...reg("status")}>
                {STATS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div><label style={S.label}>Currency</label>
              <select style={S.sel} {...reg("currency")}>
                {CURR.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
            <div><label style={S.label}>Reference</label><input style={S.inp} placeholder="Optional reference" {...reg("reference")}/></div>
          </div>
        </div>

        <div style={{...S.card,padding:0,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid #EDF2F7",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,color:"#1E3A5F",fontSize:14}}>Line Items</span>
            <button type="button" onClick={()=>setItems(p=>[...p,{...DI}])} style={S.btnAdd}><Plus size={13}/> Add Item</button>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#F8FAFC"}}>
                  <th style={{padding:"10px 12px",textAlign:"left",fontWeight:600,color:"#6B7280",borderBottom:"1px solid #E2E8F0",minWidth:200}}>Description</th>
                  <th style={{padding:"10px 8px",textAlign:"right",fontWeight:600,color:"#6B7280",borderBottom:"1px solid #E2E8F0",width:80}}>Qty</th>
                  <th style={{padding:"10px 8px",textAlign:"left",fontWeight:600,color:"#6B7280",borderBottom:"1px solid #E2E8F0",width:70}}>Unit</th>
                  <th style={{padding:"10px 8px",textAlign:"right",fontWeight:600,color:"#6B7280",borderBottom:"1px solid #E2E8F0",width:110}}>Unit Price</th>
                  <th style={{padding:"10px 8px",textAlign:"right",fontWeight:600,color:"#6B7280",borderBottom:"1px solid #E2E8F0",width:80}}>Tax %</th>
                  <th style={{padding:"10px 8px",textAlign:"right",fontWeight:600,color:"#6B7280",borderBottom:"1px solid #E2E8F0",width:110}}>Amount</th>
                  <th style={{width:36,borderBottom:"1px solid #E2E8F0"}}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item,idx)=>(
                  <tr key={idx} style={{borderBottom:"1px solid #EDF2F7"}}>
                    <td style={{padding:"7px 10px"}}><input style={{...S.inp,minWidth:180}} value={item.description} onChange={e=>upd(idx,"description",e.target.value)} placeholder="Item description"/></td>
                    <td style={{padding:"7px 6px"}}><input style={{...S.inp,textAlign:"right"}} type="number" min="0" step="0.001" value={item.quantity} onChange={e=>upd(idx,"quantity",e.target.value)}/></td>
                    <td style={{padding:"7px 6px"}}><input style={S.inp} value={item.unit} onChange={e=>upd(idx,"unit",e.target.value)} placeholder="pcs"/></td>
                    <td style={{padding:"7px 6px"}}><input style={{...S.inp,textAlign:"right"}} type="number" min="0" step="0.01" value={item.unit_price} onChange={e=>upd(idx,"unit_price",e.target.value)}/></td>
                    <td style={{padding:"7px 6px"}}><input style={{...S.inp,textAlign:"right"}} type="number" min="0" max="100" step="0.01" value={item.tax_percent} onChange={e=>upd(idx,"tax_percent",e.target.value)}/></td>
                    <td style={{padding:"7px 10px",textAlign:"right",fontWeight:600,color:"#1E3A5F",whiteSpace:"nowrap"}}>{cur} {item.amount||"0.00"}</td>
                    <td style={{padding:"7px 4px",textAlign:"center"}}>
                      {items.length>1&&<button type="button" onClick={()=>setItems(p=>p.filter((_,i)=>i!==idx))} style={{background:"none",border:"none",cursor:"pointer",color:"#EF4444",padding:4}}><Trash2 size={14}/></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",padding:20,borderTop:"1px solid #EDF2F7"}}>
            <div style={{minWidth:260}}>
              {[["Subtotal",totals.sub],["Tax",totals.tax]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14}}>
                  <span style={{color:"#6B7280"}}>{l}</span><span style={{fontWeight:600}}>{cur} {v}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"2px solid #1E3A5F",fontSize:16,fontWeight:800,color:"#1E3A5F"}}>
                <span>Total</span><span>{cur} {totals.tot}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.sec}>Notes & Terms</div>
          <div style={S.grid2}>
            <div><label style={S.label}>Notes</label><textarea rows={3} style={S.ta} {...reg("notes")}/></div>
            <div><label style={S.label}>Terms & Conditions</label><textarea rows={3} style={S.ta} {...reg("terms")}/></div>
          </div>
        </div>

        <div style={S.footer}>
          <button type="button" style={S.btnC} onClick={()=>navigate("/rfq")} >Cancel</button>
          <button type="submit" style={{...S.btnS,opacity:submitting?.7:1}} disabled={submitting}>
            {submitting?"Saving...":isEdit?"Update RFQ":"Create RFQ"}
          </button>
        </div>
      </form>
    </div>
  );
}
