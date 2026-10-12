(function () {
  var FB = (window.FB = {});
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;
  function $(id) { return document.getElementById(id); }
  function root() { return document.querySelector('.page:not([hidden])') || document; }

  /* section label in the desktop header */
  FB.chip = function () {
    var L = $('chipL'), T = $('chipT');
    if (!L || !T) return;
    var mid = window.innerHeight * 0.4, found = null;
    root().querySelectorAll('[data-chip]').forEach(function (s) { var b = s.getBoundingClientRect(); if (b.top <= mid && b.bottom > mid) found = s; });
    var p = found ? found.getAttribute('data-chip').split('|') : ['', ''];
    L.textContent = p[0]; T.textContent = p[1] || '';
  };
  FB.navState = function () { var n = document.querySelector('.nav'); if (n) n.classList.toggle('scrolled', window.scrollY > 8 || (menuBtn && menuBtn.getAttribute('aria-expanded') === 'true')); };
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { FB.chip(); FB.navState(); ticking = false; });
  }, { passive: true });

  /* mobile menu: aria-expanded, focus trap, Escape, closes on link click */
  var menuBtn = $('menuBtn'), mnav = $('mnav');
  function menuItems() { return [menuBtn].concat([].slice.call(mnav.querySelectorAll('a'))); }
  FB.menu = function (open, refocus) {
    if (!menuBtn) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mnav.hidden = !open;
    FB.navState();
    if (open) { var first = mnav.querySelector('a'); if (first) first.focus(); }
    else if (refocus) menuBtn.focus();
  };
  if (menuBtn && mnav) {
    menuBtn.addEventListener('click', function () { FB.menu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (mnav.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); FB.menu(false, true); return; }
      if (e.key !== 'Tab') return;
      var items = menuItems(), i = items.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === items.length - 1)) { e.preventDefault(); items[0].focus(); }
    });
    document.addEventListener('click', function (e) { if (!mnav.hidden && !e.target.closest('#mnav,#menuBtn')) FB.menu(false); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) FB.menu(false); });
  }

  /* VoiceRouter demo: one illustrative note, matched against an invented workspace */
  var dests = [
    { p: 'Projects', s: 'Spring launch', k: 'Folder' },
    { p: 'Support', s: 'Rota planner', k: 'Shared table' },
    { p: 'Finance', s: 'Budget 2027', k: 'Shared table' },
    { p: 'People', s: 'Team notes', k: 'Team docs' },
    { p: 'Product', s: 'Roadmap board', k: 'Board' },
    { p: 'Ops', s: 'Vendor list', k: 'Shared table' }
  ];
  var note = {
    t: "Let's trial weekend support in March, and ask Lena to check the budget first.",
    d: 1, also: [2, 3], title: 'Weekend support trial', type: 'Plan', c: 91,
    tags: ['support', 'staffing', 'budget', 'trial']
  };
  var demo = { built: false, dest: 1, moved: false, status: 'idle', timers: [], io: null };
  function name(n) { return dests[n].p + ' / ' + dests[n].s; }

  FB.demo = function () {
    var board = $('board');
    if (!board || !board.offsetParent) return;
    var thought = $('thought'), tt = $('thoughtText'), jacks = $('jacks'), lamp = $('lamp'), rt = $('resultText');
    var cable = $('cable'), pa = $('plugA'), pb = $('plugB');
    var STAGES = { listening: 0, routing: 1, confirmed: 2 };

    function later(fn, ms) { demo.timers.push(setTimeout(fn, reduce ? 0 : ms)); }
    function stop() { demo.timers.forEach(clearTimeout); demo.timers = []; }
    function prog(p) { $('progFill').style.width = p + '%'; $('progBar').setAttribute('aria-valuenow', Math.round(p)); }
    function clock(sec) { $('recTime').textContent = '00:' + (sec < 10 ? '0' : '') + sec; }
    function stage(st, label) {
      demo.status = st; board.setAttribute('data-stage', st);
      var ph = STAGES[st] === undefined ? 2 : STAGES[st];
      document.querySelectorAll('#phase .ph').forEach(function (b, n) {
        b.classList.toggle('on', n === ph);
        if (n === ph) { b.setAttribute('aria-current', 'step'); $('phaseNow').textContent = b.querySelector('.d').textContent; } else b.removeAttribute('aria-current');
      });
      $('phoneState').textContent = label;
      $('wave').classList.toggle('live', st === 'listening');
      thought.classList.toggle('typing', st === 'listening');
      $('okBtn').disabled = st !== 'confirmed';
      $('moveBtn').disabled = st !== 'confirmed' && st !== 'approved';
    }
    function path(animate) {
      var j = $('jack' + demo.dest), br = board.getBoundingClientRect(), a = thought.getBoundingClientRect();
      if (!j || !br.width) return;
      var jr = j.getBoundingClientRect();
      var x1 = a.left + a.width / 2 - br.left, y1 = a.bottom - br.top, x2 = jr.left + jr.width / 2 - br.left, y2 = jr.top - br.top, my = (y1 + y2) / 2;
      cable.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + my + ' ' + x2 + ',' + my + ' ' + x2 + ',' + y2);
      pa.setAttribute('cx', x1); pa.setAttribute('cy', y1); pb.setAttribute('cx', x2); pb.setAttribute('cy', y2);
      if (animate && !reduce) {
        var len = cable.getTotalLength();
        cable.style.transition = 'none'; cable.style.strokeDasharray = len; cable.style.strokeDashoffset = len;
        cable.getBoundingClientRect();
        cable.style.transition = 'stroke-dashoffset .7s ease'; cable.style.strokeDashoffset = 0;
      } else { cable.style.strokeDasharray = 'none'; cable.style.strokeDashoffset = 0; }
    }
    function mark(scanning) {
      jacks.classList.toggle('scanning', !!scanning);
      dests.forEach(function (_, n) {
        var el = $('jack' + n);
        el.classList.toggle('on', !scanning && n === demo.dest);
        el.classList.toggle('also', !scanning && n !== demo.dest && note.also.indexOf(n) > -1);
      });
    }
    function listen() {
      stop(); demo.dest = note.d; demo.moved = false;
      stage('listening', 'Transcribing'); lamp.className = 'lamp wait'; rt.textContent = 'Listening.';
      tt.textContent = ''; prog(0); clock(0);
      var text = note.t, k = 0;
      if (reduce) { tt.textContent = text; clock(9); match(); return; }
      (function type() {
        k++; tt.textContent = text.slice(0, k); prog(k / text.length * 33); clock(Math.round(k / text.length * 9));
        if (k < text.length) later(type, 32); else later(match, 500);
      })();
    }
    function finishTyping() { stop(); tt.textContent = note.t; clock(9); }
    function match() {
      stage('routing', 'Checking workspace'); prog(50); lamp.className = 'lamp wait';
      rt.textContent = 'Checking projects, tables and docs for the best fit.';
      mark(true); cable.setAttribute('d', ''); pa.setAttribute('cx', -20); pb.setAttribute('cx', -20);
      later(function () {
        mark(false); path(true); prog(66);
        rt.textContent = 'Best fit: ' + name(demo.dest) + '.';
        later(confirm, 1100);
      }, 1300);
    }
    function confirm() {
      stage('confirmed', 'Matched'); prog(100); lamp.className = 'lamp set';
      var card = $('routed');
      card.classList.toggle('moved', demo.moved);
      $('routedLabel').textContent = demo.moved ? 'Moved by you' : 'Best match';
      $('routedConf').textContent = demo.moved ? 'Noted for next time' : note.c + '%';
      $('routedTitle').textContent = note.title;
      $('routedQuote').textContent = '“' + note.t + '”';
      $('routedPrimary').textContent = name(demo.dest);
      $('routedAlso').textContent = note.also.filter(function (n) { return n !== demo.dest; }).map(name).join(' · ');
      $('routedType').textContent = note.type;
      var tags = $('routedTags'); tags.textContent = '';
      note.tags.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; tags.appendChild(li); });
      card.style.animation = 'none'; card.offsetHeight; card.style.animation = '';
      rt.textContent = demo.moved
        ? 'Moved to ' + name(demo.dest) + '. VoiceRouter will weigh this next time.'
        : 'Matched to ' + name(demo.dest) + ' at ' + note.c + '% confidence. Accept it or move it.';
    }

    if (!demo.built) {
      dests.forEach(function (d, n) {
        var el = document.createElement('div'); el.className = 'jack'; el.id = 'jack' + n; el.style.setProperty('--i', n);
        var b = document.createElement('b'); b.textContent = d.p + ' / ' + d.s;
        var sp = document.createElement('span'); sp.textContent = d.k;
        el.appendChild(b); el.appendChild(sp); jacks.appendChild(el);
      });
      $('okBtn').addEventListener('click', function () {
        if (demo.status !== 'confirmed') return;
        stage('approved', 'Filed'); lamp.className = 'lamp ok';
        rt.textContent = 'Accepted. Filed in ' + name(demo.dest) + '.';
      });
      $('moveBtn').addEventListener('click', function () {
        if (demo.status !== 'confirmed' && demo.status !== 'approved') return;
        stop(); demo.dest = (demo.dest + 1) % dests.length; demo.moved = true;
        stage('routing', 'Moving'); prog(66); lamp.className = 'lamp wait';
        mark(false); path(true); rt.textContent = 'Moving to ' + name(demo.dest) + '.';
        later(confirm, 900);
      });
      $('replayBtn').addEventListener('click', listen);
      document.querySelectorAll('#phase .ph').forEach(function (b, n) {
        b.addEventListener('click', function () {
          if (n === 0) { listen(); return; }
          finishTyping(); demo.dest = note.d; demo.moved = false;
          if (n === 1) match(); else { mark(false); confirm(); }
        });
      });
      window.addEventListener('resize', function () { if (demo.status === 'routing') path(false); });
      demo.built = true;
    }
    stop(); stage('listening', 'Transcribing'); tt.textContent = ''; prog(0); clock(0);
    if (demo.io) demo.io.disconnect();
    if (!('IntersectionObserver' in window)) { listen(); return; }
    demo.io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { demo.io.disconnect(); listen(); } }, { threshold: 0.35 });
    demo.io.observe(board);
  };

  /* early-access form (prototype: nothing is sent) */
  function msgs(f) { return { err: f.querySelector('.msg.err'), ok: f.querySelector('.msg.ok') }; }
  document.addEventListener('submit', function (e) {
    var f = e.target.closest ? e.target.closest('form[data-waitlist]') : null;
    if (!f) return;
    e.preventDefault();
    var em = f.querySelector('.f-email'), fn = f.querySelector('.f-first'), ck = f.querySelector('.f-consent'), btn = f.querySelector('.joinBtn'), m = msgs(f);
    var v = em.value.trim();
    em.removeAttribute('aria-invalid'); ck.removeAttribute('aria-invalid'); m.ok.textContent = ''; m.err.textContent = '';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { em.setAttribute('aria-invalid', 'true'); m.err.textContent = v ? 'Check the email address: it looks incomplete.' : 'Add your email so we know where to write.'; em.focus(); return; }
    if (!ck.checked) { ck.setAttribute('aria-invalid', 'true'); m.err.textContent = 'Tick the consent box so we can email you.'; ck.focus(); return; }
    btn.classList.add('loading'); btn.setAttribute('aria-busy', 'true');
    setTimeout(function () {
      btn.classList.remove('loading'); btn.removeAttribute('aria-busy');
      m.ok.textContent = 'Thanks' + (fn.value.trim() ? ', ' + fn.value.trim() : '') + ". You're on the early-access list. This is a prototype, so nothing was sent.";
    }, reduce ? 0 : 600);
  });
  document.addEventListener('input', function (e) {
    var f = e.target; if (!f.closest || !f.closest('form[data-waitlist]') || f.getAttribute('aria-invalid') !== 'true') return;
    f.removeAttribute('aria-invalid'); msgs(f.closest('form')).err.textContent = '';
  });

  FB.onShow = function () { FB.chip(); FB.navState(); FB.demo(); };
  /* arriving with a #fragment from another page: make sure we land on it */
  function toHash() {
    var id = decodeURIComponent(location.hash.slice(1)), t = id && document.getElementById(id);
    if (t && Math.abs(t.getBoundingClientRect().top) > 120) t.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  if (!window.FB_MANUAL) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', FB.onShow); else FB.onShow();
    window.addEventListener('load', function () { setTimeout(toHash, 0); });
  }
})();
