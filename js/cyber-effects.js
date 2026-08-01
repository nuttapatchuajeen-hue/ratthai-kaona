/* ===========================================================================
   Cyberpunk Micro-interactions & Touch Effects — รัฐไทยก้าวหน้า
   ---------------------------------------------------------------------------
   - Card 3D Tilt on mouse move & mobile touch
   - Cyberpunk Glitch & Neon Ripple Effect on Click/Tap
   - HUD Pulse Badge Animation Handler
   =========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. CARD 3D TILT ON MOUSE & TOUCH ──
  const cyberCards = document.querySelectorAll('.cyber-card, .stat, .hero-btn-primary, .hero-btn-ghost');
  
  cyberCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 768) return; // Disable heavy tilt on small mobile
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -6; // max deg
      const rotateY = ((x - centerX) / centerX) * 6;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // ── 2. NEON TOUCH RIPPLE EFFECT ──
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.cyber-btn, .hero-btn-primary, .hero-btn-ghost, .nav-tab, .nav-burger');
    if (!target) return;

    const ripple = document.createElement('span');
    ripple.className = 'cyber-ripple';
    
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    target.style.position = target.style.position === 'static' ? 'relative' : target.style.position;
    target.style.overflow = 'hidden';
    target.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});
