/* ============================================================
   ai-chat.js — วิดเจ็ตผู้ช่วย AI ข้อมูลรัฐ (รวมงานเว็บ md)
   ใช้ได้ทุกหน้า: ใส่ <script src=".../js/ai-chat.js"></script> ก่อน </body>
   - ปุ่มลอยมุมขวาล่าง (เลี่ยงปุ่มสลับธีม 🌙 อัตโนมัติ)
   - ตามธีมเว็บ (html[data-theme]) เอง
   - คุยผ่าน proxy ของเรา → ThaiLLM (API key ไม่อยู่ในไฟล์นี้)
   ============================================================ */
(function () {
  "use strict";

  // ⬇️⬇️⬇️ แก้บรรทัดเดียวนี้: ใส่ URL proxy ของคุณหลัง deploy ขึ้น Netlify ⬇️⬇️⬇️
  var PROXY_URL = "https://YOUR-SITE.netlify.app/api/chat";
  // ⬆️⬆️⬆️ เช่น https://md-ai-proxy.netlify.app/api/chat ⬆️⬆️⬆️

  // คำสั่งระบบ (บุคลิก/ขอบเขตของผู้ช่วย)
  // 📌 เฟสต่อไป: เอาข้อมูลจริง (ครม./กระทรวง/ส.ส.) มาต่อท้ายตรงนี้ เพื่อให้ตอบแม่นขึ้น
  var SYSTEM_PROMPT =
    "คุณคือ 'ผู้ช่วยข้อมูลรัฐ' ของเว็บรวมงาน md ตอบคำถามเกี่ยวกับโครงสร้างภาครัฐไทย " +
    "คณะรัฐมนตรี สมาชิกสภาผู้แทนราษฎร และสถิติข้อมูลเปิดภาครัฐ " +
    "ตอบเป็นภาษาไทย กระชับ สุภาพ ตรงประเด็น ถ้าไม่แน่ใจหรือไม่มีข้อมูลให้บอกตรง ๆ อย่าเดา";

  var MAX_TOKENS = 1024;
  var TEMPERATURE = 0.3;

  // ---- ประวัติการสนทนา (อยู่ในหน่วยความจำ รีโหลดแล้วเริ่มใหม่) ----
  var messages = [{ role: "system", content: SYSTEM_PROMPT }];
  var busy = false;
  var opened = false;

  // ---------- CSS (scope ด้วย mdai- กันชนกับเว็บ) ----------
  var CSS = [
    "#mdai-root{--mdai-accent:#1f54c7;--mdai-accent2:#3b82f6;--mdai-surface:#fff;--mdai-surface2:#f1f4f9;",
    "--mdai-text:#1a1d24;--mdai-dim:#5b6472;--mdai-border:rgba(0,0,0,.10);--mdai-shadow:0 18px 50px -12px rgba(20,30,60,.35);",
    "font-family:'IBM Plex Sans Thai',system-ui,-apple-system,sans-serif}",
    'html[data-theme="dark"] #mdai-root{--mdai-surface:#12141a;--mdai-surface2:#1a1e27;--mdai-text:#e8eaf0;',
    "--mdai-dim:#9aa3b2;--mdai-border:rgba(255,255,255,.12);--mdai-shadow:0 18px 50px -12px rgba(0,0,0,.6)}",
    // ปุ่มลอย
    "#mdai-fab{position:fixed;right:18px;bottom:20px;z-index:99998;width:56px;height:56px;border:none;border-radius:50%;",
    "cursor:pointer;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));",
    "box-shadow:0 10px 30px -8px rgba(31,84,199,.6);transition:transform .18s ease, box-shadow .18s ease}",
    "#mdai-fab:hover{transform:translateY(-3px) scale(1.04)}",
    "#mdai-fab svg{width:26px;height:26px}",
    // หน้าต่างแชต
    "#mdai-panel{position:fixed;right:18px;bottom:88px;z-index:99999;width:380px;max-width:calc(100vw - 36px);height:70vh;max-height:560px;",
    "display:none;flex-direction:column;overflow:hidden;border-radius:18px;background:var(--mdai-surface);color:var(--mdai-text);",
    "border:1px solid var(--mdai-border);box-shadow:var(--mdai-shadow);opacity:0;transform:translateY(12px) scale(.98);transition:opacity .2s, transform .2s}",
    "#mdai-panel.mdai-show{display:flex;opacity:1;transform:none}",
    // หัว
    "#mdai-head{display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));color:#fff}",
    "#mdai-head .mdai-dot{width:9px;height:9px;border-radius:50%;background:#5ef08a;box-shadow:0 0 0 3px rgba(94,240,138,.25)}",
    "#mdai-head b{font-size:15px;font-weight:700;line-height:1.1}",
    "#mdai-head span{display:block;font-size:11px;opacity:.85;font-weight:400}",
    "#mdai-close{margin-left:auto;background:rgba(255,255,255,.15);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:18px;line-height:1}",
    "#mdai-close:hover{background:rgba(255,255,255,.28)}",
    // กล่องข้อความ
    "#mdai-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:var(--mdai-surface2)}",
    ".mdai-row{display:flex;max-width:85%}",
    ".mdai-row.me{align-self:flex-end}.mdai-row.ai{align-self:flex-start}",
    ".mdai-bubble{padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}",
    ".me .mdai-bubble{background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));color:#fff;border-bottom-right-radius:4px}",
    ".ai .mdai-bubble{background:var(--mdai-surface);color:var(--mdai-text);border:1px solid var(--mdai-border);border-bottom-left-radius:4px}",
    ".ai .mdai-bubble.err{border-color:#d7263d;color:#d7263d}",
    // จุดพิมพ์
    ".mdai-typing{display:flex;gap:4px;padding:4px 2px}",
    ".mdai-typing i{width:7px;height:7px;border-radius:50%;background:var(--mdai-dim);animation:mdai-b 1s infinite}",
    ".mdai-typing i:nth-child(2){animation-delay:.15s}.mdai-typing i:nth-child(3){animation-delay:.3s}",
    "@keyframes mdai-b{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}",
    // ช่องพิมพ์
    "#mdai-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--mdai-border);background:var(--mdai-surface)}",
    "#mdai-input{flex:1;resize:none;border:1px solid var(--mdai-border);border-radius:12px;padding:10px 12px;font:inherit;font-size:14px;",
    "background:var(--mdai-surface2);color:var(--mdai-text);max-height:110px;outline:none}",
    "#mdai-input:focus{border-color:var(--mdai-accent)}",
    "#mdai-send{border:none;border-radius:12px;width:44px;cursor:pointer;color:#fff;background:linear-gradient(135deg,var(--mdai-accent),var(--mdai-accent2));display:grid;place-items:center}",
    "#mdai-send:disabled{opacity:.5;cursor:not-allowed}",
    "#mdai-send svg{width:20px;height:20px}",
    "@media(max-width:480px){#mdai-panel{right:10px;left:10px;width:auto;height:76vh}}",
  ].join("");

  // ---------- สร้าง DOM ----------
  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function build() {
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = document.createElement("div");
    root.id = "mdai-root";

    var fab = el(
      '<button id="mdai-fab" aria-label="เปิดผู้ช่วย AI">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M9.5 9.5l1 1 4-3"/></svg></button>'
    );

    var panel = el(
      '<div id="mdai-panel" role="dialog" aria-label="ผู้ช่วย AI ข้อมูลรัฐ">' +
        '<div id="mdai-head"><span class="mdai-dot"></span><div><b>ผู้ช่วย AI ข้อมูลรัฐ</b>' +
        "<span>ถามเรื่องโครงสร้างรัฐ ครม. ส.ส. และสถิติ</span></div>" +
        '<button id="mdai-close" aria-label="ปิด">×</button></div>' +
        '<div id="mdai-msgs"></div>' +
        '<form id="mdai-form"><textarea id="mdai-input" rows="1" placeholder="พิมพ์คำถาม…" autocomplete="off"></textarea>' +
        '<button id="mdai-send" type="submit" aria-label="ส่ง"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg></button></form>' +
        "</div>"
    );

    root.appendChild(fab);
    root.appendChild(panel);
    document.body.appendChild(root);

    // เลี่ยงปุ่มสลับธีมลอยมุมขวาล่าง (เช่นหน้า stats)
    if (document.querySelector(".md-theme-toggle")) {
      fab.style.bottom = "78px";
      panel.style.bottom = "146px";
    }

    fab.addEventListener("click", toggle);
    panel.querySelector("#mdai-close").addEventListener("click", close);
    var form = panel.querySelector("#mdai-form");
    var input = panel.querySelector("#mdai-input");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      send(input.value);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send(input.value);
      }
    });
    input.addEventListener("input", function () {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 110) + "px";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && opened) close();
    });

    addBubble("ai", "สวัสดีครับ 👋 ผมเป็นผู้ช่วย AI ข้อมูลรัฐ ถามได้เลยครับ");
  }

  // ---------- การทำงาน ----------
  function toggle() {
    opened ? close() : open();
  }
  function open() {
    opened = true;
    var p = document.getElementById("mdai-panel");
    p.classList.add("mdai-show");
    document.getElementById("mdai-input").focus();
  }
  function close() {
    opened = false;
    document.getElementById("mdai-panel").classList.remove("mdai-show");
  }

  function addBubble(who, text, isErr) {
    var msgs = document.getElementById("mdai-msgs");
    var row = document.createElement("div");
    row.className = "mdai-row " + (who === "me" ? "me" : "ai");
    var b = document.createElement("div");
    b.className = "mdai-bubble" + (isErr ? " err" : "");
    b.textContent = text;
    row.appendChild(b);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return b;
  }

  function showTyping() {
    var msgs = document.getElementById("mdai-msgs");
    var row = document.createElement("div");
    row.className = "mdai-row ai";
    row.id = "mdai-typing-row";
    row.innerHTML = '<div class="mdai-bubble"><div class="mdai-typing"><i></i><i></i><i></i></div></div>';
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping() {
    var r = document.getElementById("mdai-typing-row");
    if (r) r.remove();
  }

  function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;

    if (PROXY_URL.indexOf("YOUR-SITE") !== -1) {
      addBubble("ai", "⚙️ ยังไม่ได้ตั้งค่า PROXY_URL — แก้ในไฟล์ js/ai-chat.js ให้เป็น URL Netlify ของคุณก่อนครับ", true);
      return;
    }

    var input = document.getElementById("mdai-input");
    input.value = "";
    input.style.height = "auto";
    addBubble("me", text);
    messages.push({ role: "user", content: text });

    busy = true;
    document.getElementById("mdai-send").disabled = true;
    showTyping();

    fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages, max_tokens: MAX_TOKENS, temperature: TEMPERATURE }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.error || "HTTP " + r.status);
          return data;
        });
      })
      .then(function (data) {
        hideTyping();
        var reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        reply = (reply || "").trim() || "ขออภัย ไม่ได้รับคำตอบครับ";
        messages.push({ role: "assistant", content: reply });
        addBubble("ai", reply);
      })
      .catch(function (err) {
        hideTyping();
        addBubble("ai", "เกิดข้อผิดพลาด: " + err.message, true);
      })
      .finally(function () {
        busy = false;
        document.getElementById("mdai-send").disabled = false;
      });
  }

  // ---------- เริ่มทำงาน ----------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
