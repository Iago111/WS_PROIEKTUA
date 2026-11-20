const ATALAK = ['hasiera', 'bilatzaile', 'bilduma', 'kudeatuBilduma', 'estatistikak', 'ezarpenak'];

const HASIERATZAILEAK = {
  hasiera: () => hasieratuPortada(),
  bilatzaile: () => bilatuApi(),
  bilduma: () => { erakutsiBilduma(); },
  kudeatuBilduma: () => { erakutsiBildumaKudeatzailea(); },
  estatistikak: () => { kalkulatuEstatistikak(); },
  ezarpenak: () => ezarpenakHasieratu()
};

let konparatzekoHautatuak = new Set();
const HAMAIKAKOA_GAKOA = "nire_hamaikakoa";

const KOLORE_GAIAK = {
  berdea: { primary: "#15803d", hover: "#166534", hero: "#14532d" },
  urdina: { primary: "#1d4ed8", hover: "#1e40af", hero: "#1e3a8a" },
  morea:  { primary: "#7e22ce", hover: "#6b21a8", hero: "#581c87" },
  gorria: { primary: "#b91c1c", hover: "#991b1b", hero: "#7f1d1d" }
};

function koloreaAplikatu(izena) {
  const aukera = KOLORE_GAIAK[izena] || KOLORE_GAIAK.berdea;
  document.documentElement.style.setProperty("--primary", aukera.primary);
  document.documentElement.style.setProperty("--primary-hover", aukera.hover);
  document.documentElement.style.setProperty("--hero-accent", aukera.hero);

  document.querySelectorAll(".kolore-botoia").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.kolorea === izena);
  });
}

// ===== PORTADA (HASIERA) =====
function hasieratuPortada() {
  const nireBilduma = bildumaStorage.itemBezalaLortu();

  const guztiraEl = document.getElementById("hasiera-guztira");
  const urreaEl = document.getElementById("hasiera-urrea");
  const golakEl = document.getElementById("hasiera-golak");
  const bbEl = document.getElementById("hasiera-batezbestekoa");
  const mailaTxapaEl = document.getElementById("hasiera-maila-txapa");
  const aurrerapenTestuaEl = document.getElementById("hasiera-aurrerapen-testua");
  const aurrerapenBarraEl = document.getElementById("hasiera-aurrerapen-barra");
  const nabarmenduaEl = document.getElementById("hasiera-kromo-nabarmendua");
  const aldatuBotoia = document.getElementById("aldatu-kromo-nabarmendua");
  const topKromoakEl = document.getElementById("hasiera-top-kromoak");

  if (!guztiraEl) return;

  const kop = nireBilduma.length;
  const urrezkoak = nireBilduma.filter(j => Number(j.balorazioa) >= 5).length;
  const golakGuztira = nireBilduma.reduce((acc, j) => {
    return acc + (j.estatistikak || []).reduce((s, x) => s + (x.goals?.total || 0), 0);
  }, 0);
  const bb = kop > 0
    ? (nireBilduma.reduce((acc, j) => acc + Number(j.balorazioa || 0), 0) / kop).toFixed(2)
    : "0.00";

  guztiraEl.textContent = kop;
  urreaEl.textContent = urrezkoak;
  if (golakEl) golakEl.textContent = golakGuztira;
  if (bbEl) bbEl.textContent = `${bb} ★`;

  const helburua = 15;
  const ehunekoa = Math.min(100, Math.round((kop / helburua) * 100));
  if (aurrerapenTestuaEl) aurrerapenTestuaEl.textContent = `${kop} / ${helburua} kromo (${ehunekoa}%)`;
  if (aurrerapenBarraEl) aurrerapenBarraEl.style.width = `${ehunekoa}%`;

  if (mailaTxapaEl) {
    if (kop === 0) mailaTxapaEl.textContent = "Maila: Hasiberria";
    else if (kop < 5) mailaTxapaEl.textContent = "Maila: Zalea 🥉";
    else if (kop < 10) mailaTxapaEl.textContent = "Maila: Aditua 🥈";
    else if (kop < 15) mailaTxapaEl.textContent = "Maila: Maisua 🏅";
    else mailaTxapaEl.textContent = "Maila: KONDAIRA 👑";
  }

  const erakutsiAusazkoIzarra = () => {
    if (!nabarmenduaEl) return;
    if (kop === 0) {
      nabarmenduaEl.innerHTML = `
        <div class="kromo-hutsik-txartela">
          <span>🃏</span>
          <p>Albuma hutsik dago.<br>Gehitu zure lehen kromoa!</p>
        </div>`;
      return;
    }
    const ausazkoa = nireBilduma[Math.floor(Math.random() * kop)];
    nabarmenduaEl.innerHTML = ausazkoa.toHTML(true);
    const check = nabarmenduaEl.querySelector(".konparatu-etiketa");
    if (check) check.remove();
    aktibatuKromo3DEfektua(nabarmenduaEl);
  };

  erakutsiAusazkoIzarra();
  if (aldatuBotoia) {
    aldatuBotoia.onclick = erakutsiAusazkoIzarra;
  }

  if (topKromoakEl) {
    if (kop === 0) {
      topKromoakEl.innerHTML = "<p>Oraindik ez dago kromorik bitrinan erakusteko.</p>";
    } else {
      const top3 = [...nireBilduma]
        .sort((a, b) => Number(b.balorazioa) - Number(a.balorazioa))
        .slice(0, 3);

      topKromoakEl.innerHTML = top3.map(item => item.toHTML(true)).join("");
      topKromoakEl.querySelectorAll(".konparatu-etiketa").forEach(el => el.remove());
      aktibatuKromo3DEfektua(topKromoakEl);
    }
  }
}

