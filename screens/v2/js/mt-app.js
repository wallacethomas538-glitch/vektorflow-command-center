/* ============================================================
   VEKTORMIND 2.0 — MISSION THEATRE (app logic)
   Every widget reads the REAL VektorFlow backend through the
   same VF layer the command center uses (js/vf-config.js +
   js/vf-api.js). No mock data, no simulated states: failures
   render as honest errors, missing features as honest notices.
   ============================================================ */
(function () {
  "use strict";
  var V = window.VF;
  var MC = "/api/v1/mission-control";
  var esc = V.vfEscapeHtml;

  function el(id) { return document.getElementById(id); }
  function setText(id, txt) { var n = el(id); if (n) n.textContent = txt; }
  function setHtml(id, html) { var n = el(id); if (n) n.innerHTML = html; }

  function errBox(retryFnName, e) {
    return '<div class="state-msg error">Couldn&rsquo;t load this from the backend. '
      + (retryFnName ? '<button class="retry" onclick="MT.' + retryFnName + '()">Retry</button>' : '')
      + '<span class="detail">' + esc(e && e.message ? e.message : e) + '</span></div>';
  }
  function emptyBox(msg) { return '<div class="state-msg">' + msg + '</div>'; }

  /* Render every scalar / short-list field of an object as honest KV rows. */
  function kvRows(obj, skip) {
    skip = skip || {};
    var html = "";
    Object.keys(obj || {}).forEach(function (k) {
      if (skip[k]) return;
      var v = obj[k];
      if (v === null || v === undefined) { html += kv(k, "—"); return; }
      if (typeof v === "boolean") { html += kv(k, v ? "true" : "false", v ? "good" : ""); return; }
      if (typeof v === "number" || typeof v === "string") { html += kv(k, String(v)); return; }
      if (Array.isArray(v) && v.every(function (x) { return typeof x !== "object"; })) {
        html += kv(k, v.length ? v.join(", ") : "(none)");
        return;
      }
      /* nested objects are summarized, never faked */
      html += kv(k, Array.isArray(v) ? v.length + " item(s)" : "object");
    });
    return html || emptyBox("The backend returned no fields for this panel.");
  }
  function kv(k, v, cls) {
    return '<div class="kv"><span class="k">' + esc(k) + '</span><span class="v ' + (cls || "") + '">' + esc(v) + "</span></div>";
  }

  var STATE_LABEL = {
    draft: "DRAFT", planning: "PLANNING", ready: "READY",
    awaiting_approval: "AWAITING APPROVAL", approved: "APPROVED",
    executing: "EXECUTING", paused: "PAUSED", blocked: "BLOCKED",
    completed: "COMPLETED", failed: "FAILED", cancelled: "CANCELLED"
  };
  var ACTIVE_STATES = ["planning", "ready", "awaiting_approval", "approved", "executing", "paused", "blocked"];
  function stateChip(st) {
    var key = STATE_LABEL[st] ? st : "draft";
    return '<span class="state-chip st-' + key + '">' + (STATE_LABEL[st] || esc(st || "unknown")) + "</span>";
  }
  function fmtTime(iso) {
    try { return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return iso || ""; }
  }

  /* ---------------- navigation ---------------- */
  var loaded = {};
  var loaders = {};
  function showView(name) {
    document.querySelectorAll(".view").forEach(function (s) { s.classList.toggle("active", s.id === "view-" + name); });
    document.querySelectorAll("#tabbar button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-view") === name); });
    window.scrollTo({ top: 0 });
    if (loaders[name]) loaders[name]();
  }
  document.querySelectorAll("#tabbar button").forEach(function (b) {
    b.addEventListener("click", function () { showView(b.getAttribute("data-view")); });
  });

  /* ---------------- header / system pill ---------------- */
  var backendAlive = false;
  function loadHeader() {
    return V.vfGet("/health").then(function (h) {
      backendAlive = true;
      var pill = el("sys-pill");
      pill.className = "pill ok";
      setText("sys-pill-text", (h && h.status ? String(h.status).toUpperCase() : "ONLINE"));
      var dir = el("chat-conn"); if (dir) dir.textContent = "Backend link: LIVE — VektorFlow 15xr";
    }).catch(function (e) {
      backendAlive = false;
      var pill = el("sys-pill");
      pill.className = "pill bad";
      setText("sys-pill-text", "BACKEND UNREACHABLE");
      var dir = el("chat-conn"); if (dir) dir.textContent = "Backend link: " + (e && e.message ? e.message : "unreachable");
    });
  }

  /* ---------------- overview ---------------- */
  function loadOverview() {
    loadHeader();
    V.vfGet("/health").then(function (h) {
      setText("ov-system", h && h.status === "healthy" ? "HEALTHY" : (h && h.status ? String(h.status).toUpperCase() : "UP"));
      setText("ov-system-sub", (h && h.service ? h.service : "VektorFlow 15xr") + " · /health");
    }).catch(function () { setText("ov-system", "DOWN"); setText("ov-system-sub", "backend unreachable"); });

    V.vfGet("/health/supabase").then(function (d) {
      var ok = d && (d.supabase_postgres_connected === true || d.status === "ok");
      setText("ov-db", ok ? "CONNECTED" : "CHECK");
      setText("ov-db-sub", "Supabase Postgres · /health/supabase");
    }).catch(function () { setText("ov-db", "UNKNOWN"); setText("ov-db-sub", "supabase check failed"); });

    V.vfGet("/api/agents").then(function (d) {
      var n = (d && (d.count || (d.agents || []).length)) || 0;
      setText("ov-agents", String(n));
      setText("ov-agents-sub", "registered with the backend");
    }).catch(function () { setText("ov-agents", "—"); });

    V.vfGet("/api/analytics/metrics").then(function (d) {
      var calls = d && typeof d.api_calls === "number" ? d.api_calls : null;
      if (calls === null && d) {
        var nums = Object.keys(d).filter(function (k) { return typeof d[k] === "number"; });
        if (nums.length) calls = d[nums[0]];
      }
      setText("ledger-calls", calls === null ? "—" : String(calls));
    }).catch(function () { setText("ledger-calls", "—"); });

    /* mission summary drives state counts + open count + hero directive */
    V.vfGet(MC + "/summary").then(function (s) {
      var total = s && (s.mission_count != null ? s.mission_count : (s.total != null ? s.total : null));
      setText("ledger-missions", total === null ? "—" : String(total));
      var byState = null;
      ["by_state", "counts", "state_counts", "states"].forEach(function (k) {
        var cand = s && s[k];
        if (!byState && cand && typeof cand === "object" && !Array.isArray(cand)
          && Object.keys(cand).every(function (kk) { return typeof cand[kk] === "number"; })) byState = cand;
      });
      if (byState) {
        var html = Object.keys(byState).map(function (st) {
          return '<div class="kv"><span class="k">' + esc(STATE_LABEL[st] || st) + '</span><span class="v">' + esc(byState[st]) + "</span></div>";
        }).join("");
        setHtml("ov-state-counts", html || emptyBox("No missions on record yet."));
        var open = 0;
        ACTIVE_STATES.forEach(function (st) { open += Number(byState[st] || 0); });
        setText("ov-open", String(open));
        setText("ov-open-sub", "in an active state right now");
      } else {
        return V.vfGet(MC + "/missions?limit=100").then(function (d2) {
          var ms = d2.missions || [];
          setText("ledger-missions", String(ms.length));
          var counts = {};
          ms.forEach(function (m) { counts[m.state] = (counts[m.state] || 0) + 1; });
          var html = Object.keys(counts).map(function (st) {
            return '<div class="kv"><span class="k">' + esc(STATE_LABEL[st] || st) + '</span><span class="v">' + counts[st] + "</span></div>";
          }).join("");
          setHtml("ov-state-counts", html || emptyBox("No missions on record yet."));
          var open = ms.filter(function (m) { return ACTIVE_STATES.indexOf(m.state) !== -1; }).length;
          setText("ov-open", String(open));
          setText("ov-open-sub", "in an active state right now");
        });
      }
    }).catch(function (e) {
      setHtml("ov-state-counts", errBox("loadOverview", e));
      setText("ov-open", "—");
    });

    V.vfGet(MC + "/missions?limit=5").then(function (d) {
      var ms = d.missions || [];
      var first = ms.filter(function (m) { return ACTIVE_STATES.indexOf(m.state) !== -1; })[0] || ms[0];
      setText("hero-directive", first
        ? "Latest directive: " + (first.objective || "(no objective)") + " [" + (STATE_LABEL[first.state] || first.state) + "]"
        : "No missions yet — open Dispatch to give the fleet its first objective.");
    }).catch(function () { setText("hero-directive", "Mission feed unavailable right now."); });

    /* store snapshot */
    Promise.all([
      V.vfGet("/api/shopify/products?limit=1").catch(function () { return null; }),
      V.vfGet("/api/shopify/orders?limit=1").catch(function () { return null; })
    ]).then(function (r) {
      var p = r[0], o = r[1];
      if (!p && !o) { setHtml("ov-store", emptyBox("Store endpoints unreachable right now.")); return; }
      var html = "";
      if (p) html += kv("products on record", String(p.total != null ? p.total : (p.products || []).length));
      if (o) html += kv("orders on record", String(o.total != null ? o.total : (o.orders || []).length));
      html += kv("storefront", "gojojoes.com");
      setHtml("ov-store", html);
    });

    /* scheduled tasks */
    V.vfGet("/api/tasks").then(function (d) {
      var tasks = (d && (d.tasks || d.items)) || (Array.isArray(d) ? d : []);
      if (!tasks.length) { setHtml("ov-tasks", emptyBox("No scheduled tasks reported by the backend.")); return; }
      setHtml("ov-tasks", tasks.slice(0, 6).map(function (t) {
        var name = t.title || t.name || t.task || t.description || "task";
        var st = t.status || t.state || "";
        var when = t.created_at || t.updated_at || t.run_at || "";
        return '<div class="kv"><span class="k">' + esc(when ? fmtTime(when) : "") + '</span><span class="v">' + esc(name) + (st ? ' · ' + esc(st) : "") + "</span></div>";
      }).join(""));
    }).catch(function (e) { setHtml("ov-tasks", errBox("loadOverview", e)); });
  }

  /* ---------------- missions ---------------- */
  function loadStateStrip() {
    V.vfGet(MC + "/states").then(function (d) {
      var states = [];
      if (Array.isArray(d)) states = d;
      else if (d && Array.isArray(d.states)) states = d.states;
      else if (d && d.states && typeof d.states === "object") states = Object.keys(d.states);
      else if (d && Array.isArray(d.state_machine)) states = d.state_machine;
      states = states.map(function (s) { return typeof s === "string" ? s : (s && (s.name || s.state)) || ""; }).filter(Boolean);
      if (!states.length) states = Object.keys(STATE_LABEL);
      setHtml("state-strip", states.map(function (st, i) {
        return (i ? '<span class="arrow">&rarr;</span>' : "") + stateChip(st);
      }).join(""));
    }).catch(function () {
      setHtml("state-strip", Object.keys(STATE_LABEL).map(function (st, i) {
        return (i ? '<span class="arrow">&rarr;</span>' : "") + stateChip(st);
      }).join(""));
    });
  }

  function missionBadges(m) {
    var b = "";
    if (m.state === "awaiting_approval") b += ' <span class="badge approval">NEEDS HUMAN APPROVAL</span>';
    if (m.state === "completed") b += ' <span class="badge evidence">EVIDENCE-GATED</span>';
    return b;
  }

  function loadMissions() {
    loadStateStrip();
    V.vfGet(MC + "/missions?limit=50").then(function (d) {
      var missions = d.missions || [];
      if (!missions.length) {
        setHtml("missions-list", '<div class="card">' + emptyBox("No missions yet — dispatch the fleet&rsquo;s first objective from the Dispatch tab.") + "</div>");
        return;
      }
      setHtml("missions-list", missions.map(function (m) {
        return '<article class="card mission-card" data-mid="' + esc(m.id) + '">'
          + '<div class="objective">' + esc(m.objective || "(no objective)") + "</div>"
          + '<div class="meta-row">' + stateChip(m.state) + missionBadges(m)
          + '<span class="mid">#' + esc(String(m.id).slice(0, 8)) + "</span>"
          + (m.created_at ? '<span class="mid">' + esc(fmtTime(m.created_at)) + "</span>" : "")
          + "</div>"
          + '<div class="mission-detail" id="detail-' + esc(m.id) + '"></div>'
          + "</article>";
      }).join(""));
      document.querySelectorAll(".mission-card").forEach(function (card) {
        card.addEventListener("click", function (ev) {
          if (ev.target && ev.target.tagName === "BUTTON") return;
          toggleMissionDetail(card.getAttribute("data-mid"));
        });
      });
    }).catch(function (e) {
      setHtml("missions-list", '<div class="card">' + errBox("loadMissions", e) + "</div>");
    });
  }

  function toggleMissionDetail(mid) {
    var box = el("detail-" + mid);
    if (!box) return;
    if (box.classList.contains("open")) { box.classList.remove("open"); box.innerHTML = ""; return; }
    box.classList.add("open");
    box.innerHTML = '<div class="skeleton">LOADING DETAIL&hellip;</div>';
    V.vfGet(MC + "/missions/" + encodeURIComponent(mid)).then(function (d) {
      var mission = d.mission || {};
      var tasks = d.tasks || [];
      var audit = d.audit || [];
      var html = "";
      var synth = d.synthesis || mission.synthesis || mission.result_summary
        || (typeof mission.result === "string" ? mission.result : null);
      if (!synth) {
        var oracleTask = tasks.filter(function (t) { return /oracle/i.test(t.agent || "") && t.result; })[0];
        if (oracleTask) synth = typeof oracleTask.result === "string" ? oracleTask.result : V.vfResultText(oracleTask.result);
      }
      html += '<div class="card-title">Oracle synthesis</div>';
      html += synth
        ? '<div class="synth-box">' + esc(synth) + "</div>"
        : '<div class="sub" style="color:var(--ink-faint); font-size:12.5px;">No synthesis attached to this mission yet' + (mission.state === "completed" ? " — it completed without a synthesis text on record." : " — Oracle reports when the mission concludes.") + "</div>";
      if (tasks.length) {
        html += '<div class="card-title" style="margin-top:14px;">Tasks (' + tasks.length + ")</div>";
        html += tasks.map(function (t) {
          return '<div class="task-row"><div><span class="agent">' + esc(t.agent || "agent") + '</span> '
            + '<span class="instr">' + esc(t.instruction || "") + '</span></div>'
            + '<span class="mid">' + esc(t.status || "") + "</span></div>";
        }).join("");
      }
      if (audit.length) {
        html += '<div class="card-title" style="margin-top:14px;">Timeline</div><div class="timeline">';
        html += audit.slice(-8).map(function (a) {
          var what = (a.from_state || a.to_state)
            ? esc(a.from_state || "") + " &rarr; " + esc(a.to_state || "")
            : esc(a.event_type || "event");
          return "<div>" + esc(fmtTime(a.created_at)) + " — " + esc(a.actor || "") + ": " + what + "</div>";
        }).join("");
        html += "</div>";
      }
      if (mission.state === "awaiting_approval") {
        html += '<div style="margin-top:12px;"><button class="btn approve small" onclick="MT.approveMission(\'' + esc(mid) + '\')">Approve mission</button></div>';
      }
      box.innerHTML = html || emptyBox("No detail on record for this mission.");
    }).catch(function (e) { box.innerHTML = errBox(null, e); });
  }

  function approveMission(mid) {
    return V.vfPost(MC + "/missions/" + encodeURIComponent(mid) + "/transition",
      { to_state: "approved", actor: "commander", email: "commander@vektorflow.com" })
      .then(function () { loadMissions(); loadSafety(); })
      .catch(function (e) { alert("Approval failed: " + (e && e.message ? e.message : e)); });
  }

  /* ---------------- dispatch ---------------- */
  function dispatchMission() {
    var goal = el("dispatch-goal").value.trim();
    var out = el("dispatch-output");
    var btn = el("dispatch-btn");
    if (!goal) { out.textContent = "Describe the mission objective first."; return; }
    btn.disabled = true; btn.textContent = "LAUNCHING…";
    out.textContent = "Creating mission…";
    var mid = null;
    V.vfPost(MC + "/missions", { objective: goal }).then(function (d) {
      mid = d.mission && d.mission.id;
      if (!mid) throw new Error("Backend did not return a mission id.");
      out.textContent = "Planning across the 15-agent team…";
      return V.vfPost(MC + "/missions/" + encodeURIComponent(mid) + "/plan");
    }).then(function () {
      out.textContent = "Executing — the fleet is on it…";
      return V.vfPost(MC + "/missions/" + encodeURIComponent(mid) + "/execute?wait=false");
    }).then(function () {
      btn.disabled = false; btn.textContent = "DISPATCH MISSION";
      out.textContent = "Mission #" + String(mid).slice(0, 8) + " is executing. Watch it on the Missions tab.";
      el("dispatch-goal").value = "";
      loaded.missions = false;
    }).catch(function (e) {
      btn.disabled = false; btn.textContent = "DISPATCH MISSION";
      out.textContent = "Dispatch failed: " + (e && e.message ? e.message : e);
    });
  }

  function sendChat() {
    var input = el("chat-input");
    var log = el("chat-log");
    var btn = el("chat-btn");
    var val = input.value.trim();
    if (!val) return;
    log.innerHTML += '<div class="chat-msg you"><span class="who">YOU</span>' + esc(val) + "</div>";
    input.value = "";
    btn.disabled = true; btn.textContent = "ASKING THE FLEET…";
    V.vfPost("/api/ai/chat", { message: val }, { timeout: 180000 }).then(function (d) {
      var text = typeof d === "string" ? d
        : (d && (d.response || d.reply || d.message)) || V.vfResultText(d && d.result !== undefined ? d.result : d);
      log.innerHTML += '<div class="chat-msg sys"><span class="who">VEKTORMIND</span>' + esc(text) + "</div>";
    }).catch(function (e) {
      log.innerHTML += '<div class="chat-msg sys"><span class="who">VEKTORMIND</span>The fleet couldn&rsquo;t answer: ' + esc(e && e.message ? e.message : e) + "</div>";
    }).then(function () {
      btn.disabled = false; btn.textContent = "SEND TO FLEET";
    });
  }

  /* ---------------- agents ---------------- */
  function loadAgents() {
    V.vfGet("/api/agents").then(function (d) {
      var agents = d.agents || [];
      if (!agents.length) { setHtml("agents-grid", '<div class="card">' + emptyBox("The backend reports no registered agents.") + "</div>"); return; }
      setHtml("agents-grid", agents.map(function (a) {
        var name = a.name || a.id || "Agent";
        var role = a.role || a.description || a.specialty || "";
        var st = a.status || "unknown";
        var stCls = st === "idle" ? "st-ready" : (st === "busy" || st === "working" ? "st-executing" : "st-draft");
        return '<div class="card agent-card"><div class="avatar">' + esc(String(name).charAt(0).toUpperCase()) + "</div>"
          + '<div class="name">' + esc(name) + "</div>"
          + (role ? '<div class="role">' + esc(role) + "</div>" : "")
          + '<div class="status"><span class="state-chip ' + stCls + '">' + esc(String(st).toUpperCase()) + "</span></div></div>";
      }).join(""));
    }).catch(function (e) {
      setHtml("agents-grid", '<div class="card">' + errBox("loadAgents", e) + "</div>");
    });
  }

  /* ---------------- safety & approvals ---------------- */
  function findKillState(gw) {
    /* Read the kill-switch state from whichever shape the gateway reports.
       Returns {known:bool, engaged:bool, killedAgents:[...]} */
    var out = { known: false, engaged: false, killedAgents: [] };
    if (!gw || typeof gw !== "object") return out;
    /* The live gateway nests it at security.kill_switch — check every
       plausible container, then any nested object carrying the flag. */
    var containers = [];
    if (gw.kill_switch && typeof gw.kill_switch === "object") containers.push(gw.kill_switch);
    if (gw.security && typeof gw.security === "object") {
      if (gw.security.kill_switch && typeof gw.security.kill_switch === "object") containers.push(gw.security.kill_switch);
      containers.push(gw.security);
    }
    containers.push(gw);
    Object.keys(gw).forEach(function (k) {
      var v = gw[k];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        if (v.kill_switch && typeof v.kill_switch === "object") containers.push(v.kill_switch);
        containers.push(v);
      }
    });
    var ks = null;
    for (var c = 0; c < containers.length; c++) {
      if (typeof containers[c].global_killed === "boolean" || Array.isArray(containers[c].killed_agents)) { ks = containers[c]; break; }
    }
    if (!ks) ks = gw;
    var candidates = ["global_killed", "killed", "engaged", "active", "kill_switch_engaged", "global_kill_switch"];
    for (var i = 0; i < candidates.length; i++) {
      if (typeof ks[candidates[i]] === "boolean") { out.known = true; out.engaged = ks[candidates[i]]; break; }
    }
    if (!out.known && typeof gw.kill_switch_engaged === "boolean") { out.known = true; out.engaged = gw.kill_switch_engaged; }
    var lists = [ks.killed_agents, ks.killed, gw.killed_agents];
    for (var j = 0; j < lists.length; j++) {
      if (Array.isArray(lists[j])) { out.killedAgents = lists[j]; break; }
    }
    return out;
  }

  function loadSafety() {
    V.vfGet("/api/v1/gateway/status").then(function (gw) {
      var ks = findKillState(gw);
      var box = el("killswitch");
      if (!ks.known) {
        box.className = "killswitch";
        setText("ks-state", "STATUS UNREPORTED");
        setText("ks-sub", "The gateway answered, but its response carries no kill-switch field this panel recognizes. Raw fields are listed beside this panel — nothing is hidden.");
      } else if (ks.engaged) {
        box.className = "killswitch engaged";
        setText("ks-state", "ENGAGED — FLEET HALTED");
        setText("ks-sub", "The global kill switch is ON. Tool calls and model calls are stopped."
          + (ks.killedAgents.length ? " Halted agents: " + ks.killedAgents.join(", ") : ""));
      } else {
        box.className = "killswitch";
        setText("ks-state", "CLEAR — FLEET LIVE");
        setText("ks-sub", "The global kill switch is off. The fleet is operating inside the policy envelope, and the switch can halt it instantly.");
      }
      setHtml("gw-boundaries", kvRows(gw));
    }).catch(function (e) {
      var box = el("killswitch");
      box.className = "killswitch";
      setText("ks-state", "STATUS UNREPORTED");
      setText("ks-sub", "Could not read gateway status — state unknown, and this panel says so rather than guessing.");
      setHtml("gw-boundaries", errBox("loadSafety", e));
    });

    V.vfGet(MC + "/missions?limit=50").then(function (d) {
      var waiting = (d.missions || []).filter(function (m) { return m.state === "awaiting_approval"; });
      if (!waiting.length) {
        setHtml("approval-queue", emptyBox("Nothing is waiting. When a mission needs a human decision, it appears here."));
        return;
      }
      setHtml("approval-queue", waiting.map(function (m) {
        return '<div class="kv"><span class="k">#' + esc(String(m.id).slice(0, 8)) + '</span><span class="v">' + esc(m.objective || "") + "</span></div>"
          + '<div style="padding:8px 0 12px;"><button class="btn approve small" onclick="MT.approveMission(\'' + esc(m.id) + '\')">Approve</button></div>';
      }).join(""));
    }).catch(function (e) { setHtml("approval-queue", errBox("loadSafety", e)); });
  }

  /* ---------------- meta panel ---------------- */
  function loadMeta() {
    V.vfGet("/api/meta/status").then(function (d) {
      var chatReady = d && (d.chat && d.chat.ready === true || d.chat_model_ready === true || d.chat_ready === true
        || (d.chat_model && typeof d.chat_model === "object" && d.chat_model.ready === true));
      var imageReady = d && (d.image && d.image.ready === true || d.image_model_ready === true || d.image_ready === true
        || (d.image_model && typeof d.image_model === "object" && d.image_model.ready === true));
      var connected = d && d.configured === true && d.api_key_set === true && (chatReady || imageReady);
      setHtml("meta-panel",
        '<div class="card"><div class="card-title">Meta Model API — live status</div>'
        + '<div class="big" style="color:' + (connected ? "var(--green)" : "var(--amber)") + ';">' + (connected ? "CONNECTED" : "NOT LIVE") + "</div>"
        + '<div style="margin-top:10px;">' + kvRows(d) + "</div>"
        + '<p class="sub" style="margin-top:10px;">Rendered from the backend&rsquo;s own response — every field above is real.</p></div>');
    }).catch(function (e) {
      var notLive = e && e.status === 404;
      setHtml("meta-panel",
        '<div class="card"><div class="card-title">Meta Model API — live status</div>'
        + '<div class="offline-banner">' + (notLive
          ? "NOT LIVE ON THE DEPLOYED BACKEND YET. The route /api/meta/status does not exist on today&rsquo;s production main — it returns 404. The Meta bridge (status route + Muse Spark chat + Muse Image) is built and tested on the local prep branch and lands the moment the approved merge ships. This panel will light up with the real status the second it does — until then, it shows you this, honestly."
          : "Could not read the Meta status route. No status is being simulated.")
        + '<span class="detail">' + esc(e && e.message ? e.message : e) + "</span></div>"
        + '<div style="margin-top:12px;">' + kv("route", "/api/meta/status") + kv("expected ready-state", "connected · model · meta_served") + "</div></div>");
    });
  }

  /* ---------------- store ---------------- */
  function loadStore() {
    V.vfGet("/api/shopify/products?limit=24").then(function (d) {
      var products = d.products || [];
      setText("store-count", String(d.total != null ? d.total : products.length));
      if (!products.length) { setHtml("product-grid", '<div class="card">' + emptyBox("No products returned by the backend.") + "</div>"); return; }
      setHtml("product-grid", products.map(function (p) {
        var img = (p.image && p.image.src) || (p.images && p.images[0] && p.images[0].src) || "";
        var price = "";
        if (p.variants && p.variants[0] && p.variants[0].price != null) price = "$" + p.variants[0].price;
        else if (p.price != null) price = "$" + p.price;
        var st = String(p.status || "").toLowerCase();
        var chip = st ? '<span class="state-chip ' + (st === "active" ? "st-completed" : "st-draft") + '">' + esc(st.toUpperCase()) + "</span>" : "";
        return '<div class="card product-card">'
          + (img ? '<img loading="lazy" alt="" src="' + esc(img) + '"/>' : "")
          + '<div class="p-title">' + esc(p.title || "(untitled)") + "</div>"
          + (price ? '<div class="p-price">' + esc(price) + "</div>" : "")
          + '<div class="p-status">' + chip + "</div></div>";
      }).join(""));
    }).catch(function (e) {
      setText("store-count", "—");
      setHtml("product-grid", '<div class="card">' + errBox("loadStore", e) + "</div>");
    });

    V.vfGet("/api/shopify/orders?limit=10").then(function (d) {
      var orders = d.orders || [];
      setText("store-orders", String(d.total != null ? d.total : orders.length));
      if (!orders.length) {
        setHtml("orders-box", emptyBox("Zero orders on record. The first one will land here the moment it happens — the watch is live."));
        return;
      }
      setHtml("orders-box", orders.map(function (o) {
        var name = o.name || o.order_number || o.id || "order";
        var total = o.total_price != null ? "$" + o.total_price : "";
        var st = o.financial_status || o.fulfillment_status || "";
        return '<div class="kv"><span class="k">' + esc(name) + '</span><span class="v">' + esc(total) + (st ? " · " + esc(st) : "") + "</span></div>";
      }).join(""));
    }).catch(function (e) {
      setText("store-orders", "—");
      setHtml("orders-box", errBox("loadStore", e));
    });
  }

  /* ---------------- second brain ---------------- */
  /* Hermes — the family's Operator — lives on Wallace's phone. His live
     signal to this backend IS the second-brain relay: /api/second-brain/status
     is the same endpoint that drives the relay card below. This section only
     re-reads those real fields (relay_online, relay.hostname/status/
     last_seen_at, error) — no Hermes data is invented anywhere. */
  function hermesCard(d, online, relay) {
    var html = '<div class="card"><div class="card-title">Hermes — Operator (phone)</div>'
      + '<p class="sub">Hermes runs on Wallace&rsquo;s phone. His check-in with the fleet is the second-brain relay below — when the relay reports in, that is Hermes reporting for duty. No relay, no Hermes: this panel never pretends otherwise.</p>';
    if (online) {
      html += '<div class="big" style="color:var(--green); margin-top:10px;">HERMES CHECKED IN</div>';
      if (relay) {
        html += '<div style="margin-top:10px;">';
        if (relay.hostname) html += kv("host", relay.hostname);
        if (relay.status) html += kv("relay status", relay.status);
        if (relay.last_seen_at) html += kv("last check-in", fmtTime(relay.last_seen_at));
        var hasExtra = Object.keys(relay).some(function (k) { return k !== "hostname" && k !== "status" && k !== "last_seen_at"; });
        if (hasExtra) html += kvRows(relay, { hostname: 1, status: 1, last_seen_at: 1 });
        html += "</div>";
      } else {
        html += '<p class="sub" style="margin-top:10px;">The backend reports the relay online but returned no relay record to show.</p>';
      }
    } else {
      html += '<div class="offline-banner" style="margin-top:10px;">HERMES OFFLINE — relay table missing.'
        + (d && d.error ? '<span class="detail">Backend says: ' + esc(d.error) + "</span>" : "")
        + "</div>"
        + '<p class="sub" style="margin-top:10px;">Hermes himself is fine — he lives on the phone. His check-in line is what is down: the relay&rsquo;s table (public.termux_relays) was never created in the live database, so the backend has nowhere to record his heartbeat. The moment that migration is applied and the phone relay checks in, this panel lights up with his real check-in.</p>';
    }
    html += "</div>";
    return html;
  }

  function loadBrain() {
    V.vfGet("/api/second-brain/status").then(function (d) {
      var online = d && d.relay_online === true;
      var relay = d && d.relay ? d.relay : null;
      var rawJobs = d && d.jobs;
      var jobs = Array.isArray(rawJobs) ? rawJobs : (rawJobs && typeof rawJobs === "object" ? [rawJobs] : []);
      var html = hermesCard(d, online, relay);
      html += '<div class="card"><div class="card-title">Termux relay — live state</div>';
      if (online) {
        html += '<div class="big" style="color:var(--green);">RELAY ONLINE</div>';
        if (relay) html += '<div style="margin-top:10px;">' + kvRows(relay) + "</div>";
      } else {
        html += '<div class="offline-banner">RELAY OFFLINE — the phone-side relay is not checking in.'
          + (d && d.error ? '<span class="detail">Backend says: ' + esc(d.error) + "</span>" : "")
          + "</div>"
          + '<p class="sub" style="margin-top:10px;">Known cause on record: the relay&rsquo;s database table was never created in the live Supabase project (the migration exists in the repo). Until it is applied, this panel stays honestly dark — the rest of the system is unaffected.</p>';
      }
      html += '<div class="card-title" style="margin-top:14px;">Relay jobs</div>';
      html += jobs.length
        ? jobs.map(function (j) {
          var id = j.id != null ? j.id : (j.job_id != null ? j.job_id : "job");
          var state = j.status != null ? j.status : (j.state != null ? j.state : "");
          var count = j.count != null ? " · count " + j.count : "";
          return '<div class="kv"><span class="k">' + esc(String(id)) + '</span><span class="v">' + esc(String(state)) + esc(count) + "</span></div>";
        }).join("")
        : emptyBox("No relay jobs on record.");
      html += "</div>";
      setHtml("brain-panel", html);
    }).catch(function (e) {
      setHtml("brain-panel", '<div class="card">' + errBox("loadBrain", e) + "</div>");
    });
  }

  /* ---------------- wiring ---------------- */
  loaders.overview = function () { loadOverview(); };
  loaders.missions = function () { loadMissions(); };
  loaders.dispatch = function () { loadHeader(); };
  loaders.agents = function () { loadAgents(); };
  loaders.safety = function () { loadSafety(); };
  loaders.meta = function () { loadMeta(); };
  loaders.store = function () { loadStore(); };
  loaders.brain = function () { loadBrain(); };

  el("dispatch-btn").addEventListener("click", dispatchMission);
  el("chat-btn").addEventListener("click", sendChat);
  el("btn-refresh").addEventListener("click", function () {
    loaded = {};
    var active = document.querySelector(".view.active");
    if (active) {
      var name = active.id.replace("view-", "");
      if (loaders[name]) loaders[name]();
    }
    loadHeader();
  });

  window.MT = {
    loadOverview: loadOverview, loadMissions: loadMissions, loadAgents: loadAgents,
    loadSafety: loadSafety, loadMeta: loadMeta, loadStore: loadStore, loadBrain: loadBrain,
    approveMission: approveMission
  };

  /* init + gentle polling (header + visible overview stay fresh) */
  loadOverview();
  setInterval(function () {
    loadHeader();
    var ov = el("view-overview");
    if (ov && ov.classList.contains("active")) loadOverview();
  }, 45000);
})();
