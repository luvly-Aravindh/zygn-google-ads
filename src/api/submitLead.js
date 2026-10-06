import { parseLeadBody } from "../../server/leadFields.js";

// Getnos Desk lead endpoint, called straight from the browser (the live site is
// static hosting, so there is no /api/submit-lead server behind it).
// The "lh_" key is Desk's lead-submit key, meant for landing pages. Desk only
// accepts it from origins allowed for this project (CORS).
// Override at build time with VITE_DESK_URL / VITE_DESK_API_KEY.
const DESK_URL = import.meta.env.VITE_DESK_URL || "https://deskbackend.getnos.io/v1/lead";
const DESK_API_KEY = import.meta.env.VITE_DESK_API_KEY || "lh_HjY-Yfabz8TZOuCKwki7kPuvWIucgyTiAInzvDGKDNA";

const NETWORK_FAIL = "Network error. Please check your connection and try again.";
const SAVE_FAIL = "We could not save your details right now. Please try again in a moment.";

let submitting = false;

/**
 * Validate, map and send one lead to Desk.
 * Throws an Error whose message is safe to show to the visitor.
 * @param {Record<string, unknown>} fields
 * @returns {Promise<{ status?: string, leadId?: string, duplicate?: boolean, skipped?: boolean, message?: string }>}
 */
export async function submitFlowLead(fields) {
  if (submitting) {
    console.warn("[desk] Submit already in progress");
    return { duplicate: true, skipped: true };
  }
  submitting = true;

  try {
    const parsed = parseLeadBody({
      honeypot: fields.honeypot || "",
      page: typeof window !== "undefined" ? window.location.href : "",
      ...fields,
    });

    if (parsed.honeypot) return { status: "success", skipped: true };
    if (parsed.error) throw new Error(parsed.error.message);

    const { deskFields } = parsed;
    console.log("[desk] Sending lead", { name: deskFields.name, email: deskFields.email, form_type: deskFields.form_type });

    let res;
    try {
      res = await fetch(DESK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DESK_API_KEY}`,
        },
        body: JSON.stringify(deskFields),
        keepalive: true,
      });
    } catch (networkErr) {
      console.error("[desk] Request failed:", networkErr);
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
      console.error("[desk] Rejected:", res.status, data);
      throw new Error(res.status === 400 && data.message ? data.message : SAVE_FAIL);
    }

    console.log("[desk] Lead accepted:", data.leadId);
    return data; // { status: "success", leadId }
  } finally {
    submitting = false;
  }
}
