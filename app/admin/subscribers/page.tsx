"use client";
import { useEffect, useState } from "react";

interface Subscriber {
  id: string;
  email: string;
  source: string;
  subscribedAt: string;
  status: "active" | "unsubscribed";
}

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message?: string;
  createdAt: string;
  status?: string;
}

type Tab = "subscribers" | "contacts" | "submissions";

interface FormSubmission {
  id: string;
  formId: string;
  formName: string;
  data: Record<string, string>;
  submittedAt: string;
  status: string;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "";
}

export default function SubscribersPage() {
  const [tab,         setTab]         = useState<Tab>("subscribers");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [contacts,    setContacts]    = useState<Contact[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState<Contact | null>(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const [subRes, conRes, submsRes] = await Promise.all([
          fetch("/api/subscribe",       { headers: { "x-admin-token": token() } }),
          fetch("/api/contact",         { headers: { "x-admin-token": token() } }),
          fetch("/api/admin/forms",     { headers: { "x-admin-token": token() } }),
        ]);
        const subData  = await subRes.json();
        const conData  = await conRes.json();
        const frmData  = await submsRes.json();

        setSubscribers(subData.subscribers || []);
        setContacts(conData.contacts || []);

        // Load all submissions across all forms
        if (frmData.forms && frmData.forms.length > 0) {
          const allSubs: FormSubmission[] = [];
          await Promise.all(
            frmData.forms.map(async (form: {id: string; name: string}) => {
              try {
                const r = await fetch(`/api/admin/forms?formId=${form.id}`, { headers: { "x-admin-token": token() } });
                const d = await r.json();
                allSubs.push(...(d.submissions || []));
              } catch { /* silent */ }
            })
          );
          allSubs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
          setSubmissions(allSubs);
        }
      } catch { /* silent */ }
      setLoading(false);
    }
    loadAll();
  }, []);

  const TABS: Array<{ id: Tab; label: string; count: number }> = [
    { id: "subscribers", label: "Subscribers",       count: subscribers.length },
    { id: "contacts",    label: "Contact Messages",   count: contacts.length    },
    { id: "submissions", label: "Form Submissions",   count: submissions.length },
  ];

  return (
    <div className="adm-page-main" style={{ padding: 32, minHeight: "100vh" }}>
      {/* Contact detail modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border2)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 520, position: "relative" }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--adm-muted)", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--adm-text)", marginBottom: 20 }}>{selected.name}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                ["Email", selected.email],
                ["Company", selected.company || "—"],
                ["Budget", selected.budget || "—"],
                ["Received", fmt(selected.createdAt)],
              ].map(([l, v]) => (
                <div key={l as string}>
                  <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--adm-text)" }}>{v}</div>
                </div>
              ))}
            </div>
            {selected.message && (
              <div>
                <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Message</div>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, margin: 0 }}>{selected.message}</p>
              </div>
            )}
            <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
              <a href={`mailto:${selected.email}`} style={{ padding: "9px 18px", borderRadius: 9, background: "linear-gradient(135deg,#E8312A,#FF6B1A)", color: "#fff", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none" }}>
                ✉ Reply
              </a>
              <button onClick={() => setSelected(null)} style={{ padding: "9px 18px", borderRadius: 9, border: "1px solid var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", cursor: "pointer", fontSize: "0.8125rem" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.03em" }}>
          Inbox &amp; Subscribers
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--adm-muted)", marginTop: 4 }}>
          All contact messages, subscribers, and form submissions in one place
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "9px 18px", borderRadius: 99, fontSize: "0.875rem", fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
              background: tab === t.id ? "rgba(232,49,42,0.12)" : "transparent",
              color: tab === t.id ? "#E8312A" : "rgba(255,255,255,0.5)",
              border: `1px solid ${tab === t.id ? "rgba(232,49,42,0.3)" : "rgba(255,255,255,0.08)"}`,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {t.label}
            <span style={{
              padding: "1px 7px", borderRadius: 99, fontSize: "0.625rem", fontWeight: 700,
              background: tab === t.id ? "rgba(232,49,42,0.2)" : "rgba(255,255,255,0.08)",
              color: tab === t.id ? "#E8312A" : "rgba(255,255,255,0.4)",
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--adm-muted)" }}>Loading…</div>
      ) : (
        <>
          {/* SUBSCRIBERS */}
          {tab === "subscribers" && (
            subscribers.length === 0 ? (
              <Empty icon="📧" title="No subscribers yet" desc="Subscribers from the blog and insights pages appear here." />
            ) : (
              <div>
                {/* Export hint */}
                <div style={{ marginBottom: 16, fontSize: "0.8125rem", color: "var(--adm-muted)" }}>
                  {subscribers.filter((s) => s.status === "active").length} active subscribers
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {subscribers.map((sub) => (
                    <div key={sub.id} style={{ padding: "14px 18px", background: "var(--adm-surface)", border: "1px solid var(--adm-border)", borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: sub.status === "active" ? "#34D399" : "#F87171", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: "0.875rem", color: "var(--adm-text)", fontWeight: 500 }}>{sub.email}</span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 99 }}>{sub.source}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--adm-muted)", flexShrink: 0 }}>{fmt(sub.subscribedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* CONTACTS */}
          {tab === "contacts" && (
            contacts.length === 0 ? (
              <Empty icon="✉️" title="No messages yet" desc="Contact form submissions from the website appear here." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {contacts.map((contact) => (
                  <div key={contact.id} onClick={() => setSelected(contact)}
                    style={{ padding: "16px 20px", background: "var(--adm-surface)", border: "1px solid var(--adm-border)", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "background 0.2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#141414"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0d0d0d"; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(232,49,42,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#E8312A", flexShrink: 0 }}>
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--adm-text)" }}>{contact.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                        {contact.email}{contact.company ? ` · ${contact.company}` : ""}
                      </div>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--adm-muted)", flexShrink: 0 }}>{fmt(contact.createdAt)}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                ))}
              </div>
            )
          )}

          {/* FORM SUBMISSIONS */}
          {tab === "submissions" && (
            submissions.length === 0 ? (
              <Empty icon="📋" title="No submissions yet" desc="Submissions from your custom forms appear here. Create forms in Form Builder." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {submissions.map((sub) => (
                  <div key={sub.id} style={{ padding: "14px 20px", background: "var(--adm-surface)", border: "1px solid var(--adm-border)", borderRadius: 12, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.875rem", color: "var(--adm-text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {Object.values(sub.data)[0] || "Unnamed submission"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 2 }}>
                        {sub.formName} · {Object.keys(sub.data).length} fields
                      </div>
                    </div>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(167,139,250,0.1)", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.2)" }}>
                      {sub.formName}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--adm-muted)", flexShrink: 0 }}>{fmt(sub.submittedAt)}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

function Empty({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 40px", background: "var(--adm-surface)", borderRadius: 16, border: "2px dashed rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: "3rem", marginBottom: 16 }}>{icon}</div>
      <h3 style={{ color: "var(--adm-text)", fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--adm-muted)", fontSize: "0.875rem" }}>{desc}</p>
    </div>
  );
}