// ===== BILDUMA =====
function erakutsiBilduma() {
  const izenarekinBilatu = document.getElementById("jokalariaBilaketa");
  const ordenatuSelect = document.getElementById("Ordenatu");
  const ordenaSelect = document.getElementById("Ordena");
  const garbituBotoia = document.getElementById("garbitu-konparaketa");
  const garbituZelaiaBotoia = document.getElementById("garbitu-hamaikakoa");

  if (izenarekinBilatu) izenarekinBilatu.oninput = aplikatuIragazkiak;
  if (ordenatuSelect) ordenatuSelect.onchange = aplikatuIragazkiak;
  if (ordenaSelect) ordenaSelect.onchange = aplikatuIragazkiak;

  if (garbituBotoia) {
    garbituBotoia.onclick = () => {
      konparatzekoHautatuak.clear();
      aplikatuIragazkiak();
      eguneratuKonparatzailea();
    };
  }

  if (garbituZelaiaBotoia) {
    garbituZelaiaBotoia.onclick = () => {
      localStorage.removeItem(HAMAIKAKOA_GAKOA);
      eguneratuHamaikakoa();
    };
  }

  aplikatuIragazkiak();
  eguneratuHamaikakoa();
}

function aplikatuIragazkiak() {
  const nireBilduma = bildumaStorage.itemBezalaLortu();

  const testua = (document.getElementById("jokalariaBilaketa")?.value || "").toLowerCase();
  const filtratu = nireBilduma.filter(item =>
    ((item.izena || "").toLowerCase()).includes(testua) ||
    ((item.abizena || "").toLowerCase()).includes(testua) ||
    ((item.taldea || "").toLowerCase()).includes(testua)
  );

  const irizpidea = document.getElementById("Ordenatu")?.value || "balorazioa";
  const norabidea = document.getElementById("Ordena")?.value || "beherantz";

  const ordenatuta = filtratu.sort((a, b) => {
    let emaitza = 0;

    if (irizpidea === "izena") {
      emaitza = a.izena.localeCompare(b.izena);
    } else if (irizpidea === "balorazioa") {
      emaitza = Number(a.balorazioa) - Number(b.balorazioa);
    } else if (irizpidea === "golak") {
      const golakA = a.estatistikak.reduce((acc, x) => acc + (x.goals?.total || 0), 0);
      const golakB = b.estatistikak.reduce((acc, x) => acc + (x.goals?.total || 0), 0);
      emaitza = golakA - golakB;
    }

    return norabidea === "gorantz" ? emaitza : -emaitza;
  });

  eguneratuBilduma(ordenatuta);
}

