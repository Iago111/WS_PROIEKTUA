const ATALAK = ['hasiera', 'bilatzaile', 'bilduma', 'kudeatuBilduma'];

const HASIERATZAILEAK = {
  bilatzaile: () => bilatuApi(),
  bilduma: () => {erakutsiBilduma()},
  kudeatuBilduma: () => {}
};
function erakutsiBilduma() {
  const itemak = document.getElementById("lista-bilduma");
  if (!itemak) return; 

  const nireBilduma = bildumaStorage.itemBezalaLortu();
  const itemXehetasunak = document.getElementById("xehetasun-bilduma");

  if (nireBilduma.length == 0) {
    itemak.innerHTML = "<p>Oraindik ez duzu item-ik gorde.</p>";
    return;
  }

  itemak.innerHTML = nireBilduma.map(item => item.toHTML()).join("");
  nireBilduma.forEach(item => {
    const datuak = itemak.querySelector(`[data-id="${item.cardId || item.id}"]`);
    if (datuak) {
      datuak.addEventListener("click", function() {
        itemXehetasunak.innerHTML = item.toXehetasunHTML();
      });
    }
  });

  const izenarekinBilatu = document.getElementById("jokalariaBilaketa")
  izenarekinBilatu.addEventListener("input", function(){
    const testua = izenarekinBilatu.value.toLowerCase();
    const filtratu = nireBilduma.filter(item=>((item.izena).toLowerCase()).startsWith(testua) || ((item.abizena || "").toLowerCase()).startsWith(testua))
    itemak.innerHTML = filtratu.map(item => item.toHTML()).join("");
    filtratu.forEach(item => {
    const datuak = itemak.querySelector(`[data-id="${item.cardId || item.id}"]`);
    if (datuak) {
      datuak.addEventListener("click", function() {
        itemXehetasunak.innerHTML = item.toXehetasunHTML();
      });
    }
  });
  })
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

async function jaurtiApp() {
  await Promise.all(ATALAK.map(atalaKargatu));
  erakutsiAtala('hasiera');
}

/*document.getElementById('menu-nagusia').addEventListener('click', (event) => {
  const boton = event.target.closest('button[data-seccion]');
  if (!boton) return;
  erakutsiAtala(boton.dataset.seccion);
});*/
document.getElementById('menu-nagusia').addEventListener('click', (event) => {
  console.log('Click detectado');
  const boton = event.target.closest('button[data-seccion]');
  if (!boton) return;

  console.log('Botón pulsado:', boton.dataset.seccion);
  erakutsiAtala(boton.dataset.seccion);
});

jaurtiApp();
