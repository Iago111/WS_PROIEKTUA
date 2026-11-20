const ATALAK = ['hasiera', 'bilatzaile', 'bilduma', 'kudeatuBilduma', 'estatistikak', 'ezarpenak'];

const HASIERATZAILEAK = {
  bilatzaile: () => bilatuApi(),
  bilduma: () => {erakutsiBilduma()},
  kudeatuBilduma: () => {erakutsiBildumaKudeatzailea()},
  estatistikak: () => {kalkulatuEstatistikak()},
  ezarpenak: () => ezarpenakHasieratu()
};
function erakutsiBilduma() {
  const izenarekinBilatu = document.getElementById("jokalariaBilaketa");
  const ordenatuSelect = document.getElementById("Ordenatu"); 
  const ordenaSelect = document.getElementById("Ordena");     

  izenarekinBilatu.addEventListener("input", aplikatuIragazkiak);
  ordenatuSelect.addEventListener("change", aplikatuIragazkiak);
  ordenaSelect.addEventListener("change", aplikatuIragazkiak);

  aplikatuIragazkiak();
}

function aplikatuIragazkiak() {
  const nireBilduma = bildumaStorage.itemBezalaLortu();

  const testua = (document.getElementById("jokalariaBilaketa").value || "").toLowerCase();
  const filtratu = nireBilduma.filter(item =>
    ((item.izena).toLowerCase()).startsWith(testua) ||
    (((item.abizena || "")).toLowerCase()).startsWith(testua)
  );

  const irizpidea = document.getElementById("Ordenatu").value; 
  const norabidea = document.getElementById("Ordena").value; 

  const ordenatuta =filtratu.sort((a, b) => {
    let emaitza = 0;

    if (irizpidea === "izena") {
      emaitza = a.izena.localeCompare(b.izena);
    } else if (irizpidea === "balorazioa") {
      emaitza = Number(a.balorazioa) - Number(b.balorazioa);
    } else if (irizpidea === "golak") {
      const golakA = a.estatistikak.reduce((acc, x) => acc + (x.goals.total || 0), 0);
      const golakB = b.estatistikak.reduce((acc, x) => acc + (x.goals.total || 0), 0);
      emaitza = golakA - golakB;
    }
    
    if(norabidea==="gorantz"){
      return emaitza;
    }else{
      return -emaitza;
    } 
  });

  eguneratuBilduma(ordenatuta);
}

function eguneratuBilduma(bilduma) {
  const itemak = document.getElementById("lista-bilduma");
  const itemXehetasunak = document.getElementById("xehetasun-bilduma");
  if (!itemak) return;

  if (bilduma.length === 0) {
    itemak.innerHTML = "<p>Ez da emaitzarik aurkitu.</p>";
    return;
  }

  itemak.innerHTML = bilduma.map(item => item.toHTML(true)).join("");

  bilduma.forEach(item => {
    const datuak = itemak.querySelector(`[data-id="${item.cardId || item.id}"]`);
    if (datuak) {
      datuak.addEventListener("click", function () {
        itemXehetasunak.innerHTML = item.toXehetasunHTML(true);
      });
    }
  });
}

function gaiaAplikatu(iluna) {
  document.body.classList.toggle('iluna', iluna);
}

function ezarpenakHasieratu() {
  const etengailua = document.getElementById('modu-iluna');
  etengailua.checked = localStorage.getItem('gaia') === 'iluna';

  etengailua.addEventListener('change', () => {
    gaiaAplikatu(etengailua.checked);
    localStorage.setItem('gaia', etengailua.checked ? 'iluna' : 'argia');
  });
}

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

function erakutsiBildumaKudeatzailea(){
  const hustuBotoia = document.getElementById("botoia-hustu")
  hustuBotoia.addEventListener("click",hustuBiltegia)

  const lista = document.getElementById("lista-kudeatu")
  lista.addEventListener("click",function(event){

    const kromoa = event.target.closest(".kudeatu")
    if(!kromoa) return
    const unekoId = kromoa.dataset.id
    if(event.target.id === `gorde-${unekoId}`){
      const nota = lista.querySelector(`#nota-${unekoId}`)
      if(nota.value.trim()==="" || Number(nota.value)>5 || Number(nota.value)<1){
        nota.value="3";
      }
      const iruzkina=lista.querySelector(`#iruzkina-${unekoId}`).value
      bildumaStorage.eguneratu(unekoId,nota.value,iruzkina)
      lista.querySelector(`#text-${unekoId}`).textContent=`${kromoa.querySelector('h2').textContent} eguneratu da`
    }
    if(event.target.id === `ezabatu-${unekoId}`){
      bildumaStorage.ezabatu(unekoId)
      eguneratuKudeatzailea()
    }
  })
  eguneratuKudeatzailea()
}
function eguneratuKudeatzailea(){
  const lista = document.getElementById("lista-kudeatu")
  const bilduma=bildumaStorage.itemBezalaLortu();
  if(bilduma.length===0){
    lista.innerHTML=`<p>Ez daude kartarik</p>`
    return
  }
  lista.innerHTML = bilduma.map(item=>item.toBildumaKudeatu()).join("")
}

function hustuBiltegia(){
  if (!confirm("Ziur zaude bilduma osoa ezabatu nahi duzula?")) return
  bildumaStorage.hustu()
  eguneratuKudeatzailea()
}

