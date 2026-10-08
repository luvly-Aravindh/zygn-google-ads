import { useState, useEffect, useCallback, useRef } from "react";
import Logo from "../assets/logo.png";
import { submitFlowLead } from "../api/submitLead.js";

// ─── CSS ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

  :root {
    --bg: #060708;
    --s1: #0f1012;
    --s2: #15161a;
    --s3: #1c1d22;
    --border: rgba(255,255,255,0.065);
    --border-h: rgba(255,30,30,0.38);
    --red: #FF1F1F;
    --red-bg: rgba(255,30,30,0.10);
    --red-glow: rgba(255,30,30,0.20);
    --white: #ffffff;
    --muted: rgba(255,255,255,0.75);
    --dim: rgba(255,255,255,0.2);
    --r: 13px;
    --rs: 9px;
  }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

  .zygn-root {
    font-family: 'Sora', sans-serif;
    background: var(--bg);
    color: var(--white);
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 20px 16px;
    overflow-x: hidden;
    position: relative;
  }

  .zygn-root::before {
    content: ''; position: fixed;
    width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,30,30,0.055) 0%, transparent 60%);
    top: -200px; right: -180px; pointer-events: none; z-index: 0;
  }
  .zygn-root::after {
    content: ''; position: fixed;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,30,30,0.032) 0%, transparent 60%);
    bottom: -150px; left: -100px; pointer-events: none; z-index: 0;
  }

  .grid-bg {
    position: fixed; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px);
    background-size: 26px 26px;
    pointer-events: none; z-index: 0;
  }

  .shell {
    position: relative; z-index: 1;
    width: 100%; max-width: 584px;
  }

  /* HEADER */
  .hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
  .logo { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; letter-spacing: -0.04em; color: var(--white); user-select: none; }
  .logo img { height: 30px; width: auto; display: block; }
  .logo-text em { font-style: normal; color: var(--red); }
  .qcount { font-size: 12px; font-weight: 500; color: var(--muted); letter-spacing: 0.03em; opacity: 0; transition: opacity 0.3s; }
  .qcount.show { opacity: 1; }

  /* PROGRESS */
  .prog-rail { height: 2px; background: var(--border); border-radius: 99px; margin-bottom: 40px; position: relative; overflow: visible; }
  .prog-bar {
    height: 100%; border-radius: 99px;
    background: var(--red);
    box-shadow: 0 0 8px rgba(255,30,30,0.65);
    transition: width 0.42s cubic-bezier(0.4,0,0.2,1);
    position: relative;
  }
  .prog-bar::after {
    content: ''; position: absolute; right: -1px; top: 50%; transform: translateY(-50%);
    width: 5px; height: 5px; background: var(--red); border-radius: 50%;
    box-shadow: 0 0 6px rgba(255,30,30,1);
  }

  /* STEP TRANSITIONS */
  .step-enter { animation: stepIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
  .step-exit  { animation: stepOut 0.2s cubic-bezier(0.4,0,1,1) both; }
  @keyframes stepIn  { from { opacity:0; transform: translateY(20px) scale(.99) } to { opacity:1; transform: translateY(0) scale(1) } }
  @keyframes stepOut { from { opacity:1; transform: translateY(0) } to { opacity:0; transform: translateY(-12px) } }

  /* BACK */
  .back {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'Sora', sans-serif; font-size: 12.5px; font-weight: 400;
    color: var(--muted); background: none; border: none; cursor: pointer;
    padding: 4px 0; margin-bottom: 26px; transition: color .15s;
    -webkit-tap-highlight-color: transparent;
  }
  .back:hover { color: rgba(255,255,255,.7); }
  .back svg { width: 14px; height: 14px; }

  /* QUESTION COPY */
  .eyebrow {
    display: block; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #ff2b2b; margin-bottom: 16px;
  }
  .q {
    font-size: clamp(20px, 3.8vw, 27px); font-weight: 700;
    letter-spacing: -0.03em; line-height: 1.23;
    color: var(--white); margin-bottom: 9px;
  }
  .sub {
    font-size: 13.5px; font-weight: 300;
    color: rgba(255,255,255,0.72); line-height: 1.68;
    margin-bottom: 28px; max-width: 440px;
  }
  .sub strong { color: #ffffff; font-weight: 600; }

  /* TEXT INPUTS */
  .inp-row { display: flex; flex-direction: column; gap: 10px; }
  .inp-group { display: flex; flex-direction: column; gap: 6px; }
  .inp-label { font-size: 11px; font-weight: 500; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; }
  .inp-field {
    width: 100%; padding: 14px 18px;
    font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 400;
    color: var(--white); background: var(--s1);
    border: 1px solid var(--border); border-radius: var(--r);
    outline: none; caret-color: var(--red);
    transition: border-color .18s, box-shadow .18s; -webkit-appearance: none;
  }
  .inp-field::placeholder { color: var(--dim); }
  .inp-field:focus {
    border-color: rgba(255,30,30,.45);
    box-shadow: 0 0 0 3px var(--red-bg);
  }
  .phone-wrap { display: flex; gap: 10px; align-items: stretch; }
  .country-pre {
    display: flex; align-items: center; padding: 14px 16px;
    background: var(--s1); border: 1px solid var(--border);
    border-radius: var(--r); font-size: 14px; font-weight: 500;
    color: var(--muted); white-space: nowrap; flex-shrink: 0; user-select: none;
  }
  .phone-wrap .inp-field { flex: 1; }

  /* SINGLE-SELECT OPTIONS */
  .opts { display: flex; flex-direction: column; gap: 8px; }
  .opts.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .opt {
    display: flex; align-items: center; gap: 13px;
    padding: 13px 15px;
    background: var(--s1); border: 1px solid var(--border); border-radius: var(--r);
    cursor: pointer; text-align: left; color: var(--white);
    font-family: 'Sora', sans-serif; width: 100%;
    transition: background .11s, border-color .11s, transform .11s;
    -webkit-tap-highlight-color: transparent;
  }
  .opt:hover { background: var(--s2); border-color: var(--border-h); transform: translateY(-1px); }
  .opt:active { transform: translateY(0); }
  .opt.on { background: var(--red-bg); border-color: var(--red); box-shadow: 0 0 0 1px rgba(255,30,30,.28); }
  .opt .tl { font-size: 13.5px; font-weight: 500; line-height: 1.3; }
  .opt .ds { font-size: 11.5px; font-weight: 300; color: var(--muted); margin-top: 2px; line-height: 1.45; }
  .opts.g2 .opt { padding: 15px 16px; flex-direction: column; align-items: flex-start; gap: 4px; }
  .opts.g2 .opt .tl { font-size: 14px; font-weight: 600; }
  .full-col { grid-column: 1 / -1; }

  /* MULTI-SELECT MODULES */
  .mod-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .mod {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    background: var(--s1); border: 1px solid var(--border); border-radius: var(--r);
    cursor: pointer; text-align: left; color: var(--white);
    font-family: 'Sora', sans-serif; width: 100%;
    transition: background .11s, border-color .11s;
    -webkit-tap-highlight-color: transparent;
  }
  .mod:hover { background: var(--s2); border-color: rgba(255,30,30,.2); }
  .mod.on { background: var(--red-bg); border-color: var(--red); }
  .mod .tl { font-size: 12.5px; font-weight: 500; line-height: 1.3; }
  .mod-hint { font-size: 13.5px; color: var(--muted); margin-bottom: 16px; font-weight: 300; line-height: 1.68; }

  /* OTHER INPUT REVEAL */
  .reveal {
    overflow: hidden; max-height: 0; opacity: 0;
    transition: max-height .25s ease, opacity .2s ease, margin-top .25s ease;
    margin-top: 0;
  }
  .reveal.open { max-height: 120px; opacity: 1; margin-top: 10px; }

  /* BUDGET CARDS */
  .budget-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .budget-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 22px 16px; gap: 8px;
    background: var(--s1); border: 1px solid var(--border); border-radius: var(--r);
    cursor: pointer; font-family: 'Sora', sans-serif;
    transition: background .11s, border-color .11s, transform .11s;
    -webkit-tap-highlight-color: transparent;
  }
  .budget-card:hover { background: var(--s2); border-color: var(--border-h); transform: translateY(-1px); }
  .budget-card.on { background: var(--red-bg); border-color: var(--red); }
  .budget-card:disabled { opacity: .5; cursor: not-allowed; }
  .budget-card .emo { font-size: 26px; }
  .budget-card .bl { font-size: 14px; font-weight: 600; color: var(--white); }
  .budget-card .bd { font-size: 11.5px; font-weight: 300; color: var(--muted); margin-top: 2px; text-align: center; line-height: 1.4; }

  .flow-msg { font-size: 12px; color: var(--red); margin-top: 14px; text-align: center; font-weight: 400; }

  /* BUTTONS */
  .btn {
    width: 100%; padding: 15px 22px;
    font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 600;
    letter-spacing: 0.01em; color: var(--white); background: var(--red);
    border: none; border-radius: var(--r); cursor: pointer;
    box-shadow: 0 4px 20px rgba(255,30,30,.26);
    transition: background .14s, transform .11s, box-shadow .14s, opacity .14s;
    margin-top: 16px; -webkit-tap-highlight-color: transparent;
  }
  .btn:hover:not(:disabled) { background: #ff3535; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(255,30,30,.38); }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity: .3; cursor: not-allowed; box-shadow: none; transform: none; }
  .btn.ghost {
    background: transparent; border: 1px solid rgba(255,255,255,.12);
    box-shadow: none; color: var(--muted); font-weight: 400;
  }
  .btn.ghost:hover:not(:disabled) { color: rgba(255,255,255,.7); border-color: rgba(255,255,255,.22); background: transparent; box-shadow: none; }

  /* RESULT */
  .result { text-align: center; padding: 12px 0 8px; }
  .emblem { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 26px; }
  .emblem.go { background: var(--red-bg); border: 1px solid rgba(255,30,30,.3); box-shadow: 0 0 40px rgba(255,30,30,.13); }
  .emblem.read { background: rgba(255,255,255,.04); border: 1px solid var(--border); }
  .res-h { font-size: clamp(21px, 3.8vw, 27px); font-weight: 700; letter-spacing: -0.04em; margin-bottom: 13px; line-height: 1.2; }
  .res-b { font-size: 14px; font-weight: 300; color: var(--muted); line-height: 1.72; margin-bottom: 32px; max-width: 380px; margin-left: auto; margin-right: auto; }
  .res-b strong { color: var(--white); font-weight: 500; }
  .links { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
  .link-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 17px;
    background: var(--s1); border: 1px solid var(--border); border-radius: var(--r);
    text-decoration: none; color: var(--white); font-size: 13.5px; font-weight: 500;
    transition: background .11s, border-color .11s;
  }
  .link-row:hover { background: var(--s2); border-color: rgba(255,30,30,.2); }
  .link-row svg { width: 14px; height: 14px; color: var(--muted); flex-shrink: 0; }
  .note { font-size: 11.5px; color: var(--dim); font-weight: 300; margin-top: 11px; }
  .divider { display: flex; align-items: center; gap: 12px; color: var(--dim); font-size: 11px; margin: 18px 0; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* DISQUALIFY EARLY */
  .dis-notice {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; background: rgba(255,255,255,.03);
    border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 20px;
  }
  .dis-notice svg { width: 16px; height: 16px; color: var(--muted); flex-shrink: 0; margin-top: 1px; }
  .dis-notice p { font-size: 13px; font-weight: 300; color: var(--muted); line-height: 1.6; }

  @media (max-width: 460px) {
    .opts.g2 { grid-template-columns: 1fr 1fr; }
    .mod-grid { grid-template-columns: 1fr 1fr; }
    .budget-opts { grid-template-columns: 1fr 1fr; }
    .q { font-size: 19px; }
  }
`;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const GA_ID = "G-WSRR2JGD27";

const BackArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

function trackThankYou() {
  if (typeof window.gtag !== "function") return;
  window.gtag("config", GA_ID, {
    page_title: "Thank you",
    page_path: "/thank-you",
  });
  window.gtag("event", "generate_lead");
}

// ─── STEP WRAPPER ─────────────────────────────────────────────────────────────
function Step({ children, animating }) {
  return (
    <div className={animating ? "step-exit" : "step-enter"}>
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ZygnQuestionnaire() {

  const [cur, setCur] = useState("s2");
  const [animating, setAnimating] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studioName, setStudioName] = useState("");
  const [studioCity, setStudioCity] = useState("");
  const [phone, setPhone] = useState("");
  const [team, setTeam] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flowMsg, setFlowMsg] = useState("");
  const thankYouTracked = useRef(false);

  // ── carry the mobile number forward from Pop.jsx ───────────────────────────
  useEffect(() => {
    const fromState = location.state?.mobile;
    const fromStorage = localStorage.getItem("mobile");
    const carried = fromState || fromStorage || "";
    if (carried) setPhone(carried);
  }, [location.state]);

  // Thank-you screen is in-app, so send a virtual page view plus a lead event once.
  useEffect(() => {
    if (cur !== "s-demo" || thankYouTracked.current) return;
    thankYouTracked.current = true;
    trackThankYou();
  }, [cur]);

  // Inject styles once
  useEffect(() => {
    const id = "zygn-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = css;
      document.head.appendChild(el);
    }
  }, []);

  const canContinue =
    fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.length === 10 &&
    studioName.trim().length >= 2 &&
    studioCity.trim().length >= 2;

  const canSubmit = Boolean(team && timeline && budget);

  const step = cur === "s2" ? 1 : cur === "s3" ? 2 : 0;

  // ── navigation ────────────────────────────────────────────────────────────
  const navigate = useCallback((to) => {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      setCur(to);
    }, 200);
  }, []);

  const submitFlowForm = useCallback(async () => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    setFlowMsg("");

    const submissionData = {
      form_type: "google_ads",
      country_code: "+91",
      mobile: phone,
      full_name: fullName,
      email,
      studio_name: studioName,
      studio_city: studioCity,
      team,
      timeline,
      budget,
    };

    try {
      const data = await submitFlowLead(submissionData);

      if (data.duplicate || data.status === "success" || data.skipped) {
        return true;
      }

      setFlowMsg(data.message || "Submission failed. Please try again.");
      return false;
    } catch (submitError) {
      setFlowMsg(submitError?.message || "Network error. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, phone, fullName, email, studioName, studioCity, team, timeline, budget]);

  const submitContact = useCallback(async () => {
    if (!canSubmit || isSubmitting) return;
    const submitted = await submitFlowForm();
    if (submitted) navigate("s-demo");
  }, [canSubmit, isSubmitting, submitFlowForm, navigate]);

  // ── render screens ────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (cur) {
      case "s2": return (
        <>
          <div className="q">Tell us where to reach you.</div>
          <div className="sub">Name, company, and where the studio works.</div>
          <div className="inp-row">
            <div className="inp-group">
              <div className="inp-label">Name</div>
              <input className="inp-field" type="text" placeholder="e.g. Rohan Mehta" maxLength={80}
                value={fullName} onChange={e => setFullName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") document.getElementById("email-input")?.focus(); }}
              />
            </div>
            <div className="inp-group">
              <div className="inp-label">Email</div>
              <input id="email-input" className="inp-field" type="email" placeholder="you@studio.com" maxLength={120}
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") document.getElementById("phone-input")?.focus(); }}
              />
            </div>
            <div className="inp-group">
              <div className="inp-label">Phone number</div>
              <div className="phone-wrap">
                <div className="country-pre">+91</div>
                <input id="phone-input" className="inp-field" type="tel" placeholder="98765 43210" maxLength={10} inputMode="numeric"
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={e => { if (e.key === "Enter") document.getElementById("company-input")?.focus(); }}
                />
              </div>
            </div>
            <div className="inp-group">
              <div className="inp-label">Company name</div>
              <input id="company-input" className="inp-field" type="text" placeholder="e.g. Forma Design Studio" maxLength={80}
                value={studioName} onChange={e => setStudioName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") document.getElementById("city-input")?.focus(); }}
              />
            </div>
            <div className="inp-group">
              <div className="inp-label">City</div>
              <input id="city-input" className="inp-field" type="text" placeholder="e.g. Bangalore" maxLength={60}
                value={studioCity} onChange={e => setStudioCity(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && canContinue) navigate("s3"); }}
              />
            </div>
            <button className="btn" disabled={!canContinue} onClick={() => navigate("s3")}>Continue</button>
          </div>
        </>
      );

      case "s3": return (
        <>
          <button className="back" onClick={() => setCur("s2")}><BackArrow />Back</button>
          <div className="q">A bit about the team.</div>
          <div className="sub">Team size, timing, and budget.</div>

          <div className="inp-label" style={{ marginBottom: 8 }}>How many people are on the team?</div>
          <div className="opts g2" style={{ marginBottom: 18 }}>
            {[
              { val: "s5", tl: "1 to 5" },
              { val: "s14", tl: "6 to 14" },
              { val: "s30", tl: "15 to 30" },
              { val: "s60", tl: "31 to 60" },
              { val: "s60plus", tl: "More than 60", wide: true },
            ].map(o => (
              <button key={o.val} className={`opt${o.wide ? " full-col" : ""}${team === o.val ? " on" : ""}`} onClick={() => setTeam(o.val)}>
                <div className="tl">{o.tl}</div>
              </button>
            ))}
          </div>

          <div className="inp-label" style={{ marginBottom: 8 }}>When are you looking to start?</div>
          <div className="opts" style={{ marginBottom: 18 }}>
            {[
              { val: "now", tl: "This month" },
              { val: "q90", tl: "Within the next 90 days" },
              { val: "exploring", tl: "Just exploring for now" },
            ].map(o => (
              <button key={o.val} className={`opt${timeline === o.val ? " on" : ""}`} onClick={() => setTimeline(o.val)}>
                <div className="tl">{o.tl}</div>
              </button>
            ))}
          </div>

          <div className="inp-label" style={{ marginBottom: 8 }}>Does ₹4–6K per person a year fit?</div>
          <div className="budget-opts">
            <button className={`budget-card${budget === "yes" ? " on" : ""}`} onClick={() => setBudget("yes")}>
              <div className="bl">Yes, that fits</div>
            </button>
            <button className={`budget-card${budget === "no" ? " on" : ""}`} onClick={() => setBudget("no")}>
              <div className="bl">Not at this stage</div>
            </button>
          </div>

          <button className="btn" style={{ marginTop: 18 }} disabled={!canSubmit || isSubmitting} onClick={submitContact}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          {flowMsg && <p className="flow-msg">{flowMsg}</p>}
        </>
      );

      case "s-demo": return (
        <div className="result">
          <div className="emblem go">✅</div>
          <div className="res-h">You're all set.</div>
          <div className="res-b">Thank you! Your details have been successfully submitted.</div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="zygn-root">
      <div className="grid-bg" />
      <div className="shell">
        {/* HEADER */}
        <div className="hdr">
          <div className="logo">
            <img src={Logo} alt="Zygn" onError={e => e.target.style.display = "none"} />
            <span className="logo-text">zygn</span>
          </div>
          <div className={`qcount${step ? " show" : ""}`}>{step ? `Step ${step} of 2` : ""}</div>
        </div>

        {step > 0 && (
          <div className="prog-rail">
            <div className="prog-bar" style={{ width: `${(step / 2) * 100}%` }} />
          </div>
        )}

        {/* STEP CONTENT */}
        <Step animating={animating}>
          {renderScreen()}
        </Step>
      </div>
    </div>
  );
}