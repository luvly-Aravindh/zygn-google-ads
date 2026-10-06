import {
  ROLE_MAP,
  TEAM_MAP,
  PROJECTS_MAP,
  BUSINESS_MAP,
  TOOLS_MAP,
  TIMELINE_MAP,
  BUDGET_MAP,
  getLabel,
  getModulesLabel,
} from "./leadMaps.js";

function field(obj, keys) {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function normalizeModules(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

/**
 * Turn the flow answers into flat Desk columns.
 * @returns {{ honeypot?: boolean, error?: string, fields?: Record<string, string> }}
 */
export function mapLeadFields(body) {
  const fullName = field(body, ["full_name", "fullname", "name"]);
  const email = field(body, ["email"]).replace(/[\r\n]/g, "");
  const mobile = field(body, ["mobile", "phone"]);
  const countryCode = field(body, ["country_code"]) || "+91";
  const studioName = field(body, ["studio_name"]);
  const studioCity = field(body, ["studio_city", "city"]);
  const role = field(body, ["role"]);
  const team = field(body, ["team"]);
  const projects = field(body, ["projects"]);
  const businessType = field(body, ["business_type", "biz"]);
  const modules = normalizeModules(body.modules);
  const tools = field(body, ["tools"]);
  const toolOther = field(body, ["tool_other"]);
  const timeline = field(body, ["timeline"]);
  const budget = field(body, ["budget"]);
  const formType = field(body, ["form_type"]) || "flow";
  const page = field(body, ["page", "landing_page"]);
  const honeypot = field(body, ["honeypot"]);

  if (honeypot) return { honeypot: true };
  if (!fullName || fullName.length < 2) return { error: "Enter your full name" };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email" };
  if (!mobile || String(mobile).replace(/\D/g, "").length < 10) {
    return { error: "Enter valid phone number" };
  }

  const fields = {
    name: fullName.replace(/[\r\n]/g, ""),
    email,
    phone: `${countryCode}${mobile}`,
    country_code: countryCode,
    studio_name: studioName || "Not provided",
    studio_city: studioCity || "Not provided",
    current_role: getLabel(role, ROLE_MAP),
    team_size: getLabel(team, TEAM_MAP),
    projects: getLabel(projects, PROJECTS_MAP),
    business_type: getLabel(businessType, BUSINESS_MAP),
    modules: getModulesLabel(modules),
    tools: getLabel(tools, TOOLS_MAP),
    timeline: getLabel(timeline, TIMELINE_MAP),
    budget: getLabel(budget, BUDGET_MAP),
    form_type: formType,
    landing_page: page || "Not provided",
  };

  if (tools === "software" && toolOther) {
    fields.tool_other = toolOther;
  }

  return { fields };
}
