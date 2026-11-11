
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
    this.taldeLogo = ApiDatuak.estadistikak?.[0].team.logo;
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
          
          <p><strong>Partidak:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.games.appearences},0) ?? 0}</p>
          <p><strong>Hasierako hamaikakoa:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.games.lineups},0) ?? 0}</p>
          <p><strong>Minutuak:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.games.minutes},0) ?? 0}</p>
          <p><strong>Posizioa:</strong> ${this.estatistikak[0].games.position || "Ez dago eskuragarri"}</p>

          <p><strong>Golak:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.goals.total},0) ?? 0}</p>
          <p><strong>Tiroak:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.shots.total},0) ?? 0}</p>
          <p><strong>Asistentziak:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.goals.assists},0) ?? 0}</p>

          <p><strong>Txartel horiak:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.cards.yellow},0) ?? 0}</p>
          <p><strong>Txartel gorriak:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.cards.red},0) ?? 0}</p>

          <p><strong>Paseak:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.passes.total},0) ?? 0}</p>
          <p><strong>Pase giltzarriak:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.passes.key},0) ?? 0}</p>
          <p><strong>Partidako faltak:</strong> ${this.estatistikak.reduce((acc,x)=>{return acc+x.fouls.committed},0) ?? 0}</p>
       
          <p><small><strong>Gordetako data:</strong> ${this.gordetakoData.toLocaleDateString("eu-ES")}</small></p>
          <label for="nota">Puntuación (1-5):</label>
          <input type="balorazioa" id="nota" name="nota" min="1" max="5" required>
          <p></p>
          <label for="editor">DESCRIBAPENA</label><br>
          <textarea id="describapena" rows="6" cols="50" placeholder="Describapena"></textarea>
          <p></p>
          <button type="button" id="gordeBiltegian"> Gorde biltegian</button>

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
