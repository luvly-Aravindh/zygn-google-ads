import { mapLeadFields } from "./leadFields.js";

/* Getnos Desk — landing page lead submit.
   Called once per form submit, straight from the browser.
   Each answer is its own JSON field. */

const DESK_URL = import.meta.env.VITE_DESK_URL || "https://deskbackend.getnos.io/v1/lead";
const API_KEY = import.meta.env.VITE_DESK_API_KEY || "lh_PfBvLDISEFqaWa4TsRZ--1yD5F4Mk1rZ6_mWdtUb7V0";
const SUBJECT = "New audit lead - zygn";

const NETWORK_FAIL = "Network error. Please check your connection and try again.";
const SAVE_FAIL = "We could not save your details right now. Please try again in a moment.";

let submitting = false;

/**
 * @param {Record<string, unknown>} fields flat lead answers (any custom keys OK)
 * @returns {Promise<{ status?: string, leadId?: string, duplicate?: boolean, skipped?: boolean, message?: string }>}
 */
export async function submitFlowLead(fields) {
  if (submitting) return { duplicate: true, skipped: true };
  submitting = true;

  try {
    const mapped = mapLeadFields({
      honeypot: fields.honeypot || "",
      page: typeof window !== "undefined" ? window.location.href : "",
      ...fields,
    });

    if (mapped.honeypot) return { status: "success", skipped: true };
    if (mapped.error) throw new Error(mapped.error);

    let res;
    try {
      res = await fetch(DESK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          form: "contact",
          honeypot: fields.honeypot || "",
          ...mapped.fields,
          subject: SUBJECT,
        }),
        keepalive: true,
      });
    } catch {
      throw new Error(NETWORK_FAIL);
    }

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    // Desk ignores identical payloads for ~15 min — treat as success
    if (data.duplicate) return { ...data, status: "success" };

    if (!res.ok) {
      throw new Error(res.status === 400 && data.message ? data.message : SAVE_FAIL);
    }

    return data; // { status: "success", leadId }
  } finally {
    submitting = false;
  }
}
