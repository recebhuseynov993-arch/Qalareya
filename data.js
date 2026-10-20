// Demo məlumat bazası — real layihədə backend API ilə əvəz olunur
const CATEGORIES = [
  {ico:'\uD83C\uDFA8', name:'Rəsm əsərləri'},
  {ico:'\uD83D\uDDFF', name:'Heykəllər'},
  {ico:'\uD83D\uDCF7', name:'Fotoqrafiya'},
  {ico:'\uD83D\uDCBB', name:'Rəqəmsal incəsənət'},
  {ico:'\u2702\uFE0F', name:'Sənətkarlıq'},
  {ico:'\u25A6', name:'Bütün kateqoriyalar'}
];

const GRADS = [
  'linear-gradient(135deg,#2c3e50,#4ca1af)',
  'linear-gradient(135deg,#654ea3,#eaafc8)',
  'linear-gradient(135deg,#232526,#414345)',
  'linear-gradient(135deg,#3a1c71,#d76d77,#ffaf7b)',
  'linear-gradient(135deg,#0f2027,#2c5364)',
  'linear-gradient(135deg,#42275a,#734b6d)',
  'linear-gradient(135deg,#1e3c72,#2a5298)',
  'linear-gradient(135deg,#603813,#b29f94)'
];

const WORKS = [
  {t:'Bakı mənzərəsi', a:'Rauf Əliyev',      p:1200, g:GRADS[0]},
  {t:'Düşüncələr',    a:'Leyla Məmmədova',   p:950,  g:GRADS[1]},
  {t:'Sükut',        a:'Tural Quliyev',     p:1800, g:GRADS[2]},
  {t:'Dağ kəndi',    a:'Nəsib İsmayılov',   p:1100, g:GRADS[3]},
  {t:'Harmoniya',    a:'Aysel Rzayeva',     p:1450, g:GRADS[4]},
  {t:'Qarışıq hisslər', a:'Rauf Əliyev',   p:1350, g:GRADS[5]},
  {t:'Xatirələr',    a:'Leyla Məmmədova',   p:1050, g:GRADS[6]},
  {t:'Şəhər işıqları', a:'Tural Quliyev',    p:1600, g:GRADS[7]},
  {t:'Tabla', a:'Aysel Rzayeva',            p:890,  g:GRADS[2]},
  {t:'Kölgə və işıq', a:'Nəsib İsmayılov', p:1750, g:GRADS[0]}
];

const ARTISTS = [
  {n:'Rauf Əliyev',     s:'Rəssam • 24 əsər', c:'#ffd60a'},
  {n:'Leyla Məmmədova', s:'Rəssam • 18 əsər', c:'#eaafc8'},
  {n:'Tural Quliyev',   s:'Heykəltəraş • 12 əsər', c:'#4ca1af'},
  {n:'Aysel Rzayeva',   s:'Rəqəmsal rəssam • 31 əsər', c:'#d76d77'}
];

const COLLECTIONS = [
  {t:'Müasir incəsənət', n:'42 əsər', g:GRADS[3]},
  {t:'Klassik rəsmlər', n:'28 əsər', g:GRADS[0]},
  {t:'Fotoqrafiya toplusu', n:'65 əsər', g:GRADS[4]}
];
