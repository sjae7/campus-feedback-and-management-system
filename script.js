const notes = {};

function selectRole(btn){
  document.querySelectorAll('.role-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedRole = btn.dataset.role;
}
function selectCat(btn){
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
  selectedCat = btn.dataset.cat;
}
function toggleAnon(){
  anonMode = !anonMode;
  const t = document.getElementById('anon-toggle');
  const lbl = document.getElementById('anon-label');
  const sub = document.getElementById('anon-sub');
  if(anonMode){t.classList.add('on');lbl.textContent='Posting Anonymously';sub.textContent='Your identity is hidden from administrators';}
  else{t.classList.remove('on');lbl.textContent='Post Anonymously';sub.textContent='Your name will not be shown to administrators';}
}
function updateChar(){
  const t = document.getElementById('fb-text');
  document.getElementById('char-num').textContent = t.value.length;
  if(t.value.length>500)t.value=t.value.slice(0,500);
}
function doLogin(){
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-password').value;
  if(!email || !pass){showToast('Please fill in all fields','#F87171');return;}
  if(!email.includes('@')){showToast('Use your school email','#F87171');return;}
  currentUser={email,role:selectedRole};
  if(selectedRole==='administrator'){showAdminPage();}
  else{showStudentPage();}
}
function demoLogin(type){
  if(type==='student'){currentUser={email:'demo.student@school.edu.ph',role:'student'};showStudentPage();}
  else{currentUser={email:'admin@school.edu.ph',role:'administrator'};showAdminPage();}
}
function logout(){
  currentUser=null;
  switchPage('page-auth');
}
function showStudentPage(){
  document.getElementById('s-email-nav').textContent=currentUser.email;
  document.getElementById('s-avatar').textContent=currentUser.email[0].toUpperCase();
  document.getElementById('s-role-badge').textContent=currentUser.role.charAt(0).toUpperCase()+currentUser.role.slice(1);
  switchPage('page-student');
  renderMyFeedbacks();
}
function showAdminPage(){
  document.getElementById('a-email-nav').textContent=currentUser.email;
  switchPage('page-admin');
  renderAdmin();
  updateAdminStats();
}
function switchPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function submitFeedback(){
  const text = document.getElementById('fb-text').value.trim();
  if(!text){showToast('Please write your feedback first','#F87171');return;}
  const newFb = {
    id: feedbacks.length+1,
    email: currentUser.email,
    role: currentUser.role,
    category: selectedCat,
    text,
    anonymous: anonMode,
    status: 'new',
    timestamp: new Date().toLocaleString('en-PH',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}),
    note:''
  };
  feedbacks.unshift(newFb);
  document.getElementById('fb-text').value='';
  document.getElementById('char-num').textContent='0';
  showToast('Feedback submitted! Thank you.','var(--green)');
  renderMyFeedbacks();
}
function renderMyFeedbacks(){
  const mine = feedbacks.filter(f=>f.email===currentUser.email);
  document.getElementById('my-count').textContent=mine.length;
  const list = document.getElementById('my-feedbacks-list');
  if(!mine.length){list.innerHTML='<div class="empty-state">📭<p>No submissions yet. Be the first to speak up!</p></div>';return;}
  list.innerHTML = mine.map(f=>`
    <div class="feedback-item">
      <div class="fi-header">
        <span class="fi-cat">${f.category}</span>
        ${f.anonymous?'<span class="fi-anon">Anonymous</span>':''}
        <span class="fi-time">${f.timestamp}</span>
        <span style="margin-left:auto"><span class="status-dot ${f.status==='reviewed'?'s-reviewed':f.status==='pending'?'s-pending':'s-new'}"></span><span style="font-size:.72rem;color:var(--text3)">${f.status}</span></span>
      </div>
      <div class="fi-text">${f.text}</div>
      ${f.note?`<div class="admin-note">Admin note: ${f.note}</div>`:''}
    </div>
  `).join('');
}
function setAdminFilter(filter, el){
  adminFilter = filter;
  document.querySelectorAll('.sidebar-item').forEach(s=>s.classList.remove('active'));
  if(el)el.classList.add('active');
  renderAdmin();
}
function getFiltered(){
  if(adminFilter==='all') return feedbacks;
  if(adminFilter==='new'||adminFilter==='pending'||adminFilter==='reviewed') return feedbacks.filter(f=>f.status===adminFilter);
  if(adminFilter.startsWith('cat:')) return feedbacks.filter(f=>f.category===adminFilter.slice(4));
  if(adminFilter.startsWith('role:')) return feedbacks.filter(f=>f.role===adminFilter.slice(5));
  return feedbacks;
}
function updateAdminStats(){
  const total=feedbacks.length;
  const newF=feedbacks.filter(f=>f.status==='new').length;
  const pend=feedbacks.filter(f=>f.status==='pending').length;
  const rev=feedbacks.filter(f=>f.status==='reviewed').length;
  document.getElementById('stat-total').textContent=total;
  document.getElementById('stat-new').textContent=newF;
  document.getElementById('stat-pending').textContent=pend;
  document.getElementById('stat-reviewed').textContent=rev;
  document.getElementById('badge-all').textContent=total;
  document.getElementById('badge-new').textContent=newF;
  document.getElementById('badge-pending').textContent=pend;
  document.getElementById('badge-reviewed').textContent=rev;
  renderBarChart();
}
function renderBarChart(){
  const cats=['Facilities','Academic','Safety','Services','Events','Other'];
  const counts=cats.map(c=>feedbacks.filter(f=>f.category===c).length);
  const max=Math.max(...counts,1);
  const chart=document.getElementById('admin-bar-chart');
  chart.innerHTML=cats.map((c,i)=>`
    <div class="bar-col">
      <span class="bar-val">${counts[i]}</span>
      <div class="bar" style="height:${Math.max(counts[i]/max*90,4)}px"></div>
      <span class="bar-label">${c.slice(0,5)}</span>
    </div>
  `).join('');
}
function renderAdmin(){
  const list=getFiltered();
  updateAdminStats();
  const container=document.getElementById('admin-feedback-list');
  if(!list.length){container.innerHTML='<div class="no-feedbacks">📭 No feedbacks match this filter</div>';return;}
  container.innerHTML=list.map(f=>{
    const rolePill=`<span class="pill pill-role">${f.role}</span>`;
    const catPill=`<span class="pill pill-cat">${f.category}</span>`;
    const anonPill=f.anonymous?`<span class="pill pill-anon">Anonymous</span>`:'';
    const statusClass=f.status==='new'?'pill-status-new':f.status==='pending'?'pill-status-pending':'pill-status-reviewed';
    const statusPill=`<span class="pill ${statusClass}">${f.status}</span>`;
    const initials=f.anonymous?'?':f.email[0].toUpperCase();
    const displayName=f.anonymous?'Anonymous User':f.email;
    const isExp=expandedId===f.id;
    return `<div class="afb-item${isExp?' expanded':''}" onclick="toggleExpand(${f.id})">
      <div class="afb-top">
        <div class="afb-avatar">${initials}</div>
        <div class="afb-info">
          <div class="afb-meta">
            <span class="afb-name">${displayName}</span>
            ${rolePill}${catPill}${anonPill}${statusPill}
          </div>
          <div class="afb-text">${f.text}</div>
          <div class="afb-time">${f.timestamp}</div>
        </div>
      </div>
      ${isExp?`<div class="afb-expanded" onclick="event.stopPropagation()">
        ${f.note?`<div class="admin-note" style="margin-bottom:.8rem">Note: ${f.note}</div>`:''}
        <textarea class="note-area" id="note-${f.id}" rows="2" placeholder="Add admin note...">${notes[f.id]||f.note||''}</textarea>
        <div class="action-row" style="margin-top:.6rem">
          <button class="action-btn btn-mark-reviewed" onclick="changeStatus(${f.id},'reviewed')">✓ Mark Reviewed</button>
          <button class="action-btn btn-mark-pending" onclick="changeStatus(${f.id},'pending')">⏳ Mark Pending</button>
          <button class="action-btn btn-email" onclick="saveNote(${f.id})">💾 Save Note</button>
        </div>
      </div>`:''}
    </div>`;
  }).join('');
}
function toggleExpand(id){
  expandedId=expandedId===id?null:id;
  renderAdmin();
}
function changeStatus(id,status){
  const fb=feedbacks.find(f=>f.id===id);
  if(fb){fb.status=status;showToast(`Marked as ${status}`,'var(--green)');}
  renderAdmin();
  updateAdminStats();
}
function saveNote(id){
  const ta=document.getElementById('note-'+id);
  if(!ta)return;
  const fb=feedbacks.find(f=>f.id===id);
  if(fb){fb.note=ta.value;notes[id]=ta.value;}
  showToast('Note saved','var(--green)');
  renderAdmin();
}
function exportCSV(){
  const headers=['ID','Email','Role','Category','Anonymous','Status','Timestamp','Feedback'];
  const rows=feedbacks.map(f=>[f.id,f.anonymous?'[Hidden]':f.email,f.role,f.category,f.anonymous,f.status,f.timestamp,`"${f.text.replace(/"/g,"'")}"`]);
  const csv=[headers,...rows].map(r=>r.join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='campus_feedbacks.csv';
  a.click();
  showToast('CSV exported!','var(--green)');
}
function showToast(msg,color='var(--green)'){
  const t=document.createElement('div');
  t.className='toast';
  t.style.background=color;
  if(color==='var(--green)')t.style.color='#0a1a0f';
  else t.style.color='white';
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2500);
}
