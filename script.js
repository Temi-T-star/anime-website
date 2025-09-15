/* -------------------------
   Basic DOM refs
   ------------------------- */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];
const mobileSubToggle = document.querySelector('.mobile-sub-toggle');
const mobileSub = document.querySelector('.mobile-sub');
const navLinks = document.querySelectorAll('.nav-desktop .nav-link');
const yearEl = document.getElementById('year');
const contactForm = document.getElementById('contactForm');
const commentList = document.getElementById('commentList');
const clearBtn = document.getElementById('clearComments');
const formNote = document.getElementById('formNote');

/* set year in footer */
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* -------------------------
   Hamburger toggle & overlay
   ------------------------- */
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  mobileNav.setAttribute('aria-hidden', String(!open));
});

/* close overlay when clicking a link */
mobileLinks.forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    mobileNav.setAttribute('aria-hidden','true');
    // If a mobile sub was open, close it
    if (mobileSub) mobileSub.classList.remove('open');
    if (mobileSubToggle) mobileSubToggle.setAttribute('aria-expanded','false');
  });
});

/* mobile sub toggle */
if (mobileSubToggle) {
  mobileSubToggle.addEventListener('click', () => {
    const open = mobileSub.classList.toggle('open');
    mobileSubToggle.setAttribute('aria-expanded', String(open));
  });
}

/* close overlay on outside click */
mobileNav.addEventListener('click', (e) => {
  if (e.target === mobileNav) {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    mobileNav.setAttribute('aria-hidden','true');
  }
});

/* close overlay on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    mobileNav.setAttribute('aria-hidden','true');
    if (mobileSub) mobileSub.classList.remove('open');
    if (mobileSubToggle) mobileSubToggle.setAttribute('aria-expanded','false');
  }
});

/* Highlight active nav link on scroll / click */
function setActiveLinkById(id) {
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === id));
}
const sections = document.querySelectorAll('main section[id]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setActiveLinkById(entry.target.id);
    }
  });
}, { root: null, threshold: 0.35 });

sections.forEach(s => observer.observe(s));

/* Smooth scroll behavior is enabled via CSS scroll-behavior: smooth */

/* -------------------------
   Typewriter: DISCOVER NEW fixed, words loop
   Words: ANIME, MANGA, CHARACTERS
   ------------------------- */
const typeDisplay = document.getElementById('typeText');
const typedWords = ['ANIME', 'MANGA', 'CHARACTERS'];
let wIndex = 0;
let cIndex = 0;
let deleting = false;
const TYPE_SPEED = 80;
const DEL_SPEED = 40;
const HOLD_AFTER = 900;
const HOLD_BEFORE = 300;

function typeTick() {
  const word = typedWords[wIndex];
  if (!deleting) {
    // type forward
    cIndex++;
    typeDisplay.textContent = word.substring(0, cIndex);
    if (cIndex === word.length) {
      deleting = true;
      setTimeout(typeTick, HOLD_AFTER);
      return;
    }
    setTimeout(typeTick, TYPE_SPEED);
  } else {
    // deleting
    cIndex--;
    typeDisplay.textContent = word.substring(0, cIndex);
    if (cIndex === 0) {
      deleting = false;
      wIndex = (wIndex + 1) % typedWords.length;
      setTimeout(typeTick, HOLD_BEFORE);
      return;
    }
    setTimeout(typeTick, DEL_SPEED);
  }
}
// start after brief delay so hero text is readable
setTimeout(typeTick, 600);

/* -------------------------
   Contact form & comments (client-side)
   Comments persist to localStorage
   ------------------------- */
function loadComments() {
  const raw = localStorage.getItem('dn_comments');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveComments(list) {
  localStorage.setItem('dn_comments', JSON.stringify(list));
}

function renderComments() {
  const comments = loadComments();
  commentList.innerHTML = '';
  if (!comments.length) {
    commentList.innerHTML = '<li class="comment-item">No comments yet — be the first!</li>';
    return;
  }
  comments.forEach((c, i) => {
    const li = document.createElement('li');
    li.className = 'comment-item';
    li.innerHTML = `<strong>${escapeHtml(c.email)}</strong> <small style="color:var(--muted);margin-left:8px">${new Date(c.time).toLocaleString()}</small><p style="margin:6px 0 0">${escapeHtml(c.text)}</p>`;
    commentList.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]); });
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = contactForm.email.value.trim();
    const text = contactForm.comment.value.trim();
    if (!email || !text) {
      if (formNote) {
        formNote.textContent = 'Please provide both email and a comment.';
        formNote.style.color = '#ff9b9b';
      }
      return;
    }
    const comments = loadComments();
    comments.unshift({ email, text, time: Date.now() });
    saveComments(comments);
    renderComments();
    contactForm.reset();
    if (formNote) {
      formNote.textContent = 'Thanks — your comment was posted.';
      formNote.style.color = '#bfe9d8';
    }
  });
}

/* clear comments */
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    localStorage.removeItem('dn_comments');
    renderComments();
  });
}

/* initial render */
renderComments();

/* -------------------------
   Utility: close mobile nav on window resize to prevent stuck states
   ------------------------- */
window.addEventListener('resize', () => {
  if (window.innerWidth > 780) {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    mobileNav.setAttribute('aria-hidden','true');
  }
});
