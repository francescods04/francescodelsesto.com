import { DOSSIERS, REEL_IDS, type DossierItem } from "./data/dossiers";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function wrapOffset(raw: number, count: number): number {
  const half = count / 2;
  return ((((raw % count) + count + half) % count) - half);
}

function initSpatialReel(): void {
  const viewport = document.querySelector<HTMLElement>("[data-spatial-viewport]");
  const plates = Array.from(document.querySelectorAll<HTMLElement>("[data-plate]"));
  const statusEl = document.querySelector<HTMLElement>("[data-spatial-status]");
  const pauseBtn = document.querySelector<HTMLButtonElement>("[data-spatial-pause]");
  const prevBtn = document.querySelector<HTMLButtonElement>("[data-spatial-prev]");
  const nextBtn = document.querySelector<HTMLButtonElement>("[data-spatial-next]");
  const openBtn = document.querySelector<HTMLButtonElement>("[data-spatial-open]");

  if (!viewport || plates.length === 0) return;

  const count = plates.length;
  let current = 0;
  let target = 0;
  let springVelocity = 0;
  let dragVelocity = 0;
  let isHover = false;
  let isFocus = false;
  let isVisible = true;
  let isPaused = reducedMotion.matches;
  let isDragging = false;
  let activePointerId: number | null = null;
  let dragStartY = 0;
  let dragLastY = 0;
  let dragLastTime = 0;
  let dragDistance = 0;
  let lastTime = performance.now();

  const updatePauseLabel = () => {
    if (!pauseBtn) return;
    pauseBtn.textContent = isPaused ? "Play" : "Pause";
    pauseBtn.setAttribute("aria-pressed", String(isPaused));
  };

  const getActiveIndex = (pos: number): number => {
    const rounded = Math.round(pos);
    return ((rounded % count) + count) % count;
  };

  const render = (pos: number) => {
    const activeIdx = getActiveIndex(pos);
    const compact = viewport.clientHeight < 460;
    const step1 = compact ? 168 : 148;
    const step2 = compact ? 92 : 94;
    const maxVisible = compact ? 1.45 : 2.35;

    plates.forEach((plate, index) => {
      const u = wrapOffset(index - pos, count);
      const absU = Math.abs(u);
      const isFront = index === activeIdx;

      plate.dataset.active = isFront ? "true" : "false";

      if (absU > maxVisible) {
        plate.style.visibility = "hidden";
        plate.style.opacity = "0";
        plate.style.pointerEvents = "none";
        return;
      }

      const sign = Math.sign(u);
      const y = sign * (absU <= 1 ? absU * step1 : step1 + (absU - 1) * step2);
      const z = -absU * 110;
      const x = u * 12;
      const rotX = -u * 13;
      const rotY = -u * 3.5;
      const scale = Math.max(0.76, 1 - absU * 0.085);
      const opacity = Math.max(0.32, 1 - absU * 0.27);
      const zIndex = Math.round(100 - absU * 20);

      plate.style.visibility = "visible";
      plate.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      plate.style.opacity = opacity.toFixed(3);
      plate.style.zIndex = String(zIndex);
      plate.style.pointerEvents = "auto";
    });

    const activeId = REEL_IDS[activeIdx];
    const dossier = DOSSIERS[activeId];
    if (statusEl && dossier) {
      statusEl.textContent = `${dossier.plateCode} of 0${count}: ${dossier.title}`;
    }
    if (openBtn && dossier) {
      openBtn.dataset.openDossier = dossier.id;
    }
  };

  const stepTo = (delta: number) => {
    target = Math.round(target) + delta;
    springVelocity = 0;
    if (reducedMotion.matches) {
      current = target;
      render(current);
    }
  };

  viewport.addEventListener(
    "wheel",
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      target += delta * 0.0042;
      springVelocity = 0;
      if (reducedMotion.matches) {
        current = Math.round(target);
        target = current;
        render(current);
      }
    },
    { passive: false }
  );

  // Track phase: 1:1 direct manipulation with pointer capture and multi-touch guard
  viewport.addEventListener("pointerdown", (e: PointerEvent) => {
    if (e.button !== 0 || activePointerId !== null) return;
    activePointerId = e.pointerId;
    isDragging = true;
    dragStartY = e.clientY;
    dragLastY = e.clientY;
    dragLastTime = performance.now();
    dragDistance = 0;
    dragVelocity = 0;
    springVelocity = 0;
    try {
      viewport.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic pointer events in headless tests may not support capture
    }
  });

  viewport.addEventListener("pointermove", (e: PointerEvent) => {
    if (!isDragging || e.pointerId !== activePointerId) return;
    const now = performance.now();
    const dt = Math.max((now - dragLastTime) / 1000, 0.004);
    const dy = e.clientY - dragLastY;
    dragLastY = e.clientY;
    dragLastTime = now;
    dragDistance += Math.abs(dy);

    const deltaPlates = -dy * 0.0068;
    current += deltaPlates;
    target = current;
    const instantVel = deltaPlates / dt;
    dragVelocity = dragVelocity * 0.65 + instantVel * 0.35;
    render(current);
  });

  const endDrag = (e: PointerEvent) => {
    if (!isDragging || e.pointerId !== activePointerId) return;
    isDragging = false;
    activePointerId = null;
    try {
      if (viewport.hasPointerCapture(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore if capture was already released
    }

    if (Math.abs(dragLastY - dragStartY) > 6) {
      const clampedVel = Math.max(-8, Math.min(8, dragVelocity));
      target = Math.round(current + clampedVel * 0.22);
      springVelocity = reducedMotion.matches ? 0 : clampedVel * 0.55;
      if (reducedMotion.matches) {
        current = target;
        render(current);
      }
    }
  };

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  viewport.addEventListener("pointerenter", () => {
    isHover = true;
  });
  viewport.addEventListener("pointerleave", () => {
    isHover = false;
  });
  viewport.addEventListener("focusin", () => {
    isFocus = true;
  });
  viewport.addEventListener("focusout", () => {
    isFocus = false;
  });

  viewport.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      stepTo(1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      stepTo(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const activeId = REEL_IDS[getActiveIndex(current)];
      if (activeId) openDossierModal(activeId);
    }
  });

  plates.forEach((plate, index) => {
    plate.addEventListener("click", () => {
      if (dragDistance > 8) return;
      const u = wrapOffset(index - current, count);
      if (Math.abs(u) < 0.35) {
        const id = plate.dataset.plate;
        if (id) openDossierModal(id);
      } else {
        target = current + u;
        springVelocity = 0;
        if (reducedMotion.matches) {
          current = target;
          render(current);
        }
      }
    });
  });

  prevBtn?.addEventListener("click", () => stepTo(-1));
  nextBtn?.addEventListener("click", () => stepTo(1));
  pauseBtn?.addEventListener("click", () => {
    isPaused = !isPaused;
    updatePauseLabel();
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
    },
    { threshold: 0.05 }
  );
  observer.observe(viewport);

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => render(current));
    ro.observe(viewport);
  }

  updatePauseLabel();
  render(current);

  const stiffness = 180;
  const damping = 26;

  const tick = (now: number) => {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (!isDragging) {
      if (!reducedMotion.matches && isVisible && !isPaused && !isHover && !isFocus) {
        target += dt * 0.14;
      }

      const displacement = target - current;
      if (Math.abs(displacement) > 0.0004 || Math.abs(springVelocity) > 0.0004) {
        const accel = stiffness * displacement - damping * springVelocity;
        springVelocity += accel * dt;
        current += springVelocity * dt;
        render(current);
      }
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

const stageshowReplayers = new Map<string, () => void>();

function initStageshows(): void {
  const timers = new Map<string, number[]>();

  const clearTimers = (name: string) => {
    const list = timers.get(name);
    if (list) {
      list.forEach((id) => window.clearTimeout(id));
      timers.set(name, []);
    }
  };

  const cvStage = document.querySelector<HTMLElement>('[data-stageshow="cv-radar"]');
  if (cvStage) {
    const statusEl = cvStage.querySelector<HTMLElement>("[data-ss-cv-status]");
    const metaEl = cvStage.querySelector<HTMLElement>("[data-ss-cv-meta]");

    const setCvBeat = (beat: "1" | "2" | "3") => {
      cvStage.dataset.beat = beat;
      if (!statusEl || !metaEl) return;
      if (beat === "1") {
        statusEl.textContent = "Queued";
        metaEl.textContent = "Awaiting 14 source assertions";
      } else if (beat === "2") {
        statusEl.textContent = "Verifying";
        metaEl.textContent = "Matching profile_facts.json";
      } else {
        statusEl.textContent = "Compiled";
        metaEl.textContent = "0 invented claims, network off";
      }
    };

    const replayCv = () => {
      clearTimers("cv-radar");
      if (reducedMotion.matches) {
        setCvBeat("3");
        return;
      }
      setCvBeat("1");
      timers.set("cv-radar", [
        window.setTimeout(() => setCvBeat("2"), 700),
        window.setTimeout(() => setCvBeat("3"), 1500)
      ]);
    };

    stageshowReplayers.set("cv-radar", replayCv);
    cvStage.querySelector<HTMLButtonElement>('[data-ss-replay="cv-radar"]')?.addEventListener("click", replayCv);
  }

  const excelStage = document.querySelector<HTMLElement>('[data-stageshow="excel-ai"]');
  if (excelStage) {
    const stateEl = excelStage.querySelector<HTMLElement>("[data-ss-excel-state]");

    const setExcelBeat = (beat: "1" | "2") => {
      excelStage.dataset.beat = beat;
      if (!stateEl) return;
      stateEl.textContent = beat === "1" ? "Awaiting confirm" : "Applied, 4 cells";
    };

    const replayExcel = () => {
      clearTimers("excel-ai");
      if (reducedMotion.matches) {
        setExcelBeat("2");
        return;
      }
      setExcelBeat("1");
      timers.set("excel-ai", [window.setTimeout(() => setExcelBeat("2"), 860)]);
    };

    stageshowReplayers.set("excel-ai", replayExcel);
    excelStage
      .querySelector<HTMLButtonElement>('[data-ss-replay="excel-ai"]')
      ?.addEventListener("click", replayExcel);
  }
}

function initTabs(): void {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  if (tabs.length === 0) return;

  const activate = (targetTab: HTMLButtonElement) => {
    tabs.forEach((tab) => {
      const selected = tab === targetTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    const controls = targetTab.getAttribute("aria-controls");
    panels.forEach((panel) => {
      panel.hidden = panel.id !== controls;
    });

    if (controls === "panel-excel") {
      stageshowReplayers.get("excel-ai")?.();
    } else if (controls === "panel-cv") {
      stageshowReplayers.get("cv-radar")?.();
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = tabs[(index + 1) % tabs.length];
        activate(next);
        next.focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = tabs[(index - 1 + tabs.length) % tabs.length];
        activate(prev);
        prev.focus();
      }
    });
  });
}

function initVideoLoops(): void {
  document.querySelectorAll<HTMLElement>("[data-loop]").forEach((wrap) => {
    const video = wrap.querySelector<HTMLVideoElement>("video");
    const toggle = wrap.querySelector<HTMLButtonElement>("[data-loop-toggle]");
    if (!video || !toggle) return;

    const state = {
      seen: false,
      hover: false,
      focus: false,
      held: reducedMotion.matches
    };

    const sync = () => {
      const shouldPlay = state.seen && !state.hover && !state.focus && !state.held;
      if (shouldPlay) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
      toggle.textContent = state.held ? "Play clip" : "Pause clip";
      toggle.setAttribute("aria-pressed", String(state.held));
    };

    toggle.addEventListener("click", () => {
      state.held = !state.held;
      sync();
    });

    wrap.addEventListener("pointerenter", () => {
      state.hover = true;
      sync();
    });
    wrap.addEventListener("pointerleave", () => {
      state.hover = false;
      sync();
    });
    wrap.addEventListener("focusin", () => {
      state.focus = true;
      sync();
    });
    wrap.addEventListener("focusout", () => {
      state.focus = false;
      sync();
    });

    new IntersectionObserver(([entry]) => {
      state.seen = entry.isIntersecting;
      sync();
    }).observe(wrap);
  });
}

const dossierDialog = document.querySelector<HTMLDialogElement>("#dossier-dialog");
const dossierMount = document.querySelector<HTMLElement>("#dossier-mount");

function renderDossier(item: DossierItem): string {
  const factsHtml = item.facts
    .map(
      (f) => `<div class="spec-row"><dt>${f.label}</dt><dd>${f.value}</dd></div>`
    )
    .join("");

  const proseHtml = item.body.map((p) => `<p>${p}</p>`).join("");

  const imageHtml = item.image
    ? `<figure class="media-frame">
         <div class="media-box"><img src="${item.image.src}" alt="${item.image.alt}" loading="lazy"></div>
         <figcaption class="caption">${item.image.caption}${item.image.credit ? ` (${item.image.credit})` : ""}</figcaption>
       </figure>`
    : "";

  const caveatHtml = item.limitations
    ? `<p class="dialog-caveat">${item.limitations}</p>`
    : "";

  const bibtexHtml = item.bibtex
    ? `<pre class="dialog-bibtex"><code>${item.bibtex}</code></pre>`
    : "";

  const linksHtml =
    item.links.length > 0
      ? `<div class="tab-actions">${item.links
          .map(
            (l) =>
              `<a class="btn btn--compact" href="${l.href}"${
                l.external ? ' target="_blank" rel="noopener noreferrer"' : ""
              }>${l.label}</a>`
          )
          .join("")}</div>`
      : "";

  return `
    <div class="dialog-top">
      <div>
        <h2>${item.title}</h2>
        <p class="caption">${item.category}, ${item.year}</p>
      </div>
      <button class="btn btn--compact" type="button" data-close-dialog>Close</button>
    </div>
    <p class="lead">${item.summary}</p>
    <dl class="spec-list">${factsHtml}</dl>
    ${imageHtml}
    <div class="dialog-prose">${proseHtml}</div>
    ${caveatHtml}
    ${bibtexHtml}
    ${linksHtml}
  `;
}

function openDossierModal(id: string): void {
  const item = DOSSIERS[id];
  if (!item || !dossierDialog || !dossierMount) return;
  dossierMount.innerHTML = renderDossier(item);
  dossierMount.querySelector<HTMLButtonElement>("[data-close-dialog]")?.addEventListener("click", () => {
    dossierDialog.close();
  });
  dossierDialog.showModal();
}

function initDossierTriggers(): void {
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-open-dossier]");
    if (!target) return;
    const id = target.dataset.openDossier;
    if (id) {
      e.preventDefault();
      openDossierModal(id);
    }
  });

  dossierDialog?.addEventListener("click", (e) => {
    if (e.target === dossierDialog) dossierDialog.close();
  });
}