// Kromoetan 3D efektua saguarekin
function aktibatuKromo3DEfektua(kontainerra) {
  kontainerra.querySelectorAll(".kromo").forEach(kromo => {
    kromo.addEventListener("mousemove", (e) => {
      if (kromo.classList.contains("buelta-emanda")) return;
      const rect = kromo.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 16;
      const rotateX = (0.5 - (y / rect.height)) * 16;
      kromo.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    kromo.addEventListener("mouseleave", () => {
      kromo.style.transform = "";
    });
  });
}

function eguneratuBilduma(bilduma) {
  const itemak = document.getElementById("lista-bilduma");
  const itemXehetasunak = document.getElementById("xehetasun-bilduma");
  if (!itemak) return;

  if (bilduma.length === 0) {
    itemak.innerHTML = "<p>Ez da kromorik aurkitu.</p>";
    eguneratuKonparatzailea();
    return;
  }

  itemak.innerHTML = bilduma.map(item => item.toHTML(true)).join("");
  aktibatuKromo3DEfektua(itemak);

  bilduma.forEach(item => {
    const unekoId = String(item.cardId || item.id);
    const datuak = itemak.querySelector(`.item-card[data-id="${unekoId}"]`);
    const check = itemak.querySelector(`.konparatu-check[data-id="${unekoId}"]`);

    if (check) {
      check.checked = konparatzekoHautatuak.has(unekoId);
      check.addEventListener("click", (e) => e.stopPropagation());
      check.closest(".konparatu-etiketa").addEventListener("click", (e) => e.stopPropagation());

      check.addEventListener("change", () => {
        if (check.checked) {
          konparatzekoHautatuak.add(unekoId);
        } else {
          konparatzekoHautatuak.delete(unekoId);
        }
        eguneratuKonparatzailea();
      });
    }

    if (datuak) {
      datuak.querySelectorAll(".buelta-botoia").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          datuak.style.transform = "";
          datuak.classList.toggle("buelta-emanda");
        });
      });

      datuak.addEventListener("click", function () {
        itemak.querySelectorAll(".item-card").forEach(c => c.classList.remove("hautatua"));
        datuak.classList.add("hautatua");
        itemXehetasunak.innerHTML = item.toXehetasunHTML(true);
      });
    }
  });

  eguneratuKonparatzailea();
}

// ===== NIRE HAMAIKAKOA (CAMPO 1-4-3-3) =====
function eguneratuHamaikakoa() {
  const posizioak = document.querySelectorAll(".posizio-lekua");
  const bbEl = document.getElementById("hamaikakoa-bb");
  const golakEl = document.getElementById("hamaikakoa-golak");
  if (!posizioak.length) return;

  const nireBilduma = bildumaStorage.itemBezalaLortu();
  let hamaikakoa = JSON.parse(localStorage.getItem(HAMAIKAKOA_GAKOA) || "{}");

  const aukerakHTML = nireBilduma.map(j => {
    const id = String(j.cardId || j.id);
    return `<option value="${id}">${j.izena} ${j.abizena || ""} (${j.balorazioa}★)</option>`;
  }).join("");

  let notaBatura = 0;
  let golBatura = 0;
  let jokalariKop = 0;

  posizioak.forEach(lekua => {
    const posIndex = lekua.dataset.pos;
    const etiketa = lekua.dataset.etiketa;
    const hautatutakoId = hamaikakoa[posIndex];
    const jokalaria = nireBilduma.find(j => String(j.cardId || j.id) === hautatutakoId);

    if (jokalaria) {
      jokalariKop++;
      notaBatura += Number(jokalaria.balorazioa) || 0;
      golBatura += (jokalaria.estatistikak || []).reduce((acc, x) => acc + (x.goals?.total || 0), 0);
    }

    lekua.innerHTML = `
      <div class="zelai-kromo-txikia ${jokalaria ? jokalaria.lortuKromoMota(true) : "hutsik"}">
        <span class="zelai-pos-etiketa">${etiketa}</span>
        ${jokalaria
          ? `<img src="${jokalaria.irudia}" alt="${jokalaria.izena}">
             <strong>${jokalaria.abizena || jokalaria.izena}</strong>
             <small>${jokalaria.balorazioa}★</small>`
          : `<span class="zelai-plus">+</span>`}
        <select class="zelai-hautatzailea" data-pos="${posIndex}">
          <option value="">-- Aukeratu --</option>
          ${aukerakHTML}
        </select>
      </div>
    `;

    const select = lekua.querySelector(".zelai-hautatzailea");
    if (hautatutakoId && jokalaria) select.value = hautatutakoId;

    select.addEventListener("change", () => {
      hamaikakoa[posIndex] = select.value;
      localStorage.setItem(HAMAIKAKOA_GAKOA, JSON.stringify(hamaikakoa));
      eguneratuHamaikakoa();
    });
  });

  if (bbEl) bbEl.textContent = jokalariKop > 0 ? `${(notaBatura / jokalariKop).toFixed(2)} ★` : "0.00 ★";
  if (golakEl) golakEl.textContent = golBatura;
}

