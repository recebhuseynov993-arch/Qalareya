// --- Vəziyyət ---
const state = { likes: new Set(), follows: new Set(), cart: 0 };

// --- Toast bildirişi ---
let toastTimer;
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('show'), 2000);
}

// --- Kateqoriyalar ---
function renderCats(){
  document.getElementById('catGrid').innerHTML = CATEGORIES.map(c=>
    `<div class="cat-item" data-cat="${c.name}"><span class="cat-ico">${c.ico}</span><span>${c.name}</span></div>`
  ).join('');
  document.querySelectorAll('.cat-item').forEach(el=>
    el.onclick = ()=>{ toast(el.dataset.cat + ' seçildi'); document.getElementById('works').scrollIntoView(); }
  );
}

// --- Əsərlər ---
function renderWorks(list){
  const grid = document.getElementById('worksGrid');
  grid.innerHTML = list.map((w,i)=>`
    <div class="work-card">
      <div class="work-thumb" style="background:${w.g}">
        <button class="work-like ${state.likes.has(w.t)?'liked':''}" data-like="${w.t}">${state.likes.has(w.t)?'\u2665':'\u2661'}</button>
      </div>
      <div class="work-info">
        <h3>${w.t}</h3>
        <p class="work-artist">${w.a}</p>
        <div class="work-foot">
          <span class="work-price">${w.p.toLocaleString('az')} AZN</span>
          <button class="add-cart" data-cart="${w.t}">Səbətə at</button>
        </div>
      </div>
    </div>`).join('');

  grid.querySelectorAll('[data-like]').forEach(b=>b.onclick=e=>{
    const t=b.dataset.like;
    if(state.likes.has(t)){state.likes.delete(t);} else {state.likes.add(t); toast('Bəyənildi: '+t);}
    document.getElementById('likeCount').textContent=state.likes.size;
    b.classList.toggle('liked'); b.textContent=state.likes.has(t)?'\u2665':'\u2661';
  });
  grid.querySelectorAll('[data-cart]').forEach(b=>b.onclick=()=>{
    state.cart++; document.getElementById('cartCount').textContent=state.cart;
    toast('Səbətə əlavə edildi: '+b.dataset.cart);
  });
}

// --- Rəssamlar ---
function renderArtists(){
  const grid=document.getElementById('artistsGrid');
  grid.innerHTML=ARTISTS.map(a=>`
    <div class="artist-card">
      <div class="artist-ava" style="background:${a.c}">${a.n[0]}</div>
      <h3>${a.n}</h3>
      <p>${a.s}</p>
      <button class="btn-follow ${state.follows.has(a.n)?'following':''}" data-follow="${a.n}">${state.follows.has(a.n)?'\u0130zlənilir':'\u0130zlə'}</button>
    </div>`).join('');
  grid.querySelectorAll('[data-follow]').forEach(b=>b.onclick=()=>{
    const n=b.dataset.follow;
    if(state.follows.has(n)){state.follows.delete(n);b.classList.remove('following');b.textContent='\u0130zlə';}
    else{state.follows.add(n);b.classList.add('following');b.textContent='\u0130zlənilir';toast(n+' izlənilir');}
  });
}

// --- Kolleksiyalar ---
function renderCollections(){
  document.getElementById('collectionsGrid').innerHTML=COLLECTIONS.map(c=>`
    <div class="coll-card" style="background:${c.g}"><h3>${c.t}</h3><span>${c.n}</span></div>`).join('');
}

// --- Axtarış ---
function setupSearch(){
  const inp=document.getElementById('searchInput');
  inp.oninput=()=>{
    const q=inp.value.trim().toLowerCase();
    const filtered=WORKS.filter(w=>w.t.toLowerCase().includes(q)||w.a.toLowerCase().includes(q));
    renderWorks(filtered.length?filtered:WORKS);
  };
}