function initCommandIndex(): void {
  const cmdDialog = document.querySelector<HTMLDialogElement>("#cmd-dialog");
  const cmdInput = document.querySelector<HTMLInputElement>("#cmd-input");
  const cmdList = document.querySelector<HTMLUListElement>("#cmd-list");
  const cmdOpen = document.querySelector<HTMLButtonElement>("[data-open-cmd]");
  const cmdClose = document.querySelector<HTMLButtonElement>("[data-close-cmd]");

  if (!cmdDialog || !cmdInput || !cmdList) return;

  type CmdEntry = { label: string; meta: string; run: () => void };

  const entries: CmdEntry[] = [
    ...Object.values(DOSSIERS).map((d) => ({
      label: d.title,
      meta: `${d.category}, ${d.year}`,
      run: () => {
        cmdDialog.close();
        openDossierModal(d.id);
      }
    })),
    {
      label: "Download Bocconi BSc Thesis PDF",
      meta: "63 pages, 21.78M firm-year observations",
      run: () => {
        cmdDialog.close();
        window.open("/papers/del-sesto-2025-public-development-banks-thesis.pdf", "_blank");
      }
    },
    {
      label: "Open PD Meter (live tool)",
      meta: "Client-side pupillary distance calibration",
      run: () => {
        cmdDialog.close();
        window.open("/lab/pd-meter.html", "_blank");
      }
    },
    {
      label: "Open Lens Tints Explorer (live tool)",
      meta: "Interactive lens density and tint preview",
      run: () => {
        cmdDialog.close();
        window.open("/lab/lens-tints.html", "_blank");
      }
    }
  ];

  const renderList = (query: string) => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? entries.filter(
          (entry) =>
            entry.label.toLowerCase().includes(q) || entry.meta.toLowerCase().includes(q)
        )
      : entries;

    cmdList.innerHTML = "";
    filtered.forEach((entry) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cmd-item";
      btn.innerHTML = `<span>${entry.label}</span><span class="cmd-item-meta">${entry.meta}</span>`;
      btn.addEventListener("click", entry.run);
      li.appendChild(btn);
      cmdList.appendChild(li);
    });
  };

  const openCmd = () => {
    cmdInput.value = "";
    renderList("");
    cmdDialog.showModal();
    cmdInput.focus();
  };

  cmdOpen?.addEventListener("click", openCmd);
  cmdClose?.addEventListener("click", () => cmdDialog.close());
  cmdInput.addEventListener("input", () => renderList(cmdInput.value));
  cmdDialog.addEventListener("click", (e) => {
    if (e.target === cmdDialog) cmdDialog.close();
  });

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdDialog.open) {
        cmdDialog.close();
      } else {
        openCmd();
      }
    }
  });
}

initSpatialReel();
initStageshows();
initTabs();
initVideoLoops();
initDossierTriggers();
initCommandIndex();
