const BILDUMA_GAKOA = 'bilduma';

class bildumaStorage {
  static denakLortu() {
    const bilduma = localStorage.getItem(BILDUMA_GAKOA)
    if(bilduma){
      return JSON.parse(bilduma)
    }else{
      return []
    }
  }

  static gorde(item) {
    const bilduma=bildumaStorage.denakLortu()
    const aurkitua = bilduma.find(x=>x.cardId===item.cardId) 
    if(!aurkitua){
      bilduma.push(item.toStorageObject())
      localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(bilduma))
      return true
    }else{
      return false
    }
  }

  static itemBezalaLortu() {
    const bilduma = bildumaStorage.denakLortu()
    return bilduma.map(item=>Item.fromStorageObject(item))
  }

  static ezabatu(id) {
    const bilduma = bildumaStorage.denakLortu()
    const bildumaBerria=bilduma.filter(item=>item.cardId!=id)
    localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(bildumaBerria))
  }

  static eguneratu(id, balorazioa, iruzkina){
    const bilduma = bildumaStorage.denakLortu()
    const aurkitua = bilduma.find(x=>x.cardId===id) 
    if (aurkitua){  
      aurkitua.balorazioa=balorazioa
      aurkitua.iruzkina=iruzkina
      localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(bilduma))
    }
  }

  static hustu() {
    localStorage.removeItem(BILDUMA_GAKOA);
  }

  static lortuHistoriala(gakoa) {
    const historiala = localStorage.getItem(gakoa);
    if(historiala) {
      return JSON.parse(historiala);
    } else{
      return [];
    }
  }

  static gordetakoHistoriala(gakoa, balioa) {
    if (!balioa || balioa.trim() === "") return;
    let historiala = bildumaStorage.lortuHistoriala(gakoa);

    //ez errepikatzeko
    historiala = historiala.filter(item => item.balioa != balioa);
    historiala.unshift({ balioa: balioa, data: new Date().toISOString() });

    if(historiala.length > 10) {
      historiala.pop();
    }

    localStorage.setItem(gakoa, JSON.stringify(historiala));
  }

  static eguneratuDatalista(gakoa, datalistID) {
    const datalist = document.getElementById(datalistID);
    if(!datalist) return;
    const historiala = bildumaStorage.lortuHistoriala(gakoa);
    datalist.innerHTML = historiala.map(item => `<option value="${item.balioa}">${new Date(item.data).toLocaleDateString()}</option>`).join("");
  }
}
