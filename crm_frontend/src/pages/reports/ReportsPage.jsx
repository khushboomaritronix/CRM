import React, { useEffect, useState } from "react";
import TrendingUp from "@mui/icons-material/TrendingUp";
import Users from "@mui/icons-material/People"; // was lucide Users
import FileText from "@mui/icons-material/Description"; // was lucide FileText
import DollarSign from "@mui/icons-material/AttachMoney"; // was lucide DollarSign
import AlertCircle from "@mui/icons-material/ErrorOutlineOutlined"; // was lucide AlertCircle
import BarChart2 from "@mui/icons-material/BarChart"; // was lucide BarChart2
import Download from "@mui/icons-material/Download";
import api from "../../services/api";
import PageHeader from "../../components/common/PageHeader";

const Card = ({icon:Icon,label,value,sub,color="#2E86AB",bg="#EBF8FF"}) => (
  <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}>
    <div style={{width:46,height:46,borderRadius:12,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <Icon size={20} color={color}/>
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:12,color:"#6B7280",fontWeight:600,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color:"#1E3A5F",marginTop:1}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:"#9CA3AF",marginTop:1}}>{sub}</div>}
    </div>
  </div>
);

const Section = ({title,children}) => (
  <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:22,marginBottom:14}}>
    <div style={{fontSize:13,fontWeight:700,color:"#1E3A5F",marginBottom:16,display:"flex",alignItems:"center",gap:7}}>
      <BarChart2 size={15} color="#2E86AB"/>{title}
    </div>
    {children}
  </div>
);

const fmt = (v) => parseFloat(v||0).toLocaleString("en-IN",{minimumFractionDigits:2});

