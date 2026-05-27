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
    notifyEmail: string;
    active: boolean;
  };
  createdAt: string;
  updatedAt: string;
  submissionsCount: number;
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

const S: Record<string, React.CSSProperties> = {
  input: {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
    color: "#F5F5F5", fontSize: "0.875rem", outline: "none", fontFamily: "inherit",
  },
  label: {
    display: "block", fontSize: "0.6875rem", fontWeight: 700,
    color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em",
    textTransform: "uppercase" as const, marginBottom: 6,
  },
};

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "";
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ─────────────────────── Field Editor ─────────────────────── */
function FieldEditor({
  field,
  idx,
  onChange,
  onRemove,
  onMove,
  total,
}: {
  field: FormField;
  idx: number;
  onChange: (f: FormField) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  total: number;
}) {
  return (
    <div style={{
      background: "#141414",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      padding: "16px 20px",
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
        {/* Order */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button
            onClick={() => onMove(-1)} disabled={idx === 0}
            style={{ background: "none", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: "rgba(255,255,255,0.3)", padding: "2px 5px", borderRadius: 4, fontSize: "0.75rem" }}
          >▲</button>
          <button
            onClick={() => onMove(1)} disabled={idx === total - 1}
            style={{ background: "none", border: "none", cursor: idx === total - 1 ? "not-allowed" : "pointer", color: "rgba(255,255,255,0.3)", padding: "2px 5px", borderRadius: 4, fontSize: "0.75rem" }}
          >▼</button>
        </div>

        {/* Type */}
        <div style={{ flex: 1 }}>
          <label style={S.label}>Field Type</label>
          <select
            value={field.type}
            onChange={(e) => onChange({ ...field, type: e.target.value as FormField["type"] })}
            style={{ ...S.input }}
          >
            {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Label */}
        <div style={{ flex: 2 }}>
          <label style={S.label}>Label</label>
          <input
            value={field.label}
            onChange={(e) => onChange({ ...field, label: e.target.value })}
            placeholder="Field label"
            style={S.input}
          />
        </div>

        {/* Required */}
        <div style={{ paddingTop: 20, flexShrink: 0 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onChange({ ...field, required: e.target.checked })}
            />
            Required
          </label>
        </div>

        {/* Remove */}
        <button
          onClick={onRemove}
          style={{ background: "rgba(232,49,42,0.1)", border: "1px solid rgba(232,49,42,0.2)", color: "#E8312A", borderRadius: 8, padding: "6px 10px", cursor: "pointer", flexShrink: 0, marginTop: 18, fontSize: "0.75rem" }}
        >✕</button>
      </div>

      {/* Placeholder (non-checkbox/radio) */}
      {!["checkbox", "radio"].includes(field.type) && (
        <div style={{ marginBottom: 10 }}>
          <label style={S.label}>Placeholder</label>
          <input
            value={field.placeholder || ""}
            onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
            placeholder="Placeholder text..."
            style={S.input}
          />
        </div>
      )}

      {/* Options (for select/radio) */}
      {["select", "radio"].includes(field.type) && (
        <div>
          <label style={S.label}>Options (one per line)</label>
          <textarea
            value={(field.options || []).join("\n")}
            onChange={(e) => onChange({ ...field, options: e.target.value.split("\n").filter(Boolean) })}
            placeholder={"Option 1\nOption 2\nOption 3"}
            rows={4}
            style={{ ...S.input, resize: "vertical" }}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Form Builder Modal ─────────────────────── */
function BuilderModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<Form> | null;
  onSave: (form: Partial<Form>) => void;
  onClose: () => void;
}) {
  const [name, setName]           = useState(initial?.name || "");
  const [description, setDesc]    = useState(initial?.description || "");
  const [submitText, setSubTxt]   = useState(initial?.settings?.submitText || "Submit");
  const [successMsg, setSuccMsg]  = useState(initial?.settings?.successMessage || "Thank you! Your response has been recorded.");
  const [notifyEmail, setNEmail]  = useState(initial?.settings?.notifyEmail || "");
  const [active, setActive]       = useState(initial?.settings?.active !== false);
  const [fields, setFields]       = useState<FormField[]>(initial?.fields || []);
  const [saving, setSaving]       = useState(false);

  function addField() {
    setFields((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "text", label: "New Field", placeholder: "", required: false },
    ]);
  }

  function updateField(idx: number, f: FormField) {
    setFields((prev) => prev.map((x, i) => (i === idx ? f : x)));
  }

  function removeField(idx: number) {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  }

  function moveField(idx: number, dir: -1 | 1) {
    setFields((prev) => {
      const arr = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return arr;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return arr;
    });
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      ...(initial?.id ? { id: initial.id } : {}),
      name,
      description,
      fields,
      settings: { submitText, successMessage: successMsg, notifyEmail, active },
    });
    setSaving(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "40px 20px", overflowY: "auto",
    }}>
      <div style={{
        background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 32, width: "100%", maxWidth: 860,
        position: "relative",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#F5F5F5" }}>
            {initial?.id ? "Edit Form" : "Create New Form"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>
        </div>

        {/* Basic Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={S.label}>Form Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Contact Form" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Description</label>
            <input value={description} onChange={(e) => setDesc(e.target.value)} placeholder="Internal description..." style={S.input} />
          </div>
          <div>
            <label style={S.label}>Submit Button Text</label>
            <input value={submitText} onChange={(e) => setSubTxt(e.target.value)} placeholder="Submit" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Notify Email</label>
            <input value={notifyEmail} onChange={(e) => setNEmail(e.target.value)} placeholder="admin@company.com" type="email" style={S.input} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={S.label}>Success Message</label>
            <input value={successMsg} onChange={(e) => setSuccMsg(e.target.value)} placeholder="Thank you! Your submission has been received." style={S.input} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Form is Active (accepting submissions)
            </label>
          </div>
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F5F5F5" }}>
              Form Fields ({fields.length})
            </h3>
            <button
              onClick={addField}
              style={{
                background: "rgba(232,49,42,0.12)", border: "1px solid rgba(232,49,42,0.3)",
                color: "#E8312A", padding: "7px 16px", borderRadius: 8,
                cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600,
              }}
            >
              + Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 12, color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>
              No fields yet. Click "Add Field" to start building your form.
            </div>
          ) : (
            fields.map((f, i) => (
              <FieldEditor
                key={f.id}
                field={f}
                idx={i}
                total={fields.length}
                onChange={(nf) => updateField(i, nf)}
                onRemove={() => removeField(i)}
                onMove={(dir) => moveField(i, dir)}
              />
            ))
          )}
        </div>

        {/* Save */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "11px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "0.875rem" }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              padding: "11px 28px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#E8312A,#FF6B1A)",
              color: "#fff", cursor: saving ? "not-allowed" : "pointer",
              fontSize: "0.875rem", fontWeight: 700,
              opacity: saving || !name.trim() ? 0.7 : 1,
            }}
          >
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
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 900, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#F5F5F5" }}>Submissions — {form.name}</h2>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{submissions.length} total submission{submissions.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.4)" }}>Loading submissions…</div>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: "0.9375rem" }}>
            No submissions yet for this form.
          </div>
        ) : selected ? (
          /* Detail view */
          <div>
            <button
              onClick={() => setSelected(null)}
              style={{ marginBottom: 20, background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: "0.8125rem" }}
            >
              ← Back to list
            </button>
            <div style={{ padding: 24, background: "#141414", borderRadius: 12 }}>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                Submitted {fmt(selected.submittedAt)}
              </p>
              {Object.entries(selected.data).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: "0.9375rem", color: "#F5F5F5", lineHeight: 1.6 }}>{v || <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}</div>
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
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "#111", marginBottom: 8,
                  cursor: "pointer", display: "flex", gap: 12, alignItems: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#181818"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#111"; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F5F5F5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {Object.values(sub.data)[0] || "Anonymous submission"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {fmt(sub.submittedAt)} · {Object.keys(sub.data).length} fields
                  </div>
                </div>
                <span style={{ fontSize: "0.6875rem", padding: "3px 10px", borderRadius: 99, background: "rgba(52,211,153,0.1)", color: "#34D399", fontWeight: 600 }}>
                  {sub.status}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
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
      setForms(data.forms || []);
    } catch { /* silent */ }
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
    <div style={{ padding: 32, minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 2000,
          background: "#1a2e1a", border: "1px solid rgba(52,211,153,0.3)",
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F5F5F5", letterSpacing: "-0.03em" }}>
            Form Builder
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Create forms, manage fields, and view submissions
          </p>
        </div>
        <button
          onClick={() => { setEditForm(null); setBuilder(true); }}
          style={{
            background: "linear-gradient(135deg,#E8312A,#FF6B1A)",
            border: "none", color: "#fff", padding: "11px 22px",
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
          <div key={stat.label} style={{ padding: "20px 24px", background: "#0d0d0d", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#E8312A", letterSpacing: "-0.04em" }}>{stat.value}</div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Forms list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "rgba(255,255,255,0.3)" }}>Loading forms…</div>
      ) : forms.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 40px",
          background: "#0d0d0d", borderRadius: 16,
          border: "2px dashed rgba(255,255,255,0.07)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📋</div>
          <h3 style={{ color: "#F5F5F5", fontWeight: 700, marginBottom: 8 }}>No forms yet</h3>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Create your first form to start collecting submissions.</p>
          <button
            onClick={() => setBuilder(true)}
            style={{ background: "linear-gradient(135deg,#E8312A,#FF6B1A)", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}
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
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F5F5F5" }}>{form.name}</h3>
                  <span style={{
                    fontSize: "0.625rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: form.settings.active ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
                    color: form.settings.active ? "#34D399" : "rgba(255,255,255,0.3)",
                    border: `1px solid ${form.settings.active ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.08)"}`,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    {form.settings.active ? "Active" : "Inactive"}
                  </span>
                </div>
                {form.description && (
                  <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>{form.description}</p>
                )}
                <div style={{ display: "flex", gap: 16, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
                  <span>{form.fields.length} field{form.fields.length !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{form.submissionsCount || 0} submission{form.submissionsCount !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>Updated {fmt(form.updatedAt)}</span>
                </div>
              </div>

              {/* Form embed code */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setViewSubs(form)}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "0.8125rem" }}
                >
                  📊 Submissions ({form.submissionsCount || 0})
                </button>
                <button
                  onClick={() => {
                    const code = `/api/forms/${form.id}/submit`;
                    navigator.clipboard?.writeText(code);
                    showToast("API endpoint copied to clipboard");
                  }}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "0.8125rem" }}
                >
                  📋 Copy Endpoint
                </button>
                <button
                  onClick={() => toggleActive(form)}
                  style={{
                    padding: "8px 14px", borderRadius: 8,
                    border: `1px solid ${form.settings.active ? "rgba(232,49,42,0.2)" : "rgba(52,211,153,0.2)"}`,
                    background: "transparent",
                    color: form.settings.active ? "#E8312A" : "#34D399",
                    cursor: "pointer", fontSize: "0.8125rem",
                  }}
                >
                  {form.settings.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setEditForm(form)}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(232,49,42,0.2)", background: "rgba(232,49,42,0.08)", color: "#E8312A", cursor: "pointer", fontSize: "0.8125rem" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(form.id)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "0.8125rem" }}
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