// --- Mobil menyu ---
document.getElementById('burger').onclick=()=>document.getElementById('mainNav').classList.toggle('open');
document.querySelectorAll('.main-nav a').forEach(a=>a.onclick=()=>document.getElementById('mainNav').classList.remove('open'));

// --- Başlat ---
renderCats(); renderWorks(WORKS); renderArtists(); renderCollections(); setupSearch();

// ================== AUTH (qeydiyyat / giriş) ==================
// İKİ REžİM:
//  1) BACKEND režimi  — API_BASE doldurulanda real server (/api/auth/*) istifadə olunur.
//  2) DEMO režimi    — API_BASE boş olduqda istifadəçilər brauzerdə (localStorage) saxlanılır.
// Backend-i işlətmək üçün aşağını doldurun, məs: 'http://127.0.0.1:4000'
const API_BASE = '';
const TOKEN_KEY = 'qalareya_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = t => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

// Backend-ə sorğu göndərən köməkçi
async function api(path, { method='GET', body, auth=false } = {}){
  const headers = { 'Content-Type':'application/json' };
  if(auth && getToken()) headers.Authorization = 'Bearer ' + getToken();
  const res = await fetch(API_BASE + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error || 'Xəta baş verdi');
  return data;
}

// Demo məqsədilə istifadəçilər localStorage-də saxlanılır (API_BASE boş olduqda).
const USERS_KEY = 'qalareya_users';
const SESSION_KEY = 'qalareya_session';
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveUsers = u => localStorage.setItem(USERS_KEY, JSON.stringify(u));

const authModal = document.getElementById('authModal');
const authBtn = document.getElementById('authBtn');
const authMsg = document.getElementById('authMsg');

function openAuth(){ authModal.classList.add('open'); setMsg(''); }
function closeAuth(){ authModal.classList.remove('open'); }
function setMsg(t, type){ authMsg.textContent=t||''; authMsg.className='auth-note'+(type?(' '+type):''); }

function setSession(user){
  localStorage.setItem(SESSION_KEY, JSON.stringify({name:user.name, email:user.email, role:user.role}));
  refreshAuthUI();
  if(typeof renderMembers==='function') renderMembers(document.getElementById('memberSearch').value);
  if(typeof updateMsgBadge==='function') updateMsgBadge();
}
function refreshAuthUI(){
  const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  const upBtn = document.getElementById('uploadBtn');
  if(s){ authBtn.textContent = s.name.trim()[0].toUpperCase(); authBtn.title = s.name+' (çıxış üçün kliklə)'; }
  else { authBtn.textContent = '\u25cb'; authBtn.title = 'Daxil ol / Qeydiyyat'; }
  // Ükləmə düyməsi yalnız rəssamlara görünür
  upBtn.style.display = (s && s.role==='artist') ? 'inline-block' : 'none';
}

authBtn.onclick = () => {
  const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  if(s){ localStorage.removeItem(SESSION_KEY); setToken(null); refreshAuthUI(); toast('Çıxış edildi'); }
  else openAuth();
};
document.getElementById('modalClose').onclick = closeAuth;
authModal.onclick = e => { if(e.target===authModal) closeAuth(); };

// Tablar
document.querySelectorAll('.auth-tab').forEach(tab=>tab.onclick=()=>{
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
  tab.classList.add('active'); setMsg('');
  const isLogin = tab.dataset.tab==='login';
  document.getElementById('loginForm').style.display = isLogin?'block':'none';
  document.getElementById('registerForm').style.display = isLogin?'none':'block';
});

