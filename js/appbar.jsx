import { useState } from "react";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ico = ({ n, s = 20 }) => {
  const map = {
    grid:    <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    bars:    <><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></>,
    plus:    <><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>,
    pulse:   <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    trend:   <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    cog:     <><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      {map[n]}
    </svg>
  );
};

const NAV = [
  { id: "dashboard", label: "Dashboard",       icon: "grid"  },
  { id: "budget",    label: "Budget",           icon: "bars"  },
  { id: "add",       label: "Add Transaction",  icon: "plus", special: true },
  { id: "activity",  label: "Activity",         icon: "pulse" },
  { id: "report",    label: "Financial Report", icon: "trend" },
];

// ── AppBar ────────────────────────────────────────────────────────────────────
export default function AppBar({ activePage = "budget", onNavigate }) {
  const [active, setActive] = useState(activePage);

  const navigate = (id) => {
    setActive(id);
    onNavigate?.(id);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-btn {
          all: unset;
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: rgba(255,255,255,0.72);
          transition: background 0.15s, color 0.15s;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.05); }
        .nav-btn.active {
          background: rgba(222, 92, 92, 0.18);
          color: #DE5C5C;
          font-weight: 600;
        }
        .nav-btn.special {
          color: #DE5C5C;
          background: rgba(222, 92, 92, 0.08);
          border: 1.5px dashed rgba(222, 92, 92, 0.5);
          margin: 6px 0;
          font-weight: 600;
        }
        .nav-btn.special:hover { background: rgba(222, 92, 92, 0.14); }
      `}</style>

      <aside style={{
        width: 260,
        height: "100vh",
        background: "#120847",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}>

        {/* ── Logo ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "28px 20px 24px",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(175,174,215,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
          }}>
            🪙
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: "#AFAED7",
            letterSpacing: "-0.3px",
          }}>
            Budget-Flow
          </span>
        </div>

        {/* ── Nav Items ── */}
        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => {
            const isActive  = active === item.id;
            const isSpecial = item.special;

            return (
              <button
                key={item.id}
                className={`nav-btn${isSpecial ? " special" : isActive ? " active" : ""}`}
                onClick={() => navigate(item.id)}
              >
                {/* Icon */}
                <span style={{ flexShrink: 0 }}>
                  <Ico n={item.icon} s={20} />
                </span>

                {/* Label */}
                <span>{item.label}</span>

                {/* Active dot */}
                {isActive && !isSpecial && (
                  <span style={{
                    marginLeft: "auto",
                    width: 7, height: 7,
                    borderRadius: "50%",
                    background: "#DE5C5C",
                    flexShrink: 0,
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Settings ── */}
        <div style={{
          padding: "12px 12px 24px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}>
          <button
            className={`nav-btn${active === "settings" ? " active" : ""}`}
            onClick={() => navigate("settings")}
          >
            <span style={{ flexShrink: 0 }}><Ico n="cog" s={20} /></span>
            <span>Settings</span>
            {active === "settings" && (
              <span style={{
                marginLeft: "auto", width: 7, height: 7,
                borderRadius: "50%", background: "#DE5C5C", flexShrink: 0,
              }} />
            )}
          </button>
        </div>

      </aside>
    </>
  );
};