// ===== KONPARATZAILEA =====
function eguneratuKonparatzailea() {
  const edukiontzia = document.getElementById("konparatzailea-edukia");
  const garbituBotoia = document.getElementById("garbitu-konparaketa");
  if (!edukiontzia) return;

  const nireBilduma = bildumaStorage.itemBezalaLortu();
  const existitzenDirenIdak = new Set(nireBilduma.map(i => String(i.cardId || i.id)));
  konparatzekoHautatuak.forEach(id => {
    if (!existitzenDirenIdak.has(id)) konparatzekoHautatuak.delete(id);
  });

  const hautatuak = nireBilduma.filter(item =>
    konparatzekoHautatuak.has(String(item.cardId || item.id))
  );

  if (garbituBotoia) {
    garbituBotoia.style.display = hautatuak.length > 0 ? "inline-block" : "none";
  }

  if (hautatuak.length < 2) {
    edukiontzia.innerHTML = `<p>Markatu bildumako gutxienez <strong>2 kromo</strong> elkarren ondoan alderatzeko (une honetan: <strong>${hautatuak.length}</strong> hautatuta).</p>`;
    return;
  }

  const batu = (item, fn) => (item.estatistikak || []).reduce((acc, x) => acc + (fn(x) || 0), 0);

  const errenkadak = [
    { etiketa: "Taldea", lortu: j => j.taldea || "-", mota: "testua" },
    { etiketa: "Denboraldia", lortu: j => j.denb || "-", mota: "testua" },
    { etiketa: "Posizioa", lortu: j => j.estatistikak?.[0]?.games?.position || "-", mota: "testua" },
    { etiketa: "Adina", lortu: j => j.adina ?? "-", mota: "testua" },
    { etiketa: "Balorazioa (1-5)", lortu: j => Number(j.balorazioa) || 0, mota: "max" },
    { etiketa: "Partidak", lortu: j => batu(j, x => x.games?.appearences), mota: "max" },
    { etiketa: "Minutuak", lortu: j => batu(j, x => x.games?.minutes), mota: "max" },
    { etiketa: "Golak", lortu: j => batu(j, x => x.goals?.total), mota: "max" },
    { etiketa: "Asistentziak", lortu: j => batu(j, x => x.goals?.assists), mota: "max" },
    { etiketa: "Tiroak", lortu: j => batu(j, x => x.shots?.total), mota: "max" },
    { etiketa: "Paseak", lortu: j => batu(j, x => x.passes?.total), mota: "max" },
    { etiketa: "Pase giltzarriak", lortu: j => batu(j, x => x.passes?.key), mota: "max" },
    { etiketa: "Txartel horiak", lortu: j => batu(j, x => x.cards?.yellow), mota: "min" },
    { etiketa: "Txartel gorriak", lortu: j => batu(j, x => x.cards?.red), mota: "min" }
  ];

  const taulaBurua = hautatuak.map(j => `
    <th>
      <img class="konparaketa-foto" src="${j.irudia || ""}" alt="${j.izena}"><br>
      <span>${j.izena} ${j.abizena || ""}</span>
    </th>
  `).join("");

  const taulaGorputza = errenkadak.map(err => {
    const balioak = hautatuak.map(j => err.lortu(j));
    let onena = null;
    let maxBarra = 0;

    if (err.mota === "max") {
      maxBarra = Math.max(...balioak);
      if (maxBarra > 0) onena = maxBarra;
    } else if (err.mota === "min") {
      onena = Math.min(...balioak);
    }

    const gelaxkak = balioak.map(val => {
      const irabazlea = onena !== null && val === onena;
      const barraHTML = err.mota === "max" && maxBarra > 0
        ? `<div class="konp-barra"><div style="width: ${Math.round((val / maxBarra) * 100)}%"></div></div>`
        : "";
      return `<td class="${irabazlea ? "konparaketa-onena" : ""}">${val}${barraHTML}</td>`;
    }).join("");

    return `<tr><th>${err.etiketa}</th>${gelaxkak}</tr>`;
  }).join("");

  edukiontzia.innerHTML = `
    <div class="konparatzailea-scroll">
      <table class="konparatzailea-taula">
        <thead>
          <tr>
            <th>Ezaugarria</th>
            ${taulaBurua}
          </tr>
        </thead>
        <tbody>
          ${taulaGorputza}
        </tbody>
      </table>
    </div>
  `;
}

