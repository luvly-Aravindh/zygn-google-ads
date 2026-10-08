const TEAM_MAP = {
  s5: "1 to 5",
  s14: "6 to 14",
  s30: "15 to 30",
  s60: "31 to 60",
  s60plus: "More than 60",
};

const TIMELINE_MAP = {
  now: "This month",
  q90: "Within the next 90 days",
  exploring: "Just exploring for now",
};

const BUDGET_MAP = {
  yes: "Yes, that fits",
  no: "Not at this stage",
};

function label(value, map) {
  if (!value) return "";
  return map[value] ?? value;
}

function field(obj, keys) {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

/**
 * Turn the form answers into flat Desk columns.
 * @returns {{ honeypot?: boolean, error?: string, fields?: Record<string, string> }}
 */
export function mapLeadFields(body) {
  const fullName = field(body, ["full_name", "fullname", "name"]);
  const email = field(body, ["email"]).replace(/[\r\n]/g, "");
  const mobile = field(body, ["mobile", "phone"]);
  const countryCode = field(body, ["country_code"]) || "+91";
  const studioName = field(body, ["studio_name", "company"]);
  const studioCity = field(body, ["studio_city", "city"]);
  const team = field(body, ["team"]);
  const timeline = field(body, ["timeline"]);
  const budget = field(body, ["budget"]);
  const formType = field(body, ["form_type"]) || "google_ads";
  const page = field(body, ["page", "landing_page"]);
  const honeypot = field(body, ["honeypot"]);

  if (honeypot) return { honeypot: true };
  if (!fullName || fullName.length < 2) return { error: "Enter your full name" };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email" };
  if (!mobile || String(mobile).replace(/\D/g, "").length < 10) {
    return { error: "Enter valid phone number" };
  }
  if (!studioName || studioName.length < 2) return { error: "Enter your company name" };
  if (!studioCity || studioCity.length < 2) return { error: "Enter your city" };
  if (!team) return { error: "Choose your team size" };
  if (!timeline) return { error: "Choose a timeline" };
  if (!budget) return { error: "Choose a budget option" };

  return {
    fields: {
      name: fullName.replace(/[\r\n]/g, ""),
      email,
      phone: `${countryCode}${mobile}`,
      country_code: countryCode,
      studio_name: studioName,
      studio_city: studioCity,
      team_size: label(team, TEAM_MAP),
      timeline: label(timeline, TIMELINE_MAP),
      budget: label(budget, BUDGET_MAP),
      form_type: formType,
      landing_page: page || "Not provided",
    },
  };
}
