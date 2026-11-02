const API_BASE_URL ='https://api.rawg.io/api/games';
const key="8a11170470fa4bbbbf26b9a561b1a3f9"
async function bilatuApi(terminoa, mota) {
  
  const formularioa = document.getElementById("form-bilatzaile")
  const jokoa = document.getElementById("input-bilaketa")
  const egoera = document.getElementById("egoera-bilatzen")
  const emaitzak = document.getElementById("emaitzak-bilaketa");
  const jokoenDatuak = document.getElementById("xehetasunak-item")
  formularioa.addEventListener("submit", async function(e){
    e.preventDefault();
    emaitzak.innerHTML='<p>Bilaketa bat gauzatu emaitzak lortzeko</p>'
    egoera.textContent="bilatzen..."
    if(jokoa.value===""){
      egoera.textContent="ipini jokoaren izena"
      return
    }
    console.log(jokoa.value)
    try{
      const url = `${API_BASE_URL}?key=${key}&search=${encodeURIComponent(jokoa.value)}&ordering=-added&search_exact=true`;
      const erantzuna = await fetch(url) 
      const data= await erantzuna.json();

      if(data.results.length===0){
        egoera.textContent="ez dira aurkitu jokoak"
      }else{
          data.results.map(jokoa=>{
          return new Item(jokoa);
        }).forEach(jokoa => {
          emaitzak.insertAdjacentHTML('beforeend',jokoa.toHTML());
          const datuak = document.querySelector(`[data-id="${jokoa.id}"]`)
          datuak.addEventListener("click",function(){
            jokoenDatuak.innerHTML=jokoa.toXehetasunHTML();
          })
        });
        egoera.textContent="bilaketa eginda"
      }
    }catch(error){
      console.log("error:", error )
    }
  })
  window.onload = bilatuApi
}