// ===== EZARPENAK ETA JSON =====
function gaiaAplikatu(iluna) {
  document.body.classList.toggle('iluna', iluna);
}

function ezarpenakHasieratu() {
  const etengailua = document.getElementById('modu-iluna');
  if (etengailua) {
    etengailua.checked = localStorage.getItem('gaia') === 'iluna';
    etengailua.addEventListener('change', () => {
      gaiaAplikatu(etengailua.checked);
      localStorage.setItem('gaia', etengailua.checked ? 'iluna' : 'argia');
    });
  }

  const gordetakoKolorea = localStorage.getItem("album_kolorea") || "berdea";
  koloreaAplikatu(gordetakoKolorea);

  document.querySelectorAll(".kolore-botoia").forEach(btn => {
    btn.addEventListener("click", () => {
      const k = btn.dataset.kolorea;
      localStorage.setItem("album_kolorea", k);
      koloreaAplikatu(k);
    });
  });

  const eguneratuEzarpenDatuak = () => {
    const kromoKopEl = document.getElementById("ezarpen-kromo-kop");
    const historiaKopEl = document.getElementById("ezarpen-historia-kop");
    if (kromoKopEl) kromoKopEl.textContent = bildumaStorage.denakLortu().length;
    if (historiaKopEl) {
      const h1 = JSON.parse(localStorage.getItem("historiala_jokalariak") || "[]").length;
      const h2 = JSON.parse(localStorage.getItem("historiala_taldeak") || "[]").length;
      historiaKopEl.textContent = `${h1 + h2} sarrera`;
    }
  };
  eguneratuEzarpenDatuak();

  const espBtn = document.getElementById("ezarpen-esportatu");
  const inpBtn = document.getElementById("ezarpen-inportatu");
  const fitxInput = document.getElementById("ezarpen-fitxategia");
  const jsonMezua = document.getElementById("ezarpen-json-mezua");

  if (espBtn) {
    espBtn.addEventListener("click", () => esportatuBildumaJSON(jsonMezua));
  }
  if (inpBtn && fitxInput) {
    inpBtn.addEventListener("click", () => fitxInput.click());
    fitxInput.addEventListener("change", (e) => {
      inportatuBildumaJSON(e, () => {
        eguneratuEzarpenDatuak();
        if (jsonMezua) jsonMezua.textContent = "✅ Bilduma ondo inportatu da!";
      }, jsonMezua);
    });
  }

  const garbituHistBtn = document.getElementById("ezarpen-garbitu-historia");
  if (garbituHistBtn) {
    garbituHistBtn.addEventListener("click", () => {
      localStorage.removeItem("historiala_jokalariak");
      localStorage.removeItem("historiala_taldeak");
      eguneratuEzarpenDatuak();
      if (jsonMezua) jsonMezua.textContent = "🧹 Bilaketa historia garbitu da.";
    });
  }

  const ezabatuDenaBtn = document.getElementById("ezarpen-ezabatu-dena");
  if (ezabatuDenaBtn) {
    ezabatuDenaBtn.addEventListener("click", () => {
      if (!confirm("Ziur zaude bilduma eta ezarpen guztiak ezabatu nahi dituzula?")) return;
      bildumaStorage.hustu();
      localStorage.removeItem(HAMAIKAKOA_GAKOA);
      eguneratuEzarpenDatuak();
      if (jsonMezua) jsonMezua.textContent = "🗑️ Datu guztiak ezabatu dira.";
    });
  }
}

