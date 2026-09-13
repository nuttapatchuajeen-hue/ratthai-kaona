/**
 * รัฐไทยก้าวหน้า — Cyber Cookie & Storage Consent Banner (PDPA Compliant)
 * แสดงแถบแจ้งเตือนการใช้งาน LocalStorage และข้อมูลที่จำเป็น สไตล์ Cyberpunk GovTech
 * Self-contained: ฉีด CSS และ DOM อัตโนมัติ ไม่กระทบเลย์เอาต์หน้าเดิม
 */
(function () {
  'use strict';

  if (window.__cyberCookieConsentMounted) return;
  window.__cyberCookieConsentMounted = true;

  var STORAGE_KEY = 'ratthai-privacy-consent';
  var CONSENT_VERSION = 'v1';

  // ตรวจสอบว่าผู้ใช้เคยกดยอมรับหรือปิดแล้วหรือยัง
  try {
    if (localStorage.getItem(STORAGE_KEY) === CONSENT_VERSION) {
      return; // เคยกดยอมรับแล้ว ไม่ต้องแสดงอีก
    }
  } catch (e) {}

  var css = [
    '#cyber-cookie-banner {',
    '  position: fixed;',
    '  bottom: 24px;',
    '  left: 24px;',
    '  z-index: 99998;',
    '  width: 410px;',
    '  max-width: calc(100vw - 48px);',
    '  background: rgba(6, 12, 22, 0.94);',
    '  backdrop-filter: blur(16px);',
    '  -webkit-backdrop-filter: blur(16px);',
    '  border: 1px solid rgba(0, 229, 255, 0.35);',
    '  border-radius: 14px;',
    '  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 229, 255, 0.16);',
    '  padding: 16px 18px;',
    '  box-sizing: border-box;',
    '  font-family: system-ui, -apple-system, "Sarabun", sans-serif;',
    '  color: #DCE8F0;',
    '  opacity: 0;',
    '  transform: translateY(24px);',
    '  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);',
    '}',
    '#cyber-cookie-banner.cyber-cookie-visible {',
    '  opacity: 1;',
    '  transform: translateY(0);',
    '}',
    '.cyber-cookie-corner {',
    '  position: absolute;',
    '  width: 8px;',
    '  height: 8px;',
    '  border-color: #00E5FF;',
    '  border-style: solid;',
    '  pointer-events: none;',
    '}',
    '.cyber-corner-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; border-top-left-radius: 14px; }',
    '.cyber-corner-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; border-bottom-right-radius: 14px; }',
    '.cyber-cookie-header {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  margin-bottom: 10px;',
    '}',
    '.cyber-cookie-badge {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 6px;',
    '  background: rgba(0, 229, 255, 0.1);',
    '  border: 1px solid rgba(0, 229, 255, 0.25);',
    '  padding: 3px 8px;',
    '  border-radius: 6px;',
    '}',
    '.cyber-cookie-dot {',
    '  width: 6px;',
    '  height: 6px;',
    '  background: #00E5FF;',
    '  border-radius: 50%;',
    '  box-shadow: 0 0 8px #00E5FF;',
    '  animation: cyberDotPulse 2s infinite ease-in-out;',
    '}',
    '@keyframes cyberDotPulse {',
    '  0%, 100% { opacity: 1; transform: scale(1); }',
    '  50% { opacity: 0.4; transform: scale(0.85); }',
    '}',
    '.cyber-cookie-tag {',
    '  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;',
    '  font-size: 0.68rem;',
    '  font-weight: 700;',
    '  color: #00E5FF;',
    '  letter-spacing: 0.05em;',
    '}',
    '.cyber-cookie-close {',
    '  background: transparent;',
    '  border: none;',
    '  color: #7E97A8;',
    '  cursor: pointer;',
    '  padding: 4px 6px;',
    '  font-size: 0.9rem;',
    '  border-radius: 4px;',
    '  transition: color 0.15s, background 0.15s;',
    '  line-height: 1;',
    '}',
    '.cyber-cookie-close:hover {',
    '  color: #FFF;',
    '  background: rgba(255, 255, 255, 0.08);',
    '}',
    '.cyber-cookie-title {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 6px;',
    '  font-size: 0.92rem;',
    '  font-weight: 700;',
    '  color: #FFF;',
    '  margin-bottom: 6px;',
    '}',
    '.cyber-cookie-desc {',
    '  font-size: 0.78rem;',
    '  line-height: 1.55;',
    '  color: #A0AEC0;',
    '  margin: 0 0 14px 0;',
    '}',
    '.cyber-cookie-desc b {',
    '  color: #6EE7B7;',
    '  font-weight: 600;',
    '}',
    '.cyber-cookie-actions {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 10px;',
    '}',
    '.cyber-cookie-btn-accept {',
    '  flex: 1;',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 6px;',
    '  background: linear-gradient(135deg, #00E5FF 0%, #00A3FF 100%);',
    '  color: #05080E;',
    '  font-weight: 700;',
    '  font-size: 0.82rem;',
    '  padding: 8px 14px;',
    '  border: none;',
    '  border-radius: 8px;',
    '  cursor: pointer;',
    '  box-shadow: 0 4px 14px rgba(0, 229, 255, 0.28);',
    '  transition: all 0.2s ease;',
    '}',
    '.cyber-cookie-btn-accept:hover {',
    '  box-shadow: 0 6px 20px rgba(0, 229, 255, 0.5);',
    '  transform: translateY(-1px);',
    '}',
    '.cyber-cookie-btn-detail {',
    '  background: rgba(255, 255, 255, 0.05);',
    '  color: #94A3B8;',
    '  font-size: 0.78rem;',
    '  font-weight: 600;',
    '  padding: 8px 12px;',
    '  border: 1px solid rgba(255, 255, 255, 0.12);',
    '  border-radius: 8px;',
    '  cursor: pointer;',
    '  transition: all 0.15s ease;',
    '}',
    '.cyber-cookie-btn-detail:hover {',
    '  background: rgba(255, 255, 255, 0.1);',
    '  color: #FFF;',
    '  border-color: rgba(0, 229, 255, 0.3);',
    '}',
    '.cyber-cookie-detail-panel {',
    '  margin-top: 12px;',
    '  padding-top: 10px;',
    '  border-top: 1px solid rgba(255, 255, 255, 0.08);',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 6px;',
    '}',
    '.cyber-detail-item {',
    '  display: flex;',
    '  align-items: baseline;',
    '  justify-content: space-between;',
    '  font-size: 0.7rem;',
    '  background: rgba(0, 0, 0, 0.3);',
    '  padding: 5px 8px;',
    '  border-radius: 6px;',
    '}',
    '.cyber-detail-name {',
    '  font-family: monospace;',
    '  color: #38BDF8;',
    '  font-weight: 700;',
    '}',
    '.cyber-detail-desc {',
    '  color: #94A3B8;',
    '}',
    '@media (max-width: 640px) {',
    '  #cyber-cookie-banner {',
    '    bottom: 16px;',
    '    left: 14px;',
    '    right: 14px;',
    '    width: auto;',
    '    max-width: none;',
    '    padding: 14px;',
    '  }',
    '}'
  ].join('\n');

  function dismiss() {
    var banner = document.getElementById('cyber-cookie-banner');
    if (!banner) return;
    banner.classList.remove('cyber-cookie-visible');
    try {
      localStorage.setItem(STORAGE_KEY, CONSENT_VERSION);
    } catch (e) {}

    // เล่นเสียง SFX สไตล์ไซเบอร์ (ถ้ามี)
    if (window.CyberSFX && typeof window.CyberSFX.play === 'function') {
      try { window.CyberSFX.play('click'); } catch (err) {}
    }

    setTimeout(function () {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 400);
  }

  function mount() {
    if (!document.body || document.getElementById('cyber-cookie-banner')) return;

    var style = document.createElement('style');
    style.id = 'cyber-cookie-style';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);

    var banner = document.createElement('div');
    banner.id = 'cyber-cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'นโยบายความเป็นส่วนตัวและคุกกี้');

    banner.innerHTML = [
      '<div class="cyber-cookie-corner cyber-corner-tl"></div>',
      '<div class="cyber-cookie-corner cyber-corner-br"></div>',
      '<div class="cyber-cookie-header">',
      '  <div class="cyber-cookie-badge">',
      '    <span class="cyber-cookie-dot"></span>',
      '    <span class="cyber-cookie-tag">SYS.PRIVACY // PDPA COMPLIANT</span>',
      '  </div>',
      '  <button class="cyber-cookie-close" id="cyberCookieClose" title="ปิด">✕</button>',
      '</div>',
      '<div class="cyber-cookie-body">',
      '  <div class="cyber-cookie-title">',
      '    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      '    การจัดเก็บข้อมูลและการใช้งาน (Privacy Notice)',
      '  </div>',
      '  <p class="cyber-cookie-desc">',
      '    เว็บไซต์นี้ใช้ LocalStorage เฉพาะเพื่อบันทึกการตั้งค่าการใช้งาน (เช่น ธีมมืด/สว่าง และระดับเสียงเพลง) <b>ไม่มีการใช้คุกกี้ติดตามพฤติกรรมเพื่อการค้าหรือโฆษณาใดๆ</b> เป็นไปตามหลัก PDPA',
      '  </p>',
      '</div>',
      '<div class="cyber-cookie-actions">',
      '  <button class="cyber-cookie-btn-accept" id="cyberCookieAccept">',
      '    <span>⚡ ยอมรับและเข้าใจ</span>',
      '  </button>',
      '  <button class="cyber-cookie-btn-detail" id="cyberCookieDetail">',
      '    รายละเอียด',
      '  </button>',
      '</div>',
      '<div class="cyber-cookie-detail-panel" id="cyberCookieDetailPanel" style="display:none;">',
      '  <div class="cyber-detail-item">',
      '    <span class="cyber-detail-name">md-theme</span>',
      '    <span class="cyber-detail-desc">จำธีมมืด/สว่างในเครื่อง</span>',
      '  </div>',
      '  <div class="cyber-detail-item">',
      '    <span class="cyber-detail-name">cyber-bgm-*</span>',
      '    <span class="cyber-detail-desc">จำเพลงและระดับเสียง</span>',
      '  </div>',
      '  <div class="cyber-detail-item">',
      '    <span class="cyber-detail-name" style="color:#10B981;">Ad Trackers</span>',
      '    <span class="cyber-detail-desc" style="color:#10B981;font-weight:600;">ไม่มี 100% (Clean)</span>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(banner);

    // เปิดการแสดงผลแบบมี Animation ค่อยๆ ลอยขึ้นมาหลังเปิดเว็บ 1.2 วินาที
    setTimeout(function () {
      banner.classList.add('cyber-cookie-visible');
    }, 1200);

    var acceptBtn = document.getElementById('cyberCookieAccept');
    var closeBtn = document.getElementById('cyberCookieClose');
    var detailBtn = document.getElementById('cyberCookieDetail');
    var detailPanel = document.getElementById('cyberCookieDetailPanel');

    if (acceptBtn) acceptBtn.addEventListener('click', dismiss);
    if (closeBtn) closeBtn.addEventListener('click', dismiss);

    if (detailBtn && detailPanel) {
      detailBtn.addEventListener('click', function () {
        var isHidden = detailPanel.style.display === 'none';
        detailPanel.style.display = isHidden ? 'flex' : 'none';
        detailBtn.textContent = isHidden ? 'ซ่อนรายละเอียด' : 'รายละเอียด';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
