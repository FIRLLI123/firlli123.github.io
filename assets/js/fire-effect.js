(function () {
  'use strict';

  let cursorEl;
  let cursorRing;
  let activeSection = null;
  let activeZone = null;

  const cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { x: cursorPos.x, y: cursorPos.y };

  function isFinePointer() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  function syncCursor() {
    if (!cursorEl || !cursorRing) {
      return;
    }

    ringPos.x += (cursorPos.x - ringPos.x) * 0.18;
    ringPos.y += (cursorPos.y - ringPos.y) * 0.18;

    cursorEl.style.transform = `translate(${cursorPos.x}px, ${cursorPos.y}px)`;
    cursorRing.style.transform = `translate(calc(${ringPos.x - cursorPos.x}px - 50%), calc(${ringPos.y - cursorPos.y}px - 50%))`;

    requestAnimationFrame(syncCursor);
  }

  function setActiveSection(section) {
    if (activeSection === section) {
      return;
    }

    if (activeSection) {
      activeSection.classList.remove('cursor-active');
    }

    activeSection = section;

    if (activeSection) {
      activeSection.classList.add('cursor-active');
    }
  }

  function setActiveZone(zone) {
    if (activeZone === zone) {
      return;
    }

    activeZone = zone;

    if (cursorEl) {
      cursorEl.classList.toggle('is-active', !!activeZone);
    }
  }

  function findInteractiveZone(target) {
    return target.closest('main .section');
  }

  function updateHoverState(target) {
    if (!cursorEl) {
      return;
    }

    const isClickable = !!target.closest('a, button, [role="button"], .btn, input, textarea, select, summary, label');
    cursorEl.classList.toggle('hover-active', isClickable);
  }

  function handlePointerMove(event) {
    cursorPos.x = event.clientX;
    cursorPos.y = event.clientY;

    const target = document.elementFromPoint(event.clientX, event.clientY);
    if (!target) {
      setActiveZone(null);
      setActiveSection(null);
      return;
    }

    const zone = findInteractiveZone(target);
    setActiveZone(zone);
    setActiveSection(zone);
    updateHoverState(target);
  }

  function clearStates() {
    setActiveZone(null);
    setActiveSection(null);

    if (cursorEl) {
      cursorEl.classList.remove('hover-active');
    }
  }

  function init() {
    if (!isFinePointer()) {
      return;
    }

    cursorEl = document.getElementById('aurora-cursor');
    cursorRing = document.getElementById('aurora-cursor-ring');

    if (!cursorEl || !cursorRing) {
      return;
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseout', (event) => {
      if (!event.relatedTarget) {
        clearStates();
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearStates();
      }
    });

    syncCursor();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