function esportatuBildumaJSON(mezuaEl) {
  const datuak = JSON.stringify(bildumaStorage.denakLortu(), null, 2);
  const blob = new Blob([datuak], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nire-kromo-albuma.json";
  a.click();
  URL.revokeObjectURL(url);
  if (mezuaEl) mezuaEl.textContent = "⬇️ 'nire-kromo-albuma.json' deskargatu da.";
}

function inportatuBildumaJSON(event, onSuccess, mezuaEl) {
  const fitxategia = event.target.files[0];
  if (!fitxategia) return;

  const irakurlea = new FileReader();
  irakurlea.onload = (e) => {
    try {
      const bildumaBerria = JSON.parse(e.target.result);
      if (!Array.isArray(bildumaBerria)) throw new Error("Formatu okerra");
      localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(bildumaBerria));
      if (onSuccess) onSuccess();
    } catch (err) {
      if (mezuaEl) mezuaEl.textContent = "❌ Errorea JSON fitxategia irakurtzean.";
    }
  };
  irakurlea.readAsText(fitxategia);
}

// ===== BILDUMA KUDEATU =====
function erakutsiBildumaKudeatzailea() {
  const hustuBotoia = document.getElementById("botoia-hustu");
  if (hustuBotoia) hustuBotoia.addEventListener("click", hustuBiltegia);

  const iragazkia = document.getElementById("kudeatu-iragazkia");
  if (iragazkia) {
    iragazkia.addEventListener("input", () => eguneratuKudeatzailea(iragazkia.value));
  }

  const esportatuBotoia = document.getElementById("botoia-esportatu");
  const inportatuBotoia = document.getElementById("botoia-inportatu");
  const fitxategiInput = document.getElementById("fitxategia-inportatu");

  if (esportatuBotoia) {
    esportatuBotoia.addEventListener("click", () => esportatuBildumaJSON());
  }
  if (inportatuBotoia && fitxategiInput) {
    inportatuBotoia.addEventListener("click", () => fitxategiInput.click());
    fitxategiInput.addEventListener("change", (e) => {
      inportatuBildumaJSON(e, () => {
        eguneratuKudeatzailea();
        alert("Bilduma ondo inportatu da!");
      });
    });
  }

  const lista = document.getElementById("lista-kudeatu");
  if (lista) {
    lista.addEventListener("click", function (event) {
      const kromoa = event.target.closest(".kudeatu");
      if (!kromoa) return;
      const unekoId = kromoa.dataset.id;
      if (event.target.id === `gorde-${unekoId}`) {
        const nota = lista.querySelector(`#nota-${unekoId}`);
        if (nota.value.trim() === "" || Number(nota.value) > 5 || Number(nota.value) < 1) {
          nota.value = "3";
        }
        const iruzkina = lista.querySelector(`#iruzkina-${unekoId}`).value;
        bildumaStorage.eguneratu(unekoId, nota.value, iruzkina);
        const izarrakEl = kromoa.querySelector(".kudeatu-izarrak");
        const n = Number(nota.value);
        if (izarrakEl) izarrakEl.textContent = "★".repeat(n) + "☆".repeat(5 - n);
        lista.querySelector(`#text-${unekoId}`).textContent = "✅ Aldaketak gorde dira!";
      }
      if (event.target.id === `ezabatu-${unekoId}`) {
        bildumaStorage.ezabatu(unekoId);
        eguneratuKudeatzailea(iragazkia?.value || "");
      }
    });
  }
  eguneratuKudeatzailea();
}

function eguneratuKudeatzailea(testua = "") {
  const lista = document.getElementById("lista-kudeatu");
  if (!lista) return;
  const filtro = testua.toLowerCase();
  const bilduma = bildumaStorage.itemBezalaLortu().filter(j =>
    (j.izena || "").toLowerCase().includes(filtro) ||
    (j.abizena || "").toLowerCase().includes(filtro) ||
    (j.taldea || "").toLowerCase().includes(filtro)
  );

  if (bilduma.length === 0) {
    lista.innerHTML = `<p>Ez da kromorik aurkitu.</p>`;
    return;
  }
  lista.innerHTML = bilduma.map(item => item.toBildumaKudeatu()).join("");
}

