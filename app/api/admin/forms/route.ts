import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FORMS_FILE       = path.join(process.cwd(), "data", "forms.json");
const SUBMISSIONS_FILE = path.join(process.cwd(), "data", "form_submissions.json");
const CONTACTS_FILE    = path.join(process.cwd(), "data", "contacts.json");
const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");
const LEADS_FILE       = path.join(process.cwd(), "data", "leads.json");
const BOOKINGS_FILE    = path.join(process.cwd(), "data", "bookings.json");

function readJSON(filePath: string, defaultVal: unknown = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return defaultVal;
  }
}

function writeJSON(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/* ── Helpers: read counts for built-in forms ── */
function getCount(filePath: string, key: string): number {
  try {
    if (!fs.existsSync(filePath)) return 0;
    const db = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return Array.isArray(db[key]) ? db[key].length : 0;
  } catch { return 0; }
}

/* ── Normalize built-in data sources → Submission shape ── */
interface Submission {
  id: string;
  formId: string;
  formName: string;
  data: Record<string, string>;
  submittedAt: string;
  status: string;
}

function contactsAsSubmissions(): Submission[] {
  try {
    if (!fs.existsSync(CONTACTS_FILE)) return [];
    const db = JSON.parse(fs.readFileSync(CONTACTS_FILE, "utf-8"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (db.contacts || []).map((c: any) => ({
      id:          c.id,
      formId:      "contact-form",
      formName:    "Contact / Start a Project",
      data: {
        "Name":    c.name    || "",
        "Email":   c.email   || "",
        "Company": c.company || "",
        "Budget":  c.budget  || "",
        "Message": c.message || "",
      },
      submittedAt: c.createdAt || new Date().toISOString(),
      status:      c.status   || "new",
    }));
  } catch { return []; }
}

function subscribersAsSubmissions(): Submission[] {
  try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) return [];
    const db = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (db.subscribers || []).map((s: any) => ({
      id:          s.id,
      formId:      "newsletter-subscribe",
      formName:    "Email Newsletter Subscription",
      data: {
        "Email Address": s.email  || "",
        "Source":        s.source || "",
      },
      submittedAt: s.subscribedAt || new Date().toISOString(),
      status:      s.status       || "active",
    }));
  } catch { return []; }
}

function leadsAsSubmissions(): Submission[] {
  try {
    if (!fs.existsSync(LEADS_FILE)) return [];
    const db = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (db.leads || []).map((l: any) => ({
      id:          l.id,
      formId:      "lead-capture",
      formName:    "Lead Capture Modal",
      data: {
        "Name":    l.name    || "",
        "Email":   l.email   || "",
        "Company": l.company || "",
        "Phone":   l.phone   || "",
        "Service": l.service || "",
        "Budget":  l.budget  || "",
        "Message": l.message || "",
      },
      submittedAt: l.createdAt || new Date().toISOString(),
      status:      l.status    || "new",
    }));
  } catch { return []; }
}

function bookingsAsSubmissions(): Submission[] {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) return [];
    const db = JSON.parse(fs.readFileSync(BOOKINGS_FILE, "utf-8"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (db.bookings || []).map((b: any) => ({
      id:          b.id,
      formId:      "booking-modal",
      formName:    "Book a Session",
      data: {
        "Name":    b.name    || "",
        "Email":   b.email   || "",
        "Phone":   b.phone   || "",
        "Company": b.company || "",
        "Service": b.service || "",
        "Date":    b.date    || "",
        "Time":    b.time    || "",
        "Notes":   b.notes   || "",
        "Zoom":    b.zoomLink || "",
      },
      submittedAt: b.createdAt || new Date().toISOString(),
      status:      b.status    || "confirmed",
    }));
  } catch { return []; }
}

// GET: list all forms OR get submissions for a specific form
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const formId = searchParams.get("formId");

  if (formId) {
    /* ── Built-in forms: serve from their own data sources ── */
    if (formId === "contact-form") {
      const subs = contactsAsSubmissions();
      return NextResponse.json({ submissions: subs, total: subs.length });
    }
    if (formId === "newsletter-subscribe") {
      const subs = subscribersAsSubmissions();
      return NextResponse.json({ submissions: subs, total: subs.length });
    }
    if (formId === "lead-capture") {
      const subs = leadsAsSubmissions();
      return NextResponse.json({ submissions: subs, total: subs.length });
    }
    if (formId === "booking-modal") {
      const subs = bookingsAsSubmissions();
      return NextResponse.json({ submissions: subs, total: subs.length });
    }

    /* ── Custom (builder) form submissions ── */
    const submissions = readJSON(SUBMISSIONS_FILE, []) as Array<{ formId: string }>;
    const formSubmissions = submissions.filter((s) => s.formId === formId);
    return NextResponse.json({ submissions: formSubmissions, total: formSubmissions.length });
  }

  /* ── List all forms + real built-in counts ── */
  const forms = readJSON(FORMS_FILE, []);
  const builtInCounts: Record<string, number> = {
    "contact-form":         getCount(CONTACTS_FILE,    "contacts"),
    "newsletter-subscribe": getCount(SUBSCRIBERS_FILE, "subscribers"),
    "lead-capture":         getCount(LEADS_FILE,       "leads"),
    "booking-modal":        getCount(BOOKINGS_FILE,    "bookings"),
  };
  return NextResponse.json({ forms, total: forms.length, builtInCounts });
}

// POST: create a new form
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, fields, settings } = body;

  if (!name || !fields || !Array.isArray(fields)) {
    return NextResponse.json({ error: "Name and fields are required" }, { status: 400 });
  }

  const forms = readJSON(FORMS_FILE, []) as Array<unknown>;
  const newForm = {
    id: crypto.randomUUID(),
    name,
    description: description || "",
    fields,
    settings: settings || {
      submitText: "Submit",
      successMessage: "Thank you! Your response has been recorded.",
      notifyEmail: "",
      active: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submissionsCount: 0,
  };

  (forms as unknown[]).unshift(newForm);
  writeJSON(FORMS_FILE, forms);

  return NextResponse.json({ form: newForm }, { status: 201 });
}

// PUT: update a form
export async function PUT(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Form ID required" }, { status: 400 });

  const forms = readJSON(FORMS_FILE, []) as Array<{ id: string; updatedAt: string }>;
  const idx = forms.findIndex((f) => f.id === id);
  if (idx === -1) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  forms[idx] = { ...forms[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJSON(FORMS_FILE, forms);

  return NextResponse.json({ form: forms[idx] });
}

// DELETE: remove a form
export async function DELETE(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const forms = readJSON(FORMS_FILE, []) as Array<{ id: string }>;
  const updated = forms.filter((f) => f.id !== id);
  writeJSON(FORMS_FILE, updated);

  return NextResponse.json({ success: true });
}
