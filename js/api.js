
const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = "d15b472138b0586ea6366674402e1aaf";

async function bilatuApi() {
  const jokalariFormularioa = document.getElementById("form-bilatzaile");
  const jokalariInput = document.getElementById("jokalari-bilaketa"); 
  const denboraldiBilaketa = document.getElementById("denboraldi-bilaketa");
  const taldeBilaketa = document.getElementById("talde-bilaketa-jokalaria")
  
  const taldeFormularioa = document.getElementById("form-bilatzaile-taldea");
  const taldeEgoera = document.getElementById("talde-egoera");
  const taldeEmaitzak = document.getElementById("talde-emaitzak-bilaketa");
  const taldeInput = document.getElementById("talde-bilaketa");

  const egoera = document.getElementById("egoera-bilatzen");
  const emaitzak = document.getElementById("emaitzak-bilaketa");
  const jokalariDatuak = document.getElementById("xehetasunak-item"); 
  const ezabatzekoBotoia = document.getElementById("emaitzak_ezabatu");

  // JOKALARIAK BILATU
  jokalariFormularioa.addEventListener("submit", async function(e) {
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

    egoera.textContent = "Bilatzen...";
    
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

      const denboraldiaUrtea = data.parameters
      console.log(data);
      
      data.response.map(player => {
        return new Item({...denboraldiaUrtea,...player.player,estadistikak: player.statistics});
      }).forEach(player => {
        emaitzak.insertAdjacentHTML("beforeend", player.toHTML());
        const datuak=document.querySelector(`[data-id="${player.id}"]`);
        datuak.addEventListener("click", function(){
          jokalariDatuak.innerHTML=player.toXehetasunHTML()
        })
      });

      egoera.textContent = "";

    } catch (error) {
      console.log("error:", error);
      egoera.textContent = "Errore bat gertatu da.";
    }
  });

  // EMAITZAK EZABATU
  ezabatzekoBotoia.addEventListener("click", function() {
    emaitzak.innerHTML = "<p>Bilaketa bat gauzatu emaitzak lortzeko</p>";
  });

  // TALDEAK BILATU
  taldeFormularioa.addEventListener("submit", async function(e) {
    e.preventDefault();

    const taldea = taldeInput.value.trim();

    if (taldea === "") {
      taldeEgoera.textContent = "Sartu talde baten izena";
      return;
    }

    taldeEgoera.textContent = "Taldea bilatzen...";
    taldeEmaitzak.innerHTML = "";
    console.log(taldea)
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

      taldeData.response.sort((a,b)=>b.venue.capacity-a.venue.capacity).slice(0,10).map(talde => {
        return new Item(talde.team);
      }).forEach(talde => {
        taldeEmaitzak.insertAdjacentHTML("beforeend", talde.toHTML());
      });

      taldeEmaitzak.querySelectorAll(".item-card").forEach(talde=>{
        talde.addEventListener("click",function(){
          taldeBilaketa.value=talde.getAttribute("data-id");
          taldeEmaitzak.innerHTML=""
          taldeEgoera.textContent = "Taldea aukeratuta";
        })
      })
    } catch (error) {
      console.log("error:", error);
      taldeEgoera.textContent = "Errore bat gertatu da.";
    }
  });
}

window.onload = bilatuApi;