function hustuBiltegia() {
  if (!confirm("Ziur zaude bilduma osoa ezabatu nahi duzula?")) return;
  bildumaStorage.hustu();
  eguneratuKudeatzailea();
}

// ===== NABIGAZIOA =====
async function atalaKargatu(izena) {
  const edukiontzia = document.getElementById(`atala-${izena}`);

  try {
    const emaitza = await fetch(`templates/${izena}.html`);
    if (!emaitza.ok) throw new Error(`${izena} Ezin izan da kargatu`);

    edukiontzia.innerHTML = await emaitza.text();

    if (HASIERATZAILEAK[izena]) HASIERATZAILEAK[izena]();
  } catch (error) {
    edukiontzia.innerHTML = '<p>Atal hau kargatzean errorea suertatu da.</p>';
    console.error(error);
  }
}

function erakutsiAtala(izena) {
  document.querySelectorAll('.atala').forEach(sec => {
    sec.classList.remove('aktiboa');
  });

  const atala = document.getElementById(`atala-${izena}`);
  if (!atala) return;

  atala.classList.add('aktiboa');

  if (izena === 'hasiera') {
    hasieratuPortada();
  } else if (izena === 'bilduma') {
    erakutsiBilduma();
  } else if (izena === 'kudeatuBilduma') {
    eguneratuKudeatzailea();
  } else if (izena === 'estatistikak') {
    kalkulatuEstatistikak();
  } else if (izena === 'ezarpenak') {
    ezarpenakHasieratu();
  }

  document.querySelectorAll('#menu-nagusia button')
    .forEach(btn => btn.classList.remove('active'));

  const boton = document.querySelector(`#menu-nagusia button[data-seccion="${izena}"]`);
  if (boton) boton.classList.add('active');
}

