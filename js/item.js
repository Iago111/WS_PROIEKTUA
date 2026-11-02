class Item {
  constructor(ApiDatuak) {
    this.id = ApiDatuak.id;
    this.izena = ApiDatuak.name;
    this.irudia = ApiDatuak.background_image;
    this.data=ApiDatuak.released;
    this.balorazioa=ApiDatuak.rating,
    this.balorazioKop=ApiDatuak.ratingCount,
    this.deskargatuak=ApiDatuak.added,
    this.metacritic=ApiDatuak.metacritic,
    this.plataformak=ApiDatuak.platforms.map(p=>p.platform.name)
    this.eskakizunak= ApiDatuak.platforms.map(p=>{
      plataforma: p.platform.name
      minimun:p.requirements?.minimun || "ez dago ezkuragarri"
      reccomended:p.requirements?.reccomended || "ez dago ezkuragarri"
    }
    );
    this.genres=ApiDatuak.genres.map(g=>g.name)
    this.gordetakoData= new Date();
  }; //

  toHTML() {
    return `
      <div class="item-card" data-id="${this.id}">
        <img src="${this.irudia}" alt="${this.izena}">
        <h3>${this.izena}</h3>
      </div>
    `;
  }
  
toXehetasunHTML() {
  return `
    <div class="xehetasunak">
      <h2>${this.izena}</h2>

      <img src="${this.irudia}" alt="${this.izena}">

      <p><strong>ID:</strong> ${this.id}</p>
      <p><strong>Data:</strong> ${this.data || "Ez dago eskuragarri"}</p>
      <p><strong>Balorazioa:</strong> ${this.rating ?? "Ez dago eskuragarri"}</p>
      <p><strong>Balorazio Kopurua:</strong> ${this.ratingCount}</p>
      <p><strong>Erositako Kopurua:</strong> ${this.added}</p>
      <p><strong>Metacritic:</strong> ${this.metacritic ?? "Ez dago eskuragarri"}</p>

      <h3>Genres</h3>
      <p>${this.genres.join(", ") || "Ez dago eskuragarri"}</p>

      <h3>Platforms</h3>
      <ul>
        ${this.platforms.map(plataforma => `
          <li>${plataforma}</li>
        `).join("")}
      </ul>

      <h3>Requirements</h3>
      ${this.requirements.map(req => `
        <div>
          <h4>${req.plataforma}</h4>
          <p><strong>Minimum:</strong> ${req.minimum}</p>
          <p><strong>Recommended:</strong> ${req.recommended}</p>
        </div>
      `).join("")}

      <p><strong>Gordetako data:</strong> ${new Date(this.gordetakoData).toLocaleDateString()}</p>
    </div>
  `;
}

  toStorageObject() {
    // TODO
    const json={"id":this.id,
                "izena":this.izena,
                "irudia":this.irudia, 
                "datuak":this.datuak, 
                "balorazioa":this.balorazioa, 
                "iruzkina":this.iruzkina, 
                "gordetakoData":this.gordetakoData
              }
    return json
  }

  static fromStorageObject(obj) {
    // TODO
    return new Item(obj)
  }
}
