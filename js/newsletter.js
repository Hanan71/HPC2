/* ─────────────────────────────────────────────────────────────────────────────
   newsletter.js — Visual-only subscription handler (no backend / no DB)
   Works on every page that has the footer newsletter input + subscribe button.
───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Toast container (injected once) ────────────────────────────────────── */
  function getToastContainer() {
    var el = document.getElementById('hpc-toast-wrap');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hpc-toast-wrap';
      el.style.cssText = [
        'position:fixed',
        'top:24px',
        'left:50%',
        'transform:translateX(-50%)',
        'z-index:9999',
        'min-width:300px',
        'max-width:90vw',
        'pointer-events:none'
      ].join(';');
      document.body.appendChild(el);
    }
    return el;
  }

  /* ── Show a toast message ───────────────────────────────────────────────── */
  function showToast(msg, type) {
    var container = getToastContainer();
    var toast = document.createElement('div');
    var bg    = type === 'success' ? '#198754' : '#dc3545';
    var icon  = type === 'success' ? '✅' : '⚠️';

    toast.style.cssText = [
      'background:' + bg,
      'color:#fff',
      'padding:14px 22px',
      'border-radius:10px',
      'font-family:Cairo,Tajawal,sans-serif',
      'font-size:15px',
      'font-weight:600',
      'line-height:1.5',
      'text-align:center',
      'direction:rtl',
      'box-shadow:0 4px 20px rgba(0,0,0,.25)',
      'opacity:0',
      'transition:opacity .3s ease',
      'pointer-events:auto',
      'margin-bottom:8px'
    ].join(';');

    toast.textContent = icon + '  ' + msg;
    container.appendChild(toast);

    /* Fade in */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.style.opacity = '1'; });
    });

    /* Fade out and remove after 3.5 s */
    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 3500);
  }

  /* ── Shake animation for invalid input ─────────────────────────────────── */
  function shakeInput(input) {
    input.style.transition = 'transform .1s ease';
    var steps = [6, -6, 4, -4, 2, -2, 0];
    var i = 0;
    (function next() {
      if (i >= steps.length) { input.style.transform = ''; return; }
      input.style.transform = 'translateX(' + steps[i++] + 'px)';
      setTimeout(next, 60);
    })();
    input.style.borderColor = '#dc3545';
    setTimeout(function () { input.style.borderColor = ''; }, 1500);
  }

  /* ── Get current lang from localStorage ────────────────────────────────── */
  function getLang() {
    try { return localStorage.getItem('hpc-lang') || 'ar'; } catch (e) { return 'ar'; }
  }

  /* ── Get translation from i18n dict ────────────────────────────────────── */
  function t(key) {
    try {
      var dict = window.__hpcDict;
      if (dict && dict[getLang()] && dict[getLang()][key]) {
        return dict[getLang()][key];
      }
    } catch (e) {}
    /* Fallbacks */
    var fallback = {
      ar: {
        'newsletter.success': 'شكراً على اشتراكك! سنبقيك على اطلاع بآخر أخبار اِنطلاقة 🌿',
        'newsletter.invalid': 'يرجى إدخال بريد إلكتروني صحيح.'
      },
      en: {
        'newsletter.success': "Thank you for subscribing! We'll keep you updated with the latest from HPC 🌿",
        'newsletter.invalid': 'Please enter a valid email address.'
      }
    };
    return (fallback[getLang()] || fallback.ar)[key] || key;
  }

  /* ── Wire every subscribe button on the page ─────────────────────────────
     Selector targets the button inside the footer newsletter input group.
     Works whether there is one or multiple footers (404, etc.).
  ────────────────────────────────────────────────────────────────────────── */
  function wireButtons() {
    /* All subscribe buttons — identified by their i18n key attribute */
    var buttons = document.querySelectorAll('[data-i18n="footer.subscribe"]');

    buttons.forEach(function (btn) {
      /* Prevent double-binding */
      if (btn.dataset.nlBound) return;
      btn.dataset.nlBound = '1';

      btn.addEventListener('click', function () {
        /* Find the nearest input in the same wrapper */
        var wrapper = btn.closest('.position-relative') || btn.parentElement;
        var input   = wrapper ? wrapper.querySelector('input') : null;
        if (!input) return;

        var val = input.value.trim();
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

        if (!emailOk) {
          shakeInput(input);
          showToast(t('newsletter.invalid'), 'error');
          input.focus();
          return;
        }

        /* Success — clear field, show toast */
        input.value = '';
        input.style.borderColor = '#198754';
        setTimeout(function () { input.style.borderColor = ''; }, 2000);
        showToast(t('newsletter.success'), 'success');
      });

      /* Also trigger on Enter key inside the input */
      var wrapper = btn.closest('.position-relative') || btn.parentElement;
      var input   = wrapper ? wrapper.querySelector('input') : null;
      if (input && !input.dataset.nlBound) {
        input.dataset.nlBound = '1';
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') btn.click();
        });
      }
    });
  }

  /* ── Init ───────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireButtons);
  } else {
    wireButtons();
  }

  /* Re-run after i18n finishes re-rendering (in case buttons are re-created) */
  document.addEventListener('hpc-lang-applied', wireButtons);
})();