// ===== ESTATISTIKAK ETA LORPENAK =====
function kalkulatuEstatistikak() {
  const nireBilduma = bildumaStorage.itemBezalaLortu();

  const guztira = document.getElementById("guztira");
  const batezBestekoa = document.getElementById("batezBestekoa");
  const banaketa = document.getElementById("banaketa");
  const gehienBaloratutako = document.getElementById("gehienBaloratutako");
  const gutxienBaloratutako = document.getElementById("gutxienBaloratutako");
  const gehienGolak = document.getElementById("gehienGolak");

  if (!guztira) return;

  if (nireBilduma.length === 0) {
    guztira.textContent = "0";
    batezBestekoa.textContent = "0.00";
    banaketa.innerHTML = "<p>Ez dago daturik</p>";
    gehienBaloratutako.textContent = "Ez dago jokalaririk";
    gutxienBaloratutako.textContent = "Ez dago jokalaririk";
    gehienGolak.textContent = "Ez dago jokalaririk";
  } else {
    guztira.textContent = nireBilduma.length.toString();

    const baturaTotala = nireBilduma.reduce((acc, jokalaria) => acc + Number(jokalaria.balorazioa), 0);
    const batezBestekoaBalioa = baturaTotala / nireBilduma.length;
    batezBestekoa.textContent = batezBestekoaBalioa.toFixed(2);

    const onena = nireBilduma.reduce((max, jokalaria) => Number(jokalaria.balorazioa) > Number(max.balorazioa) ? jokalaria : max, nireBilduma[0]);
    const txarrena = nireBilduma.reduce((min, jokalaria) => Number(jokalaria.balorazioa) < Number(min.balorazioa) ? jokalaria : min, nireBilduma[0]);

    gehienBaloratutako.textContent = `${onena.izena} ${onena.abizena || ""} (${onena.balorazioa}★)`;
    gutxienBaloratutako.textContent = `${txarrena.izena} ${txarrena.abizena || ""} (${txarrena.balorazioa}★)`;

    const baneketaEgin = nireBilduma.reduce((acc, jokalaria) => {
      const balorazioa = Math.round(Number(jokalaria.balorazioa));
      if (balorazioa >= 1 && balorazioa <= 5) {
        acc[balorazioa] = (acc[balorazioa] || 0) + 1;
      }
      return acc;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    banaketa.innerHTML = [5, 4, 3, 2, 1].map(nota => {
      const kopurua = baneketaEgin[nota];
      const ehunekoa = Math.round((kopurua / nireBilduma.length) * 100);
      return `
        <div class="banaketa-errenkada">
          <span>${nota} ★</span>
          <div class="barra-atzekoa">
            <div class="barra-aurrekoa" style="width: ${ehunekoa}%;"></div>
          </div>
          <span>${kopurua} (${ehunekoa}%)</span>
        </div>
      `;
    }).join("");

    const jokalariGolak = nireBilduma.reduce((max, jokalaria) => {
      if (!max.estatistikak) return jokalaria;
      if (!jokalaria.estatistikak) return max;
      const maxGolak = max.estatistikak.reduce((acc, x) => acc + (x.goals?.total || 0), 0);
      const jokalariGolak = jokalaria.estatistikak.reduce((acc, x) => acc + (x.goals?.total || 0), 0);
      return jokalariGolak > maxGolak ? jokalaria : max;
    }, nireBilduma[0]);

    let golTotak = 0;
    if (jokalariGolak.estatistikak) {
      golTotak = jokalariGolak.estatistikak.reduce((acc, x) => acc + (x.goals?.total || 0), 0);
    }
    gehienGolak.textContent = `${jokalariGolak.izena} ${jokalariGolak.abizena || ""} (${golTotak} gol)`;
  }

  // Lorpenak (Dominak)
  const lorpenakEl = document.getElementById("lorpenak-sareta");
  if (lorpenakEl) {
    const golakTotala = nireBilduma.reduce((acc, j) =>
      acc + (j.estatistikak || []).reduce((s, x) => s + (x.goals?.total || 0), 0), 0
    );
    const urreKop = nireBilduma.filter(j => Number(j.balorazioa) >= 5).length;
    const taldeDesberdinak = new Set(nireBilduma.map(j => j.taldea).filter(Boolean)).size;

    const lorpenak = [
      { ikonoa: "🌱", titulua: "Lehen Fitxaketa", desk: "Gorde zure lehen kromoa albumean", lortuta: nireBilduma.length >= 1 },
      { ikonoa: "📚", titulua: "Bildumagile Zalea", desk: "Bildu gutxienez 5 kromo", lortuta: nireBilduma.length >= 5 },
      { ikonoa: "👑", titulua: "Urre Bilatzailea", desk: "Lortu 3 Urrezko Kondaira (5★)", lortuta: urreKop >= 3 },
      { ikonoa: "⚽", titulua: "Golegile Makina", desk: "Metatu 50 gol baino gehiago zure albumean", lortuta: golakTotala >= 50 },
      { ikonoa: "🌍", titulua: "Nazioarteko Sarea", desk: "Izan 4 talde desberdinetako jokalariak", lortuta: taldeDesberdinak >= 4 },
      { ikonoa: "🏆", titulua: "Albumaren Maisua", desk: "Osatu 15 kromoko bilduma osoa", lortuta: nireBilduma.length >= 15 }
    ];

    lorpenakEl.innerHTML = lorpenak.map(l => `
      <div class="lorpen-txartela ${l.lortuta ? "lortuta" : "blokeatuta"}">
        <span class="lorpen-ikonoa">${l.ikonoa}</span>
        <div>
          <strong>${l.titulua}</strong>
          <p>${l.desk}</p>
        </div>
        <span class="lorpen-egoera">${l.lortuta ? "✅ Lortuta" : "🔒 Blokeatuta"}</span>
      </div>
    `).join("");
  }
}

async function jaurtiApp() {
  gaiaAplikatu(localStorage.getItem('gaia') === 'iluna');
  koloreaAplikatu(localStorage.getItem('album_kolorea') || 'berdea');
  await Promise.all(ATALAK.map(atalaKargatu));
  erakutsiAtala('hasiera');
}

document.getElementById('menu-nagusia').addEventListener('click', (event) => {
  const boton = event.target.closest('button[data-seccion]');
  if (!boton) return;
  erakutsiAtala(boton.dataset.seccion);
});

jaurtiApp();