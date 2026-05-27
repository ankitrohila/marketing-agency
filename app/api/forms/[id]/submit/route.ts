import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FORMS_FILE       = path.join(process.cwd(), "data", "forms.json");
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Find the form
  const forms = readJSON(FORMS_FILE, []) as Array<{id: string; settings?: {active?: boolean}; submissionsCount?: number}>;
  const form = forms.find((f) => f.id === id);
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }
  if (form.settings?.active === false) {
    return NextResponse.json({ error: "This form is no longer active" }, { status: 403 });
  }

  const body = await req.json();

  // Save submission
  const submissions = readJSON(SUBMISSIONS_FILE, []) as Array<unknown>;
  const newSubmission = {
    id: crypto.randomUUID(),
    formId: id,
    formName: (form as unknown as {name: string}).name,
    data: body,
    submittedAt: new Date().toISOString(),
    ip: req.headers.get("x-forwarded-for") || "unknown",
    status: "new",
  };

  (submissions as unknown[]).unshift(newSubmission);
  writeJSON(SUBMISSIONS_FILE, submissions);

  // Increment counter on form
  const formIdx = forms.findIndex((f) => f.id === id);
  if (formIdx !== -1) {
    forms[formIdx].submissionsCount = (forms[formIdx].submissionsCount || 0) + 1;
    writeJSON(FORMS_FILE, forms);
  }

  return NextResponse.json({
    success: true,
    message: (form as unknown as {settings?: {successMessage?: string}}).settings?.successMessage || "Thank you for your submission!",
  });
}
