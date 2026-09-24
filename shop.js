(() => {
  const KEY="oldroot-cart-v1";
  const products=Object.fromEntries(Array.from({length:10},(_,i)=>{const n=i+1;return ["oldroot-book-"+n,{id:"oldroot-book-"+n,title:"OldRoot Book "+n,format:"OldRoot Standard",price:null,purchasable:false,url:"library/oldroot-book-"+n+"/"}]}));
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}};
  const write=cart=>{localStorage.setItem(KEY,JSON.stringify(cart));sync()};
  const count=()=>read().reduce((sum,x)=>sum+(Number(x.qty)||0),0);
  function sync(){document.querySelectorAll("[data-cart-count]").forEach(el=>el.textContent=count());renderCart();renderCheckout();}
  function ensureDrawer(){
    if(document.querySelector(".bag-drawer"))return;
    document.body.insertAdjacentHTML("beforeend",'<div class="bag-overlay" data-bag-close></div><aside class="bag-drawer" aria-label="Library Bag"><div class="bag-head"><strong>Your Library Bag</strong><button class="bag-close" type="button" data-bag-close>×</button></div><div class="bag-body"><div class="bag-empty">No titles are available to purchase yet.</div></div><div class="bag-actions"><a href="'+rootPath("cart.html")+'">View Full Bag</a><a href="'+rootPath("library.html")+'">Continue Browsing</a></div></aside>');
    document.querySelectorAll("[data-bag-close]").forEach(el=>el.addEventListener("click",closeBag));
  }
  function depth(){return location.pathname.includes("/library/oldroot-book-")?2:0}
  function rootPath(p){return depth()===2?"../../"+p:p}
  function openBag(e){if(e)e.preventDefault();ensureDrawer();document.querySelector(".bag-overlay").classList.add("open");document.querySelector(".bag-drawer").classList.add("open");}
  function closeBag(){document.querySelector(".bag-overlay")?.classList.remove("open");document.querySelector(".bag-drawer")?.classList.remove("open")}
  document.querySelectorAll("[data-bag-toggle]").forEach(el=>el.addEventListener("click",openBag));
  function renderCart(){
    const target=document.querySelector("#cartItems"); if(!target)return;
    const cart=read();
    if(!cart.length){target.innerHTML='<div class="cart-empty"><h2>Your bag is empty.</h2><p>The first OldRoot titles are still being prepared for release.</p><a class="shop-secondary" href="library.html">Browse Library</a></div>';return;}
    target.innerHTML=cart.map(x=>'<div>'+x.title+'</div>').join("");
  }
  function renderCheckout(){
    const el=document.querySelector("#checkoutCartCount"); if(el)el.textContent=count();
  }
  window.OldRootShop={products,cart:read,add(id){const p=products[id];if(!p||!p.purchasable)return false;const c=read();const row=c.find(x=>x.id===id);if(row)row.qty++;else c.push({...p,qty:1});write(c);return true},clear(){write([])}};
  sync();
})();