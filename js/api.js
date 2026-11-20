const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = "d15b472138b0586ea6366674402e1aaf";

async function bilatuApi() {
  const jokalariFormularioa = document.getElementById("form-bilatzaile");
  const jokalariInput = document.getElementById("jokalari-bilaketa");
  const denboraldiBilaketa = document.getElementById("denboraldi-bilaketa");
  const taldeBilaketa = document.getElementById("talde-bilaketa-jokalaria");

  const taldeFormularioa = document.getElementById("form-bilatzaile-taldea");
  const taldeEgoera = document.getElementById("talde-egoera");
  const taldeEmaitzak = document.getElementById("talde-emaitzak-bilaketa");
  const taldeInput = document.getElementById("talde-bilaketa");

  const egoera = document.getElementById("egoera-bilatzen");
  const emaitzak = document.getElementById("emaitzak-bilaketa");
  const jokalariDatuak = document.getElementById("xehetasunak-item");
  const ezabatzekoBotoia = document.getElementById("emaitzak-ezabatu");

  const harrituBotoia = document.getElementById("harritu-botoia");
  const harrituEgoera = document.getElementById("harritu-egoera");

  // HISTORIALA KARGATU
  bildumaStorage.eguneratuDatalista('historiala_jokalariak', 'jokalari-historiala');
  bildumaStorage.eguneratuDatalista('historiala_taldeak', 'talde-historiala');

  // JOKALARIAK BILATU
  jokalariFormularioa.addEventListener("submit", async function (e) {
    e.preventDefault();

    const jokalaria = jokalariInput.value.trim();
    const denboraldia = denboraldiBilaketa.value;

    if (jokalaria === "" || denboraldia === "") {
      egoera.textContent = "Bete eremu guztiak";
      return;
    }

    if (taldeBilaketa.value === "") {
      egoera.textContent = "Lehenengo talde bat aukeratu";
      return;
    }

    bildumaStorage.gordetakoHistoriala('historiala_jokalariak', jokalaria);
    bildumaStorage.eguneratuDatalista('historiala_jokalariak', 'jokalari-historiala');

    egoera.textContent = "Bilatzen...";
    emaitzak.innerHTML = "";

    try {
      const erantzuna = await fetch(
        `${API_BASE_URL}/players?search=${encodeURIComponent(jokalaria)}&season=${denboraldia}&team=${taldeBilaketa.value}`,
        {
          method: "GET",
          headers: {
            'x-apisports-key': API_KEY
          }
        }
      );

      const data = await erantzuna.json();

      if (Object.keys(data.errors).length > 0) {
        egoera.textContent = "Errorea jokalaria bilatzen";
        console.log(data.errors);
        return;
      }

      if (data.response.length === 0) {
        egoera.textContent = "Ez da jokalaririk aurkitu";
        return;
      }

      const denboraldiaUrtea = data.parameters;

      data.response.map(player => {
        return new Item({ ...denboraldiaUrtea, ...player.player, estadistikak: player.statistics });
      }).forEach(player => {
        emaitzak.insertAdjacentHTML("beforeend", player.toHTML(false));
        const datuak = emaitzak.querySelector(`[data-id="${player.cardId}"]`);

        datuak.addEventListener("click", function () {
          emaitzak.querySelectorAll(".item-card").forEach(t => t.classList.remove("hautatua"));
          datuak.classList.add("hautatua");
          jokalariDatuak.innerHTML = player.toXehetasunHTML(false);

          const gordetzekoBotoia = document.getElementById("gordeBiltegian");
          const balorazioa = document.getElementById("nota");
          const iruzkina = document.getElementById("iruzkina");

          gordetzekoBotoia.addEventListener("click", function () {
            if (balorazioa.value.trim() === "" || Number(balorazioa.value) > 5 || Number(balorazioa.value) < 1) {
              balorazioa.value = "3";
            }
            player.balorazioa = balorazioa.value;
            player.iruzkina = iruzkina.value;
            const gordeTestua = document.getElementById("gorde");
            const gorde = bildumaStorage.gorde(player);
            if (gorde) {
              gordeTestua.innerHTML = `<p>${player.izena} ${player.abizena || ""} gorde da</p>`;
            } else {
              gordeTestua.innerHTML = "<p>Badago gordeta</p>";
            }
          });
        });
      });

      if (typeof aktibatuKromo3DEfektua === "function") {
        aktibatuKromo3DEfektua(emaitzak);
      }

      egoera.textContent = "";

    } catch (error) {
      console.log("error:", error);
      egoera.textContent = "Errore bat gertatu da.";
    }
  });

  // EMAITZAK EZABATU
  ezabatzekoBotoia.addEventListener("click", function () {
    emaitzak.innerHTML = "<p>Bilaketa bat gauzatu emaitzak lortzeko</p>";
    jokalariDatuak.innerHTML = "<p>Emaitzetako bat aukeratu, bere xehetasunak bistaratzeko.</p>";
  });

  // TALDEAK BILATU
  taldeFormularioa.addEventListener("submit", async function (e) {
    e.preventDefault();

    const taldea = taldeInput.value.trim();

    if (taldea === "") {
      taldeEgoera.textContent = "Sartu talde baten izena";
      return;
    }

    bildumaStorage.gordetakoHistoriala('historiala_taldeak', taldea);
    bildumaStorage.eguneratuDatalista('historiala_taldeak', 'talde-historiala');

    taldeEgoera.textContent = "Taldea bilatzen...";
    taldeEmaitzak.innerHTML = "";

    try {
      const url = `${API_BASE_URL}/teams?search=${encodeURIComponent(taldea)}`;

      const erantzuna = await fetch(url, {
        headers: {
          'x-apisports-key': API_KEY
        }
      });

      const taldeData = await erantzuna.json();

      if (Object.keys(taldeData.errors).length > 0) {
        taldeEgoera.textContent = "Errorea taldea bilatzen";
        console.log(taldeData.errors);
        return;
      }

      if (taldeData.response.length === 0) {
        taldeEgoera.textContent = "Ez da talderik aurkitu";
        return;
      }

      taldeData.response.sort((a, b) => b.venue.capacity - a.venue.capacity).slice(0, 10).map(talde => {
        return new Item(talde.team);
      }).forEach(talde => {
        taldeEmaitzak.insertAdjacentHTML("beforeend", talde.toHTML(false));
      });

      taldeEmaitzak.querySelectorAll(".item-card").forEach(talde => {
        talde.addEventListener("click", function () {
          taldeBilaketa.value = talde.getAttribute("data-id");
          const taldeIzena = talde.querySelector("h3").textContent;
          taldeEmaitzak.innerHTML = `<p id="talde-egoera">${taldeIzena} aukeratu da</p>`;
        });
      });
    } catch (error) {
      console.log("error:", error);
      taldeEgoera.textContent = "Errore bat gertatu da.";
    }
  });

  // HARRITU NAZAZU (KROMO-ZORROAREN IREKIERA ANIMATUA - +2500 JOKALARI)
  const denboraldiak = [2022, 2023, 2024];

  const zorroModala = document.getElementById("zorro-modala");
  const itxiZorroa = document.getElementById("itxi-zorroa");
  const zorroItxiaFasea = document.getElementById("zorro-itxia-fasea");
  const zorroIrekiaFasea = document.getElementById("zorro-irekia-fasea");
  const kromoZorroa = document.getElementById("kromo-zorroa");
  const irekiZorroaBotoia = document.getElementById("ireki-zorroa-botoia");
  const zorroEgoeraTestua = document.getElementById("zorro-egoera-testua");
  const zorroKromoLekua = document.getElementById("zorro-kromo-lekua");
  const zorroArrarotasunaTitulua = document.getElementById("zorro-arrarotasuna-titulua");
  const zorroNota = document.getElementById("zorro-nota");
  const zorroIruzkina = document.getElementById("zorro-iruzkina");
  const zorroGordeBotoia = document.getElementById("zorro-gorde-botoia");
  const zorroBerriaBotoia = document.getElementById("zorro-berria-botoia");
  const zorroGordeMezua = document.getElementById("zorro-gorde-mezua");

  let unekoZorroPlayer = null;

  function lortuAusazkoJokalariId() {
    return Math.floor(Math.random() * 2500) + 1;
  }

  async function prestatuZorroa(saiakera = 1) {
    if (saiakera === 1) {
      unekoZorroPlayer = null;
      zorroModala.classList.remove("ezkutatuta");
      zorroItxiaFasea.classList.remove("ezkutatuta");
      zorroIrekiaFasea.classList.add("ezkutatuta");
      kromoZorroa.classList.add("dardara");
      kromoZorroa.classList.remove("zorro-irekitzen");

      irekiZorroaBotoia.disabled = true;
      irekiZorroaBotoia.textContent = "⏳ Zorroa prestatzen...";
      zorroEgoeraTestua.textContent = "Jokalaria bilatzen...";
      zorroGordeMezua.textContent = "";
      zorroIruzkina.value = "";
    }

    const randomId = lortuAusazkoJokalariId();
    const randomDenboraldi = denboraldiak[Math.floor(Math.random() * denboraldiak.length)];

    try {
      const erantzuna = await fetch(
        `${API_BASE_URL}/players?id=${randomId}&season=${randomDenboraldi}`,
        {
          method: "GET",
          headers: {
            "x-apisports-key": API_KEY
          }
        }
      );

      const data = await erantzuna.json();
      const emaitza = data.response?.[0];

      if (!emaitza || !emaitza.statistics || emaitza.statistics.length === 0) {
        if (saiakera < 5) {
          return prestatuZorroa(saiakera + 1);
        }
        zorroEgoeraTestua.textContent = "Ez da jokalaririk aurkitu, saiatu berriro";
        irekiZorroaBotoia.disabled = false;
        irekiZorroaBotoia.textContent = "🔄 Saiatu berriro";
        return;
      }

      const ausazkoNota = [3, 4, 4, 5][Math.floor(Math.random() * 4)];

      unekoZorroPlayer = new Item({
        season: randomDenboraldi,
        ...emaitza.player,
        estadistikak: emaitza.statistics,
        balorazioa: String(ausazkoNota),
        iruzkina: "Kromo-zorroan lortua"
      });

      zorroNota.value = String(ausazkoNota);
      zorroEgoeraTestua.textContent = "PREST DAGO!";
      irekiZorroaBotoia.disabled = false;
      irekiZorroaBotoia.textContent = "✨ IREKI ZORROA!";
    } catch (error) {
      console.error("error", error);
      zorroEgoeraTestua.textContent = "Konexio errorea";
      irekiZorroaBotoia.disabled = false;
      irekiZorroaBotoia.textContent = "🔄 Saiatu berriro";
    }
  }

  function erakutsiZorrokoKromoa() {
    if (!unekoZorroPlayer) {
      prestatuZorroa();
      return;
    }

    kromoZorroa.classList.remove("dardara");
    kromoZorroa.classList.add("zorro-irekitzen");

    setTimeout(() => {
      zorroItxiaFasea.classList.add("ezkutatuta");
      zorroIrekiaFasea.classList.remove("ezkutatuta");

      const nota = Number(unekoZorroPlayer.balorazioa);
      if (nota >= 5) {
        zorroArrarotasunaTitulua.textContent = "👑 URREZKO KONDAIRA LORTU DUZU!";
      } else if (nota === 4) {
        zorroArrarotasunaTitulua.textContent = "⚡ ZILARREZKO ELITE KROMOA!";
      } else {
        zorroArrarotasunaTitulua.textContent = "🔥 KROMO BERRIA LORTU DUZU!";
      }

      zorroKromoLekua.innerHTML = unekoZorroPlayer.toHTML(true);
      const checkEtiketa = zorroKromoLekua.querySelector(".konparatu-etiketa");
      if (checkEtiketa) checkEtiketa.remove();

      if (typeof aktibatuKromo3DEfektua === "function") {
        aktibatuKromo3DEfektua(zorroKromoLekua);
      }

      emaitzak.innerHTML = unekoZorroPlayer.toHTML(false);
      jokalariDatuak.innerHTML = unekoZorroPlayer.toXehetasunHTML(false);
    }, 450);
  }

  harrituBotoia.addEventListener("click", () => prestatuZorroa(1));
  irekiZorroaBotoia.addEventListener("click", erakutsiZorrokoKromoa);
  kromoZorroa.addEventListener("click", () => {
    if (!irekiZorroaBotoia.disabled) erakutsiZorrokoKromoa();
  });

  zorroNota.addEventListener("input", () => {
    if (!unekoZorroPlayer) return;
    let val = Number(zorroNota.value);
    if (val >= 1 && val <= 5) {
      unekoZorroPlayer.balorazioa = String(val);
      zorroKromoLekua.innerHTML = unekoZorroPlayer.toHTML(true);
      const checkEtiketa = zorroKromoLekua.querySelector(".konparatu-etiketa");
      if (checkEtiketa) checkEtiketa.remove();
    }
  });

  zorroGordeBotoia.addEventListener("click", () => {
    if (!unekoZorroPlayer) return;
    let val = Number(zorroNota.value);
    if (!val || val < 1 || val > 5) val = 3;

    unekoZorroPlayer.balorazioa = String(val);
    unekoZorroPlayer.iruzkina = zorroIruzkina.value.trim() || "Kromo-zorroan lortua";

    const gordeta = bildumaStorage.gorde(unekoZorroPlayer);
    if (gordeta) {
      zorroGordeMezua.textContent = `✅ ${unekoZorroPlayer.izena} ${unekoZorroPlayer.abizena || ""} albumean itsatsi da!`;
      harrituEgoera.textContent = `${unekoZorroPlayer.izena} ${unekoZorroPlayer.abizena || ""} bilduman gorde da.`;
    } else {
      zorroGordeMezua.textContent = "⚠️ Kromo hau jada zure albumean dago!";
    }
  });

  zorroBerriaBotoia.addEventListener("click", () => prestatuZorroa(1));
  itxiZorroa.addEventListener("click", () => zorroModala.classList.add("ezkutatuta"));
  zorroModala.addEventListener("click", (e) => {
    if (e.target === zorroModala) zorroModala.classList.add("ezkutatuta");
  });
}