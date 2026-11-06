
class Item {
  constructor(ApiDatuak) {
    //denbboraldia
    this.denb=ApiDatuak.season
    // Informazio orokorra
    this.id = ApiDatuak.id;
    this.izena = ApiDatuak.name;
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
    this.taldea = ApiDatuak.estadistikak?.[0].team.name;

    // Estatistikak
    this.estatistikak = ApiDatuak.estadistikak || [];

    // Gordetako data
    this.gordetakoData = ApiDatuak.gordetakoData
      ? new Date(ApiDatuak.gordetakoData)
      : new Date();
  }

  // Bilaketako txartela
  toHTML() {
    return `
      <div class="item-card" data-id="${this.id}">
        <img src="${this.irudia || ""}" alt="${this.izena}" width="80">
        <h3>${this.izena} ${this.abizena || ""}</h3>
        <p>${this.taldea || "Talde ezezaguna"}</p>
        <p>${this.adina || "?"} urte</p>
      </div>
    `;
  }

  // Jokalariaren informazio xehea
  toXehetasunHTML() {
    return `
      <div class="xehetasunak">
        <h2>${this.izena} ${this.abizena || ""}</h2>

        <img src="${this.irudia || ""}" alt="${this.izena}" width="150">

        <p><strong>ID:</strong> ${this.id}</p>
        <p><strong>Adina:</strong> ${this.adina ?? "Ez dago eskuragarri"}</p>
        <p><strong>Nazionalitatea:</strong> ${this.nazionalitatea || "Ez dago eskuragarri"}</p>
        <p><strong>Jaiotze data:</strong> ${this.jaiotzeData || "Ez dago eskuragarri"}</p>
        <p><strong>Jaiotze lekua:</strong> ${this.jaiotzeLekua || "Ez dago eskuragarri"}</p>
        <p><strong>Altuera:</strong> ${this.altuera || "Ez dago eskuragarri"}</p>
        <p><strong>Pisua:</strong> ${this.pisua || "Ez dago eskuragarri"}</p>
        <p><strong>Lesionatuta:</strong> ${this.lesionatuta ? "Bai" : "Ez"}</p>

        <h3>Taldea</h3>
        <img src="${this.taldeLogo || ""}" alt="${this.taldea || ""}" width="60">
        <p>${this.taldea || "Ez dago eskuragarri"}</p>

        <h3>${this.denb} Denboraldiko estatistikak</h3>

        ${this.estatistikak.map(est => `
          <div class="estatistikak">
            <h4>${est.league.name}</h4>

            <p><strong>Partidak:</strong> ${est.games.appearences ?? 0}</p>
            <p><strong>Hasierako hamaikakoa:</strong> ${est.games.lineups ?? 0}</p>
            <p><strong>Minutuak:</strong> ${est.games.minutes ?? 0}</p>
            <p><strong>Posizioa:</strong> ${est.games.position || "Ez dago eskuragarri"}</p>

            <p><strong>Golak:</strong> ${est.goals.total ?? 0}</p>
            <p><strong>Asistentziak:</strong> ${est.goals.assists ?? 0}</p>

            <p><strong>Txartel horiak:</strong> ${est.cards.yellow ?? 0}</p>
            <p><strong>Txartel gorriak:</strong> ${est.cards.red ?? 0}</p>

            <p><strong>Paseak:</strong> ${est.passes.total ?? 0}</p>
            <p><strong>Pase giltzarriak:</strong> ${est.passes.key ?? 0}</p>
            <p><strong>Partidako faltak:</strong> ${est.fouls.committed ?? 0}</p>
          </div>
        `).join("")}

        <p><small><strong>Gordetako data:</strong> ${this.gordetakoData.toLocaleDateString("eu-ES")}</small></p>
      </div>
    `;
  }

  // LocalStorage-rako objektua prestatu
  toStorageObject() {
    return {
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
      statistics: this.estatistikak,
      gordetakoData: this.gordetakoData.toISOString()
    };
  }

  // LocalStorage-tik objektua berreraiki
  static fromStorageObject(obj) {
    return new Item(obj);
  }
}
