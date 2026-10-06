'use strict';
const AUTH_URL = 'https://optabknrlqkkqrlgwvgt.supabase.co/auth/v1/';
const PUBLIC_KEY = 'sb_publishable_isMrP2Ampmd0LWAvmoAAwg_BT9mOfqP';
const STORAGE = 'ai-assistant-session-v1';
const $ = id => document.getElementById(id);
let mode = 'login', session = null, busy = false;
async function api(path, body, token) {
  const response = await fetch(AUTH_URL + path, {method:'POST', headers:{apikey:PUBLIC_KEY,'Content-Type':'application/json', ...(token ? {Authorization:'Bearer '+token} : {})}, body:JSON.stringify(body)});
  let data = {}; try { data = await response.json(); } catch (_) {}
  if (!response.ok) {
    const error = new Error(response.status === 429 ? 'Слишком много попыток. Попробуй позже.' : response.status >= 500 ? 'Сервис временно недоступен.' : mode === 'register' ? 'Регистрация не завершена. Проверь адрес, пароль и настройки почты.' : 'Проверь email, пароль и подтверждение почты.');
    error.status = response.status; throw error;
  }
  return data;
}
function save(data) {
  if (!data.refresh_token || !data.user?.id) throw new Error('Не удалось получить сессию. Повтори вход.');
  session = data;
  try { localStorage.setItem(STORAGE, JSON.stringify(data)); } catch (_) { $('message').textContent = 'Вход выполнен, но браузер не разрешил сохранить его.'; }
  $('auth-form-area').hidden = true; $('profile').hidden = false;
  $('profile-email').textContent = data.user.email || '';
  $('password').value = '';
}
function clear() {
  session = null; try { localStorage.removeItem(STORAGE); } catch (_) {}
  $('auth-form-area').hidden = false; $('profile').hidden = true;
}
function setMode(next) {
  if (busy) return;
  mode = next; $('login-tab').setAttribute('aria-pressed', mode==='login'); $('register-tab').setAttribute('aria-pressed', mode==='register');
  $('form-title').textContent = mode==='login' ? 'С возвращением' : 'Создай аккаунт';
  $('submit').textContent = mode==='login' ? 'Войти' : 'Зарегистрироваться';
  $('password').autocomplete = mode==='login' ? 'current-password' : 'new-password';
  $('password').minLength = mode==='login' ? 1 : 8;
  $('password-hint').textContent = mode==='login' ? 'Введи пароль своего аккаунта.' : 'Минимум 8 символов. Используй уникальный пароль.';
  $('message').textContent = ''; $('password').value = '';
}
function lock(value) {
  busy = value;
  for (const id of ['submit','login-tab','register-tab','logout']) $(id).disabled = value;
}
$('login-tab').addEventListener('click',()=>setMode('login'));
$('register-tab').addEventListener('click',()=>setMode('register'));
$('account-form').addEventListener('submit',async event=>{
  event.preventDefault(); if (busy) return; lock(true); $('message').textContent = 'Подключаюсь…';
  try {
    const payload = {email:$('email').value.trim(), password:$('password').value};
    const path = mode==='login' ? 'token?grant_type=password' : 'signup?redirect_to='+encodeURIComponent(new URL('account.html',location.href).href);
    const data = await api(path,payload);
    $('message').textContent = '';
    if (data.refresh_token) save(data);
    else { lock(false); setMode('login'); $('message').textContent = 'Письмо отправлено. Открой его и нажми «Подтвердить email». После подтверждения войди здесь со своим паролем. Если аккаунт уже существует, просто войди.'; }
  } catch(error) { $('message').textContent = error instanceof TypeError ? 'Нет соединения. Проверь интернет и повтори попытку.' : error.message; }
  finally { $('password').value=''; lock(false); }
});
$('logout').addEventListener('click',async()=>{
  if (busy) return; const token = session?.access_token; clear(); lock(true);
  $('message').textContent='Ты вышел из аккаунта на этом устройстве.';
  try { if(token) await api('logout?scope=local',{},token); } catch(_) {}
  finally { lock(false); }
});
async function restore() {
  let saved; try { saved=JSON.parse(localStorage.getItem(STORAGE)); } catch (_) { clear(); return; }
  if(!saved?.refresh_token) return;
  lock(true); $('message').textContent='Проверяю вход…';
  try { const data=await api('token?grant_type=refresh_token',{refresh_token:saved.refresh_token}); $('message').textContent=''; save(data); }
  catch(error) { if([400,401,403].includes(error.status)) clear(); $('message').textContent='Не удалось восстановить вход. Проверь соединение или войди снова.'; }
  finally { lock(false); }
}
// A confirmation link never signs the browser into a URL-supplied session.
// Verify its access token with Auth, then require the user's password to log in.
async function handleConfirmation() {
  const fragment = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  const token = fragment.get('access_token');
  const error = fragment.get('error') || query.get('error');
  const type = fragment.get('type');
  if (!token && !error) { await restore(); return; }
  history.replaceState(null, '', location.pathname);
  clear(); lock(true);
  try {
    if (error) throw new Error('Ссылка устарела или уже использована. Попробуй войти: если email подтверждён, аккаунт уже готов.');
    if (!['signup','email'].includes(type)) throw new Error('Эта ссылка не предназначена для подтверждения регистрации. Войди с email и паролем.');
    $('message').textContent = 'Проверяю подтверждение почты…';
    const response = await fetch(AUTH_URL + 'user', {headers:{apikey:PUBLIC_KEY,Authorization:'Bearer '+token}});
    if (!response.ok) throw new Error('Не удалось проверить ссылку. Попробуй войти со своим паролем.');
    const user = await response.json();
    if (!user.email_confirmed_at) throw new Error('Email пока не подтверждён. Открой последнее письмо.');
    $('email').value = user.email || '';
    $('form-title').textContent = 'Почта подтверждена ✓';
    $('message').textContent = 'Аккаунт готов. Введи свой пароль и нажми «Войти». Этот же аккаунт работает в приложении.';
    $('password').focus();
  } catch(error) { $('message').textContent = error instanceof TypeError ? 'Не удалось подключиться. Попробуй войти снова.' : error.message; }
  finally { lock(false); }
}
handleConfirmation();