export default function ReportsPage() {
  const[stats,setStats]=useState(null);
  const[sales,setSales]=useState(null);
  const[outstanding,setOutstanding]=useState(null);
  const[payments,setPayments]=useState(null);
  const[loading,setLoading]=useState(true);
  const[activeTab,setActiveTab]=useState("dashboard");
  const[dateFrom,setDateFrom]=useState("");
  const[dateTo,setDateTo]=useState("");

  const today=new Date(); const y=today.getFullYear(); const m=String(today.getMonth()+1).padStart(2,"0");
  const defaultFrom=`${y}-${m}-01`; const defaultTo=today.toISOString().slice(0,10);

  useEffect(()=>{
    setLoading(true);
    Promise.all([
      api.get("/reports/dashboard/"),
      api.get("/reports/outstanding/"),
    ]).then(([s,o])=>{
      setStats(s.data); setOutstanding(o.data);
    }).finally(()=>setLoading(false));
  },[]);

  const loadSales=()=>{
    const from=dateFrom||defaultFrom; const to=dateTo||defaultTo;
    api.get(`/reports/sales/?date_from=${from}&date_to=${to}`).then(r=>setSales(r.data));
    api.get(`/reports/payments/?date_from=${from}&date_to=${to}`).then(r=>setPayments(r.data));
  };
  useEffect(()=>{if(activeTab==="sales")loadSales();},[activeTab]);

  const TABS=[{id:"dashboard",label:"Dashboard"},{id:"sales",label:"Sales Report"},{id:"outstanding",label:"Outstanding"}];

  if(loading) return <div style={{padding:60,textAlign:"center",color:"#9CA3AF",fontSize:15}}>Loading reports...</div>;

  return(
    <div>
      <PageHeader title="Reports" subtitle="Business analytics and insights"
        breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Reports"}]}/>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:16,background:"#F8FAFC",borderRadius:10,padding:4,border:"1px solid #E2E8F0",width:"fit-content"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{padding:"8px 18px",borderRadius:8,border:"none",fontWeight:600,fontSize:13.5,cursor:"pointer",transition:"all 0.15s",
            background:activeTab===t.id?"#fff":"transparent",color:activeTab===t.id?"#2E86AB":"#6B7280",
            boxShadow:activeTab===t.id?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab==="dashboard"&&stats&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
            <Card icon={Users} label="Active Customers" value={stats.totals.customers} color="#2E86AB" bg="#EBF8FF"/>
            <Card icon={FileText} label="Total Invoices" value={stats.totals.invoices} color="#7C3AED" bg="#FAF5FF"/>
            <Card icon={DollarSign} label="Revenue This Month" value={"₹"+fmt(stats.revenue.this_month)} color="#059669" bg="#F0FFF4"/>
            <Card icon={AlertCircle} label="Outstanding" value={"₹"+fmt(stats.revenue.total_outstanding)} color="#DC2626" bg="#FFF5F5"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Section title="Invoice Status Breakdown">
              {Object.entries(stats.invoice_status_breakdown||{}).map(([s,c])=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{width:90,fontSize:13,color:"#374151",textTransform:"capitalize",fontWeight:500}}>{s}</span>
                  <div style={{flex:1,background:"#F3F4F6",borderRadius:20,height:10,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:20,background:s==="paid"?"#10B981":s==="overdue"?"#EF4444":s==="sent"?"#3B82F6":"#9CA3AF",width:`${Math.min(100,(c/Math.max(stats.totals.invoices,1))*100)}%`}}/>
                  </div>
                  <span style={{width:28,textAlign:"right",fontWeight:700,fontSize:13,color:"#374151"}}>{c}</span>
                </div>
              ))}
            </Section>
            <Section title="Revenue Overview">
              {[["This Month","₹"+fmt(stats.revenue.this_month),"#3B82F6"],["This Year","₹"+fmt(stats.revenue.this_year),"#10B981"],["Total Paid","₹"+fmt(stats.revenue.total_paid),"#059669"],["Outstanding","₹"+fmt(stats.revenue.total_outstanding),"#EF4444"]].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #F3F4F6"}}>
                  <span style={{fontSize:13.5,color:"#6B7280"}}>{l}</span>
                  <span style={{fontWeight:700,fontSize:14,color:c}}>{v}</span>
                </div>
              ))}
            </Section>
          </div>
        </>
      )}

      {/* SALES TAB */}
      {activeTab==="sales"&&(
        <>
          <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
            <div><label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:3}}>From</label>
              <input type="date" value={dateFrom||defaultFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:"8px 12px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:13.5,outline:"none"}}/>
            </div>
            <div><label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:3}}>To</label>
              <input type="date" value={dateTo||defaultTo} onChange={e=>setDateTo(e.target.value)} style={{padding:"8px 12px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:13.5,outline:"none"}}/>
            </div>
            <button onClick={loadSales} style={{marginTop:18,padding:"9px 20px",background:"#2E86AB",color:"#fff",border:"none",borderRadius:8,fontWeight:600,fontSize:13.5,cursor:"pointer"}}>Generate Report</button>
          </div>
          {sales&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Section title="Sales Summary">
                {[["Total Revenue","₹"+fmt(sales.summary.total_amount)],["Total Invoices",sales.summary.total_invoices],["Average Invoice","₹"+fmt(sales.summary.average)]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #F3F4F6"}}>
                    <span style={{fontSize:13.5,color:"#6B7280"}}>{l}</span>
                    <span style={{fontWeight:700,fontSize:14,color:"#1E3A5F"}}>{v}</span>
                  </div>
                ))}
                {payments&&<>
                  <div style={{marginTop:10,fontSize:12,fontWeight:700,color:"#2E86AB",letterSpacing:0.5,textTransform:"uppercase"}}>Payments</div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #F3F4F6"}}>
                    <span style={{fontSize:13.5,color:"#6B7280"}}>Total Received</span>
                    <span style={{fontWeight:700,fontSize:14,color:"#059669"}}>₹{fmt(payments.summary.total)}</span>
                  </div>
                </>}
              </Section>
              <Section title="Top Customers">
                {(sales.by_customer||[]).slice(0,8).map((c,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #F9FAFB"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:20,height:20,borderRadius:"50%",background:"#2E86AB",color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{i+1}</span>
                      <span style={{fontSize:13.5,color:"#374151"}}>{c.customer__name||"—"}</span>
                    </div>
                    <span style={{fontWeight:700,fontSize:13,color:"#1E3A5F"}}>₹{fmt(c.total)}</span>
                  </div>
                ))}
              </Section>
            </div>
          )}
        </>
      )}

      {/* OUTSTANDING TAB */}
      {activeTab==="outstanding"&&outstanding&&(
        <>
          <div style={{background:"#FFF5F5",border:"1px solid #FEB2B2",borderRadius:10,padding:"14px 18px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:14,color:"#9B2C2C",fontWeight:600}}>Total Outstanding Amount</div>
            <div style={{fontSize:22,fontWeight:800,color:"#9B2C2C"}}>₹{fmt(outstanding.total_outstanding)}</div>
          </div>
          <div style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}>
              <thead>
                <tr style={{background:"#F8FAFC"}}>
                  {["Invoice #","Customer","Date","Due Date","Total","Balance Due","Overdue Days","Status"].map(h=>(
                    <th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:600,color:"#6B7280",borderBottom:"1px solid #E2E8F0",fontSize:12}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(outstanding.outstanding||[]).map((inv,i)=>(
                  <tr key={inv.id} style={{borderBottom:"1px solid #EDF2F7",background:i%2===0?"#fff":"#FAFAFA"}}>
                    <td style={{padding:"10px 14px",fontWeight:700,color:"#2E86AB"}}>{inv.number}</td>
                    <td style={{padding:"10px 14px"}}>{inv.customer}</td>
                    <td style={{padding:"10px 14px",color:"#6B7280"}}>{inv.date}</td>
                    <td style={{padding:"10px 14px",color:inv.days_overdue>0?"#DC2626":"#6B7280"}}>{inv.due_date||"—"}</td>
                    <td style={{padding:"10px 14px",fontWeight:600}}>₹{fmt(inv.total)}</td>
                    <td style={{padding:"10px 14px",fontWeight:700,color:"#DC2626"}}>₹{fmt(inv.balance)}</td>
                    <td style={{padding:"10px 14px"}}>
                      {inv.days_overdue>0?<span style={{color:"#DC2626",fontWeight:700}}>{inv.days_overdue}d overdue</span>:<span style={{color:"#059669"}}>On time</span>}
                    </td>
                    <td style={{padding:"10px 14px"}}>
                      <span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600,background:inv.status==="overdue"?"#FFF5F5":"#EBF8FF",color:inv.status==="overdue"?"#9B2C2C":"#2C5282"}}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(outstanding.outstanding||[]).length===0&&<div style={{padding:40,textAlign:"center",color:"#9CA3AF"}}>No outstanding invoices 🎉</div>}
          </div>
        </>
      )}
    </div>
  );
}
