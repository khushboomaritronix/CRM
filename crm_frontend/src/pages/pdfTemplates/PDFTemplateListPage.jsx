import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Plus from "@mui/icons-material/Add"; // was lucide Plus
import Pencil from "@mui/icons-material/Edit"; // was lucide Pencil
import Trash2 from "@mui/icons-material/Delete"; // was lucide Trash2
import { fetchPdfTemplates, deletePdfTemplates, selectList, selectLoading } from "../../features/pdfTemplates/pdfTemplatesSlice";
import { selectHasPermission } from "../../features/auth/authSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";

const BC={green:{background:"#F0FFF4",color:"#276749",border:"1px solid #9AE6B4"},gray:{background:"#F7FAFC",color:"#4A5568",border:"1px solid #E2E8F0"}};
const Bdg=({color="gray",children})=><span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:20,fontSize:11.5,fontWeight:600,...BC[color]}}>{children}</span>;
const btnPri={display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#2E86AB",color:"#fff",borderRadius:8,fontWeight:600,fontSize:13.5,textDecoration:"none"};

export default function PDFTemplateListPage() {
  const dispatch=useDispatch(); const navigate=useNavigate();
  const list=useSelector(selectList); const loading=useSelector(selectLoading);
  const canCreate=useSelector(selectHasPermission("pdf_templates","can_create"));
  const canUpdate=useSelector(selectHasPermission("pdf_templates","can_update"));
  const canDelete=useSelector(selectHasPermission("pdf_templates","can_delete"));
  useEffect(()=>{dispatch(fetchPdfTemplates({}))},[dispatch]);

  const columns=[
    {key:"name",label:"Template Name",render:(v,row)=><Link to={`/pdf-templates/${row.id}/edit`} style={{color:"#2E86AB",fontWeight:700,textDecoration:"none"}}>{v}</Link>},
    {key:"module_type",label:"Module",render:v=><span style={{textTransform:"capitalize",fontSize:13}}>{v?.replace(/_/g," ")}</span>},
    {key:"is_default",label:"Default",render:v=><Bdg color={v?"green":"gray"}>{v?"Default":"—"}</Bdg>},
    {key:"is_active",label:"Status",render:v=><Bdg color={v?"green":"gray"}>{v?"Active":"Inactive"}</Bdg>},
  ];
  return (
    <div>
      <PageHeader title="PDF Templates" subtitle="Manage invoice and document templates"
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"PDF Templates"}]}
        actions={canCreate && <Link to="/pdf-templates/new" style={btnPri}><Plus size={14}/> New Template</Link>}
      />
      <DataTable columns={columns} data={list} loading={loading} emptyMessage="No templates found."
        actions={row=>(
          <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
            {canUpdate && <button onClick={()=>navigate(`/pdf-templates/${row.id}/edit`)} style={{background:"none",border:"1px solid #E2E8F0",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Pencil size={13}/></button>}
            {canDelete && <button onClick={()=>window.confirm("Delete template?")&&dispatch(deletePdfTemplates(row.id))} style={{background:"none",border:"1px solid #FEB2B2",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#E53E3E"}}><Trash2 size={13}/></button>}
          </div>
        )}
      />
    </div>
  );
}