// Qeydiyyat
document.getElementById('registerForm').onsubmit = async e => {
  e.preventDefault();
  const f = e.target;
  const name = f.name.value.trim(), email = f.email.value.trim().toLowerCase(), pwd = f.password.value;
  const role = f.artist.checked ? 'artist' : 'user';
  if(pwd.length < 8){ return setMsg('Parol ən azı 8 simvol olmalıdır', 'err'); }

  if(API_BASE){ // --- BACKEND režimi ---
    try{
      const { token, user } = await api('/api/auth/register', { method:'POST', body:{ name, email, password:pwd, role } });
      setToken(token); setSession(user);
      setMsg('Uğurlu qeydiyyat! Xoş gəldiniz, '+user.name, 'ok');
      setTimeout(()=>{ closeAuth(); toast('Xoş gəldiniz, '+user.name+'!'); }, 900);
    }catch(err){ setMsg(err.message, 'err'); }
    return;
  }
  // --- DEMO režimi ---
  const users = getUsers();
  if(users.some(u=>u.email===email)){ return setMsg('Bu email ilə istifadəçi artIq mövcuddur', 'err'); }
  const user = { name, email, password: pwd, role };
  users.push(user); saveUsers(users); setSession(user);
  setMsg('Uğurlu qeydiyyat! Xoş gəldiniz, '+name, 'ok');
  setTimeout(()=>{ closeAuth(); toast('Xoş gəldiniz, '+name+'!'); }, 900);
};

// Giriş
document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const f = e.target;
  const email = f.email.value.trim().toLowerCase(), pwd = f.password.value;

  if(API_BASE){ // --- BACKEND režimi ---
    try{
      const { token, user } = await api('/api/auth/login', { method:'POST', body:{ email, password:pwd } });
      setToken(token); setSession(user);
      setMsg('Daxil olundu!', 'ok');
      setTimeout(()=>{ closeAuth(); toast('Yenidən xoş gəldiniz, '+user.name+'!'); }, 700);
    }catch(err){ setMsg(err.message, 'err'); }
    return;
  }
  // --- DEMO režimi ---
  const user = getUsers().find(u=>u.email===email && u.password===pwd);
  if(!user){ return setMsg('Email və ya parol yanlışdır', 'err'); }
  setSession(user);
  setMsg('Daxil olundu!', 'ok');
  setTimeout(()=>{ closeAuth(); toast('Yenidən xoş gəldiniz, '+user.name+'!'); }, 700);
};

// Google ilə davam et
// REAL inteqrasiya üçün: Google Identity Services (GIS) + öz Client ID-niz lazımdır.
// Bax: https://developers.google.com/identity/gsi/web  (GOOGLE_CLIENT_ID-ni təyin edin)
const GOOGLE_CLIENT_ID = ''; // <-- buraya öz Google OAuth Client ID-nizi yazın
document.getElementById('googleBtn').onclick = () => {
  if(GOOGLE_CLIENT_ID && window.google){
    // Real axIn: GIS pop-up / One Tap
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onGoogleCredential });
    google.accounts.id.prompt();
    return;
  }
  // Demo režimi — Client ID təyin edilməyib
  const demo = { name:'Google İstifadəçisi', email:'google.user@gmail.com', password:null, role:'user' };
  const users = getUsers();
  if(!users.some(u=>u.email===demo.email)){ users.push(demo); saveUsers(users); }
  setSession(demo);
  setMsg('Google ilə daxil olundu (demo)', 'ok');
  setTimeout(()=>{ closeAuth(); toast('Google ilə xoş gəldiniz!'); }, 800);
};
// Real GIS callback-i: ID token-i backend-ə göndərib yoxlayır
async function onGoogleCredential(resp){
  if(API_BASE){ // --- BACKEND režimi: token-i serverdə yoxla ---
    try{
      const { token, user } = await api('/api/auth/google', { method:'POST', body:{ credential: resp.credential } });
      setToken(token); setSession(user); closeAuth(); toast('Xoş gəldiniz, '+user.name+'!');
    }catch(err){ setMsg(err.message, 'err'); }
    return;
  }
  // --- DEMO režimi: token-i yalnız göstərmək üçün aç (serverdə yoxlanmalıdır!) ---
  const payload = JSON.parse(atob(resp.credential.split('.')[1]));
  const user = { name: payload.name, email: payload.email, password:null, role:'user' };
  const users = getUsers();
  if(!users.some(u=>u.email===user.email)){ users.push(user); saveUsers(users); }
  setSession(user); closeAuth(); toast('Xoş gəldiniz, '+user.name+'!');
}

