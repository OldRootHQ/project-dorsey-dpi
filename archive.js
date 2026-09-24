(() => {
  const api=(document.documentElement.dataset.archiveApi||"").replace(/\/$/,"");
  const form=document.querySelector("#archiveForm"),input=document.querySelector("#archiveInput"),log=document.querySelector("#chatLog");
  const submit=form.querySelector("button"),status=document.querySelector("#archiveStatus"),dot=document.querySelector("#archiveStatusDot"),hint=document.querySelector("#archiveHint");
  const memoryToggle=document.querySelector("#memoryToggle"),viewMemory=document.querySelector("#viewMemory"),clearMemory=document.querySelector("#clearMemory");
  const memoryDialog=document.querySelector("#memoryDialog"),memoryContents=document.querySelector("#memoryContents");
  const visitorKey="oldroot-archive-visitor-v1",memoryKey="oldroot-archive-memory-enabled-v1",localMemoryKey="oldroot-archive-local-memory-v1";
  const visitorId=localStorage.getItem(visitorKey)||((crypto.randomUUID&&crypto.randomUUID())||Math.random().toString(36).slice(2)+Date.now());
  localStorage.setItem(visitorKey,visitorId);memoryToggle.checked=localStorage.getItem(memoryKey)==="true";
  const history=[];let canon=null;

  function setStatus(mode,text){status.textContent=text;dot.className=mode;hint.textContent=mode==="online"?"AI grounded to public OldRoot records.":"Public-canon retrieval fallback active."}
  function addMessage(who,text,sources=[]){
    const a=document.createElement("article");a.className="message "+(who==="You"?"user-message":"archive-message");
    const sourceHtml=sources.length?'<div class="source-links">'+sources.map(s=>'<a href="'+s.page+'">'+escapeHtml(s.label)+' →</a>').join("")+'</div>':"";
    a.innerHTML='<div class="message-mark">'+(who==="You"?"YOU":"OR")+'</div><div><b>'+who.toUpperCase()+'</b><p>'+escapeHtml(text)+'</p>'+sourceHtml+'</div>';
    log.appendChild(a);log.scrollTop=log.scrollHeight;
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
  function getLocalMemory(){try{return JSON.parse(localStorage.getItem(localMemoryKey)||"[]")}catch{return[]}}
  function saveLocalMemory(question){
    if(!memoryToggle.checked)return;
    const m=getLocalMemory();m.push({at:new Date().toISOString(),question});localStorage.setItem(localMemoryKey,JSON.stringify(m.slice(-12)));
  }

  async function loadCanon(){
    try{canon=await fetch("public-canon.json?v=1",{cache:"no-store"}).then(r=>r.json())}catch{}
  }
  function textBlob(record){return JSON.stringify(record).toLowerCase()}
  function fallbackAnswer(q){
    if(!canon)return{answer:"The public canon index is temporarily unavailable.",sources:[]};
    const lower=q.toLowerCase(),terms=lower.split(/[^a-z0-9’'-]+/).filter(t=>t.length>2);
    const pools=[
      ...canon.characters.map(x=>({type:"character",record:x,label:x.codename,page:x.page})),
      ...canon.locations.map(x=>({type:"location",record:x,label:x.name,page:x.page})),
      ...canon.organizations.map(x=>({type:"organization",record:x,label:x.name,page:x.page}))
    ];
    const ranked=pools.map(x=>({x,score:terms.reduce((n,t)=>n+(textBlob(x.record).includes(t)?1:0),0)})).sort((a,b)=>b.score-a.score);
    const hits=ranked.filter(x=>x.score>0).slice(0,3).map(x=>x.x);
    if(lower.includes("dpi")&&lower.includes("explain"))return{answer:canon.dpi.name+" evaluates "+canon.dpi.categories.join(", ")+". Baseline mean is analytics-only and is not a canonical overall power score.",sources:[{label:"DPI Analytics",page:"dpi.html"}]};
    if(!hits.length)return{answer:"That is not supported by the currently published OldRoot records. The Archive will not fill the gap with private or invented lore.",sources:[]};
    const lines=hits.map(h=>{
      const r=h.record;
      if(h.type==="character")return r.codename+" — "+r.summary+" Power Classification: "+r.powerClass+". Ascendant status: "+r.ascendantStatus+".";
      return r.name+" — "+r.summary;
    });
    return{answer:lines.join("\n\n"),sources:hits.map(h=>({label:h.label,page:h.page}))};
  }

  async function ask(question){
    history.push({role:"user",content:question});addMessage("You",question);saveLocalMemory(question);
    submit.disabled=true;input.disabled=true;
    try{
      if(api){
        const res=await fetch(api+"/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          message:question,history:history.slice(-10),visitorId,memoryEnabled:memoryToggle.checked
        })});
        if(res.ok){
          const data=await res.json();const answer=data.answer||data.message;
          if(answer){history.push({role:"assistant",content:answer});addMessage("Archive",answer,(data.sources||[]));setStatus("online","Archive AI online");return}
        }
      }
      const f=fallbackAnswer(question);history.push({role:"assistant",content:f.answer});addMessage("Archive",f.answer,f.sources);setStatus("fallback","Public canon mode");
    }catch{
      const f=fallbackAnswer(question);history.push({role:"assistant",content:f.answer});addMessage("Archive",f.answer,f.sources);setStatus("fallback","Public canon mode");
    }finally{submit.disabled=false;input.disabled=false;input.focus()}
  }

  form.addEventListener("submit",e=>{e.preventDefault();const q=input.value.trim();if(!q)return;input.value="";ask(q)});
  document.querySelectorAll("[data-prompt]").forEach(b=>b.onclick=()=>{input.value=b.dataset.prompt;form.requestSubmit()});
  memoryToggle.addEventListener("change",()=>localStorage.setItem(memoryKey,String(memoryToggle.checked)));
  viewMemory.onclick=async()=>{
    let display={local:getLocalMemory()};
    if(api&&memoryToggle.checked){try{const r=await fetch(api+"/api/memory/"+encodeURIComponent(visitorId));if(r.ok)display.server=await r.json()}catch{}}
    memoryContents.textContent=JSON.stringify(display,null,2);memoryDialog.showModal();
  };
  clearMemory.onclick=async()=>{
    localStorage.removeItem(localMemoryKey);
    if(api){try{await fetch(api+"/api/memory/"+encodeURIComponent(visitorId),{method:"DELETE"})}catch{}}
    addMessage("Archive","Remembered reader context for this browser has been cleared.");
  };

  (async()=>{
    await loadCanon();
    if(!api){setStatus("fallback","Public canon mode");return}
    try{const r=await fetch(api+"/api/health",{cache:"no-store"});if(r.ok)setStatus("online","Archive AI online");else setStatus("fallback","Public canon mode")}
    catch{setStatus("fallback","Public canon mode")}
  })();
})();