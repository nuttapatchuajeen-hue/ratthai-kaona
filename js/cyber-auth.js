/**
 * CYBER AUTH ENGINE (v1.0)
 * ระบบเข้าสู่ระบบ, สมาชิก, และจัดการข้อมูลข้อเสนอแนะ สไตล์ Cyberpunk
 * โครงงาน "รัฐไทยก้าวหน้า"
 */

(function () {
  "use strict";

  const STORAGE_USERS_KEY = "md_cyber_users";
  const STORAGE_SESSION_KEY = "md_cyber_session";
  const STORAGE_COMMENTS_KEY = "md_cyber_comments";
  const STORAGE_SURVEY_KEY = "md_survey_online_responses";

  // บัญชีเริ่มต้นสำหรับผู้ดูแลระบบ (Admin เท่านั้น)
  const DEFAULT_USERS = [
    {
      id: "usr_admin",
      username: "admin",
      email: "admin@thaigovernmentdata.org",
      fullName: "ผู้ดูแลระบบ (Admin)",
      password: "password123",
      role: "admin",
      avatarBg: "role-admin",
      createdAt: "2026-09-01T10:00:00.000Z"
    }
  ];

  // ข้อเสนอแนะตัวอย่างตั้งต้น (สอดคล้องกับรายงานบทที่ 4)
  const DEFAULT_COMMENTS = [
    {
      id: "cmt_1",
      author: "ดร.ภาณุวัฒน์ ศิริพงษ์",
      username: "panuwat_doc",
      role: "guest",
      text: "เว็บไซต์นำเสนอโครงสร้างและแผนผังเข้าใจง่ายมากครับ แผนที่ ส.ส. 500 คนและทำเนียบ ครม. แสดงผลได้รวดเร็วและน่าสนใจมาก",
      ts: "2026-09-12T09:15:00.000Z"
    },
    {
      id: "cmt_2",
      author: "กิตติศักดิ์ เจริญกิจ",
      username: "kittisak_k",
      role: "guest",
      text: "อยากให้มีตัวช่วยค้นหาโครงสร้างหน่วยงานย่อยในระดับสำนัก/กองเพิ่มเติมครับ แต่โดยภาพรวมถือว่าเป็นแหล่งข้อมูลที่ยอดเยี่ยม",
      ts: "2026-09-13T14:40:00.000Z"
    },
    {
      id: "cmt_3",
      author: "ผู้ดูแลระบบ (Admin)",
      username: "admin",
      role: "admin",
      text: "ระบบปรับปรุงฐานข้อมูลสถิติปี 2569 และเพิ่มความเสถียรของระบบคำนวณผลเรียบร้อยแล้วครับ ขอบคุณทุกข้อเสนอแนะ",
      ts: "2026-09-14T11:20:00.000Z"
    }
  ];

  // ข้อมูลคำตอบออนไลน์ตัวอย่าง (เพื่อให้มีข้อมูลออนไลน์ผสมกับเล่มรายงาน n=30 ได้ทันที)
  const DEFAULT_ONLINE_RESPONSES = [
    {
      id: "rsp_001",
      ts: "2026-09-13T10:12:00.000Z",
      gender: "ชาย",
      age: "18 – 25 ปี",
      status: "นักเรียน / นักศึกษา",
      freq: "สัปดาห์ละ 1 – 2 ครั้ง",
      ratings: [5, 5, 4, 5, 5, 5, 5, 4, 5, 5, 4, 5, 5, 5, 5, 5],
      comment: "เว็บไซต์ออกแบบได้ล้ำสมัยมาก ใช้งานง่าย ค้นหาข้อมูลภาครัฐได้รวดเร็ว",
      username: "kittisak_k"
    },
    {
      id: "rsp_002",
      ts: "2026-09-14T08:45:00.000Z",
      gender: "หญิง",
      age: "26 – 35 ปี",
      status: "ข้าราชการ / พนักงานของรัฐ",
      freq: "เกือบทุกวัน",
      ratings: [5, 4, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5],
      comment: "มีประโยชน์ต่อการค้นคว้างานราชการมากค่ะ อยากให้มีฟังก์ชันเทียบงบประมาณย้อนหลัง",
      username: "siriporn_gov"
    }
  ];

  const CyberAuth = {
    // ── 1. การจัดการฐานข้อมูล LocalStorage ──
    getUsers: function () {
      try {
        const data = localStorage.getItem(STORAGE_USERS_KEY);
        if (!data) {
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
          return DEFAULT_USERS;
        }
        const parsed = JSON.parse(data);
        const adminOnly = Array.isArray(parsed) ? parsed.filter((u) => u.role === "admin") : [];
        if (!adminOnly.length) {
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
          return DEFAULT_USERS;
        }
        return adminOnly;
      } catch (e) {
        return DEFAULT_USERS;
      }
    },

    saveUsers: function (users) {
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      } catch (e) {
        console.error("Save users error:", e);
      }
    },

    // ── 2. เซสชันผู้ใช้ปัจจุบัน ──
    getCurrentUser: function () {
      try {
        const session = localStorage.getItem(STORAGE_SESSION_KEY);
        if (!session) return null;
        const user = JSON.parse(session);
        // ถ้าระบบจำกัดเฉพาะ Admin แต่ session เดิมไม่ใช่ admin ให้ล้างทิ้ง
        if (user && user.role !== "admin") {
          localStorage.removeItem(STORAGE_SESSION_KEY);
          return null;
        }
        return user;
      } catch (e) {
        return null;
      }
    },

    isLoggedIn: function () {
      return !!this.getCurrentUser();
    },

    isAdmin: function () {
      const user = this.getCurrentUser();
      return !!(user && user.role === "admin");
    },

    // ── 3. ฟังก์ชัน เข้าสู่ระบบ / ออกจากระบบ ──
    login: function (usernameOrEmail, password, remember = true) {
      const users = this.getUsers();
      const q = (usernameOrEmail || "").trim().toLowerCase();
      const user = users.find(
        (u) => (u.username.toLowerCase() === q || u.email.toLowerCase() === q) && u.password === password
      );

      if (!user) {
        return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านผู้ดูแลระบบไม่ถูกต้อง (ใช้ admin / password123)" };
      }

      const sessionData = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: "admin",
        avatarBg: "role-admin",
        token: "cyber_admin_jwt_" + Math.random().toString(36).substring(2) + Date.now(),
        loginAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
      } catch (e) {
        console.error(e);
      }

      this.updateNavbarUI();
      this.closeModal();
      this.notifyChange(sessionData);
      return { success: true, user: sessionData };
    },

    register: function () {
      return { success: false, message: "ระบบสงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) ไม่เปิดรับสมาชิกทั่วไป" };
    },

    logout: function () {
      try {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      } catch (e) {}
      this.updateNavbarUI();
      this.notifyChange(null);
      return { success: true };
    },

    notifyChange: function (user) {
      window.dispatchEvent(new CustomEvent("cyber-auth-changed", { detail: { user } }));
    },

    // ── 4. การจัดการข้อเสนอแนะเพิ่มเติม (Comments & Suggestions) ──
    getComments: function () {
      try {
        const raw = localStorage.getItem(STORAGE_COMMENTS_KEY);
        if (!raw) {
          localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(DEFAULT_COMMENTS));
          return DEFAULT_COMMENTS;
        }
        return JSON.parse(raw);
      } catch (e) {
        return DEFAULT_COMMENTS;
      }
    },

    addComment: function (text) {
      const trimmed = (text || "").trim();
      if (!trimmed) return { success: false, message: "กรุณาระบุข้อความข้อเสนอแนะ" };

      const user = this.getCurrentUser();
      const comments = this.getComments();
      const newComment = {
        id: "cmt_" + Date.now(),
        author: user ? user.fullName : "ผู้ใช้งานทั่วไป",
        username: user ? user.username : "guest",
        role: user ? user.role : "guest",
        text: trimmed,
        ts: new Date().toISOString()
      };

      comments.unshift(newComment);
      try {
        localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
      } catch (e) {
        return { success: false, message: "ไม่สามารถบันทึกข้อเสนอแนะได้" };
      }

      window.dispatchEvent(new CustomEvent("cyber-comments-updated", { detail: { comments } }));
      return { success: true, comment: newComment };
    },

    deleteComment: function (id) {
      if (!this.isAdmin()) return { success: false, message: "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถลบได้" };
      let comments = this.getComments();
      comments = comments.filter((c) => c.id !== id);
      try {
        localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent("cyber-comments-updated", { detail: { comments } }));
      return { success: true };
    },

    // ── 5. การจัดการผลแบบประเมินและดาวน์โหลด CSV ──
    getSurveyResponses: function () {
      try {
        const raw = localStorage.getItem(STORAGE_SURVEY_KEY);
        if (!raw) {
          localStorage.setItem(STORAGE_SURVEY_KEY, JSON.stringify(DEFAULT_ONLINE_RESPONSES));
          return DEFAULT_ONLINE_RESPONSES;
        }
        return JSON.parse(raw);
      } catch (e) {
        return DEFAULT_ONLINE_RESPONSES;
      }
    },

    saveSurveyResponse: function (responseData) {
      const list = this.getSurveyResponses();
      const user = this.getCurrentUser();
      const item = {
        id: "rsp_" + Date.now(),
        ts: new Date().toISOString(),
        username: user ? user.username : "guest",
        ...responseData
      };
      list.push(item);
      try {
        localStorage.setItem(STORAGE_SURVEY_KEY, JSON.stringify(list));
      } catch (e) {
        console.error("Failed to save survey response:", e);
      }
      // หากมีข้อเสนอแนะ บันทึกเข้า feed ข้อเสนอแนะด้วย
      if (responseData.comment && responseData.comment.trim()) {
        this.addComment(responseData.comment.trim());
      }
      return item;
    },

    exportSurveyCSV: function () {
      const responses = this.getSurveyResponses();
      if (!responses.length) {
        alert("ยังไม่มีข้อมูลคำตอบออนไลน์ให้ดาวน์โหลด");
        return;
      }

      // ส่วนหัวของคอลัมน์ CSV
      const headers = [
        "ID",
        "Timestamp",
        "Username",
        "Gender",
        "Age",
        "Status",
        "Frequency",
        ...Array.from({ length: 16 }, (_, i) => `Q${i + 1}`),
        "Comment"
      ];

      const rows = responses.map((r) => {
        const ratings = r.ratings || [];
        return [
          `"${r.id || ""}"`,
          `"${r.ts || ""}"`,
          `"${r.username || "guest"}"`,
          `"${r.gender || ""}"`,
          `"${r.age || ""}"`,
          `"${r.status || ""}"`,
          `"${r.freq || ""}"`,
          ...Array.from({ length: 16 }, (_, i) => ratings[i] !== undefined ? ratings[i] : ""),
          `"${(r.comment || "").replace(/"/g, '""')}"`
        ].join(",");
      });

      // ใส่ UTF-8 BOM (\uFEFF) เพื่อให้เปิดใน Microsoft Excel ภาษาไทยไม่เป็นภาษาต่างดาว
      const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ratthai_kaona_survey_raw_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    // ── 6. การสร้าง UI บน Navbar & Modal ──
    init: function () {
      this.injectNavSlot();
      this.injectModal();
      this.updateNavbarUI();
      this.bindGlobalEvents();
    },

    injectNavSlot: function () {
      const nav = document.querySelector(".site-header nav");
      if (!nav) return;
      if (document.getElementById("authNavSlot")) return;

      const slot = document.createElement("div");
      slot.id = "authNavSlot";
      slot.className = "auth-nav-slot";
      nav.appendChild(slot);
    },

    updateNavbarUI: function () {
      const slot = document.getElementById("authNavSlot");
      if (!slot) return;

      const user = this.getCurrentUser();
      if (!user) {
        slot.innerHTML = `
          <button type="button" class="auth-login-btn" id="btnOpenAuthModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>เข้าสู่ระบบ Admin</span>
          </button>
        `;
        document.getElementById("btnOpenAuthModal").addEventListener("click", () => this.openModal("login"));
      } else {
        slot.innerHTML = `
          <div class="auth-user-chip" id="authUserChip" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false">
            <div class="auth-avatar role-admin">A</div>
            <span style="font-family:'Prompt',sans-serif;font-weight:600;">Admin</span>
            <span class="auth-chip-role role-admin">ADMIN</span>
          </div>

          <div class="auth-dropdown" id="authDropdown">
            <div class="auth-dropdown-header">
              <div class="auth-dropdown-name">${user.fullName}</div>
              <div class="auth-dropdown-email">${user.email}</div>
            </div>
            <ul class="auth-dropdown-menu">
              <li>
                <button type="button" class="auth-dropdown-item" id="btnProfileModal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>ข้อมูลแอดมิน (Admin Info)</span>
                </button>
              </li>
              <li>
                <button type="button" class="auth-dropdown-item" id="btnAdminExportCSV">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  <span>ส่งออกข้อมูลดิบ (CSV)</span>
                </button>
              </li>
              <li>
                <button type="button" class="auth-dropdown-item is-danger" id="btnLogoutBtn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  <span>ออกจากระบบ</span>
                </button>
              </li>
            </ul>
          </div>
        `;

        const chip = document.getElementById("authUserChip");
        const dropdown = document.getElementById("authDropdown");

        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = dropdown.classList.toggle("is-open");
          chip.classList.toggle("is-active", isOpen);
          chip.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        document.getElementById("btnLogoutBtn").addEventListener("click", () => {
          this.logout();
        });

        document.getElementById("btnProfileModal").addEventListener("click", () => {
          dropdown.classList.remove("is-open");
          chip.classList.remove("is-active");
          this.openModal("profile");
        });

        const btnExport = document.getElementById("btnAdminExportCSV");
        if (btnExport) {
          btnExport.addEventListener("click", () => {
            dropdown.classList.remove("is-open");
            chip.classList.remove("is-active");
            this.exportSurveyCSV();
          });
        }
      }
    },

    injectModal: function () {
      if (document.getElementById("cyberAuthModalBackdrop")) return;

      const modalEl = document.createElement("div");
      modalEl.id = "cyberAuthModalBackdrop";
      modalEl.className = "cyber-modal-backdrop";
      modalEl.setAttribute("role", "dialog");
      modalEl.setAttribute("aria-modal", "true");

      modalEl.innerHTML = `
        <div class="cyber-modal-card">
          <button type="button" class="cyber-modal-close" id="cyberModalCloseBtn" aria-label="ปิดหน้าต่าง">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div class="cyber-modal-header">
            <span class="cyber-modal-badge" style="color:#FFA07A;border-color:rgba(255,92,26,0.4);background:rgba(255,92,26,0.1);">ADMINISTRATOR CONSOLE</span>
            <h2 class="cyber-modal-title" id="cyberModalTitle">เข้าสู่ระบบผู้ดูแลระบบ</h2>
            <p class="cyber-modal-desc" id="cyberModalDesc">เฉพาะผู้ดูแลระบบ เพื่อเข้าถึงข้อมูลดิบ CSV และลบข้อเสนอแนะ</p>
          </div>

          <div class="cyber-auth-alert" id="cyberAuthAlert"></div>

          <!-- FORM: LOGIN ADMIN -->
          <form id="cyberLoginForm">
            <div class="cyber-form-group">
              <label class="cyber-form-label" for="loginUsername">ชื่อผู้ใช้ (Username)</label>
              <div class="cyber-input-wrap">
                <input class="cyber-input" type="text" id="loginUsername" placeholder="admin" required autocomplete="username" />
              </div>
            </div>

            <div class="cyber-form-group">
              <label class="cyber-form-label" for="loginPassword">รหัสผ่าน (Password)</label>
              <div class="cyber-input-wrap">
                <input class="cyber-input" type="password" id="loginPassword" placeholder="••••••••" required autocomplete="current-password" />
                <button type="button" class="cyber-input-icon-btn" id="btnToggleLoginPw" aria-label="แสดงรหัสผ่าน">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div class="cyber-form-meta">
              <label class="cyber-checkbox-label">
                <input type="checkbox" id="loginRemember" checked />
                <span>จดจำการเข้าสู่ระบบ</span>
              </label>
            </div>

            <button type="submit" class="cyber-btn-submit" style="background:linear-gradient(135deg,#FF8C00,#FF5C1A);box-shadow:0 4px 16px rgba(255,92,26,0.35);color:#fff;">
              <span>เข้าสู่ระบบ Admin</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <!-- 1-Click Demo Accounts -->
            <div class="cyber-demo-accounts">
              <div class="cyber-demo-accounts-title">เข้าสู่ระบบด่วน 1-CLICK</div>
              <button type="button" class="cyber-demo-btn admin" id="btnFillAdmin" style="width:100%;padding:0.65rem;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>เข้าสู่ระบบ Admin (admin / password123)</span>
              </button>
            </div>
          </form>

          <!-- VIEW: PROFILE (เมื่อเปิดดูโปรไฟล์) -->
          <div id="cyberProfileView" style="display:none;">
            <div style="background:rgba(255,92,26,0.08);border:1px solid rgba(255,92,26,0.3);border-radius:10px;padding:1.2rem;margin-bottom:1.2rem;">
              <div style="display:flex;align-items:center;gap:14px;margin-bottom:1rem;">
                <div class="auth-avatar role-admin" id="profAvatar" style="width:48px;height:48px;font-size:1.3rem;">A</div>
                <div>
                  <div style="font-family:'Prompt';font-size:1.1rem;font-weight:700;color:#fff;" id="profName">ผู้ดูแลระบบ (Admin)</div>
                  <div style="font-family:'IBM Plex Mono';font-size:0.8rem;color:#FFA07A;" id="profRole">ADMINISTRATOR</div>
                </div>
              </div>
              <div style="font-size:0.85rem;color:var(--auth-text-dim);line-height:1.7;">
                <div><strong>สิทธิ์การใช้งาน:</strong> <span style="color:#00E5FF;">ดาวน์โหลด CSV ข้อมูลดิบ, ลบข้อเสนอแนะ</span></div>
                <div><strong>ชื่อผู้ใช้:</strong> <span id="profUser" style="color:#fff;">admin</span></div>
                <div><strong>เข้าสู่ระบบล่าสุด:</strong> <span id="profLoginAt" style="color:#fff;">-</span></div>
              </div>
            </div>

            <div style="display:flex;gap:10px;">
              <button type="button" class="cyber-demo-btn" id="btnExportMyData" style="padding:0.6rem;">
                ⬇ ส่งออกข้อมูลดิบ (CSV)
              </button>
              <button type="button" class="cyber-btn-submit" id="btnCloseProfileBtn" style="background:#FF5C1A;box-shadow:0 4px 16px rgba(255,92,26,0.35);color:#fff;">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>

        </div>
      `;

      if (!document.body) return;
      document.body.appendChild(modalEl);

      // Event Listeners สำหรับ Modal
      const backdrop = modalEl;
      const closeBtn = document.getElementById("cyberModalCloseBtn");
      if (closeBtn) closeBtn.addEventListener("click", () => this.closeModal());
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) this.closeModal();
      });

      // สลับแท็บ
      const tabs = document.querySelectorAll(".cyber-auth-tab");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          this.switchTab(tab.getAttribute("data-target"));
        });
      });

      // Submit Login
      const loginForm = document.getElementById("cyberLoginForm");
      if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const u = document.getElementById("loginUsername")?.value || "";
          const p = document.getElementById("loginPassword")?.value || "";
          const res = this.login(u, p);
          if (!res.success) {
            this.showAlert(res.message, "error");
          }
        });
      }

      // 1-Click Demo fill (Admin Only)
      const btnFillAdmin = document.getElementById("btnFillAdmin");
      if (btnFillAdmin) {
        btnFillAdmin.addEventListener("click", () => {
          const u = document.getElementById("loginUsername");
          const p = document.getElementById("loginPassword");
          if (u) u.value = "admin";
          if (p) p.value = "password123";
          this.login("admin", "password123");
        });
      }

      // Show/Hide Password
      const btnTogglePw = document.getElementById("btnToggleLoginPw");
      if (btnTogglePw) {
        btnTogglePw.addEventListener("click", () => {
          const inp = document.getElementById("loginPassword");
          if (inp) inp.type = inp.type === "password" ? "text" : "password";
        });
      }

      const btnCloseProf = document.getElementById("btnCloseProfileBtn");
      if (btnCloseProf) btnCloseProf.addEventListener("click", () => this.closeModal());

      const btnExportMy = document.getElementById("btnExportMyData");
      if (btnExportMy) btnExportMy.addEventListener("click", () => this.exportSurveyCSV());
    },

    openModal: function (mode = "login") {
      const backdrop = document.getElementById("cyberAuthModalBackdrop");
      if (!backdrop) return;
      this.clearAlert();

      if (mode === "profile") {
        this.showProfileView();
      } else {
        const profileView = document.getElementById("cyberProfileView");
        const loginForm = document.getElementById("cyberLoginForm");
        if (profileView) profileView.style.display = "none";
        if (loginForm) loginForm.style.display = "block";
        const title = document.getElementById("cyberModalTitle");
        const desc = document.getElementById("cyberModalDesc");
        if (title) title.textContent = "เข้าสู่ระบบผู้ดูแลระบบ";
        if (desc) desc.textContent = "เฉพาะผู้ดูแลระบบ เพื่อเข้าถึงข้อมูลดิบ CSV และลบข้อเสนอแนะ";
      }

      backdrop.classList.add("is-open");
    },

    closeModal: function () {
      const backdrop = document.getElementById("cyberAuthModalBackdrop");
      if (backdrop) backdrop.classList.remove("is-open");
    },

    showProfileView: function () {
      const user = this.getCurrentUser();
      if (!user) return;

      const loginForm = document.getElementById("cyberLoginForm");
      if (loginForm) loginForm.style.display = "none";

      const profileView = document.getElementById("cyberProfileView");
      if (profileView) profileView.style.display = "block";

      const title = document.getElementById("cyberModalTitle");
      const desc = document.getElementById("cyberModalDesc");
      if (title) title.textContent = "ข้อมูลผู้ดูแลระบบ";
      if (desc) desc.textContent = "สิทธิ์ผู้ดูแลระบบ: ดาวน์โหลดข้อมูลดิบ CSV และลบข้อเสนอแนะ";

      const avatar = document.getElementById("profAvatar");
      if (avatar) {
        avatar.textContent = "A";
        avatar.className = "auth-avatar role-admin";
      }

      const profName = document.getElementById("profName");
      const profRole = document.getElementById("profRole");
      const profUser = document.getElementById("profUser");
      const profLoginAt = document.getElementById("profLoginAt");

      if (profName) profName.textContent = user.fullName || "ผู้ดูแลระบบ (Admin)";
      if (profRole) profRole.textContent = "ADMINISTRATOR (ผู้ดูแลระบบ)";
      if (profUser) profUser.textContent = user.username || "admin";
      if (profLoginAt) profLoginAt.textContent = user.loginAt ? new Date(user.loginAt).toLocaleString("th-TH") : "-";
    },

    showAlert: function (msg, type = "error") {
      const el = document.getElementById("cyberAuthAlert");
      if (!el) return;
      el.textContent = msg;
      el.className = "cyber-auth-alert " + (type === "error" ? "is-error" : "is-success");
    },

    clearAlert: function () {
      const el = document.getElementById("cyberAuthAlert");
      if (!el) return;
      el.textContent = "";
      el.className = "cyber-auth-alert";
    },

    bindGlobalEvents: function () {
      // คลิกนอก Dropdown เพื่อปิด
      document.addEventListener("click", (e) => {
        const dropdown = document.getElementById("authDropdown");
        const chip = document.getElementById("authUserChip");
        if (dropdown && dropdown.classList.contains("is-open")) {
          if (!dropdown.contains(e.target) && (!chip || !chip.contains(e.target))) {
            dropdown.classList.remove("is-open");
            if (chip) chip.classList.remove("is-active");
          }
        }
      });

      // Esc ปิด Modal
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeModal();
        }
      });
    }
  };

  window.CyberAuth = CyberAuth;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => CyberAuth.init());
  } else {
    CyberAuth.init();
  }
})();