refreshAuthUI();

// ================== ƏSƏR YÜKLƏMƏ ==================
// Demo: yüklənən əsərlər localStorage-də (data URL ilə) saxlanılır.
// Real layihədə: FormData -> POST /api/artworks (Bearer token ilə).
const UPLOADS_KEY = 'qalareya_uploads';
const getUploads = () => JSON.parse(localStorage.getItem(UPLOADS_KEY) || '[]');

const uploadModal = document.getElementById('uploadModal');
const uploadMsg = document.getElementById('uploadMsg');
document.getElementById('uploadBtn').onclick = () => { uploadModal.classList.add('open'); uploadMsg.textContent=''; };
document.getElementById('uploadClose').onclick = () => uploadModal.classList.remove('open');
uploadModal.onclick = e => { if(e.target===uploadModal) uploadModal.classList.remove('open'); };

document.getElementById('uploadForm').onsubmit = async e => {
  e.preventDefault();
  const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  if(!s){ uploadMsg.textContent='Əvvəlcə daxil olun'; uploadMsg.className='auth-note err'; return; }
  const f = e.target;
  const file = f.image.files[0];
  if(!file){ uploadMsg.textContent='Şəkil seçin'; uploadMsg.className='auth-note err'; return; }

  if(API_BASE){ // --- BACKEND režimi: FormData -> POST /api/artworks (Bearer) ---
    try{
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', f.title.value.trim());
      fd.append('price', f.price.value);
      fd.append('category', f.category.value);
      const res = await fetch(API_BASE + '/api/artworks', {
        method:'POST',
        headers: getToken() ? { Authorization: 'Bearer ' + getToken() } : {},
        body: fd
      });
      const data = await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(data.error || 'Yükləmə alınmadı');
      const a = data.artwork;
      WORKS.unshift({ t:a.title, a:a.artist, p:a.price, g:`center/cover no-repeat url(${API_BASE + a.imageUrl})` });
      renderWorks(WORKS);
      uploadMsg.textContent='Əsər uğurla yükləndi!'; uploadMsg.className='auth-note ok'; f.reset();
      setTimeout(()=>{ uploadModal.classList.remove('open'); toast('Əsər əlavə edildi: '+a.title);
        document.getElementById('works').scrollIntoView(); }, 900);
    }catch(err){ uploadMsg.textContent=err.message; uploadMsg.className='auth-note err'; }
    return;
  }

  // --- DEMO režimi: data URL ilə localStorage ---
  const reader = new FileReader();
  reader.onload = () => {
    const item = { t:f.title.value.trim(), a:s.name, p:Number(f.price.value)||0,
                   category:f.category.value, img:reader.result };
    const ups = getUploads(); ups.push(item); localStorage.setItem(UPLOADS_KEY, JSON.stringify(ups));
    WORKS.unshift({ t:item.t, a:item.a, p:item.p, g:`center/cover no-repeat url(${item.img})` });
    renderWorks(WORKS);
    uploadMsg.textContent='Əsər uğurla yükləndi!'; uploadMsg.className='auth-note ok';
    f.reset();
    setTimeout(()=>{ uploadModal.classList.remove('open'); toast('Əsər əlavə edildi: '+item.t);
      document.getElementById('works').scrollIntoView(); }, 900);
  };
  reader.readAsDataURL(file);
};

// Backend režimində: əsas səhifə açılanda əsərləri serverdən yüklə
async function loadArtworksFromBackend(){
  if(!API_BASE) return;
  try{
    const data = await api('/api/artworks?limit=24');
    if(data.items && data.items.length){
      data.items.forEach(a=>{
        if(!WORKS.some(w=>w.t===a.title && w.a===a.artist))
          WORKS.unshift({ t:a.title, a:a.artist, p:a.price, g:`center/cover no-repeat url(${API_BASE + a.imageUrl})` });
      });
      renderWorks(WORKS);
    }
  }catch(e){ /* server əlçatmazdırsa demo məzmun qalır */ }
}
loadArtworksFromBackend();

