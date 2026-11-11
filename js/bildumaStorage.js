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
    const aurkitua = bilduma.find(x=>x.id===item.id) 
    if(!aurkitua){
      bilduma.push(item)
      localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(bilduma))
    }
  }

  static itemBezalaLortu() {
    const bilduma = bildumaStorage.denakLortu()
    return bilduma.map(item=>Item.fromStorageObject(item))
  }

  static ezabatu(id) {
    const bilduma = bildumaStorage.denakLortu()
    const bildumaBerria=bilduma.filter(item=>item.id!=id)
    localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(bildumaBerria))
  }

  static hustu() {
    localStorage.clear();
  }
}
