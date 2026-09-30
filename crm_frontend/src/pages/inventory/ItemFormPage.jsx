import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createItems, updateItems, fetchOneItems, selectSelected, selectSubmitting } from "../../features/inventory/itemsSlice";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

const S = {
  card: { background:"#fff", borderRadius:10, border:"1px solid #E2E8F0", padding:24, marginBottom:16 },
  sec: { fontSize:12, fontWeight:700, color:"#2E86AB", marginBottom:14, textTransform:"uppercase", letterSpacing:0.8 },
  grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  full: { gridColumn:"1/-1" },
  label: { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:5 },
  input: { width:"100%", padding:"9px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:13.5, outline:"none", fontFamily:"inherit", boxSizing:"border-box" },
  select: { width:"100%", padding:"9px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:13.5, outline:"none", fontFamily:"inherit", background:"#fff", boxSizing:"border-box" },
  textarea: { width:"100%", padding:"9px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:13.5, outline:"none", fontFamily:"inherit", resize:"vertical", boxSizing:"border-box" },
  errInput: { borderColor:"#EF4444" },
  err: { fontSize:11.5, color:"#DC2626", marginTop:3 },
  footer: { display:"flex", justifyContent:"flex-end", gap:10, marginTop:8, paddingBottom:40 },
  cancel: { padding:"10px 20px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontWeight:600, fontSize:14, cursor:"pointer" },
  save: { padding:"10px 24px", borderRadius:8, border:"none", background:"#2E86AB", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" },
  requiredStar: { color: "#EF4444", marginLeft: 2 },
  emptyNote: { fontSize: 13, color: "#9CA3AF" },
};

const Field = ({label, name, reg, errs, type="text", required=false, full=false, opts=[], placeholder=""}) => (
  <div style={full ? S.full : {}}>
    <label style={S.label}>
      {label}
      {required && <span style={S.requiredStar}>*</span>}
    </label>
    {type === "textarea" ? (
      <textarea
        style={{...S.textarea, ...(errs[name] ? S.errInput : {})}}
        rows={3}
        placeholder={placeholder}
        {...reg(name, {required: required ? `${label} is required` : false})}
      />
    ) : type === "select" ? (
      <select
        style={{...S.select, ...(errs[name] ? S.errInput : {})}}
        {...reg(name, {required: required ? `${label} is required` : false})}
      >
        <option value="">Select {label}</option>
        {opts.map(o => (
          <option key={o.value || o} value={o.value || o}>
            {o.label || o}
          </option>
        ))}
      </select>
    ) : (
      <input
        style={{...S.input, ...(errs[name] ? S.errInput : {})}}
        type={type}
        placeholder={placeholder}
        {...reg(name, {required: required ? `${label} is required` : false})}
      />
    )}
    {errs[name] && <div style={S.err}>{errs[name].message}</div>}
  </div>
);

export default function ItemFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const selected = useSelector(selectSelected);
  const submitting = useSelector(selectSubmitting);
  const [itemGroups, setItemGroups] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [rates, setRates] = useState({});

  const { register, handleSubmit, reset, formState: { errors: errs } } = useForm({
    defaultValues: { is_active: true, tax1_percent: 0, tax2_percent: 0 },
  });

  useEffect(() => {
    api.get("/inventory/item-groups/?is_active=true")
      .then(r => setItemGroups(Array.isArray(r.data) ? r.data : r.data?.results || []))
      .catch(err => console.error("Error fetching item groups:", err));
    api.get("/currencies/?is_active=true")
      .then(r => setCurrencyList(Array.isArray(r.data) ? r.data : r.data?.results || []))
      .catch(err => console.error("Error fetching currencies:", err));
    if (isEdit) dispatch(fetchOneItems(id));
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && selected) {
      reset(selected);
      const rateMap = {};
      (selected.rates || []).forEach(r => { rateMap[r.currency] = r.rate; });
      setRates(rateMap);
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (data) => {
    if (data.item_group === "") data.item_group = null;
    const ratesPayload = Object.entries(rates)
      .filter(([, v]) => v !== "" && v !== null && v !== undefined)
      .map(([currency, rate]) => ({ currency: Number(currency), rate }));
    const payload = { ...data, rates: ratesPayload };
    const res = isEdit
      ? await dispatch(updateItems({ id, data: payload }))
      : await dispatch(createItems(payload));
    if (!res.error) navigate("/inventory/items");
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Item" : "New Item"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Inventory", path: "/inventory/items" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={S.card}>
          <div style={S.sec}>Basic Information</div>
          <div style={S.grid2}>
            <Field label="Item Name" name="name" reg={register} errs={errs} required placeholder="Enter item name" />
            <Field label="Item Group" name="item_group" type="select" reg={register} errs={errs}
              opts={itemGroups.map(g => ({ value: g.id, label: g.name }))} />
            <Field label="Unit" name="unit" reg={register} errs={errs} placeholder="pcs, kg, box..." />
            <Field label="Description" name="description" reg={register} errs={errs} placeholder="Short description" />
          </div>
          <div style={{ marginTop: 16 }}>
            <Field label="Long Description" name="long_description" type="textarea" reg={register} errs={errs} full placeholder="Detailed description..." />
          </div>
        </div>

        <div style={S.card}>
          <div style={S.sec}>Tax</div>
          <div style={S.grid2}>
            <Field label="Tax 1 (%)" name="tax1_percent" type="number" reg={register} errs={errs} />
            <Field label="Tax 2 (%)" name="tax2_percent" type="number" reg={register} errs={errs} />
          </div>
        </div>

        <div style={S.card}>
          <div style={S.sec}>Rates by Currency</div>
          {currencyList.length === 0 ? (
            <div style={S.emptyNote}>No active currencies configured yet.</div>
          ) : (
            <div style={S.grid2}>
              {currencyList.map(c => (
                <div key={c.id}>
                  <label style={S.label}>{c.code} ({c.symbol})</label>
                  <input
                    style={S.input}
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="Not set"
                    value={rates[c.id] ?? ""}
                    onChange={e => setRates(p => ({ ...p, [c.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={S.card}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" defaultChecked {...register("is_active")} style={{ width: 16, height: 16, cursor: "pointer" }} />
            <span style={{ fontSize: 13, color: "#4A5568" }}>Active Item</span>
          </label>
        </div>

        <div style={S.footer}>
          <button type="button" style={S.cancel} onClick={() => navigate("/inventory/items")}>Cancel</button>
          <button type="submit" style={{ ...S.save, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Update Item" : "Create Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