// Saxlanmış əsərləri qalereyaya əlavə et
getUploads().forEach(u => {
  if(!WORKS.some(w => w.t===u.t && w.a===u.a))
    WORKS.unshift({ t:u.t, a:u.a, p:u.p, g:`center/cover no-repeat url(${u.img})` });
});
renderWorks(WORKS);

// ================== DEMO İSTİFADƏÇİLƏR ==================
// Boş bir brauzerdə də axtarış/mesajlaşma görünsn deyə bir neçə nümunə istifadəçi
function ensureDemoUsers(){
  const users = getUsers();
  if(users.length) return;
  saveUsers([
    {name:'Rauf Əliyev',     email:'rauf@qalareya.az',  password:'parol1234', role:'artist'},
    {name:'Leyla Məmmədova', email:'leyla@qalareya.az', password:'parol1234', role:'artist'},
    {name:'Tural Quliyev',   email:'tural@qalareya.az', password:'parol1234', role:'artist'},
    {name:'Aysel Rzayeva',   email:'aysel@qalareya.az', password:'parol1234', role:'user'},
    {name:'Nəsib İsmayılov', email:'nesib@qalareya.az', password:'parol1234', role:'user'}
  ]);
}
ensureDemoUsers();

const AVA_COLORS = ['#ffd60a','#eaafc8','#4ca1af','#d76d77','#8e9eab','#f6d365','#a1c4fd','#84fab0'];
const avaColor = s => AVA_COLORS[[...s].reduce((a,c)=>a+c.charCodeAt(0),0) % AVA_COLORS.length];
const session = () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');

