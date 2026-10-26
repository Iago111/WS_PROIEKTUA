const API_BASE_URL ='https://api.rawg.io/api/games';
const key="8a11170470fa4bbbbf26b9a561b1a3f9"
async function bilatuApi(terminoa, mota) {
  
  const formularioa = document.getElementById("form-bilatzaile")
  const jokoa = document.getElementById("input-bilaketa")
  const egoera = document.getElementById("egoera-bilatzen")
  formularioa.addEventListener("submit", async function(e){
    e.preventDefault();
    if(jokoa.value===""){
      egoera.textContent="ipini jokoaren izena"
      return
    }
    console.log(jokoa.value)
    try{
      const url = `${API_BASE_URL}?key=${key}&search=${encodeURIComponent(jokoa.value)}`;
      const erantzuna = await fetch(url) 
      const data= await erantzuna.json();

      egoera.textContent="bilatzen..."
      
      data.results.map(jokoa=>jokoa.name).forEach(element => {console.log(element)});

      egoera.textContent="bilaketa eginda"
    }catch(error){
      console.log("error:", error )
    }
  })
  window.onload = bilatuApi
}
