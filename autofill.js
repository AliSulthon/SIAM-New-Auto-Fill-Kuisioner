//Ali Sulthon@2026
//Masukkan Code ke Console Browser untuk menggunakan

(() => {
  const css = document.createElement("style");
  css.textContent = `
    .lkp-panel {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 999999;
      width: 220px;
      background: #101114;
      color: white;
      border: 1px solid #2c2f36;
      border-radius: 8px;
      padding: 12px;
      font: 13px Arial, sans-serif;
      box-shadow: 0 10px 30px #0006;
    }
    .lkp-title { font-weight: 700; margin-bottom: 8px; }
    .lkp-row { display: flex; gap: 6px; margin: 6px 0; }
    .lkp-panel button {
      flex: 1;
      border: 0;
      border-radius: 6px;
      padding: 8px;
      cursor: pointer;
      background: #2563eb;
      color: white;
      font-weight: 600;
    }
    .lkp-panel button.secondary { background: #3f4652; }
    .lkp-panel button.danger { background: #b91c1c; }
    .lkp-status { margin-top: 8px; color: #d1d5db; font-size: 12px; }
    .lkp-highlight { outline: 2px dashed #ef4444 !important; outline-offset: 3px; }
  `;
  document.head.appendChild(css);

  const panel = document.createElement("div");
  panel.className = "lkp-panel";
  panel.innerHTML = `
    <div class="lkp-title">Local Kuis Helper</div>
    <div class="lkp-row">
      <button data-fill-random>Random 3-5</button>
    </div>
    <div class="lkp-row">
      <button class="secondary" data-fill="3">All 3</button>
      <button class="secondary" data-fill="4">All 4</button>
      <button class="secondary" data-fill="5">All 5</button>
    </div>
    <div class="lkp-row">
      <button class="secondary" data-scan>Scan</button>
      <button class="danger" data-close>Close</button>
    </div>
    <div class="lkp-status"></div>
  `;
  document.body.appendChild(panel);

  const status = panel.querySelector(".lkp-status");

  const getLabelText = input => {
    const forLabel = input.id
      ? document.querySelector(`label[for="${CSS.escape(input.id)}"]`)
      : null;

    return [
      input.value,
      input.title,
      input.getAttribute("aria-label"),
      input.closest("label")?.innerText,
      forLabel?.innerText
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  };

  const getGroups = () => {
    const map = new Map();

    document.querySelectorAll('input[type="radio"]:not(:disabled)').forEach((radio, index) => {
      const key = radio.name || `radio-${index}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(radio);
    });

    return [...map.values()].filter(group => group.length > 1);
  };

  const findOption = (group, score) => {
    const exact = group.find(input => String(input.value).trim() === String(score));
    if (exact) return exact;

    const labelMatch = group.find(input => {
      const text = getLabelText(input);
      return new RegExp(`(^|\\D)${score}(\\D|$)`).test(text);
    });
    if (labelMatch) return labelMatch;

    return group[score - 1] || null;
  };

  const choose = (input) => {
    input.checked = true;
    input.click();
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const paint = () => {
    document.querySelectorAll(".lkp-highlight").forEach(el => {
      el.classList.remove("lkp-highlight");
    });

    const groups = getGroups();
    const unanswered = groups.filter(group => !group.some(input => input.checked));

    unanswered.forEach(group => {
      const box =
        group[0].closest("tr, li, fieldset, .form-group, .question, .pertanyaan, .row, .card") ||
        group[0].parentElement;
      box?.classList.add("lkp-highlight");
    });

    status.textContent = `${groups.length} grup radio | ${unanswered.length} belum terisi`;
  };

  const fillAll = mode => {
    const groups = getGroups();

    groups.forEach(group => {
      const score = mode === "random"
        ? Math.floor(Math.random() * 3) + 3
        : Number(mode);

      const option = findOption(group, score);
      if (option) choose(option);
    });

    paint();
  };

  panel.addEventListener("click", event => {
    const target = event.target;

    if (target.matches("[data-fill-random]")) fillAll("random");
    if (target.matches("[data-fill]")) fillAll(target.dataset.fill);
    if (target.matches("[data-scan]")) paint();
    if (target.matches("[data-close]")) window.__localKuisPopup.destroy();
  });

  window.__localKuisPopup = {
    fillRandom: () => fillAll("random"),
    fill3: () => fillAll(3),
    fill4: () => fillAll(4),
    fill5: () => fillAll(5),
    scan: paint,
    destroy() {
      panel.remove();
      css.remove();
      document.querySelectorAll(".lkp-highlight").forEach(el => {
        el.classList.remove("lkp-highlight");
      });
      delete window.__localKuisPopup;
    }
  };

  paint();
})();
