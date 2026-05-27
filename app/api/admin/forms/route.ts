import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FORMS_FILE = path.join(process.cwd(), "data", "forms.json");
const SUBMISSIONS_FILE = path.join(process.cwd(), "data", "form_submissions.json");

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

// GET: list all forms
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const formId = searchParams.get("formId");

  if (formId) {
    // Return submissions for a specific form
    const submissions = readJSON(SUBMISSIONS_FILE, []) as Array<{formId: string}>;
    const formSubmissions = submissions.filter((s) => s.formId === formId);
    return NextResponse.json({ submissions: formSubmissions, total: formSubmissions.length });
  }

  const forms = readJSON(FORMS_FILE, []);
  return NextResponse.json({ forms, total: forms.length });
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

  const forms = readJSON(FORMS_FILE, []) as Array<{id: string; updatedAt: string}>;
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

  const forms = readJSON(FORMS_FILE, []) as Array<{id: string}>;
  const updated = forms.filter((f) => f.id !== id);
  writeJSON(FORMS_FILE, updated);

  return NextResponse.json({ success: true });
}