function erakutsiAtala(izena) {
  console.log('Erakutsi atala:', izena);
 document.querySelectorAll('.atala').forEach(sec => {
    sec.classList.remove('aktiboa');
  });

  const atala = document.getElementById(`atala-${izena}`);
  console.log('Contenedor encontrado:', atala);

  if (!atala) {
    console.error('No existe el contenedor de la sección:', izena);
    return;
  }

  atala.classList.add('aktiboa');

  if (izena === 'bilduma') {
    erakutsiBilduma();
  }else if (izena=='kudeatuBilduma'){
    eguneratuKudeatzailea();
  }else if (izena=='estatistikak'){
    kalkulatuEstatistikak();
  } 

  console.log('Clases del contenedor:', atala.className);
  console.log('Contenido:', atala.innerHTML);

  document.querySelectorAll('#menu-nagusia button')
    .forEach(btn => btn.classList.remove('active'));

  const boton = document.querySelector(
    `#menu-nagusia button[data-seccion="${izena}"]`
  );

  if (boton) boton.classList.add('active');
}


  /*document.querySelectorAll('.atala').forEach(sec => sec.classList.remove('aktiboa'));
  document.getElementById(`atala-${izena}`).classList.add('aktiboa');

  document.querySelectorAll('#menu-nagusia button').forEach(btn => btn.classList.remove('active'));
  const boton = document.querySelector(`#menu-nagusia button[data-seccion="${izena}"]`);
  if (boton) boton.classList.add('active');
}*/

function kalkulatuEstatistikak(){
  const nireBilduma = bildumaStorage.itemBezalaLortu();

  const guztira = document.getElementById("guztira");
  const batezBestekoa = document.getElementById("batezBestekoa");
  const banaketa = document.getElementById("banaketa");
  const gehienBaloratutako = document.getElementById("gehienBaloratutako");
  const gutxienBaloratutako = document.getElementById("gutxienBaloratutako");
  const gehienGolak = document.getElementById("gehienGolak");

  if (!guztira) {
    return;
  }

  if (nireBilduma.length === 0) {
    guztira.textContent = "0";
    batezBestekoa.textContent = "0";
    gehienBaloratutako.textContent = "Ez dago jokalaririk";
    gutxienBaloratutako.textContent = "Ez dago jokalaririk";
    gehienGolak.textContent = "Ez dago jokalaririk";
    return;
  }
  //Elem kop
  guztira.textContent = nireBilduma.length.toString();
  //BB balorazioa
  const baturaTotala = nireBilduma.reduce((acc, jokalaria) => acc + Number(jokalaria.balorazioa), 0);
  const batezBestekoaBalioa = baturaTotala / nireBilduma.length;
  batezBestekoa.textContent = batezBestekoaBalioa.toFixed(2);
  // Balorazio onena eta txarrena
  const onena = nireBilduma.reduce((max, jokalaria) => Number(jokalaria.balorazioa) > Number(max.balorazioa) ? jokalaria : max, nireBilduma[0]);
  const txarrena = nireBilduma.reduce((min, jokalaria) => Number(jokalaria.balorazioa) < Number(min.balorazioa) ? jokalaria : min, nireBilduma[0]);

  gehienBaloratutako.textContent = `${onena.izena} ${onena.abizena} (${onena.balorazioa})`;
  gutxienBaloratutako.textContent = `${txarrena.izena} ${txarrena.abizena} (${txarrena.balorazioa})`;
  //Banaketa
  
  const baneketaEgin = nireBilduma.reduce((acc, jokalaria) => {
    const balorazioa = Number(jokalaria.balorazioa);
    if (balorazioa >= 1 && balorazioa <= 5) {
      acc[balorazioa] = (acc[balorazioa] || 0) + 1;
    }
    return acc;
  }, {1: 0, 2: 0, 3: 0, 4: 0, 5: 0});
  const guztiraKop = nireBilduma.length;
  banaketa.innerHTML = [5, 4, 3, 2, 1].map(nota => {
    const kopurua = baneketaEgin[nota];
    const ehunekoa = Math.round((kopurua / nireBilduma.length) * 100);

    return `
      <div class="banaketa-errenkada">
        <span class="banaketa-nota">${nota} </span>
        <div class="barra-atzekoa">
          <div class="barra-aurrekoa" style="width: ${ehunekoa}%;"></div>
        </div>
        <span class="banaketa-datua">  ${kopurua} (${ehunekoa}%)</span>
      </div>
    `;
  }).join("");
  //Gol gehien
  const jokalariGolak = nireBilduma.reduce((max, jokalaria) => {
    if (!max.estatistikak) return jokalaria;
    if (!jokalaria.estatistikak) return max;
    const maxGolak = max.estatistikak.reduce((acc, x) => acc + (x.goals.total || 0), 0);
    const jokalariGolak = jokalaria.estatistikak.reduce((acc, x) => acc + (x.goals.total || 0), 0);
    return jokalariGolak > maxGolak ? jokalaria : max;
  }, nireBilduma[0]);

  let golTotak = 0;
  if (jokalariGolak.estatistikak) {
    golTotak = jokalariGolak.estatistikak.reduce((acc, x) => acc + (x.goals.total || 0), 0);
  }
  gehienGolak.textContent = `${jokalariGolak.izena} ${jokalariGolak.abizena} (${golTotak})`;
}

async function jaurtiApp() {
  gaiaAplikatu(localStorage.getItem('gaia') === 'iluna');
  await Promise.all(ATALAK.map(atalaKargatu));
  erakutsiAtala('hasiera');
}

/*document.getElementById('menu-nagusia').addEventListener('click', (event) => {
  const boton = event.target.closest('button[data-seccion]');
  if (!boton) return;
  erakutsiAtala(boton.dataset.seccion);
});*/
document.getElementById('menu-nagusia').addEventListener('click', (event) => {
  const boton = event.target.closest('button[data-seccion]');
  if (!boton) return;

  console.log('Botón pulsado:', boton.dataset.seccion);
  erakutsiAtala(boton.dataset.seccion);
});

jaurtiApp();
