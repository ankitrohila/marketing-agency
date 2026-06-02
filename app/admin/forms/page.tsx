"use client";
import { useEffect, useState, useRef } from "react";

/* ─────────────────────── Types ─────────────────────── */
interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio" | "number" | "date";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface Form {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  settings: {
    submitText: string;
    successMessage: string;
    notifyEmail: string;        // primary recipient
    notifyEmails?: string[];    // additional recipients
    emailSubject?: string;      // custom email subject template
    active: boolean;
  };
  createdAt: string;
  updatedAt: string;
  submissionsCount: number;
  isBuiltIn?: boolean;
}

interface Submission {
  id: string;
  formId: string;
  formName: string;
  data: Record<string, string>;
  submittedAt: string;
  status: string;
}

/* ─────────────────────── Constants ─────────────────────── */
const FIELD_TYPES = [
  { value: "text",     label: "Short Text" },
  { value: "email",    label: "Email" },
  { value: "tel",      label: "Phone" },
  { value: "number",   label: "Number" },
  { value: "date",     label: "Date" },
  { value: "textarea", label: "Long Text" },
  { value: "select",   label: "Dropdown" },
  { value: "radio",    label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
];

const SEED_FORMS: Form[] = [
  {
    id: "contact-form",
    name: "Contact / Start a Project",
    description: "Main website contact form — linked from hero CTA and contact page",
    fields: [
      { id: "f1", type: "text",     label: "Your Name",        placeholder: "Ankit Rohilla",              required: true  },
      { id: "f2", type: "email",    label: "Email Address",    placeholder: "you@company.com",           required: true  },
      { id: "f3", type: "text",     label: "Company",          placeholder: "Your Company",              required: false },
      { id: "f4", type: "text",     label: "Monthly Budget",   placeholder: "e.g. ₹5L–10L/month",       required: false },
      { id: "f5", type: "textarea", label: "Tell Us About Your Project", placeholder: "Share your goals, challenges, and timeline...", required: true },
    ],
    settings: { submitText: "Send Message →", successMessage: "Thank you! We'll get back to you within 24 hours.", notifyEmail: "rohilla77@gmail.com", active: true },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-05-01T00:00:00Z",
    submissionsCount: 0,
    isBuiltIn: true,
  },
  {
    id: "newsletter-subscribe",
    name: "Email Newsletter Subscription",
    description: "Footer newsletter opt-in — appears sitewide at bottom of pages",
    fields: [
      { id: "f6", type: "email", label: "Email Address", placeholder: "Enter your email", required: true },
    ],
    settings: { submitText: "Subscribe", successMessage: "You're subscribed! Expect insights every week.", notifyEmail: "rohilla77@gmail.com", active: true },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-05-01T00:00:00Z",
    submissionsCount: 0,
    isBuiltIn: true,
  },
  {
    id: "lead-capture",
    name: "Lead Capture Modal",
    description: "Pop-up lead capture form — triggered from CTAs across the site",
    fields: [
      { id: "l1", type: "text",     label: "Your Name",     placeholder: "Ankit Rohilla",      required: true  },
      { id: "l2", type: "email",    label: "Email Address", placeholder: "you@company.com",   required: true  },
      { id: "l3", type: "text",     label: "Company",       placeholder: "Your Company",      required: false },
      { id: "l4", type: "tel",      label: "Phone",         placeholder: "+91 98765 43210",   required: false },
      { id: "l5", type: "select",   label: "Service",       placeholder: "",                  required: false, options: ["Brand Strategy","Creative Studio","Media Distribution","Conversion & CRO","AI & MarTech","Full Service Retainer","Other"] },
      { id: "l6", type: "select",   label: "Budget",        placeholder: "",                  required: false, options: ["Under ₹1L/month","₹1L–3L/month","₹3L–5L/month","₹5L–10L/month","₹10L+/month","Project-based"] },
      { id: "l7", type: "textarea", label: "Message",       placeholder: "Tell us more...",   required: false },
    ],
    settings: { submitText: "Send Request", successMessage: "We've received your details and will reach out within 24 hours.", notifyEmail: "rohilla77@gmail.com", active: true },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-05-01T00:00:00Z",
    submissionsCount: 0,
    isBuiltIn: true,
  },
  {
    id: "booking-modal",
    name: "Book a Strategy Session",
    description: "Booking modal — date/time selection with Zoom link generation",
    fields: [
      { id: "b1", type: "text",     label: "Full Name",  placeholder: "Your name",         required: true  },
      { id: "b2", type: "email",    label: "Email",      placeholder: "you@company.com",   required: true  },
      { id: "b3", type: "tel",      label: "Phone",      placeholder: "+91 98765 43210",   required: false },
      { id: "b4", type: "text",     label: "Company",    placeholder: "Your company",      required: false },
      { id: "b5", type: "select",   label: "Service",    placeholder: "",                  required: true, options: ["Brand Strategy Session","Creative Studio Kickoff","Performance Marketing Audit","Conversion & CRO Review","AI & MarTech Consultation","Free 30-min Strategy Call"] },
      { id: "b6", type: "date",     label: "Date",       placeholder: "",                  required: true  },
      { id: "b7", type: "text",     label: "Time",       placeholder: "e.g. 10:00 AM",     required: true  },
      { id: "b8", type: "textarea", label: "Notes",      placeholder: "Specific context…", required: false },
    ],
    settings: { submitText: "Confirm Booking", successMessage: "Booking confirmed! Check your email for the Zoom link.", notifyEmail: "rohilla77@gmail.com", active: true },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-05-01T00:00:00Z",
    submissionsCount: 0,
    isBuiltIn: true,
  },
];

const S: Record<string, React.CSSProperties> = {
  input: {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    background: "var(--adm-card2)", border: "1px solid var(--adm-border2)",
    color: "var(--adm-text)", fontSize: "0.875rem", outline: "none", fontFamily: "inherit",
  },
  label: {
    display: "block", fontSize: "0.6875rem", fontWeight: 700,
    color: "var(--adm-muted2)", letterSpacing: "0.08em",
    textTransform: "uppercase" as const, marginBottom: 6,
  },
};

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "";
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* Country codes for phone fields */
const COUNTRY_CODES = [
  { code: "+91",  label: "IN +91" },
  { code: "+1",   label: "US +1"  },
  { code: "+44",  label: "GB +44" },
  { code: "+61",  label: "AU +61" },
  { code: "+971", label: "AE +971"},
  { code: "+65",  label: "SG +65" },
  { code: "+49",  label: "DE +49" },
  { code: "+33",  label: "FR +33" },
  { code: "+81",  label: "JP +81" },
  { code: "+86",  label: "CN +86" },
];

/* ─────────────────────── Field Editor ─────────────────────── */
function FieldEditor({
  field, idx, onChange, onRemove, onMove, total,
}: {
  field: FormField; idx: number;
  onChange: (f: FormField) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  total: number;
}) {
  return (
    <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 10, padding: "14px 18px", marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        {/* Order arrows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
          <button onClick={() => onMove(-1)} disabled={idx === 0}
            style={{ background: "none", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: "var(--adm-muted)", padding: "1px 4px", borderRadius: 3, fontSize: "0.625rem", opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
          <button onClick={() => onMove(1)} disabled={idx === total - 1}
            style={{ background: "none", border: "none", cursor: idx === total - 1 ? "not-allowed" : "pointer", color: "var(--adm-muted)", padding: "1px 4px", borderRadius: 3, fontSize: "0.625rem", opacity: idx === total - 1 ? 0.3 : 1 }}>▼</button>
        </div>

        {/* Type */}
        <div style={{ flex: 1 }}>
          <label style={S.label}>Field Type</label>
          <select value={field.type} onChange={e => onChange({ ...field, type: e.target.value as FormField["type"] })} style={{ ...S.input }}>
            {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Label */}
        <div style={{ flex: 2 }}>
          <label style={S.label}>Label</label>
          <input value={field.label} onChange={e => onChange({ ...field, label: e.target.value })} placeholder="Field label" style={S.input} />
        </div>

        {/* Required */}
        <div style={{ paddingTop: 18, flexShrink: 0 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: "0.75rem", color: "var(--adm-muted2)", whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={field.required} onChange={e => onChange({ ...field, required: e.target.checked })} />
            Required
          </label>
        </div>

        {/* Remove */}
        <button onClick={onRemove}
          style={{ background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted)", borderRadius: 6, padding: "5px 9px", cursor: "pointer", flexShrink: 0, marginTop: 18, fontSize: "0.6875rem" }}>✕</button>
      </div>

      {/* Country code prefix for phone fields */}
      {field.type === "tel" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 130 }}>
            <label style={S.label}>Country Code</label>
            <select
              value={(field as FormField & { countryCode?: string }).countryCode || "+91"}
              onChange={e => onChange({ ...field, countryCode: e.target.value } as FormField & { countryCode?: string })}
              style={{ ...S.input }}
            >
              {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Placeholder</label>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <span style={{ padding: "10px 10px", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRight: "none", borderRadius: "8px 0 0 8px", fontSize: "0.8125rem", color: "var(--adm-muted2)", whiteSpace: "nowrap" }}>
                {(field as FormField & { countryCode?: string }).countryCode || "+91"}
              </span>
              <input value={field.placeholder || ""} onChange={e => onChange({ ...field, placeholder: e.target.value })} placeholder="98765 43210" style={{ ...S.input, borderRadius: "0 8px 8px 0" }} />
            </div>
          </div>
        </div>
      )}

      {/* Placeholder (non-phone, non-checkbox/radio) */}
      {!["checkbox","radio","tel"].includes(field.type) && (
        <div style={{ marginBottom: 8 }}>
          <label style={S.label}>Placeholder</label>
          <input value={field.placeholder || ""} onChange={e => onChange({ ...field, placeholder: e.target.value })} placeholder="Placeholder text…" style={S.input} />
        </div>
      )}

      {/* Options for select/radio */}
      {["select","radio"].includes(field.type) && (
        <div>
          <label style={S.label}>Options (one per line)</label>
          <textarea value={(field.options || []).join("\n")} onChange={e => onChange({ ...field, options: e.target.value.split("\n").filter(Boolean) })} placeholder={"Option 1\nOption 2\nOption 3"} rows={4} style={{ ...S.input, resize: "vertical" }} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Form Builder Modal ─────────────────────── */
function BuilderModal({ initial, onSave, onClose }: {
  initial: Partial<Form> | null;
  onSave: (form: Partial<Form>) => void;
  onClose: () => void;
}) {
  const [name,        setName]    = useState(initial?.name || "");
  const [description, setDesc]    = useState(initial?.description || "");
  const [submitText,  setSubTxt]  = useState(initial?.settings?.submitText || "Submit");
  const [successMsg,  setSuccMsg] = useState(initial?.settings?.successMessage || "Thank you! Your response has been recorded.");
  const [notifyEmail, setNEmail]  = useState(initial?.settings?.notifyEmail || "");
  const [extraEmails, setExtra]   = useState<string[]>(initial?.settings?.notifyEmails || []);
  const [emailSubject,setSubject] = useState(initial?.settings?.emailSubject || "New form submission — {{formName}}");
  const [active,      setActive]  = useState(initial?.settings?.active !== false);
  const [fields,      setFields]  = useState<FormField[]>(initial?.fields || []);
  const [saving,      setSaving]  = useState(false);
  const [settingsTab, setSettingsTab] = useState(0);

  function addField() {
    setFields(prev => [...prev, { id: crypto.randomUUID(), type: "text", label: "New Field", placeholder: "", required: false }]);
  }
  function updateField(idx: number, f: FormField) { setFields(prev => prev.map((x, i) => i === idx ? f : x)); }
  function removeField(idx: number) { setFields(prev => prev.filter((_, i) => i !== idx)); }
  function moveField(idx: number, dir: -1 | 1) {
    setFields(prev => {
      const arr = [...prev]; const to = idx + dir;
      if (to < 0 || to >= arr.length) return arr;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return arr;
    });
  }
  function addExtraEmail() { setExtra(prev => [...prev, ""]); }
  function updateExtraEmail(i: number, v: string) { setExtra(prev => prev.map((e, j) => j === i ? v : e)); }
  function removeExtraEmail(i: number) { setExtra(prev => prev.filter((_, j) => j !== i)); }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      ...(initial?.id ? { id: initial.id } : {}),
      name, description, fields,
      settings: { submitText, successMessage: successMsg, notifyEmail, notifyEmails: extraEmails.filter(Boolean), emailSubject, active },
    });
    setSaving(false);
  }

  const STABS = ["Form Fields", "Settings", "Recipients"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 20px", overflowY: "auto" }}>
      <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border2)", borderRadius: 16, width: "100%", maxWidth: 860, position: "relative", overflow: "hidden" }}>

        {/* Modal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", borderBottom: "1px solid var(--adm-border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--adm-text)" }}>
            {initial?.id ? "Edit Form" : "Create New Form"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--adm-muted)", cursor: "pointer", fontSize: "1.125rem" }}>✕</button>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--adm-border)", padding: "0 28px" }}>
          {STABS.map((t, i) => (
            <button key={t} onClick={() => setSettingsTab(i)} style={{ padding: "10px 14px", border: "none", background: "transparent", color: settingsTab === i ? "var(--adm-text)" : "var(--adm-muted)", fontSize: "0.8125rem", fontWeight: settingsTab === i ? 600 : 400, cursor: "pointer", borderBottom: `2px solid ${settingsTab === i ? "var(--adm-text)" : "transparent"}` }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* ── Tab 0: Form Fields ── */}
          {settingsTab === 0 && (
            <div>
              {/* Basic form name/desc */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={S.label}>Form Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Contact Form" style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Description</label>
                  <input value={description} onChange={e => setDesc(e.target.value)} placeholder="Internal description…" style={S.input} />
                </div>
              </div>

              {/* Fields */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)" }}>Form Fields ({fields.length})</h3>
                </div>

                {fields.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", border: "1px dashed var(--adm-border2)", borderRadius: 10, color: "var(--adm-muted)", fontSize: "0.8125rem", marginBottom: 12 }}>
                    No fields yet. Use the button below to add fields.
                  </div>
                ) : (
                  fields.map((f, i) => (
                    <FieldEditor key={f.id} field={f} idx={i} total={fields.length}
                      onChange={nf => updateField(i, nf)}
                      onRemove={() => removeField(i)}
                      onMove={dir => moveField(i, dir)}
                    />
                  ))
                )}

                {/* Add Field — BELOW the last field */}
                <button onClick={addField}
                  style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "1px dashed var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
                  + Add Field
                </button>
              </div>
            </div>
          )}

          {/* ── Tab 1: Settings ── */}
          {settingsTab === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={S.label}>Submit Button Text</label>
                <input value={submitText} onChange={e => setSubTxt(e.target.value)} placeholder="Submit" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Success Message</label>
                <input value={successMsg} onChange={e => setSuccMsg(e.target.value)} placeholder="Thank you!" style={S.input} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="active-chk" checked={active} onChange={e => setActive(e.target.checked)} style={{ cursor: "pointer", width: 14, height: 14 }} />
                <label htmlFor="active-chk" style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)", cursor: "pointer" }}>Form is active (accepting submissions)</label>
              </div>
            </div>
          )}

          {/* ── Tab 2: Recipients ── */}
          {settingsTab === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)" }}>
                Configure who receives notification emails when this form is submitted.
              </p>
              <div>
                <label style={S.label}>Primary Recipient</label>
                <input value={notifyEmail} onChange={e => setNEmail(e.target.value)} type="email" placeholder="admin@company.com" style={S.input} />
              </div>
              <div>
                <label style={S.label}>Email Subject Template</label>
                <input value={emailSubject} onChange={e => setSubject(e.target.value)} placeholder="New submission — {{formName}}" style={S.input} />
                <p style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", marginTop: 4 }}>
                  Variables: <code style={{ background: "var(--adm-card2)", padding: "1px 5px", borderRadius: 3 }}>{"{{formName}}"}</code> <code style={{ background: "var(--adm-card2)", padding: "1px 5px", borderRadius: 3 }}>{"{{date}}"}</code>
                </p>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={S.label}>Additional Recipients</label>
                  <button onClick={addExtraEmail} style={{ background: "none", border: "none", color: "var(--adm-muted2)", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}>+ Add</button>
                </div>
                {extraEmails.length === 0 && (
                  <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)" }}>No additional recipients.</p>
                )}
                {extraEmails.map((email, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input value={email} onChange={e => updateExtraEmail(i, e.target.value)} type="email" placeholder="cc@company.com" style={{ ...S.input, flex: 1 }} />
                    <button onClick={() => removeExtraEmail(i)} style={{ background: "none", border: "1px solid var(--adm-border2)", color: "var(--adm-muted)", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: "0.6875rem" }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "18px 28px", borderTop: "1px solid var(--adm-border)" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", cursor: "pointer", fontSize: "0.8125rem" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !name.trim()}
            style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: "var(--adm-text)", color: "var(--adm-bg)", cursor: saving || !name.trim() ? "not-allowed" : "pointer", fontSize: "0.8125rem", fontWeight: 600, opacity: saving || !name.trim() ? 0.6 : 1 }}>
            {saving ? "Saving…" : initial?.id ? "Update Form" : "Create Form"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Submissions Modal ─────────────────────── */
function SubmissionsModal({ form, onClose }: { form: Form; onClose: () => void }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    fetch(`/api/admin/forms?formId=${form.id}`, {
      headers: { "x-admin-token": token() },
    })
      .then((r) => r.json())
      .then((d) => { setSubmissions(d.submissions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [form.id]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto" }}>
      <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border2)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 900, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--adm-text)" }}>Submissions — {form.name}</h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--adm-muted)", marginTop: 2 }}>{submissions.length} total submission{submissions.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--adm-muted)", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--adm-muted)" }}>Loading submissions…</div>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--adm-muted)", fontSize: "0.9375rem" }}>
            No submissions yet for this form.
          </div>
        ) : selected ? (
          /* Detail view */
          <div>
            <button
              onClick={() => setSelected(null)}
              style={{ marginBottom: 20, background: "none", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: "0.8125rem" }}
            >
              ← Back to list
            </button>
            <div style={{ padding: 24, background: "var(--adm-card)", borderRadius: 12 }}>
              <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 16 }}>
                Submitted {fmt(selected.submittedAt)}
              </p>
              {Object.entries(selected.data).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: "0.9375rem", color: "var(--adm-text)", lineHeight: 1.6 }}>{v || <span style={{ color: "var(--adm-border2)" }}>—</span>}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List view */
          <div>
            {submissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelected(sub)}
                style={{
                  padding: "14px 18px", borderRadius: 10,
                  border: "1px solid var(--adm-border)",
                  background: "var(--adm-card)", marginBottom: 8,
                  cursor: "pointer", display: "flex", gap: 12, alignItems: "center",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--adm-card2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--adm-card)"; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--adm-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {Object.values(sub.data)[0] || "Anonymous submission"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 2 }}>
                    {fmt(sub.submittedAt)} · {Object.keys(sub.data).length} fields
                  </div>
                </div>
                <span style={{ fontSize: "0.6875rem", padding: "3px 10px", borderRadius: 99, background: "rgba(52,211,153,0.1)", color: "#34D399", fontWeight: 600 }}>
                  {sub.status}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--adm-border2)" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */
export default function AdminFormsPage() {
  const [forms, setForms]           = useState<Form[]>([]);
  const [loading, setLoading]       = useState(true);
  const [builderOpen, setBuilder]   = useState(false);
  const [editForm, setEditForm]     = useState<Form | null>(null);
  const [viewSubs, setViewSubs]     = useState<Form | null>(null);
  const [toast, setToast]           = useState<string | null>(null);

  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }

  async function loadForms() {
    try {
      const res = await fetch("/api/admin/forms", { headers: { "x-admin-token": token() } });
      const data = await res.json();
      const apiForms: Form[] = data.forms || [];
      // Real submission counts from each data source
      const builtInCounts: Record<string, number> = data.builtInCounts || {};
      // Seed forms with actual live counts
      const updatedSeeds = SEED_FORMS.map((f) => ({
        ...f,
        submissionsCount: f.id in builtInCounts ? builtInCounts[f.id] : f.submissionsCount,
      }));
      // Append any extra custom forms not already in seeds
      const seedIds = new Set(SEED_FORMS.map((f) => f.id));
      const extraForms = apiForms.filter((f) => !seedIds.has(f.id));
      setForms([...updatedSeeds, ...extraForms]);
    } catch {
      setForms(SEED_FORMS);
    }
    setLoading(false);
  }

  useEffect(() => { loadForms(); }, []);

  async function handleSave(formData: Partial<Form>) {
    const isEdit = !!formData.id;
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/admin/forms", {
      method,
      headers: { "Content-Type": "application/json", "x-admin-token": token() },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      await loadForms();
      setBuilder(false);
      setEditForm(null);
      showToast(isEdit ? "Form updated successfully" : "Form created successfully");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this form? All submissions will remain.")) return;
    await fetch(`/api/admin/forms?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token() },
    });
    await loadForms();
    showToast("Form deleted");
  }

  async function toggleActive(form: Form) {
    await handleSave({ ...form, settings: { ...form.settings, active: !form.settings.active } });
  }

  return (
    <div className="adm-page-main" style={{ padding: 32, minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 2000,
          background: "var(--adm-card)",
          border: "1px solid rgba(52,211,153,0.3)",
          color: "#34D399", padding: "12px 20px", borderRadius: 10,
          fontSize: "0.875rem", fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Modals */}
      {(builderOpen || editForm) && (
        <BuilderModal
          initial={editForm}
          onSave={handleSave}
          onClose={() => { setBuilder(false); setEditForm(null); }}
        />
      )}
      {viewSubs && (
        <SubmissionsModal form={viewSubs} onClose={() => setViewSubs(null)} />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.03em" }}>
            Form Builder
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--adm-muted)", marginTop: 4 }}>
            Create forms, manage fields, and view submissions
          </p>
        </div>
        <button
          onClick={() => { setEditForm(null); setBuilder(true); }}
          style={{
            background: "var(--adm-text)",
            border: "none", color: "var(--adm-bg)", padding: "11px 22px",
            borderRadius: 10, cursor: "pointer", fontSize: "0.875rem",
            fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>+</span>
          New Form
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Forms", value: forms.length },
          { label: "Active Forms", value: forms.filter((f) => f.settings.active).length },
          { label: "Total Submissions", value: forms.reduce((a, f) => a + (f.submissionsCount || 0), 0) },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: "20px 24px", background: "var(--adm-surface)", borderRadius: 14, border: "1px solid var(--adm-border)" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.04em" }}>{stat.value}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Forms list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--adm-muted)" }}>Loading forms…</div>
      ) : forms.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 40px",
          background: "var(--adm-surface)", borderRadius: 16,
          border: "2px dashed var(--adm-border)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📋</div>
          <h3 style={{ color: "var(--adm-text)", fontWeight: 700, marginBottom: 8 }}>No forms yet</h3>
          <p style={{ color: "var(--adm-muted)", marginBottom: 24 }}>Create your first form to start collecting submissions.</p>
          <button
            onClick={() => setBuilder(true)}
            style={{ background: "var(--adm-text)", border: "none", color: "var(--adm-bg)", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}
          >
            Create First Form
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {forms.map((form) => (
            <div
              key={form.id}
              style={{
                background: "var(--adm-surface)",
                border: "1px solid var(--adm-border)",
                borderRadius: 14,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)" }}>{form.name}</h3>
                  {/* Built-in badge */}
                  {form.isBuiltIn && (
                    <span style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: "var(--adm-card2)",
                      color: "var(--adm-muted2)",
                      border: "1px solid var(--adm-border2)",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}>
                      🌐 Website
                    </span>
                  )}
                  {/* Active badge */}
                  <span style={{
                    fontSize: "0.625rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: form.settings.active ? "rgba(52,211,153,0.12)" : "var(--adm-card2)",
                    color: form.settings.active ? "#34D399" : "var(--adm-muted)",
                    border: `1px solid ${form.settings.active ? "rgba(52,211,153,0.25)" : "var(--adm-border)"}`,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    {form.settings.active ? "Active" : "Inactive"}
                  </span>
                </div>
                {form.description && (
                  <p style={{ fontSize: "0.8125rem", color: "var(--adm-muted)", marginBottom: 6 }}>{form.description}</p>
                )}
                <div style={{ display: "flex", gap: 16, fontSize: "0.75rem", color: "var(--adm-muted)" }}>
                  <span>{form.fields.length} field{form.fields.length !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{form.submissionsCount || 0} submission{form.submissionsCount !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>Updated {fmt(form.updatedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setViewSubs(form)}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", cursor: "pointer", fontSize: "0.8125rem" }}
                >
                  📊 Submissions ({form.submissionsCount || 0})
                </button>
                <button
                  onClick={() => {
                    const code = `/api/forms/${form.id}/submit`;
                    navigator.clipboard?.writeText(code);
                    showToast("API endpoint copied to clipboard");
                  }}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", cursor: "pointer", fontSize: "0.8125rem" }}
                >
                  📋 Copy Endpoint
                </button>
                <button
                  onClick={() => toggleActive(form)}
                  style={{
                    padding: "8px 14px", borderRadius: 8,
                    border: "1px solid var(--adm-border2)",
                    background: "transparent",
                    color: form.settings.active ? "var(--adm-muted2)" : "var(--adm-text)",
                    cursor: "pointer", fontSize: "0.8125rem",
                  }}
                >
                  {form.settings.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setEditForm(form)}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--adm-border2)", background: "var(--adm-card)", color: "var(--adm-text)", cursor: "pointer", fontSize: "0.8125rem" }}
                >
                  Edit
                </button>
                {/* Delete — disabled for built-in forms */}
                <button
                  onClick={() => !form.isBuiltIn && handleDelete(form.id)}
                  disabled={!!form.isBuiltIn}
                  title={form.isBuiltIn ? "Built-in website forms cannot be deleted" : "Delete form"}
                  style={{
                    padding: "8px 12px", borderRadius: 8,
                    border: "1px solid var(--adm-border2)",
                    background: "transparent",
                    color: form.isBuiltIn ? "var(--adm-border2)" : "var(--adm-muted)",
                    cursor: form.isBuiltIn ? "not-allowed" : "pointer",
                    fontSize: "0.8125rem",
                    opacity: form.isBuiltIn ? 0.45 : 1,
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
