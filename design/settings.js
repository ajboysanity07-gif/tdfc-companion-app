/* Settings mockup behaviours: theme, modals, password rules, avatar crop. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
// theme (light|dark|system), persisted
function applyTheme(m){localStorage.setItem('tdfc-theme',m);
 const dark=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
 document.documentElement.classList.toggle('dark',dark);
 $$('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m));}
applyTheme(localStorage.getItem('tdfc-theme')||'light');
$$('.seg button').forEach(b=>b.onclick=()=>applyTheme(b.dataset.mode));
// modals
let lastFocus;
function openModal(id){lastFocus=document.activeElement;const m=$('#'+id);m.classList.add('open');(m.querySelector('input:not([disabled])')||m.querySelector('button')).focus()}
function closeModal(m){m.classList.remove('open');lastFocus&&lastFocus.focus()}
$$('[data-open]').forEach(b=>b.onclick=()=>openModal(b.dataset.open));
$$('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.closest('.modal-back')));
$$('.modal-back').forEach(m=>m.addEventListener('mousedown',e=>e.target===m&&closeModal(m)));
addEventListener('keydown',e=>e.key==='Escape'&&$$('.modal-back.open').forEach(closeModal));
// show/hide password
$$('.pw-wrap button').forEach(b=>b.onclick=()=>{const i=b.previousElementSibling;i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'Show':'Hide'});
// password rules (modal + page). Mock: current password "wrong" triggers the server error.
function pwForm(f,onOk){
 const cur=f.querySelector('[name=current_password]'),pw=f.querySelector('[name=password]'),cf=f.querySelector('[name=password_confirmation]');
 const e=n=>f.querySelector('[data-err='+n+']'),btn=f.querySelector('[type=submit]');
 function check(){const v=pw.value.length>=8,m=cf.value===pw.value;
  e('password').textContent=pw.value&&!v?'Minimum 8 characters.':'';pw.classList.toggle('err',!!pw.value&&!v);
  const x=e('confirm');x.className=cf.value?(m?'ok-msg':'bad-msg'):'hint';x.textContent=cf.value?(m?'Passwords match.':'Passwords do not match.'):'';
  if(btn.dataset.gate)btn.disabled=!(v&&m&&cur.value);return v&&m}
 f.addEventListener('input',check);check();
 f.onsubmit=ev=>{ev.preventDefault();e('current').textContent='';
  if(!cur.value||!check())return;
  if(cur.value==='wrong'){e('current').textContent='The provided password does not match your current password.';cur.classList.add('err');cur.focus();return}
  cur.classList.remove('err');f.reset();check();onOk&&onOk(f)}}
// flash a success line then run cb
function flash(el,cb,ms=1500){el.hidden=false;setTimeout(()=>{el.hidden=true;cb&&cb()},ms)}