// ================== İSTİFADƏÇİ AXTARIŞI ==================
function renderMembers(filter){
  const me = session();
  const q = (filter||'').trim().toLowerCase();
  const list = getUsers().filter(u =>
    (!me || u.email !== me.email) &&
    (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  );
  const grid = document.getElementById('membersGrid');
  if(!list.length){ grid.innerHTML = '<p class="members-empty">İstifadəçi tapılmadı.</p>'; return; }
  grid.innerHTML = list.map(u=>`
    <div class="member-card">
      <div class="member-ava" style="background:${avaColor(u.name)}">${u.name.trim()[0].toUpperCase()}</div>
      <div class="member-info">
        <h4>${u.name}</h4>
        <span>${u.email}</span>
        <div><span class="member-role">${u.role==='artist'?'Rəssam':'İstifadəçi'}</span></div>
      </div>
      <button class="btn-msg" data-msg="${u.email}">✉ Mesaj</button>
    </div>`).join('');
  grid.querySelectorAll('[data-msg]').forEach(b=>b.onclick=()=>startChat(b.dataset.msg));
}
document.getElementById('memberSearch').oninput = e => renderMembers(e.target.value);
renderMembers('');

// ================== MESAJLAŞMA ==================
const MSG_KEY = 'qalareya_messages';
const getMsgs = () => JSON.parse(localStorage.getItem(MSG_KEY) || '[]');
const saveMsgs = m => localStorage.setItem(MSG_KEY, JSON.stringify(m));

const msgModal = document.getElementById('msgModal');
let activeChat = null;

const userByEmail = email => getUsers().find(u=>u.email===email);

function requireLogin(){
  if(!session()){ closeMsg(); openAuth(); setMsg('Əvvəlcə daxil olun və ya qeydiyyatdan keçin', 'err'); return false; }
  return true;
}
function openMsg(){ if(!requireLogin()) return; msgModal.classList.add('open'); renderChatList(); updateMsgBadge(); }
function closeMsg(){ msgModal.classList.remove('open'); }

document.getElementById('msgBtn').onclick = openMsg;
document.getElementById('msgClose').onclick = closeMsg;
msgModal.onclick = e => { if(e.target===msgModal) closeMsg(); };

function conversationPartners(){
  const s = session(); if(!s) return [];
  const me = s.email; const seen = new Set();
  getMsgs().forEach(m=>{ if(m.from===me) seen.add(m.to); else if(m.to===me) seen.add(m.from); });
  return [...seen];
}
function lastMsgWith(email){
  const me = session().email;
  const conv = getMsgs().filter(m=>(m.from===me&&m.to===email)||(m.from===email&&m.to===me));
  return conv[conv.length-1];
}
function renderChatList(){
  const me = session().email;
  const partners = new Set(conversationPartners());
  getUsers().forEach(u=>{ if(u.email!==me) partners.add(u.email); });
  const el = document.getElementById('chatList');
  el.innerHTML = [...partners].map(email=>{
    const u = userByEmail(email); if(!u) return '';
    const last = lastMsgWith(email);
    return `<div class="chat-item ${email===activeChat?'active':''}" data-chat="${email}">
      <div class="member-ava" style="background:${avaColor(u.name)}">${u.name.trim()[0].toUpperCase()}</div>
      <div style="min-width:0"><h4>${u.name}</h4><p>${last?escapeHtml((last.from===me?'Siz: ':'')+last.text):escapeHtml(u.email)}</p></div>
    </div>`;
  }).join('');
  el.querySelectorAll('[data-chat]').forEach(it=>it.onclick=()=>openThread(it.dataset.chat));
}
function startChat(email){ if(!requireLogin()) return; openMsg(); openThread(email); }
function openThread(email){
  activeChat = email;
  const u = userByEmail(email);
  document.getElementById('threadHead').textContent = u ? u.name : email;
  document.getElementById('msgInput').disabled = false;
  document.getElementById('msgSend').disabled = false;
  renderChatList(); renderThread();
  document.getElementById('msgInput').focus();
}
function renderThread(){
  const me = session().email;
  const conv = getMsgs().filter(m=>(m.from===me&&m.to===activeChat)||(m.from===activeChat&&m.to===me));
  const box = document.getElementById('threadMsgs');
  if(!conv.length){ box.innerHTML = '<p class="thread-empty">Hələ mesaj yoxdur — ilk mesajı yazın 👋</p>'; return; }
  box.innerHTML = conv.map(m=>`<div class="bubble ${m.from===me?'me':'them'}">${escapeHtml(m.text)}<time>${new Date(m.ts).toLocaleTimeString('az',{hour:'2-digit',minute:'2-digit'})}</time></div>`).join('');
  box.scrollTop = box.scrollHeight;
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

document.getElementById('threadForm').onsubmit = e => {
  e.preventDefault();
  const inp = document.getElementById('msgInput');
  const text = inp.value.trim();
  if(!text || !activeChat) return;
  const me = session().email;
  const msgs = getMsgs();
  msgs.push({ from: me, to: activeChat, text, ts: Date.now() });
  saveMsgs(msgs); inp.value=''; renderThread(); renderChatList(); updateMsgBadge();

  const partner = activeChat;
  setTimeout(()=>{
    const replies = ['Salam! Marağlıdır 🙌','Təşəkkür, tezliklə cavab yazaram.','Əla, əlaqə saxladığınız üçün sağ olun!','Maraqlanıram — detalları göndərin.'];
    const r = replies[Math.floor(Math.random()*replies.length)];
    const m2 = getMsgs();
    m2.push({ from: partner, to: me, text: r, ts: Date.now() });
    saveMsgs(m2);
    if(activeChat===partner) renderThread();
    renderChatList(); updateMsgBadge();
  }, 1200);
};

function updateMsgBadge(){
  const s = session();
  document.getElementById('msgCount').textContent = s ? conversationPartners().length : '0';
}
updateMsgBadge();
