import React from "react";
import { navy, canvas, white, borderColor, heartRed, heartRedDark, headBlue, headBlueDark, gold, bodyText, mutedText, contactEmail, companyName, companyUrl, ageRanges, genderOptions, workRoleOptions, industryOptions, countryOptions, workPurposeOptions, tenureOptions, roleOptions, departmentOptions, levelOptions, personalSituationOptions, personalFocusOptions, personalPurposeOptions, lifeChapterOptions, intakeConfigurations, getIntakeConfiguration, personalSubscales, answerChoices, personalProfiles, personalSubscaleReads, managerSubscales, managerProfiles, managerSubscaleReads, pendingUnlockStorageKey, savePendingUnlock, loadPendingUnlock, clearPendingUnlock, getScoreBand, scoreBands, executiveSubscales, executiveProfiles, executiveSubscaleReads, newJoinerSubscales, newJoinerProfiles, newJoinerSubscaleReads, upgradeReasons, flattenItems, createProfileLookup, assessmentTracks } from "../data/assessmentData";
const logoUrl = "/atom-global-logo.png";
const textureUrl = "/report-texture.png";
const $e = (target, source) => Object.assign(target, source);
const et = (target, source) => Object.assign(target, source);
const merge = (target, source) => Object.assign({}, target, source);
function buildTextReport(e, t, a) {
  let {
      subscales: n,
      subscaleReads: i
    } = e,
    {
      total: o,
      subScores: l,
      profile: u
    } = t;
  return [`HEAD-HEART ALIGNMENT: ${e.label.toUpperCase()} \u2014 FULL REPORT FOR ${a.name.trim() || "PARTICIPANT"}`, "", `Profile: ${u.name}`, `Total score: ${o} / 250`, "", u.summary, "", "STRENGTHS:", ...u.strengths.map(d => `  \u2022 ${d}`), "", "CHALLENGES & WATCH-OUTS:", ...u.watchouts.map(d => `  \u2022 ${d}`), "", u.developmentAreas, "", "IN RELATIONSHIPS:", `  ${u.relationships}`, "", "IMPROVING YOUR WORKING STYLE:", `  ${u.work}`, ...u.workingStyleTips.map(d => `  \u2022 ${d}`), "", "HOW YOU HANDLE DIFFICULTY:", `  ${u.handlingDifficulty}`, ...(e.hasLeadershipImpact ? ["", `${e.leadershipImpactLabel.toUpperCase()}:`, `  ${u.leadershipImpact}`] : []), ...(e.hasCultureFit ? ["", `${e.cultureFitLabel.toUpperCase()}:`, `  ${u.cultureFitPrompt}`] : []), "", "FIVE PRACTICAL IDEAS FOR EVERYDAY LIFE:", ...u.growth.map((d, f) => `  ${f + 1}. ${d}`), "", "SUBSCALE DEEP-DIVE (out of 25):", ...n.flatMap((d, f) => {
    let m = l[f],
      g = getScoreBand(m);
    if (!g) return [`  ${d.name}: N/A`];
    let p = i[d.code],
      A = p[g];
    return [`  ${d.name}: ${m}/25 (${scoreBands[g].label})`, `    What it means: ${A.read}`, `    Why it matters: ${p.whyItMatters}`, `    What to do: ${A.tip}`];
  }), "", "YOUR DEVELOPMENT ROADMAP:", ...u.roadmap.flatMap(d => [`  ${d.area}:`, `    ${d.insight}`, ...d.steps.map(f => `    \u2022 ${f}`)]), "", "Retake this assessment every 3 months to track real movement over time.", "", "This is a reflective self-assessment, not a clinical instrument.", "", "Thank you for taking the assessment. We hope this was useful to you.", `If you want to learn more about yourself, or go from good to great, reach out to us: ${companyUrl}`].join(`
`);
}
function AtomLogo({
  size: e = 28
}) {
  return React.createElement("img", {
    src: logoUrl,
    alt: "Atom Global Consulting",
    style: {
      height: e,
      width: "auto",
      display: "block"
    }
  });
}
function BrandHeader() {
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 32
    }
  }, React.createElement(AtomLogo, {
    size: 30
  }), React.createElement("span", {
    style: {
      fontSize: 12,
      letterSpacing: 1.5,
      color: mutedText,
      textTransform: "uppercase"
    }
  }, companyName));
}
function ReportTexture() {
  return React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      overflow: "hidden",
      backgroundImage: `url(${textureUrl})`,
      backgroundRepeat: "repeat",
      backgroundSize: "160px 160px",
      opacity: 0.5
    }
  });
}
function AlignmentGauge({
  total: e
}) {
  let a = -90 + (e - 50) / 200 * 180,
    n = 100,
    i = 130,
    o = 120,
    l = f => f * Math.PI / 180,
    u = i + n * 0.8 * Math.cos(l(a - 90)),
    r = o + n * 0.8 * Math.sin(l(a - 90)),
    d = [];
  for (let f = -90; f <= 90; f += 2) d.push(`${i + n * Math.cos(l(f - 90))},${o + n * Math.sin(l(f - 90))}`);
  return React.createElement("svg", {
    width: "260",
    height: "150",
    viewBox: "0 0 260 150"
  }, React.createElement("defs", null, React.createElement("linearGradient", {
    id: "gaugeGrad",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "0%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: headBlue
  }), React.createElement("stop", {
    offset: "50%",
    stopColor: gold
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: heartRed
  }))), React.createElement("polyline", {
    points: d.join(" "),
    fill: "none",
    stroke: "url(#gaugeGrad)",
    strokeWidth: "14",
    strokeLinecap: "round"
  }), React.createElement("text", {
    x: i - n,
    y: o + 22,
    fontSize: "11",
    fill: headBlueDark,
    textAnchor: "middle"
  }, "Head"), React.createElement("text", {
    x: i + n,
    y: o + 22,
    fontSize: "11",
    fill: heartRedDark,
    textAnchor: "middle"
  }, "Heart"), React.createElement("line", {
    x1: i,
    y1: o,
    x2: u,
    y2: r,
    stroke: bodyText,
    strokeWidth: "3",
    strokeLinecap: "round"
  }), React.createElement("circle", {
    cx: i,
    cy: o,
    r: "6",
    fill: bodyText
  }));
}
function RadarChart({
  data: e
}) {
  let o = e.length,
    l = f => Math.PI * 2 * f / o - Math.PI / 2,
    u = (f, m, g) => {
      let p = m / g * 110,
        A = l(f);
      return [160 + p * Math.cos(A), 160 + p * Math.sin(A)];
    },
    r = e.map((f, m) => u(m, f.score, f.max)).map(f => f.join(",")).join(" ");
  return React.createElement("svg", {
    width: "100%",
    viewBox: "0 0 320 320",
    style: {
      maxWidth: 340,
      margin: "0 auto",
      display: "block"
    }
  }, [0.25, 0.5, 0.75, 1].map((f, m) => React.createElement("polygon", {
    key: m,
    points: e.map((g, p) => u(p, f, 1).join(",")).join(" "),
    fill: "none",
    stroke: borderColor,
    strokeWidth: "1"
  })), e.map((f, m) => {
    let [g, p] = u(m, 1, 1);
    return React.createElement("line", {
      key: m,
      x1: 160,
      y1: 160,
      x2: g,
      y2: p,
      stroke: borderColor,
      strokeWidth: "1"
    });
  }), React.createElement("polygon", {
    points: r,
    fill: gold,
    fillOpacity: "0.35",
    stroke: gold,
    strokeWidth: "2"
  }), e.map((f, m) => {
    let [g, p] = u(m, 1.18, 1),
      A = g < 155 ? "end" : g > 165 ? "start" : "middle";
    return React.createElement("text", {
      key: m,
      x: g,
      y: p,
      fontSize: "11",
      fill: mutedText,
      textAnchor: A,
      dominantBaseline: "middle"
    }, f.subject);
  }));
}
function TrackSelection({
  onSelect: e
}) {
  let t = a => ({
    padding: 24,
    borderRadius: 8,
    background: white,
    marginBottom: 16,
    cursor: a ? "pointer" : "default",
    border: `1px solid ${borderColor}`,
    opacity: a ? 1 : 0.5,
    textAlign: "left",
    width: "100%"
  });
  return React.createElement("div", {
    style: {
      maxWidth: 640,
      margin: "0 auto",
      padding: "56px 24px"
    }
  }, React.createElement(BrandHeader, null), React.createElement("h1", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 34,
      marginBottom: 20
    }
  }, "Head\u2013Heart Alignment"), React.createElement("p", {
    style: {
      fontSize: 16,
      color: "#3A3428",
      marginBottom: 16
    }
  }, "Every choice you make is cast by two votes: what you ", React.createElement("em", null, "feel"), " and what you ", React.createElement("em", null, "reason"), ". This assessment maps which one you actually hand the deciding vote to \u2014 not which one you wish you did."), React.createElement("p", {
    style: {
      fontSize: 16,
      color: "#3A3428",
      marginBottom: 32
    }
  }, "You'll answer 50 statements across 10 areas of life, get an instant free result, and can unlock a full in-depth report. Choose the version that fits you:"), Object.values(assessmentTracks).map(a => React.createElement("button", {
    key: a.key,
    onClick: () => a.available && e(a.key),
    disabled: !a.available,
    style: t(a.available)
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, React.createElement("span", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 20,
      color: a.available ? bodyText : mutedText
    }
  }, "Head-Heart Alignment: ", a.label), !a.available && React.createElement("span", {
    style: {
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: mutedText,
      border: `1px solid ${borderColor}`,
      borderRadius: 999,
      padding: "3px 10px"
    }
  }, "Coming Soon")), React.createElement("div", {
    style: {
      fontSize: 13,
      color: mutedText,
      marginTop: 6
    }
  }, a.tagline))));
}
function AssessmentIntroduction({
  track: e,
  onStart: t
}) {
  return React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: "0 auto",
      padding: "56px 24px"
    }
  }, React.createElement(BrandHeader, null), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 32
    }
  }, React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 9999,
      background: heartRed
    }
  }), React.createElement("span", {
    style: {
      fontSize: 12,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: mutedText
    }
  }, "Head-Heart Alignment: ", e.label, " \xB7 Lite Report Free \xB7 ~15 minutes"), React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 9999,
      background: headBlue
    }
  })), React.createElement("h1", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 44,
      lineHeight: 1.1,
      marginBottom: 24
    }
  }, "Head\u2013Heart", React.createElement("br", null), "Alignment: ", e.label), React.createElement("p", {
    style: {
      fontSize: 18,
      color: "#3A3428",
      marginBottom: 16
    }
  }, "Every choice you make is cast by two votes: what you ", React.createElement("em", null, "feel"), " and what you ", React.createElement("em", null, "reason"), ". This assessment maps which one you actually hand the deciding vote to."), React.createElement("p", {
    style: {
      fontSize: 18,
      color: "#3A3428",
      marginBottom: 40
    }
  }, "Take the full 50-question assessment free and get your Lite Report instantly. Unlock the complete Full Report \u2014 development roadmap, working-style plan, and full breakdown \u2014 for ", e.priceLabel, "."), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginBottom: 48
    }
  }, React.createElement("div", {
    style: {
      padding: 20,
      borderRadius: 8,
      background: white,
      borderLeft: `3px solid ${heartRed}`
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 24,
      color: heartRedDark
    }
  }, "Heart"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: mutedText
    }
  }, "Feeling, intuition, connection, meaning")), React.createElement("div", {
    style: {
      padding: 20,
      borderRadius: 8,
      background: white,
      borderLeft: `3px solid ${headBlue}`
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 24,
      color: headBlueDark
    }
  }, "Head"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: mutedText
    }
  }, "Logic, analysis, control, proof"))), React.createElement("button", {
    onClick: t,
    style: {
      padding: "16px 32px",
      borderRadius: 6,
      fontWeight: 500,
      fontSize: 16,
      background: gold,
      color: navy,
      border: "none",
      cursor: "pointer"
    }
  }, "Begin the free assessment \u2192"));
}
function ParticipantIntake({
  track: e,
  intake: t,
  setIntake: a,
  onContinue: n
}) {
  let i = getIntakeConfiguration(e.key),
    o = i.hasCompanyFields && roleOptions.includes(t.role),
    l = t.name.trim() && t.ageRange && /\S+@\S+\.\S+/.test(t.email) && t.role && t.industry && t.region && t.purpose && t.tenure && (!o || t.department && t.level),
    u = m => g => a(p => et($e({}, p), {
      [m]: g.target.value
    })),
    r = {
      width: "100%",
      padding: "12px 16px",
      borderRadius: 6,
      fontSize: 14,
      background: white,
      color: bodyText,
      border: `1px solid ${borderColor}`,
      marginBottom: 20
    },
    d = {
      display: "block",
      fontSize: 12,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 8
    },
    f = {
      fontSize: 11,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: mutedText,
      marginBottom: 14,
      marginTop: 28,
      borderTop: `1px solid ${borderColor}`,
      paddingTop: 24
    };
  return React.createElement("div", {
    style: {
      maxWidth: 480,
      margin: "0 auto",
      padding: "56px 24px"
    }
  }, React.createElement(BrandHeader, null), React.createElement("h1", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 30,
      marginBottom: 12
    }
  }, "Before you begin"), React.createElement("p", {
    style: {
      fontSize: 14,
      color: mutedText,
      marginBottom: 32
    }
  }, "A few details so your report can be sent to you and personalized correctly. Nothing here is identifying beyond your name and email \u2014 the rest is broad categories only."), React.createElement("label", {
    style: d
  }, "Name *"), React.createElement("input", {
    type: "text",
    value: t.name,
    onChange: u("name"),
    style: r,
    placeholder: "Your full name"
  }), React.createElement("label", {
    style: d
  }, "Age range *"), React.createElement("select", {
    value: t.ageRange,
    onChange: u("ageRange"),
    style: r
  }, React.createElement("option", {
    value: ""
  }, "Select\u2026"), ageRanges.map(m => React.createElement("option", {
    key: m,
    value: m
  }, m))), React.createElement("label", {
    style: d
  }, "Gender"), React.createElement("select", {
    value: t.gender,
    onChange: u("gender"),
    style: r
  }, React.createElement("option", {
    value: ""
  }, "Select\u2026"), genderOptions.map(m => React.createElement("option", {
    key: m,
    value: m
  }, m))), React.createElement("label", {
    style: d
  }, "Email address *"), React.createElement("input", {
    type: "email",
    value: t.email,
    onChange: u("email"),
    style: r,
    placeholder: "you@example.com"
  }), React.createElement("div", {
    style: f
  }, "A little more context"), React.createElement("label", {
    style: d
  }, i.whoLabel), React.createElement("select", {
    value: t.role,
    onChange: u("role"),
    style: r
  }, React.createElement("option", {
    value: ""
  }, "Select\u2026"), i.whoOptions.map(m => React.createElement("option", {
    key: m,
    value: m
  }, m))), React.createElement("label", {
    style: d
  }, i.whatLabel), React.createElement("select", {
    value: t.industry,
    onChange: u("industry"),
    style: r
  }, React.createElement("option", {
    value: ""
  }, "Select\u2026"), i.whatOptions.map(m => React.createElement("option", {
    key: m,
    value: m
  }, m))), React.createElement("label", {
    style: d
  }, i.whereLabel), React.createElement("select", {
    value: t.region,
    onChange: u("region"),
    style: r
  }, React.createElement("option", {
    value: ""
  }, "Select\u2026"), i.whereOptions.map(m => React.createElement("option", {
    key: m,
    value: m
  }, m))), React.createElement("label", {
    style: d
  }, i.whyLabel), React.createElement("select", {
    value: t.purpose,
    onChange: u("purpose"),
    style: r
  }, React.createElement("option", {
    value: ""
  }, "Select\u2026"), i.whyOptions.map(m => React.createElement("option", {
    key: m,
    value: m
  }, m))), React.createElement("label", {
    style: d
  }, i.howLabel), React.createElement("select", {
    value: t.tenure,
    onChange: u("tenure"),
    style: r
  }, React.createElement("option", {
    value: ""
  }, "Select\u2026"), i.howOptions.map(m => React.createElement("option", {
    key: m,
    value: m
  }, m))), o && React.createElement(React.Fragment, null, React.createElement("label", {
    style: d
  }, "Department *"), React.createElement("select", {
    value: t.department,
    onChange: u("department"),
    style: r
  }, React.createElement("option", {
    value: ""
  }, "Select\u2026"), departmentOptions.map(m => React.createElement("option", {
    key: m,
    value: m
  }, m))), React.createElement("label", {
    style: d
  }, "Level *"), React.createElement("select", {
    value: t.level,
    onChange: u("level"),
    style: r
  }, React.createElement("option", {
    value: ""
  }, "Select\u2026"), levelOptions.map(m => React.createElement("option", {
    key: m,
    value: m
  }, m)))), React.createElement("p", {
    style: {
      fontSize: 12,
      color: mutedText,
      marginBottom: 24
    }
  }, "Used to send you a copy of your report, and to help us understand who this assessment actually helps."), React.createElement("button", {
    onClick: n,
    disabled: !l,
    style: {
      padding: "14px 24px",
      borderRadius: 6,
      fontSize: 14,
      fontWeight: 500,
      background: l ? gold : borderColor,
      color: l ? navy : mutedText,
      border: "none",
      cursor: l ? "pointer" : "default",
      width: "100%"
    }
  }, "Continue to assessment \u2192"));
}
function AssessmentQuestions({
  track: e,
  section: t,
  setSection: a,
  answers: n,
  setValue: i,
  setNote: o,
  answeredCount: l,
  onFinish: u
}) {
  let {
      subscales: r,
      allItems: d
    } = e,
    f = t === r.length - 1,
    m = Math.round(l / d.length * 100),
    g = r.slice(0, t).reduce((A, Y) => A + Y.items.length, 0),
    p = r[t].items;
  return React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: "0 auto",
      padding: "40px 24px"
    }
  }, React.createElement(BrandHeader, null), React.createElement("div", {
    style: {
      marginBottom: 40
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      color: mutedText,
      marginBottom: 8
    }
  }, React.createElement("span", null, "Section ", t + 1, " of ", r.length), React.createElement("span", null, l, "/", d.length, " answered")), React.createElement("div", {
    style: {
      height: 4,
      background: borderColor,
      borderRadius: 4
    }
  }, React.createElement("div", {
    style: {
      height: 4,
      width: `${m}%`,
      background: gold,
      borderRadius: 4,
      transition: "width .3s"
    }
  }))), React.createElement("div", {
    style: {
      fontSize: 12,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 8
    }
  }, r[t].code, " \xB7 Section ", t + 1, " of 10"), React.createElement("h2", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 28,
      marginBottom: 8
    }
  }, r[t].name), React.createElement("p", {
    style: {
      color: mutedText,
      marginBottom: 40
    }
  }, r[t].blurb), p.map((A, Y) => {
    let N = g + Y,
      h = n[N];
    return React.createElement("div", {
      key: N,
      style: {
        marginBottom: 40,
        paddingBottom: 40,
        borderBottom: `1px solid ${borderColor}`
      }
    }, React.createElement("p", {
      style: {
        fontSize: 17,
        marginBottom: 16
      }
    }, React.createElement("span", {
      style: {
        color: gold
      }
    }, N + 1, "."), " ", A.t), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 12,
        flexWrap: "wrap"
      }
    }, answerChoices.map((c, y) => {
      let v = y + 1,
        z = h.value === v;
      return React.createElement("label", {
        key: v,
        style: {
          flex: "1 1 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          padding: "12px 4px",
          borderRadius: 6,
          cursor: "pointer",
          textAlign: "center",
          background: z ? gold : white,
          color: z ? navy : mutedText
        }
      }, React.createElement("input", {
        type: "radio",
        name: `q${N}`,
        style: {
          display: "none"
        },
        checked: z,
        onChange: () => i(N, v)
      }), React.createElement("span", {
        style: {
          fontSize: 14,
          fontWeight: 600
        }
      }, v), React.createElement("span", {
        style: {
          fontSize: 11,
          lineHeight: 1.2
        }
      }, c));
    })), React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: 20
      }
    }, React.createElement("label", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 12,
        background: h.value === "NA" ? mutedText : "transparent",
        color: h.value === "NA" ? canvas : mutedText,
        border: `1px dashed ${borderColor}`
      }
    }, React.createElement("input", {
      type: "radio",
      name: `q${N}`,
      style: {
        display: "none"
      },
      checked: h.value === "NA",
      onChange: () => i(N, "NA")
    }), "N/A \u2014 doesn't apply / can't answer")), React.createElement("textarea", {
      placeholder: "Optional \u2014 describe a specific moment this played out for you...",
      value: h.note,
      onChange: c => o(N, c.target.value),
      rows: 2,
      style: {
        width: "100%",
        padding: 12,
        borderRadius: 6,
        fontSize: 13,
        background: white,
        color: bodyText,
        border: `1px solid ${borderColor}`,
        resize: "vertical"
      }
    }));
  }), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 16
    }
  }, React.createElement("button", {
    onClick: () => a(A => Math.max(0, A - 1)),
    disabled: t === 0,
    style: {
      padding: "12px 24px",
      borderRadius: 6,
      fontSize: 14,
      background: white,
      color: t === 0 ? mutedText : bodyText,
      opacity: t === 0 ? 0.5 : 1,
      border: "none",
      cursor: "pointer"
    }
  }, "\u2190 Back"), f ? React.createElement("button", {
    onClick: u,
    style: {
      padding: "12px 24px",
      borderRadius: 6,
      fontSize: 14,
      fontWeight: 500,
      background: heartRed,
      color: bodyText,
      border: "none",
      cursor: "pointer"
    }
  }, "See my result \u2192") : React.createElement("button", {
    onClick: () => a(A => A + 1),
    style: {
      padding: "12px 24px",
      borderRadius: 6,
      fontSize: 14,
      fontWeight: 500,
      background: gold,
      color: navy,
      border: "none",
      cursor: "pointer"
    }
  }, "Next section \u2192")));
}
function BrandFooter() {
  return React.createElement("div", {
    style: {
      padding: 28,
      borderRadius: 8,
      background: white,
      marginBottom: 24,
      textAlign: "center",
      position: "relative",
      zIndex: 1
    }
  }, React.createElement(AtomLogo, {
    size: 32
  }), React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 22,
      margin: "16px 0 10px"
    }
  }, "Thank You"), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      maxWidth: 480,
      margin: "0 auto 20px"
    }
  }, "Thank you for taking the assessment. We hope this was useful to you."), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      maxWidth: 480,
      margin: "0 auto 24px"
    }
  }, "If you want to learn more about yourself, or go from good to great, reach out to us here."), React.createElement("a", {
    href: companyUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: "inline-block",
      padding: "12px 28px",
      borderRadius: 6,
      fontSize: 14,
      fontWeight: 600,
      background: gold,
      color: navy,
      textDecoration: "none"
    }
  }, "Visit ", companyName));
}
function LockedReport({
  track: e,
  report: t,
  answers: a,
  intake: n,
  onUnlockClick: i
}) {
  let {
      total: o,
      profile: l
    } = t,
    u = {
      padding: 24,
      borderRadius: 8,
      background: white,
      marginBottom: 24
    };
  return React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: "0 auto",
      padding: "40px 24px 80px"
    }
  }, React.createElement(BrandHeader, null), React.createElement("div", {
    style: {
      fontSize: 12,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 8
    }
  }, "Head-Heart Alignment: ", e.label, " \u2014 Lite Report"), React.createElement("div", {
    style: {
      fontSize: 12,
      letterSpacing: 1,
      color: mutedText,
      marginBottom: 8
    }
  }, "Total Score: ", o, " / 250"), React.createElement("h1", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 34,
      marginBottom: 16,
      color: l.color
    }
  }, l.name), React.createElement("div", {
    style: et($e({}, u), {
      display: "flex",
      gap: 32,
      alignItems: "center",
      flexWrap: "wrap"
    })
  }, React.createElement(AlignmentGauge, {
    total: o
  }), React.createElement("p", {
    style: {
      color: "#3A3428"
    }
  }, l.teaser)), React.createElement("div", {
    style: u
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 12
    }
  }, "Your Top Strengths"), React.createElement("ul", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      paddingLeft: 18
    }
  }, l.strengths.slice(0, 2).map((r, d) => React.createElement("li", {
    key: d,
    style: {
      marginBottom: 6
    }
  }, r)))), React.createElement("div", {
    style: et($e({}, u), {
      textAlign: "center",
      border: `1px solid ${gold}`
    })
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 22,
      marginBottom: 6
    }
  }, "This Is the Short Version"), React.createElement("p", {
    style: {
      fontSize: 14,
      color: mutedText,
      marginBottom: 20
    }
  }, "Your Full Report goes much deeper. Here's exactly what's in it:"), React.createElement("div", {
    style: {
      textAlign: "left",
      maxWidth: 480,
      margin: "0 auto 24px"
    }
  }, e.upgradeReasons.map((r, d) => React.createElement("div", {
    key: d,
    style: {
      display: "flex",
      gap: 12,
      marginBottom: 14
    }
  }, React.createElement("span", {
    style: {
      color: gold,
      fontSize: 16,
      lineHeight: 1
    }
  }, "\u2713"), React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: bodyText
    }
  }, r.title), React.createElement("div", {
    style: {
      fontSize: 13,
      color: mutedText
    }
  }, r.detail))))), React.createElement("a", {
    href: i,
    onClick: () => savePendingUnlock(e.key, a, n),
    style: {
      display: "inline-block",
      padding: "14px 32px",
      borderRadius: 6,
      fontSize: 15,
      fontWeight: 600,
      background: gold,
      color: navy,
      textDecoration: "none"
    }
  }, "Unlock the Full Report \u2014 ", e.priceLabel)), React.createElement(BrandFooter, null), React.createElement("p", {
    style: {
      fontSize: 12,
      color: mutedText,
      textAlign: "center"
    }
  }, "This self-assessment is a reflective tool, not a clinical or diagnostic instrument."));
}
function ProfileCard({
  p: e,
  isYours: t,
  track: a
}) {
  let n = {
    padding: 24,
    borderRadius: 8,
    background: white,
    marginBottom: 24,
    position: "relative",
    zIndex: 1,
    border: t ? `2px solid ${gold}` : `1px solid ${borderColor}`
  };
  return React.createElement("div", {
    style: n
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
      flexWrap: "wrap",
      gap: 8
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12,
      color: mutedText
    }
  }, e.range[0], "\u2013", e.range[1]), t && React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 999,
      color: navy,
      background: gold
    }
  }, "Your Result")), React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 22,
      marginBottom: 10,
      color: e.color
    }
  }, e.name), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      marginBottom: 16
    }
  }, e.summary), React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 6
    }
  }, "Strengths"), React.createElement("ul", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      paddingLeft: 18,
      marginBottom: 14
    }
  }, e.strengths.map((i, o) => React.createElement("li", {
    key: o,
    style: {
      marginBottom: 4
    }
  }, i))), React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 6
    }
  }, "Challenges & Development Areas"), React.createElement("ul", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      paddingLeft: 18,
      marginBottom: 8
    }
  }, e.watchouts.map((i, o) => React.createElement("li", {
    key: o,
    style: {
      marginBottom: 4
    }
  }, i))), React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      marginBottom: 14
    }
  }, e.developmentAreas), React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 6
    }
  }, "In Relationships"), React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      marginBottom: 14
    }
  }, e.relationships), React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 6
    }
  }, "Improving Your Working Style"), React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      marginBottom: 8
    }
  }, e.work), React.createElement("ul", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      paddingLeft: 18,
      marginBottom: 14
    }
  }, e.workingStyleTips.map((i, o) => React.createElement("li", {
    key: o,
    style: {
      marginBottom: 4
    }
  }, i))), React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 6
    }
  }, "How You Handle Difficulty"), React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      marginBottom: 14
    }
  }, e.handlingDifficulty), a && a.hasLeadershipImpact && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 6
    }
  }, a.leadershipImpactLabel), React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      marginBottom: 14
    }
  }, e.leadershipImpact)), a && a.hasCultureFit && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 6
    }
  }, a.cultureFitLabel), React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      marginBottom: 14
    }
  }, e.cultureFitPrompt)), React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 6
    }
  }, "Five Practical Ideas for Everyday Life"), React.createElement("ol", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      paddingLeft: 18
    }
  }, e.growth.map((i, o) => React.createElement("li", {
    key: o,
    style: {
      marginBottom: 4
    }
  }, i))));
}
function FullReport({
  track: e,
  report: t,
  answers: a,
  intake: n
}) {
  let {
      subscales: i
    } = e,
    {
      total: o,
      subScores: l,
      profile: u
    } = t,
    r = i.map((S, b) => {
      var E;
      return {
        subject: S.code,
        score: (E = l[b]) != null ? E : 15,
        max: 25
      };
    }),
    d = i.map((S, b) => {
      let E = S.items.map((x, k) => a[i.slice(0, b).reduce((_, Ke) => _ + Ke.items.length, 0) + k]).filter(x => x.note && x.note.trim().length > 0).map(x => x.note.trim());
      return {
        name: S.name,
        notes: E
      };
    }).filter(S => S.notes.length > 0),
    f = l.map((S, b) => S !== null ? b : -1).filter(S => S !== -1),
    m = f.length ? f.reduce((S, b) => l[b] > l[S] ? b : S, f[0]) : null,
    g = f.length ? f.reduce((S, b) => l[b] < l[S] ? b : S, f[0]) : null,
    p = m !== null ? i[m] : null,
    A = g !== null ? i[g] : null,
    [Y, N] = React.useState(false),
    h = buildTextReport(e, t, n),
    c = () => {
      let S = encodeURIComponent("Your Head-Heart Alignment Full Report"),
        b = encodeURIComponent(h),
        E = n.email || "",
        x = contactEmail ? `&cc=${encodeURIComponent(contactEmail)}` : "";
      return `mailto:${E}?subject=${S}${x}&body=${b}`;
    },
    y = async () => {
      try {
        await navigator.clipboard.writeText(h), N(true), setTimeout(() => N(false), 2e3);
      } catch (S) {}
    },
    v = {
      padding: 28,
      borderRadius: 8,
      background: white,
      marginBottom: 24,
      position: "relative",
      zIndex: 1
    },
    z = {
      position: "relative",
      paddingTop: 28,
      pageBreakBefore: "always"
    };
  return React.createElement("div", {
    style: {
      maxWidth: 880,
      margin: "0 auto",
      padding: "40px 24px 80px",
      position: "relative"
    }
  }, React.createElement("div", {
    className: "no-print",
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      position: "relative",
      zIndex: 1
    }
  }, React.createElement(BrandHeader, null), React.createElement("span", {
    style: {
      fontSize: 11,
      letterSpacing: 1,
      color: mutedText,
      textTransform: "uppercase"
    }
  }, "Full Report")), React.createElement("div", {
    style: {
      position: "relative"
    }
  }, React.createElement(ReportTexture, null), React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 8
    }
  }, "Head-Heart Alignment \u2014 Full Report"), React.createElement("div", {
    style: {
      fontSize: 12,
      letterSpacing: 1,
      color: mutedText,
      marginBottom: 8
    }
  }, "Prepared for ", n.name || "you", " \xB7 Total Score: ", o, " / 250"), React.createElement("h1", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 36,
      marginBottom: 20,
      color: u.color
    }
  }, u.name), React.createElement("div", {
    className: "no-print",
    style: v
  }, React.createElement("h3", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 12
    }
  }, "Get a copy of this report"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap"
    }
  }, React.createElement("a", {
    href: c(),
    style: {
      padding: "10px 16px",
      borderRadius: 6,
      fontSize: 13,
      fontWeight: 500,
      background: gold,
      color: navy,
      textDecoration: "none",
      display: "inline-block"
    }
  }, "Email me a copy"), React.createElement("button", {
    onClick: y,
    style: {
      padding: "10px 16px",
      borderRadius: 6,
      fontSize: 13,
      background: borderColor,
      color: bodyText,
      border: "none",
      cursor: "pointer"
    }
  }, Y ? "Copied \u2713" : "Copy report as text"), React.createElement("button", {
    onClick: () => window.print(),
    style: {
      padding: "10px 16px",
      borderRadius: 6,
      fontSize: 13,
      background: borderColor,
      color: bodyText,
      border: "none",
      cursor: "pointer"
    }
  }, "Print / Save as PDF"))), React.createElement("div", {
    style: merge(v, {
      display: "flex",
      gap: 32,
      alignItems: "center",
      flexWrap: "wrap"
    })
  }, React.createElement(AlignmentGauge, {
    total: o
  }), React.createElement("p", {
    style: {
      color: "#3A3428",
      fontSize: 15
    }
  }, u.summary)), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
      marginBottom: 24
    }
  }, React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 12
    }
  }, "Strengths"), React.createElement("ul", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      paddingLeft: 18
    }
  }, u.strengths.map((S, b) => React.createElement("li", {
    key: b,
    style: {
      marginBottom: 6
    }
  }, S)))), React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 12
    }
  }, "Challenges & Watch-outs"), React.createElement("ul", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      paddingLeft: 18
    }
  }, u.watchouts.map((S, b) => React.createElement("li", {
    key: b,
    style: {
      marginBottom: 6
    }
  }, S))))), React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 12
    }
  }, "Your Growth Edge, In Plain Terms"), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428"
    }
  }, u.developmentAreas)))), React.createElement("div", {
    style: z
  }, React.createElement(ReportTexture, null), React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1
    }
  }, React.createElement("h2", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 26,
      marginBottom: 6,
      color: gold
    }
  }, "Your Development Roadmap"), React.createElement("p", {
    style: {
      fontSize: 13,
      color: mutedText,
      marginBottom: 24
    }
  }, u.roadmap.length, " specific areas, drawn from your own answers, each with concrete next steps."), u.roadmap.map((S, b) => React.createElement("div", {
    key: b,
    style: v
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "flex-start"
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 22,
      color: gold,
      minWidth: 32
    }
  }, b + 1), React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 8
    }
  }, S.area), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      marginBottom: 12
    }
  }, S.insight), React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 8
    }
  }, "Roadmap"), React.createElement("ol", {
    style: {
      fontSize: 13.5,
      color: "#3A3428",
      paddingLeft: 18
    }
  }, S.steps.map((E, x) => React.createElement("li", {
    key: x,
    style: {
      marginBottom: 6
    }
  }, E))))))))), React.createElement("div", {
    style: z
  }, React.createElement(ReportTexture, null), React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1
    }
  }, p && A && React.createElement("div", {
    style: merge(v, {
      borderLeft: `3px solid ${gold}`
    })
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 20,
      marginBottom: 12
    }
  }, "Your Sharpest Edge and Your Growth Edge"), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      marginBottom: 8
    }
  }, React.createElement("strong", {
    style: {
      color: heartRedDark
    }
  }, p.name), " is where your heart shows up most (", l[m], "/25). ", e.subscaleReads[p.code].high.read), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428"
    }
  }, React.createElement("strong", {
    style: {
      color: headBlueDark
    }
  }, A.name), " is where your head takes over most (", l[g], "/25). ", e.subscaleReads[A.code].low.read)), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
      marginBottom: 24
    }
  }, React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 12
    }
  }, "In Relationships"), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428"
    }
  }, u.relationships)), React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 12
    }
  }, "Improving Your Working Style"), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      marginBottom: 10
    }
  }, u.work), React.createElement("ul", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      paddingLeft: 18
    }
  }, u.workingStyleTips.map((S, b) => React.createElement("li", {
    key: b,
    style: {
      marginBottom: 6
    }
  }, S))))), React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 12
    }
  }, "How You Handle Difficulty"), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428"
    }
  }, u.handlingDifficulty)), e.hasLeadershipImpact && React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 12
    }
  }, e.leadershipImpactLabel), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428"
    }
  }, u.leadershipImpact)), e.hasCultureFit && React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 12
    }
  }, e.cultureFitLabel), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428"
    }
  }, u.cultureFitPrompt)), React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 16
    }
  }, "Five Practical Ideas for Everyday Life"), React.createElement("ol", {
    style: {
      fontSize: 14,
      color: "#3A3428",
      paddingLeft: 18
    }
  }, u.growth.map((S, b) => React.createElement("li", {
    key: b,
    style: {
      marginBottom: 10
    }
  }, S)))))), React.createElement("div", {
    style: z
  }, React.createElement(ReportTexture, null), React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1
    }
  }, React.createElement("h2", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 26,
      marginBottom: 6,
      color: gold
    }
  }, "Your Subscale Deep-Dive"), React.createElement("p", {
    style: {
      fontSize: 13,
      color: mutedText,
      marginBottom: 20
    }
  }, "Ten areas of daily life, each scored 5\u201325. Below each score: what it means, whether it's a strength or a development area, why it matters, and what to do about it."), React.createElement("div", {
    style: merge(v, {
      textAlign: "center"
    })
  }, React.createElement(RadarChart, {
    data: r
  }), React.createElement("div", {
    style: {
      fontSize: 12,
      color: mutedText,
      marginTop: 8,
      marginBottom: 4
    }
  }, "Figure 1 \u2014 Your Head\u2013Heart Radar"), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 24,
      flexWrap: "wrap",
      marginTop: 12
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: 3,
      background: gold,
      display: "inline-block"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 12,
      color: mutedText
    }
  }, "Your shape \u2014 larger toward an axis means more Heart-led on that theme"))), React.createElement("p", {
    style: {
      fontSize: 12,
      color: mutedText,
      marginTop: 8
    }
  }, "Each axis runs 5 (Head-led) to 25 (Heart-led), from the center outward.")), i.map((S, b) => {
    let E = l[b],
      x = getScoreBand(E),
      k = e.subscaleReads[S.code],
      _ = x ? scoreBands[x] : null,
      Ke = x ? k[x] : null;
    return React.createElement("div", {
      key: S.code,
      style: v
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
        flexWrap: "wrap",
        gap: 8
      }
    }, React.createElement("h3", {
      style: {
        fontFamily: "Georgia, serif",
        fontSize: 18
      }
    }, S.name), React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, _ && React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
        color: navy,
        background: _.color
      }
    }, _.label), React.createElement("span", {
      style: {
        fontSize: 13,
        color: bodyText,
        fontWeight: 600
      }
    }, E !== null ? `${E}/25` : "N/A"))), React.createElement("div", {
      style: {
        height: 6,
        background: borderColor,
        borderRadius: 4,
        marginBottom: 14
      }
    }, E !== null && React.createElement("div", {
      style: {
        height: 6,
        width: `${E / 25 * 100}%`,
        background: _ ? _.color : gold,
        borderRadius: 4
      }
    })), Ke ? React.createElement(React.Fragment, null, React.createElement("div", {
      style: {
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: gold,
        marginBottom: 4
      }
    }, "What This Score Means"), React.createElement("p", {
      style: {
        fontSize: 13.5,
        color: "#3A3428",
        marginBottom: 12
      }
    }, Ke.read), React.createElement("div", {
      style: {
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: gold,
        marginBottom: 4
      }
    }, "Why It Matters"), React.createElement("p", {
      style: {
        fontSize: 13.5,
        color: "#3A3428",
        marginBottom: 12
      }
    }, k.whyItMatters), React.createElement("div", {
      style: {
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: gold,
        marginBottom: 4
      }
    }, "What You Can Do"), React.createElement("p", {
      style: {
        fontSize: 13.5,
        color: "#3A3428"
      }
    }, Ke.tip)) : React.createElement("p", {
      style: {
        fontSize: 13,
        color: mutedText
      }
    }, "Not enough answered items in this area to score (marked N/A)."));
  }))), React.createElement("div", {
    style: z
  }, React.createElement(ReportTexture, null), React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1
    }
  }, React.createElement("h2", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 26,
      marginBottom: 6,
      color: gold
    }
  }, "Understand the Head-Heart Profile"), React.createElement("p", {
    style: {
      fontSize: 13,
      color: mutedText,
      marginBottom: 24
    }
  }, "All four profiles, in full \u2014 so you can see where you land relative to the whole spectrum, not just in isolation. Your result is highlighted below."), e.profiles.slice().reverse().map(S => React.createElement(ProfileCard, {
    key: S.key,
    p: S,
    isYours: S.key === u.key,
    track: e
  })))), React.createElement("div", {
    style: z
  }, React.createElement(ReportTexture, null), React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1
    }
  }, d.length > 0 && React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 18,
      marginBottom: 4
    }
  }, "Your Reflections"), React.createElement("p", {
    style: {
      fontSize: 13,
      color: mutedText,
      marginBottom: 16
    }
  }, "Pulled directly from what you wrote."), d.map((S, b) => React.createElement("div", {
    key: b,
    style: {
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: gold,
      marginBottom: 6
    }
  }, S.name), S.notes.map((E, x) => React.createElement("p", {
    key: x,
    style: {
      fontSize: 14,
      color: "#3A3428",
      paddingLeft: 12,
      borderLeft: `2px solid ${borderColor}`,
      marginBottom: 6
    }
  }, "\u201C", E, "\u201D"))))), React.createElement("div", {
    style: merge(v, {
      textAlign: "center",
      border: `1px solid ${gold}`
    })
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 20,
      marginBottom: 8
    }
  }, "Track Your Progress Over Time"), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "#3A3428"
    }
  }, "People and circumstances shift. Retake the Head-Heart Alignment assessment every 3 months to see whether your development areas are actually moving \u2014 not just guess.")), React.createElement("div", {
    style: v
  }, React.createElement("h3", {
    style: {
      fontFamily: "Georgia, serif",
      fontSize: 16,
      marginBottom: 8
    }
  }, "Methodology"), React.createElement("p", {
    style: {
      fontSize: 12,
      color: mutedText
    }
  }, "This self-assessment is a reflective tool, not a clinical or diagnostic instrument. It is informed by cognitive-experiential self-theory, the Rational-Experiential Inventory, HeartMath Institute's heart-brain coherence research, and the Mayer-Salovey-Caruso emotional intelligence model \u2014 but has not itself undergone reliability or validity testing.")))), React.createElement("div", {
    style: z
  }, React.createElement(ReportTexture, null), React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1
    }
  }, React.createElement(BrandFooter, null))));
}
function AssessmentReport({
  track: e,
  report: t,
  answers: a,
  intake: n,
  onReset: i
}) {
  let [o, l] = React.useState(true);
  return React.useEffect(() => {
    new URLSearchParams(window.location.search).get("unlocked") === "1" && l(true);
  }, []), React.createElement("div", null, React.createElement("div", {
    className: "no-print",
    style: {
      maxWidth: 880,
      margin: "0 auto",
      padding: "16px 24px 0",
      display: "flex",
      justifyContent: "flex-end"
    }
  }, React.createElement("button", {
    onClick: i,
    style: {
      padding: "8px 14px",
      borderRadius: 6,
      fontSize: 12,
      background: white,
      color: mutedText,
      border: "none",
      cursor: "pointer"
    }
  }, "Retake")), o ? React.createElement(FullReport, {
    track: e,
    report: t,
    answers: a,
    intake: n
  }) : React.createElement(LockedReport, {
    track: e,
    report: t,
    answers: a,
    intake: n,
    onUnlockClick: e.stripePaymentLink
  }));
}
function AssessmentApp() {
  let [e, t] = React.useState("trackSelect"),
    [a, n] = React.useState(null),
    [i, o] = React.useState(0),
    [l, u] = React.useState([]),
    [r, d] = React.useState({
      name: "",
      ageRange: "",
      gender: "",
      email: "",
      role: "",
      industry: "",
      region: "",
      purpose: "",
      tenure: "",
      department: "",
      level: ""
    }),
    f = a ? assessmentTracks[a] : null;
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get("unlocked") !== "1") return;
    let c = loadPendingUnlock();
    !c || !assessmentTracks[c.trackKey] || !assessmentTracks[c.trackKey].available || (n(c.trackKey), u(c.answers), d(c.intake), t("report"), clearPendingUnlock());
  }, []);
  let m = h => {
      n(h), u(assessmentTracks[h].allItems.map(() => ({
        value: null,
        note: ""
      }))), t("intro");
    },
    g = (h, c) => u(y => y.map((v, z) => z === h ? merge(v, {
      value: c
    }) : v)),
    p = (h, c) => u(y => y.map((v, z) => z === h ? merge(v, {
      note: c
    }) : v)),
    A = React.useMemo(() => {
      if (!f) return null;
      let {
          subscales: h,
          allItems: c,
          getProfileFn: y
        } = f,
        v = h.map(() => 0),
        z = h.map(() => 0),
        S = 0,
        b = 0;
      c.forEach((k, _) => {
        let Ke = l[_] ? l[_].value : null;
        if (Ke === null || Ke === "NA") return;
        let Js = k.d === "K" ? 6 - Ke : Ke;
        S += Js, b += 1, v[k.subIndex] += Js, z[k.subIndex] += 1;
      });
      let E = b > 0 ? Math.round(S / b * 50) : 150,
        x = h.map((k, _) => z[_] > 0 ? Math.round(v[_] / z[_] * 5) : null);
      return {
        total: E,
        subScores: x,
        profile: y(E)
      };
    }, [l, f]),
    Y = l.filter(h => h.value !== null).length;
  return React.createElement("div", {
    style: {
      background: canvas,
      color: bodyText,
      minHeight: "100vh"
    }
  }, e === "trackSelect" && React.createElement(TrackSelection, {
    onSelect: m
  }), e === "intro" && f && React.createElement(AssessmentIntroduction, {
    track: f,
    onStart: () => t("intake")
  }), e === "intake" && f && React.createElement(ParticipantIntake, {
    track: f,
    intake: r,
    setIntake: d,
    onContinue: () => t("assessment")
  }), e === "assessment" && f && React.createElement(AssessmentQuestions, {
    track: f,
    section: i,
    setSection: o,
    answers: l,
    setValue: g,
    setNote: p,
    answeredCount: Y,
    onFinish: () => t("report")
  }), e === "report" && f && A && React.createElement(AssessmentReport, {
    track: f,
    report: A,
    answers: l,
    intake: r,
    onReset: () => {
      n(null), u([]), o(0), d({
        name: "",
        ageRange: "",
        gender: "",
        email: "",
        role: "",
        industry: "",
        region: "",
        purpose: "",
        tenure: "",
        department: "",
        level: ""
      }), t("trackSelect"), window.history.replaceState({}, "", window.location.pathname);
    }
  }));
}
export default AssessmentApp;
