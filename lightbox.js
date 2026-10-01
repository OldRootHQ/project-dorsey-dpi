(() => {
  let modal=null;
  let img=null;
  let caption=null;
  let closeBtn=null;
  let lastTrigger=null;

  function ensureModal(){
    if(modal) return;
    modal=document.createElement('div');
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
    img=modal.querySelector('img');
    caption=modal.querySelector('.image-lightbox-caption');
    closeBtn=modal.querySelector('.image-lightbox-close');
    closeBtn.addEventListener('click',close);
    modal.addEventListener('click',e=>{if(e.target===modal) close();});
  }

  function previewFor(trigger){
    return trigger.matches('img') ? trigger : trigger.querySelector('img');
  }

  function open(trigger){
    ensureModal();
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
    if(!modal) return;
    modal.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    img.removeAttribute('src');
    if(lastTrigger && lastTrigger.focus) lastTrigger.focus();
  }

  document.addEventListener('click',e=>{
    const trigger=e.target.closest('[data-lightbox]');
    if(!trigger) return;
    e.preventDefault();
    e.stopPropagation();
    open(trigger);
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && modal?.classList.contains('open')){
      close();
      return;
    }
    if((e.key==='Enter' || e.key===' ') && e.target.matches?.('[data-lightbox]')){
      e.preventDefault();
      open(e.target);
    }
  });
})();