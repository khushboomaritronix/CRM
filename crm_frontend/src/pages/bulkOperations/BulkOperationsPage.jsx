import React, { useState, useRef } from "react";
import { Upload, Download, FileText } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

const MODULES = [
  {value:"customers",label:"Customers"},{value:"vendors",label:"Vendors"},
  {value:"rfq",label:"RFQ"},{value:"invoices",label:"Invoices"},
  {value:"estimates",label:"Estimates"},{value:"purchase_orders",label:"Purchase Orders"},
];

export default function BulkOperationsPage() {
  const [mod,setMod]=useState("customers");
  const [importing,setImporting]=useState(false);
  const [result,setResult]=useState(null);
  const fileRef=useRef();

  const handleImport=async(e)=>{
    const file=e.target.files[0]; if(!file)return;
    setImporting(true); setResult(null);
    const fd=new FormData(); fd.append("file",file);
    try{
      const{data}=await api.post(`/bulk/import/${mod}/`,fd,{headers:{"Content-Type":"multipart/form-data"}});
      setResult({ok:true,...data});
    }catch(err){setResult({ok:false,message:err.response?.data?.detail||"Import failed."});}
    setImporting(false); e.target.value="";
  };
  const handleExport=async()=>{
    const{data}=await api.get(`/bulk/export/${mod}/`,{responseType:"blob"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(data); a.download=`${mod}_export.csv`; a.click();
  };
  const handleTemplate=async()=>{
    const{data}=await api.get(`/bulk/template/${mod}/`,{responseType:"blob"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(data); a.download=`${mod}_template.csv`; a.click();
  };

  return(
    <div>
      <PageHeader title="Bulk Operations" subtitle="Import and export data in bulk using CSV files"
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Bulk Operations"}]}/>

      <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:20,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:"#2E86AB",marginBottom:12,textTransform:"uppercase",letterSpacing:0.8}}>Select Module</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {MODULES.map(m=>(
            <button key={m.value} onClick={()=>{setMod(m.value);setResult(null);}} style={{padding:"8px 18px",borderRadius:8,fontWeight:600,fontSize:13.5,cursor:"pointer",
              border:mod===m.value?"2px solid #2E86AB":"1.5px solid #E2E8F0",
              background:mod===m.value?"#EBF8FF":"#fff",color:mod===m.value?"#2E86AB":"#374151"}}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Import */}
        <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <Upload size={16} color="#2E86AB"/>
            <span style={{fontSize:14,fontWeight:700,color:"#1E3A5F"}}>Import {MODULES.find(m=>m.value===mod)?.label}</span>
          </div>
          <p style={{fontSize:13.5,color:"#6B7280",marginBottom:16,lineHeight:1.6}}>Upload a CSV file to import records in bulk. Download the template first to see the required column format.</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
            <button onClick={handleTemplate} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 14px",background:"#fff",color:"#374151",borderRadius:8,fontWeight:600,fontSize:13.5,border:"1px solid #E2E8F0",cursor:"pointer"}}>
              <FileText size={14}/>Download Template
            </button>
            <button onClick={()=>fileRef.current.click()} disabled={importing} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,border:"none",cursor:"pointer",opacity:importing?.7:1}}>
              <Upload size={14}/>{importing?"Importing...":"Choose CSV File"}
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleImport}/>
          {result&&(
            <div style={{padding:"14px 16px",borderRadius:8,border:"1.5px solid",background:result.ok?"#F0FFF4":"#FFF5F5",borderColor:result.ok?"#9AE6B4":"#FEB2B2"}}>
              <div style={{fontWeight:700,color:result.ok?"#276749":"#9B2C2C",marginBottom:4}}>{result.ok?"✓ Import Successful":"✗ Import Failed"}</div>
              {result.ok?(
                <div style={{display:"flex",gap:16,fontSize:13.5}}>
                  <span>Total: {result.total}</span>
                  <span style={{color:"#276749"}}>Imported: {result.imported}</span>
                  {result.failed>0&&<span style={{color:"#E53E3E"}}>Failed: {result.failed}</span>}
                </div>
              ):<p style={{fontSize:13,color:"#9B2C2C",margin:0}}>{result.message}</p>}
              {result.errors?.length>0&&(
                <details style={{marginTop:8}}>
                  <summary style={{fontSize:12,cursor:"pointer",color:"#718096"}}>View {result.errors.length} error(s)</summary>
                  <div style={{fontSize:11,marginTop:6,maxHeight:100,overflowY:"auto"}}>
                    {result.errors.map((e,i)=><div key={i} style={{color:"#E53E3E"}}>{e}</div>)}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Export */}
        <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <Download size={16} color="#2E86AB"/>
            <span style={{fontSize:14,fontWeight:700,color:"#1E3A5F"}}>Export {MODULES.find(m=>m.value===mod)?.label}</span>
          </div>
          <p style={{fontSize:13.5,color:"#6B7280",marginBottom:20,lineHeight:1.6}}>Export all records to a CSV file that you can open in Excel or Google Sheets.</p>
          <button onClick={handleExport} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"10px 20px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,border:"none",cursor:"pointer"}}>
            <Download size={14}/>Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
}
