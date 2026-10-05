const tabs=[...document.querySelectorAll('[data-image]')];
// This is navigation state only. The account page verifies the session with Auth.
function updateAccountLinks() {
  let signedIn = false;
  try {
    const session = JSON.parse(localStorage.getItem('ai-assistant-session-v1'));
    signedIn = Boolean(session?.refresh_token && session?.user?.id);
  } catch (_) {}
  document.querySelectorAll('header a[href="account.html"]').forEach(link => {
    link.textContent = signedIn ? 'Мой аккаунт' : 'Войти';
  });
}
updateAccountLinks();
window.addEventListener('pageshow', updateAccountLinks);
window.addEventListener('storage', event => {
  if (event.key === 'ai-assistant-session-v1' || event.key === null) updateAccountLinks();
});
const descriptions={editor:'Редактор индикатора: размер, цвет, скругление и текст готовности',dark:'Настройки AI Assistant в тёмной теме',light:'Настройки AI Assistant в светлой теме'};
function selectTab(tab){
  tabs.forEach(button=>{button.classList.toggle('active',button===tab);button.setAttribute('aria-selected',String(button===tab));button.tabIndex=button===tab?0:-1;});
  const image=document.getElementById('gallery-image');image.src=`assets/${tab.dataset.image}.png`;image.alt=descriptions[tab.dataset.image];
  document.querySelector('.gallery-frame').setAttribute('aria-labelledby',tab.id);
}
tabs.forEach((tab,index)=>{tab.tabIndex=index? -1:0;tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectTab(tabs[next]);tabs[next].focus();}});});
