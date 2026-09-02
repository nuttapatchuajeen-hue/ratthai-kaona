/* ===========================================================================
   Global Cyberpunk HUD Search Controller — รัฐไทยก้าวหน้า
   =========================================================================== */

(() => {
  const SEARCH_DATA = [
    // Pages / Navigation
    { title: "หน้าแรก — รัฐไทยก้าวหน้า", category: "หน้าเว็บ", url: "hub/index.html" },
    { title: "แผนผังโครงสร้างภาครัฐ (20 กระทรวง 147 กรม)", category: "โครงสร้าง", url: "structure.html" },
    { title: "ส.ส. ผู้แทนราษฎร (รายเขต / บัญชีรายชื่อ / พรรค)", category: "ผู้แทนราษฎร", url: "election/index.html" },
    { title: "ทำเนียบคณะรัฐมนตรี", category: "คณะรัฐมนตรี", url: "cabinet/index.html" },
    { title: "แดชบอร์ดสถิติข้อมูลภาครัฐ", category: "สถิติ", url: "stats/index.html" },
    { title: "เกี่ยวกับโครงการและวิสัยทัศน์", category: "เกี่ยวกับเรา", url: "hub/about.html" },
    { title: "แบบประเมินความพึงพอใจ", category: "ประเมิน", url: "hub/survey.html" },

    // Ministries
    { title: "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.)", category: "กระทรวง", url: "structure.html#mheshi" },
    { title: "กระทรวงสาธารณสุข (สธ.)", category: "กระทรวง", url: "structure.html#moph" },
    { title: "กระทรวงกลาโหม (กห.)", category: "กระทรวง", url: "structure.html#mod" },
    { title: "กระทรวงการคลัง (กค.)", category: "กระทรวง", url: "structure.html#mof" },
    { title: "กระทรวงมหาดไทย (มท.)", category: "กระทรวง", url: "structure.html#moi" },
    { title: "กระทรวงศึกษาธิการ (ศธ.)", category: "กระทรวง", url: "structure.html#moe" },
    { title: "กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม (ดีอี)", category: "กระทรวง", url: "structure.html#mdes" }
  ];

  function createSearchModal() {
    if (document.getElementById('cyber-search-modal')) return;

    const modalHTML = `
      <div id="cyber-search-modal" class="cyber-search-modal" role="dialog" aria-modal="true" aria-label="Search">
        <div class="cyber-search-container">
          <div class="cyber-search-header">
            <svg class="cyber-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" id="cyber-search-input" class="cyber-search-input" placeholder="พิมพ์ค้นหา กระทรวง, กรม, ส.ส., มหาวิทยาลัย..." autocomplete="off" />
            <button class="cyber-search-close" id="cyber-search-close">ESC</button>
          </div>
          <div class="cyber-search-results" id="cyber-search-results"></div>
          <div class="cyber-search-footer">
            <span>กด <strong>↑</strong> <strong>↓</strong> เพื่อเลื่อนเลือก</span>
            <span>กด <strong>ENTER</strong> เพื่อเปิดดู</span>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('cyber-search-modal');
    const input = document.getElementById('cyber-search-input');
    const closeBtn = document.getElementById('cyber-search-close');
    const resultsContainer = document.getElementById('cyber-search-results');

    function openModal() {
      modal.classList.add('is-active');
      input.value = '';
      renderResults('');
      setTimeout(() => input.focus(), 50);
    }

    function closeModal() {
      modal.classList.remove('is-active');
    }

    function renderResults(query) {
      const q = query.trim().toLowerCase();
      const filtered = q
        ? SEARCH_DATA.filter(item => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q))
        : SEARCH_DATA.slice(0, 6);

      if (filtered.length === 0) {
        resultsContainer.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: #7E97A8;">ไม่พบข้อมูลตามคำค้นหา "${query}"</div>`;
        return;
      }

      resultsContainer.innerHTML = filtered.map((item, idx) => `
        <a href="${item.url}" class="search-result-item ${idx === 0 ? 'is-selected' : ''}">
          <div>
            <strong style="color:#fff; font-weight:600;">${item.title}</strong>
          </div>
          <span class="result-tag">${item.category}</span>
        </a>
      `).join('');
    }

    input.addEventListener('input', (e) => renderResults(e.target.value));
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modal.classList.contains('is-active')) closeModal();
        else openModal();
      }
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.search-trigger-btn, [data-action="open-search"]');
      if (btn) {
        e.preventDefault();
        openModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSearchModal);
  } else {
    createSearchModal();
  }
})();
