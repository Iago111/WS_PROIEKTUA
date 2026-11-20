class Item {
  constructor(ApiDatuak) {
    this.cardId = ApiDatuak.season ? `${ApiDatuak.id}-${ApiDatuak.season}` : null;
    this.denb = ApiDatuak.season;

    // Informazio orokorra
    this.id = ApiDatuak.id;
    this.izena = ApiDatuak.firstname || ApiDatuak.name;
    this.abizena = ApiDatuak.lastname;
    this.irudia = ApiDatuak.photo || ApiDatuak.logo;
    this.adina = ApiDatuak.age;
    this.nazionalitatea = ApiDatuak.nationality;

    // Jaiotzaren informazioa
    this.jaiotzeData = ApiDatuak.birth?.date;
    this.jaiotzeLekua = ApiDatuak.birth?.place;
    this.jaiotzeHerrialdea = ApiDatuak.birth?.country;

    // Ezaugarri fisikoak
    this.altuera = ApiDatuak.height;
    this.pisua = ApiDatuak.weight;
    this.lesionatuta = ApiDatuak.injured;

    // Taldearen informazioa (estatistiketatik)
    this.taldea = ApiDatuak.estadistikak?.[0]?.team?.name;
    this.taldeLogo = ApiDatuak.estadistikak?.[0]?.team?.logo;

    // Estatistikak
    this.estatistikak = ApiDatuak.estadistikak || [];

    // Gordetako data
    this.gordetakoData = ApiDatuak.gordetakoData
      ? new Date(ApiDatuak.gordetakoData)
      : new Date();
    this.balorazioa = ApiDatuak.balorazioa || "";
    this.iruzkina = ApiDatuak.iruzkina || "";
  }

  // Laguntzailea: kromoaren arrarotasun klasea lortu balorazioaren arabera
  lortuKromoMota(balorazioaErakutsi) {
    if (!balorazioaErakutsi || !this.balorazioa) return "kromo-estandar";
    const nota = Number(this.balorazioa);
    if (nota >= 5) return "kromo-urrea";
    if (nota === 4) return "kromo-zilarra";
    return "kromo-brontzea";
  }

  // Kromo txartela (Bilatzailean eta Bilduman)
  // Kromo txartela (Bilatzailean eta Bilduman, aurrealdea eta atzealdea)
  toHTML(balorazioa) {
    const unekoId = this.cardId ? this.cardId : this.id;
    const kromoMota = this.lortuKromoMota(balorazioa);
    const golak = this.estatistikak.reduce((acc, x) => acc + (x.goals?.total || 0), 0);
    const asistentziak = this.estatistikak.reduce((acc, x) => acc + (x.goals?.assists || 0), 0);
    const partidak = this.estatistikak.reduce((acc, x) => acc + (x.games?.appearences || 0), 0);
    const posizioa = this.estatistikak?.[0]?.games?.position
      ? this.estatistikak[0].games.position.slice(0, 3).toUpperCase()
      : "JOK";
    const dataFormatua = this.gordetakoData instanceof Date && !isNaN(this.gordetakoData)
      ? this.gordetakoData.toLocaleDateString("eu-ES")
      : "-";

    return `
      <div class="item-card kromo ${kromoMota}" data-id="${unekoId}">
        <div class="kromo-barnea">
          <!-- AURREALDEA -->
          <div class="kromo-aurpegia kromo-aurrea">
            <div class="kromo-distira"></div>

            <div class="kromo-goia">
              <div class="kromo-ezkerra">
                <span class="kromo-nota">${balorazioa && this.balorazioa ? `${this.balorazioa}★` : posizioa}</span>
                <span class="kromo-posizioa">${posizioa}</span>
                ${this.taldeLogo ? `<img class="kromo-armarria" src="${this.taldeLogo}" alt="${this.taldea || ""}">` : ""}
              </div>
              <span class="kromo-denboraldia">${this.denb || ""}</span>
            </div>

            <div class="kromo-irudia-kontainerra">
              <img class="kromo-argazkia" src="${this.irudia || ""}" alt="${this.izena}">
            </div>

            <div class="kromo-izena-plaka">
              <h3>${this.izena}</h3>
              <p class="kromo-taldea">${this.taldea || "Talderik gabe"}</p>
            </div>

            <div class="kromo-stats-barra">
              <div><span>${partidak}</span><small>PAR</small></div>
              <div><span>${golak}</span><small>GOL</small></div>
              <div><span>${asistentziak}</span><small>ASI</small></div>
            </div>

            ${balorazioa ? `
              <div class="kromo-ekintza-lerroa">
                <label class="konparatu-etiketa">
                  <input type="checkbox" class="konparatu-check" data-id="${unekoId}">
                  <span>Konparatu</span>
                </label>
                <button type="button" class="buelta-botoia" title="Ikusi atzealdea">🔄</button>
              </div>
            ` : ""}
          </div>

          <!-- ATZEALDEA (REVERSO OFICIAL) -->
          ${balorazioa ? `
            <div class="kromo-aurpegia kromo-atzea">
              <div class="kromo-atze-goia">
                <strong>FITXA OFIZIALA</strong>
                <button type="button" class="buelta-botoia" title="Itzuli aurrealdera">🔄</button>
              </div>
              <ul class="kromo-atze-datuak">
                <li><span>Herrialdea:</span> <strong>${this.nazionalitatea || "-"}</strong></li>
                <li><span>Adina:</span> <strong>${this.adina ?? "-"} urte</strong></li>
                <li><span>Altuera:</span> <strong>${this.altuera || "-"}</strong></li>
                <li><span>Pisua:</span> <strong>${this.pisua || "-"}</strong></li>
                <li><span>Itsatsita:</span> <strong>${dataFormatua}</strong></li>
              </ul>
              <p class="kromo-atze-iruzkina">"${this.iruzkina || "Iruzkinik gabe"}"</p>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  // Jokalariaren informazio xehea
  toXehetasunHTML(gordetaDago) {
    const partidak = this.estatistikak.reduce((acc, x) => acc + (x.games?.appearences || 0), 0);
    const hamaikakoa = this.estatistikak.reduce((acc, x) => acc + (x.games?.lineups || 0), 0);
    const minutuak = this.estatistikak.reduce((acc, x) => acc + (x.games?.minutes || 0), 0);
    const golak = this.estatistikak.reduce((acc, x) => acc + (x.goals?.total || 0), 0);
    const tiroak = this.estatistikak.reduce((acc, x) => acc + (x.shots?.total || 0), 0);
    const asistentziak = this.estatistikak.reduce((acc, x) => acc + (x.goals?.assists || 0), 0);
    const horiak = this.estatistikak.reduce((acc, x) => acc + (x.cards?.yellow || 0), 0);
    const gorriak = this.estatistikak.reduce((acc, x) => acc + (x.cards?.red || 0), 0);
    const paseak = this.estatistikak.reduce((acc, x) => acc + (x.passes?.total || 0), 0);
    const paseGiltzarriak = this.estatistikak.reduce((acc, x) => acc + (x.passes?.key || 0), 0);
    const faltak = this.estatistikak.reduce((acc, x) => acc + (x.fouls?.committed || 0), 0);
    const posizioa = this.estatistikak?.[0]?.games?.position || "Ez dago eskuragarri";

    return `
      <div class="xehetasunak">
        <div class="xehetasun-goiburua">
          <img class="xehetasun-foto" src="${this.irudia || ""}" alt="${this.izena}">
          <div>
            <h2>${this.izena} ${this.abizena || ""}</h2>
            <p class="xehetasun-azpititulua">
              ${this.taldeLogo ? `<img src="${this.taldeLogo}" alt="${this.taldea || ""}" width="24">` : ""}
              <span>${this.taldea || "Ez dago eskuragarri"} · ${this.denb || ""}</span>
            </p>
            <span class="txapa">${posizioa}</span>
            <span class="txapa ${this.lesionatuta ? "txapa-gorria" : "txapa-berdea"}">
              ${this.lesionatuta ? "Lesionatuta" : "Jokatzeko prest"}
            </span>
          </div>
        </div>

        <div class="xehetasun-sareta">
          <div><strong>Adina:</strong> ${this.adina ?? "-"}</div>
          <div><strong>Nazionalitatea:</strong> ${this.nazionalitatea || "-"}</div>
          <div><strong>Jaiotze data:</strong> ${this.jaiotzeData || "-"}</div>
          <div><strong>Jaiotze lekua:</strong> ${this.jaiotzeLekua || "-"}</div>
          <div><strong>Altuera:</strong> ${this.altuera || "-"}</div>
          <div><strong>Pisua:</strong> ${this.pisua || "-"}</div>
        </div>

        <h3>${this.denb || ""} Denboraldiko Estatistikak</h3>
        <div class="stats-koadroa">
          <div class="stat-kutxa"><strong>${partidak}</strong><span>Partidak</span></div>
          <div class="stat-kutxa"><strong>${hamaikakoa}</strong><span>Hamaikakoa</span></div>
          <div class="stat-kutxa"><strong>${minutuak}'</strong><span>Minutuak</span></div>
          <div class="stat-kutxa"><strong>${golak}</strong><span>Golak</span></div>
          <div class="stat-kutxa"><strong>${asistentziak}</strong><span>Asistentziak</span></div>
          <div class="stat-kutxa"><strong>${tiroak}</strong><span>Tiroak</span></div>
          <div class="stat-kutxa"><strong>${paseak}</strong><span>Paseak</span></div>
          <div class="stat-kutxa"><strong>${paseGiltzarriak}</strong><span>Giltzarriak</span></div>
          <div class="stat-kutxa"><strong>${horiak}</strong><span>Tx. Horiak</span></div>
          <div class="stat-kutxa"><strong>${gorriak}</strong><span>Tx. Gorriak</span></div>
          <div class="stat-kutxa"><strong>${faltak}</strong><span>Faltak</span></div>
        </div>

        <div class="balorazio-blokea">
          <label for="nota"><strong>Balorazioa (1-5):</strong></label>
          ${!gordetaDago
            ? `<input type="number" id="nota" name="nota" min="1" max="5" value="3" required>`
            : `<p class="balorazio-izarrak">${"★".repeat(Number(this.balorazioa))}${"☆".repeat(5 - Number(this.balorazioa))} (${this.balorazioa}/5)</p>`}

          <label for="iruzkina"><strong>Iruzkina:</strong></label>
          ${!gordetaDago
            ? `<textarea id="iruzkina" rows="4" placeholder="Idatzi jokalariari buruzko oharra..."></textarea>
               <button type="button" id="gordeBiltegian" class="botoi-nagusia">🃏 Gorde Bilduman</button>`
            : `<p class="iruzkin-kutxa">${this.iruzkina || "Iruzkinik gabe."}</p>`}
        </div>
      </div>
    `;
  }

  toBildumaKudeatu() {
    const unekoId = this.cardId;
    const kromoMota = this.lortuKromoMota(true);
    const notaNum = Number(this.balorazioa) || 3;
    const izarrak = "★".repeat(notaNum) + "☆".repeat(5 - notaNum);

    return `
      <div class="kudeatu ${kromoMota}-borde" data-id="${unekoId}">
        <div class="kudeatu-goiburua">
          <img src="${this.irudia}" alt="${this.izena}">
          <div class="kudeatu-tituluak">
            <span class="kudeatu-izarrak">${izarrak}</span>
            <h2>${this.izena} ${this.abizena || ""}</h2>
            <p>${this.taldea || "Talderik gabe"} · <strong>${this.denb || ""}</strong></p>
          </div>
        </div>

        <div class="kudeatu-eremuak">
          <label for="nota-${unekoId}"><strong>Balorazioa (1-5):</strong></label>
          <input type="number" id="nota-${unekoId}" min="1" max="5" value="${this.balorazioa}">

          <label for="iruzkina-${unekoId}"><strong>Iruzkina:</strong></label>
          <textarea id="iruzkina-${unekoId}" rows="2" placeholder="Idatzi jokalariari buruzko oharra...">${this.iruzkina}</textarea>
        </div>

        <div class="kudeatu-botoiak">
          <button type="button" id="gorde-${unekoId}" class="botoi-nagusia">💾 Gorde</button>
          <button type="button" id="ezabatu-${unekoId}" class="botoi-arriskua">🗑️ Ezabatu</button>
        </div>
        <p id="text-${unekoId}" class="egoera-mezua"></p>
      </div>
    `;
  }

  toStorageObject() {
    return {
      cardId: this.cardId,
      season: this.denb,
      id: this.id,
      name: this.izena,
      lastname: this.abizena,
      photo: this.irudia,
      age: this.adina,
      nationality: this.nazionalitatea,
      birth: {
        date: this.jaiotzeData,
        place: this.jaiotzeLekua,
        country: this.jaiotzeHerrialdea
      },
      height: this.altuera,
      weight: this.pisua,
      injured: this.lesionatuta,
      estadistikak: this.estatistikak,
      gordetakoData: this.gordetakoData.toISOString(),
      iruzkina: this.iruzkina,
      balorazioa: this.balorazioa
    };
  }

  static fromStorageObject(obj) {
    return new Item(obj);
  }
}