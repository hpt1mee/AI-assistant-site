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
const descriptions={editor:'Редактор индикатора: размер, цвет, скругление и текст готовности',dark:'Настройки Objectivity в тёмной теме',light:'Настройки Objectivity в светлой теме'};
function selectTab(tab){
  tabs.forEach(button=>{button.classList.toggle('active',button===tab);button.setAttribute('aria-selected',String(button===tab));button.tabIndex=button===tab?0:-1;});
  const image=document.getElementById('gallery-image');image.classList.remove('gallery-enter');image.onload=()=>image.classList.add('gallery-enter');image.src=`assets/${tab.dataset.image}.png`;image.alt=descriptions[tab.dataset.image];
  document.querySelector('.gallery-frame').setAttribute('aria-labelledby',tab.id);
}
tabs.forEach((tab,index)=>{tab.tabIndex=index? -1:0;tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectTab(tabs[next]);tabs[next].focus();}});});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealItems = [...document.querySelectorAll('.hero-copy > *, .hero-art, .section-heading, .feature-card, .gallery-frame, .workflow-copy, .update-visual, .install-card, .faq-list, .account-intro, .account-card')];
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 65}ms`);
    item.classList.add('motion-pending');
    observer.observe(item);
  });
  motionPreference.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      revealItems.forEach(item => item.classList.add('is-visible'));
    }
  });
}

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
 document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('pointermove', event => {
   if (motionPreference.matches) return;
   const bounds = card.getBoundingClientRect();
   card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
   card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  });
 });
}
