/* 无依赖交互：原生锚点/details/dialog；禁用 JS 时正文仍然可读。 */
(() => {
  const directory = document.querySelector('.mobile-directory');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const heroArt = document.querySelector('.hero-art');
  const peanut = document.getElementById('peanut-button');
  const heroSpeech = document.getElementById('hero-speech');
  const finePointer = window.matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  let heroFrame = 0;
  let heroGreeting;
  let peanuts = 0;
  const resetHero = () => {
    cancelAnimationFrame(heroFrame);
    heroFrame = 0;
    heroArt.style.setProperty('--hero-x', '0px');
    heroArt.style.setProperty('--hero-y', '0px');
    heroArt.style.setProperty('--hero-rotate', '0deg');
  };
  hero.addEventListener('pointermove', event => {
    if (motion.matches || !finePointer.matches || event.pointerType === 'touch') return;
    cancelAnimationFrame(heroFrame);
    heroFrame = requestAnimationFrame(() => {
      const bounds = hero.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      heroArt.style.setProperty('--hero-x', `${(x * 7).toFixed(2)}px`);
      heroArt.style.setProperty('--hero-y', `${(y * 4).toFixed(2)}px`);
      heroArt.style.setProperty('--hero-rotate', `${(x * .35).toFixed(3)}deg`);
      heroFrame = 0;
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', resetHero);
  window.addEventListener('blur', resetHero);
  motion.addEventListener('change', resetHero);
  finePointer.addEventListener('change', resetHero);
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) resetHero();
  }).observe(hero);
  peanut.hidden = false;
  peanut.addEventListener('click', () => {
    clearTimeout(heroGreeting);
    peanuts = peanuts % 3 + 1;
    peanut.querySelectorAll('.peanut-stamps i').forEach((stamp, i) => stamp.classList.toggle('filled', i < peanuts));
    heroSpeech.textContent = ['花生！わくわく！', '再来一颗，谢谢！', '今日快乐，补给完成！'][peanuts - 1];
    heroArt.classList.add('is-delighted');
    heroGreeting = setTimeout(() => {
      heroArt.classList.remove('is-delighted');
      heroSpeech.textContent = 'わくわく！';
    }, 3200);
  });

  const portraitCard = document.getElementById('portrait-card');
  if (portraitCard) {
    const front = portraitCard.querySelector('.portrait-front');
    const back = portraitCard.querySelector('.portrait-back');
    let portraitFrame = 0;
    const resetPortraitTilt = () => {
      cancelAnimationFrame(portraitFrame);
      portraitFrame = 0;
      portraitCard.style.setProperty('--portrait-tilt-x', '0deg');
      portraitCard.style.setProperty('--portrait-tilt-y', '0deg');
    };
    const setPortraitOpen = open => {
      portraitCard.setAttribute('aria-pressed', String(open));
      portraitCard.setAttribute('aria-label', open ? '回到高天宇的照片' : '翻开高天宇的照片卡，看看我的做事方式');
      front.setAttribute('aria-hidden', String(open));
      back.setAttribute('aria-hidden', String(!open));
    };
    portraitCard.addEventListener('click', () => {
      setPortraitOpen(portraitCard.getAttribute('aria-pressed') !== 'true');
    });
    portraitCard.addEventListener('pointermove', event => {
      if (motion.matches || !finePointer.matches || event.pointerType === 'touch') return;
      cancelAnimationFrame(portraitFrame);
      portraitFrame = requestAnimationFrame(() => {
        const bounds = portraitCard.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
        const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));
        portraitCard.style.setProperty('--portrait-tilt-x', `${(-y * 2.4).toFixed(2)}deg`);
        portraitCard.style.setProperty('--portrait-tilt-y', `${(x * 3.5).toFixed(2)}deg`);
        portraitFrame = 0;
      });
    }, { passive: true });
    portraitCard.addEventListener('pointerleave', resetPortraitTilt);
    portraitCard.addEventListener('keydown', event => {
      if (event.key === 'Escape' && portraitCard.getAttribute('aria-pressed') === 'true') {
        setPortraitOpen(false);
        resetPortraitTilt();
      }
    });
    window.addEventListener('blur', resetPortraitTilt);
    motion.addEventListener('change', resetPortraitTilt);
    finePointer.addEventListener('change', resetPortraitTilt);
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      directory?.removeAttribute('open');
      const target = document.getElementById(link.hash.slice(1));
      const heading = target?.querySelector('h1, h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.classList.add('section-heading');
        // 让浏览器先完成原生锚点定位，再将键盘阅读位置移到标题。
        window.setTimeout(() => heading.focus({ preventScroll: true }), 0);
      }
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && directory?.open) {
      directory.open = false;
      directory.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', event => {
    if (directory?.open && !directory.contains(event.target)) directory.open = false;
  });

  const navLinks = [...document.querySelectorAll('.nav a, .mobile-directory nav a')];
  const sections = [...document.querySelectorAll('main > section[id], #contact')];
  let scrollQueued = false;
  function updateNav() {
    const edge = document.querySelector('.topbar').offsetHeight + Math.min(130, innerHeight * .16);
    let current = sections[0]?.id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= edge) current = section.id;
      else break;
    }
    navLinks.forEach(link => {
      const active = link.hash === '#' + current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollQueued = false;
  }
  function queueNav() {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateNav); }
  }
  addEventListener('scroll', queueNav, { passive: true });
  addEventListener('resize', queueNav);
  addEventListener('load', queueNav);
  updateNav();

  document.querySelectorAll('.case-details').forEach(details => {
    const summary = details.querySelector('summary');
    const label = summary.textContent;
    const update = () => {
      summary.textContent = details.open ? (summary.dataset.closeLabel || '收起案例') : label;
      queueNav();
    };
    details.addEventListener('toggle', update);
    update();
  });

  const journey = document.getElementById('focus-journey');
  if (journey) {
    const tabs = [...journey.querySelectorAll('.flow-tab')];
    const panels = [...journey.querySelectorAll('.focus-panel')];
    const nav = journey.querySelector('.flow-tabs');
    const prev = document.getElementById('flow-prev');
    const next = document.getElementById('flow-next');
    let selected = 0;
    nav.hidden = false;
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-orientation', 'vertical');
    journey.classList.add('flow-enhanced');
    journey.querySelector('.flow-controls').hidden = false;
    tabs.forEach(tab => tab.setAttribute('role', 'tab'));
    panels.forEach((panel,i) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[i].id);
      panel.tabIndex = 0;
    });
    const show = (index, focus = false) => {
      selected = Math.max(0, Math.min(tabs.length - 1, index));
      tabs.forEach((tab,i) => {
        tab.setAttribute('aria-selected', String(i === selected));
        tab.tabIndex = i === selected ? 0 : -1;
        panels[i].hidden = i !== selected;
      });
      prev.disabled = selected === 0;
      next.disabled = selected === tabs.length - 1;
      document.getElementById('flow-position').textContent = `${String(selected + 1).padStart(2,'0')} / ${tabs.length}`;
      if (focus) tabs[selected].focus({preventScroll:true});
    };
    tabs.forEach((tab,i) => {
      tab.addEventListener('click', () => show(i));
      tab.addEventListener('keydown', event => {
        let index;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') index = (i+1)%tabs.length;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') index = (i-1+tabs.length)%tabs.length;
        if (event.key === 'Home') index = 0;
        if (event.key === 'End') index = tabs.length-1;
        if (index !== undefined) { event.preventDefault(); show(index,true); }
      });
    });
    prev.addEventListener('click', () => show(selected-1));
    next.addEventListener('click', () => show(selected+1));
    journey.addEventListener('toggle', () => {
      const open = journey.open;
      const label = journey.querySelector('.journey-summary-label');
      if (label) label.textContent = open ? '收起完整流程' : '展开体验完整流程';
      const speech = document.getElementById('journey-speech');
      if (speech) speech.textContent = open ? '点击收起流程 ∧' : '戳我体验完整流程呀 ✨';
      const ctaText = journey.querySelector('.journey-cta-text');
      if (ctaText) ctaText.textContent = open ? '点击收起' : '点击展开';
      const ctaIcon = journey.querySelector('.journey-cta-icon');
      if (ctaIcon) ctaIcon.textContent = open ? '−' : '+';
      queueNav();
    });
    show(0);
  }

  const viewer = document.getElementById('media-viewer');
  const viewerImage = document.getElementById('viewer-image');
  const caption = document.getElementById('viewer-caption');
  const close = viewer.querySelector('.viewer-close');
  let previousTrigger;
  document.querySelectorAll('[data-lightbox-src]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const source = trigger.dataset.lightboxSrc;
      if (typeof viewer.showModal !== 'function') {
        window.open(source, '_blank', 'noopener');
        return;
      }
      previousTrigger = trigger;
      viewerImage.alt = trigger.dataset.imageAlt || '项目图片';
      caption.textContent = trigger.dataset.imageCaption || viewerImage.alt;
      viewerImage.src = source;
      viewer.showModal();
      document.body.classList.add('viewer-open');
      close.focus();
    });
  });
  viewerImage.addEventListener('error', () => {
    if (viewer.open) caption.textContent = '图片暂时无法加载，请关闭后重试。';
  });
  close.addEventListener('click', () => viewer.close());
  let backdropPress = false;
  const outside = event => {
    const r = viewer.getBoundingClientRect();
    return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
  };
  viewer.addEventListener('pointerdown', event => { backdropPress = event.target === viewer && outside(event); });
  viewer.addEventListener('click', event => {
    if (backdropPress && event.target === viewer && outside(event)) viewer.close();
    backdropPress = false;
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    previousTrigger?.focus({ preventScroll: true });
  });

  const copy = document.getElementById('copy-email');
  const status = document.getElementById('copy-status');
  const email = document.querySelector('.contact-email').textContent.trim();
  let resetCopy;
  function fallbackCopy() {
    const selected = window.getSelection();
    const ranges = selected ? Array.from({ length: selected.rangeCount }, (_, i) => selected.getRangeAt(i).cloneRange()) : [];
    const active = document.activeElement;
    const field = document.createElement('textarea');
    field.value = email;
    field.readOnly = true;
    field.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.append(field);
    let copied = false;
    try { field.select(); copied = document.execCommand('copy'); }
    catch { copied = false; }
    finally {
      field.remove();
      active?.focus({ preventScroll: true });
      selected?.removeAllRanges();
      ranges.forEach(range => selected?.addRange(range));
    }
    return copied;
  }
  copy.addEventListener('click', async () => {
    clearTimeout(resetCopy);
    copy.disabled = true;
    copy.textContent = '正在复制…';
    status.textContent = '';
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(email); copied = true; }
        catch { copied = fallbackCopy(); }
      } else copied = fallbackCopy();
    } finally {
      copy.disabled = false;
      copy.dataset.state = status.dataset.state = copied ? 'success' : 'error';
      copy.textContent = copied ? '已复制 ✓' : '重新复制';
      status.textContent = copied ? '邮箱已复制，可以去写邮件了。' : '复制未成功，请手动选择上方邮箱。';
      resetCopy = window.setTimeout(() => {
        copy.textContent = '复制邮箱';
        delete copy.dataset.state;
        delete status.dataset.state;
        status.textContent = '';
      }, copied ? 4000 : 9000);
    }
  });

  const greet = document.getElementById('anya-greet');
  const bubble = document.getElementById('greet-bubble');
  let hideGreeting;
  greet.addEventListener('click', () => {
    clearTimeout(hideGreeting);
    bubble.textContent = 'わくわく！很高兴见到你。';
    bubble.classList.add('visible');
    greet.setAttribute('aria-pressed', 'true');
    hideGreeting = window.setTimeout(() => {
      bubble.classList.remove('visible');
      greet.setAttribute('aria-pressed', 'false');
      window.setTimeout(() => { if (!bubble.classList.contains('visible')) bubble.textContent = ''; }, motion.matches ? 0 : 200);
    }, 3200);
  });
})();
