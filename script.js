const tree = document.getElementById('tree');
const card = document.getElementById('card');
const envelope = document.getElementById('envelope');
const cardMessage = document.getElementById('cardMessage');
const modalOverlay = document.getElementById('modalOverlay');

const music = document.getElementById('backgroundMusic');
const introOverlay = document.getElementById('introOverlay');
const startButton = document.getElementById('startButton');

/* ============================
   TARJETA
============================ */

function toggleCard() {
  if (!tree || !card) return;
  const hidden = card.hasAttribute('hidden');

  if (hidden) {
    card.removeAttribute('hidden');
    tree.setAttribute('aria-expanded', 'true');
    if (envelope) envelope.focus();
  } else {
    card.setAttribute('hidden', '');
    tree.setAttribute('aria-expanded', 'false');
    if (envelope) {
      envelope.classList.remove('open');
      envelope.setAttribute('aria-expanded', 'false');
    }
    if (cardMessage) cardMessage.setAttribute('hidden', '');
  }
}

function toggleEnvelope() {
  const env = document.getElementById('envelope');
  const msg = document.getElementById('cardMessage');
  if (!env || !msg) return;

  const isOpen = env.classList.contains('open');

  if (!isOpen) {
    env.classList.add('open');
    env.setAttribute('aria-expanded', 'true');
    msg.removeAttribute('hidden');

    if (modalOverlay) {
      modalOverlay.removeAttribute('hidden');
      const dialog = modalOverlay.querySelector('.modal');
      if (dialog) dialog.focus();
      document.body.style.overflow = 'hidden';
    }

    if (msg.tabIndex === -1) msg.focus();
  } else {
    closeModal();
  }
}

if (tree) {
  tree.addEventListener('click', (e) => {
    if (e.target.id === 'envelope' || e.target.closest('#envelope')) return;
    toggleCard();
  });

  tree.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      toggleCard();
    }
  });
}

document.addEventListener('click', (e) => {
  const env = e.target.closest && e.target.closest('#envelope');
  if (env) {
    e.stopPropagation();
    toggleEnvelope();
  }
});

document.addEventListener('keydown', (e) => {
  const activeEnv = document.activeElement && document.activeElement.id === 'envelope';
  if (activeEnv && (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar')) {
    e.preventDefault();
    toggleEnvelope();
  }
});

/* ============================
   MODAL
============================ */

function closeModal() {
  if (modalOverlay) modalOverlay.setAttribute('hidden', '');

  const env = document.getElementById('envelope');
  const msg = document.getElementById('cardMessage');

  if (env) {
    env.classList.remove('open');
    env.setAttribute('aria-expanded', 'false');
  }

  if (msg) msg.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// handlers del modal (X, clic fuera, Escape)
if (modalOverlay) {

  // clic fuera
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // botón X
  const modalClose = modalOverlay.querySelector('.modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal();
    });
  }

  // Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.hasAttribute('hidden')) {
      closeModal();
    }
  });
}

/* ============================
   ANIMACIÓN DEL ÁRBOL
============================ */

let traceInProgress = true;

function easeInOutCubic(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
}

function animatePath(path, duration, showTracer = true) {
  return new Promise((resolve) => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    const tracerEl = document.getElementById('tracer');
    let start = null;

    if (showTracer && tracerEl) {
      tracerEl.classList.add('visible');
      tracerEl.style.opacity = '1';
    }

    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      let t = Math.min(1, elapsed / duration);

      const wobble = Math.sin(elapsed / 180) * 0.01;
      const eased = Math.max(0, Math.min(1, easeInOutCubic(Math.min(1, t + wobble))));
      const offset = len * (1 - eased);
      path.style.strokeDashoffset = offset;

      if (showTracer && tracerEl) {
        const pos = path.getPointAtLength(len * eased);
        tracerEl.setAttribute('cx', pos.x);
        tracerEl.setAttribute('cy', pos.y);
        const jx = Math.sin(elapsed / 120) * 0.6;
        tracerEl.setAttribute('transform', `translate(${jx}, ${-Math.abs(jx)})`);
      }

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        if (showTracer && tracerEl) {
          tracerEl.style.opacity = '0';
          tracerEl.classList.remove('visible');
        }
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

async function startTrace() {
  const treeOutline = document.getElementById('treeOutline');
  const trunkOutline = document.getElementById('trunkOutline');
  const starOutline = document.getElementById('starOutline');

  if (!treeOutline && !trunkOutline && !starOutline) {
    const shape = document.querySelector('.tree-shape');
    if (shape) shape.classList.add('revealed');
    traceInProgress = false;
    return;
  }

  traceInProgress = true;

  if (treeOutline) treeOutline.style.opacity = '1';
  if (trunkOutline) trunkOutline.style.opacity = '1';
  if (starOutline) starOutline.style.opacity = '1';

  if (treeOutline) await animatePath(treeOutline, 3500, true);

  if (starOutline) {
    await animatePath(starOutline, 900, true);
    const starShape = document.getElementById('starShape');
    if (starShape) starShape.style.opacity = '1';
  }

  if (trunkOutline) await animatePath(trunkOutline, 1200, true);

  await new Promise((r) => setTimeout(r, 250));

  const shape = document.querySelector('.tree-shape');
  if (shape) shape.classList.add('revealed');

  if (treeOutline) {
    treeOutline.style.transition = 'stroke-dashoffset 700ms ease';
    treeOutline.style.strokeDashoffset = '0';
    treeOutline.style.opacity = '1';
  }

  if (trunkOutline) {
    trunkOutline.style.transition = 'stroke-dashoffset 500ms ease';
    trunkOutline.style.strokeDashoffset = '0';
    trunkOutline.style.opacity = '1';
  }

  if (starOutline) {
    starOutline.style.transition = 'stroke-dashoffset 400ms ease';
    starOutline.style.strokeDashoffset = '0';
    starOutline.style.opacity = '1';
  }

  traceInProgress = false;
}

/* ============================
   BLOQUEAR CLICS DURANTE TRACE
============================ */

if (tree) {
  const originalClickHandler = (e) => {
    if (traceInProgress) return;
    if (e.target.id === 'envelope' || e.target.closest('#envelope')) return;
    toggleCard();
  };

  tree.replaceWith(tree.cloneNode(true));
  const newTree = document.getElementById('tree');

  newTree.addEventListener('click', originalClickHandler);

  newTree.addEventListener('keydown', (e) => {
    if (traceInProgress) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      toggleCard();
    }
  });
}

/* ============================
   EXPERIENCIA — ARRANCA CON EL BOTÓN
============================ */

async function startExperience() {
  if (introOverlay) {
    introOverlay.style.transition = 'opacity .3s ease';
    introOverlay.style.opacity = '0';
    setTimeout(() => {
      introOverlay.style.display = 'none';
    }, 300);
  }

  if (music) {
    music.volume = 0.7;
    music.play().catch(() => {});
  }

  await startTrace();
}

if (startButton) {
  startButton.addEventListener('click', () => {
    startExperience();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Esperamos el clic del usuario
});
