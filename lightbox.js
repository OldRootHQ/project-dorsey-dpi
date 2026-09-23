(() => {
  const triggers=[...document.querySelectorAll('[data-lightbox]')];
  if(!triggers.length) return;

  const modal=document.createElement('div');
  modal.className='image-lightbox';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-label','Full character image');
  modal.innerHTML=`
    <div class="image-lightbox-stage">
      <button class="image-lightbox-close" type="button" aria-label="Close full image">×</button>
      <img alt="" />
      <div class="image-lightbox-caption"></div>
    </div>`;
  document.body.appendChild(modal);

  const img=modal.querySelector('img');
  const caption=modal.querySelector('.image-lightbox-caption');
  const closeBtn=modal.querySelector('.image-lightbox-close');
  let lastTrigger=null;

  function previewFor(trigger){
    return trigger.matches('img') ? trigger : trigger.querySelector('img');
  }
  function open(trigger){
    const preview=previewFor(trigger);
    if(!preview) return;
    lastTrigger=trigger;
    img.src=trigger.dataset.fullSrc || preview.currentSrc || preview.src;
    img.alt=preview.alt || '';
    caption.textContent=trigger.dataset.caption || preview.alt || '';
    modal.classList.add('open');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  }
  function close(){
    modal.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    img.removeAttribute('src');
    if(lastTrigger && lastTrigger.focus) lastTrigger.focus();
  }

  triggers.forEach(trigger=>trigger.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    open(trigger);
  }));
  closeBtn.addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal) close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open')) close();});
})();