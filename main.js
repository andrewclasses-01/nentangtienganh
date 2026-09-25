/* NỀN TẢNG TIẾNG ANH — tương tác trang (v10) */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const giam=matchMedia('(prefers-reduced-motion: reduce)').matches;
const secs=$$('main>section');

/* ---------- hiện dần ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
$$('.rv,#dg').forEach(el=>io.observe(el));

/* ---------- số chạy ---------- */
const ioSo=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting) return; ioSo.unobserve(e.target);
  const el=e.target, dich=+el.dataset.dem, t0=performance.now(), dur=giam?1:1600+Math.min(dich,700);
  const b=t=>{const p=Math.min(1,(t-t0)/dur);el.textContent=Math.round(dich*(1-Math.pow(1-p,4))).toLocaleString('vi-VN');if(p<1)requestAnimationFrame(b);};
  requestAnimationFrame(b);
}),{threshold:.5});
$$('[data-dem]').forEach(el=>ioSo.observe(el));

/* ---------- trục dọc bên phải ---------- */
const truc=$('#truc'), chay=$('#trucChay');
const nuts=secs.map((s,i)=>{
  const b=document.createElement('button');b.type='button';b.style.setProperty('--c',s.dataset.c);
  b.innerHTML=`<i></i><span>${s.dataset.ten}</span>`;b.setAttribute('aria-label',s.dataset.ten);
  b.addEventListener('click',()=>{
    if(i>xaNhat+1){b.classList.remove('lac');void b.offsetWidth;b.classList.add('lac');nuts[xaNhat+1].classList.add('nhac');setTimeout(()=>nuts[xaNhat+1].classList.remove('nhac'),1400);return;}
    denMan(i);});
  truc.appendChild(b);return b;
});
let dangO=0;
// màn xa nhất đã xem (nhớ cho lần sau quay lại)
let xaNhat=0;try{xaNhat=Math.min(secs.length-1,+localStorage.getItem('knt-xa')||0);}catch(e){}
function capNhatTruc(){
  // phần đang chiếm giữa màn hình
  const giua=innerHeight/2;let k=0;
  secs.forEach((s,i)=>{if(s.getBoundingClientRect().top<=giua)k=i;});
  if(k!==dangO||!nuts[k].classList.contains('on')){
    dangO=k;
    nuts.forEach((b,i)=>{b.classList.toggle('on',i===k);b.classList.toggle('qua',i<k);});
  }
  if(k>xaNhat){xaNhat=k;try{localStorage.setItem('knt-xa',k);}catch(e){}}
  nuts.forEach((b,i)=>b.classList.toggle('khoa',i>xaNhat+1));
  const a=nuts[0].offsetTop+nuts[0].offsetHeight/2, b=nuts[k].offsetTop+nuts[k].offsetHeight/2;
  chay.style.top=a+'px';chay.style.height=(b-a)+'px';
  // nút "Tiếp tục" nổi (giữa đáy màn hình): ẩn ở màn đăng ký
  fab.classList.toggle('an',k===secs.length-1);
  nav.classList.toggle('dac',scrollY>20);
}
const fab=$('#fab'), nav=$('#nav');
fab.addEventListener('click',()=>denMan(dangO+1));
addEventListener('scroll',capNhatTruc,{passive:true});addEventListener('resize',capNhatTruc);
capNhatTruc();

/* phím mũi tên / PageUp-Down: nhảy trọn một màn */
addEventListener('keydown',e=>{
  if(/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  let d=0;if(['ArrowDown','PageDown'].includes(e.key))d=1;if(['ArrowUp','PageUp'].includes(e.key))d=-1;
  if(!d) return; const t=secs[Math.max(0,Math.min(secs.length-1,dangO+d))];
  e.preventDefault();denMan(secs.indexOf(t));
});
/* lăn chuột / bàn di: mỗi cú lăn = nhảy trọn một màn (màn cao hơn khung thì cuộn hết màn rồi mới nhảy) */
let khoa=false,lanCuoi=0,henMo=null;
function denMan(i){
  i=Math.max(0,Math.min(secs.length-1,i));
  khoa=true;scrollTo({top:secs[i].offsetTop,behavior:giam?'auto':'smooth'});
  clearTimeout(henMo);
  const mo=()=>{if(performance.now()-lanCuoi<220){henMo=setTimeout(mo,120);}else khoa=false;};
  henMo=setTimeout(mo,760);
}
addEventListener('wheel',e=>{
  if(e.ctrlKey||$('#lb').classList.contains('mo')) return;
  if(Math.abs(e.deltaX)>Math.abs(e.deltaY)) return;
  lanCuoi=performance.now();
  if(khoa){e.preventDefault();return;}
  if(Math.abs(e.deltaY)<4) return;
  const d=e.deltaY>0?1:-1, r=secs[dangO].getBoundingClientRect();
  if(d>0&&r.bottom>innerHeight+4) return;   // màn cao: cuộn tự nhiên tới đáy
  if(d<0&&r.top<-4) return;                  // màn cao: cuộn tự nhiên lên đỉnh
  e.preventDefault();denMan(dangO+d);
},{passive:false});
$$('[data-toi]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.toi).scrollIntoView({behavior:'smooth'})));

/* ---------- điện thoại: mỗi màn tự thu nhỏ cho VỪA KHÍT chiều cao thật của máy ----------
   (Chrome/Safari trên iPhone chiếm mất đáy màn hình ⇒ vùng thấy được thấp hơn nhiều so với màn hình;
   đo bằng 100svh = chiều cao nhỏ nhất khi thanh trình duyệt hiện đủ; chừa chỗ thanh tiêu đề + nút Tiếp tục) */
const doCao=document.createElement('div');
doCao.style.cssText='position:fixed;left:0;top:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
document.body.appendChild(doCao);
function vuaMan(){
  const dt=innerWidth<=700, H=doCao.offsetHeight||innerHeight;
  secs.forEach(s=>{
    const w=s.querySelector(':scope>.wrap'); if(!w) return;
    Object.assign(w.style,{transform:'',transformOrigin:'',width:'',marginLeft:'',marginBottom:'',flex:''});
    if(!dt){vuaBang();return;}
    const cs=getComputedStyle(s), A=H-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-6;
    vuaBang();let h=w.offsetHeight; w._h=h; if(h<=A) return;
    w.style.flex='none';
    const rong=z=>{w.style.width=(100/z)+'%';w.style.marginLeft=(-(1/z-1)*50)+'%';vuaBang();return w.offsetHeight;};
    // tìm mức thu lớn nhất vẫn vừa (khung nới rộng cho đủ bề ngang); có khối giữ tỉ lệ (thẻ game) thì nới rộng lại cao thêm
    // ⇒ không vừa được ⇒ chỉ thu nhỏ, giữ bề rộng cũ (khung hẹp lại một chút ở giữa)
    let lo=.5,hi=1,z=0;
    for(let i=0;i<14;i++){const m=(lo+hi)/2;if(rong(m)*m<=A){z=m;lo=m;}else hi=m;}
    if(z){h=rong(z);}
    else{w.style.width='';w.style.marginLeft='';vuaBang();h=w.offsetHeight;z=A/h;}
    w._h=h;Object.assign(w.style,{transformOrigin:'50% 0',transform:`scale(${z.toFixed(4)})`,marginBottom:(-(1-z)*h)+'px'});
  });
}
// bảng Theo dõi: rộng hơn khung ⇒ thu cả bảng cho vừa bề ngang (chỉ làm bảng thấp đi ⇒ màn vẫn vừa)
function vuaBang(){
  const t=document.querySelector('.tl-wrap'),b=t&&t.querySelector('table'); if(!b) return;
  Object.assign(b.style,{transform:'',transformOrigin:''});t.style.height='';t.style.overflow='';
  if(innerWidth>700||b.offsetWidth<=t.clientWidth+1) return;
  const k=t.clientWidth/b.offsetWidth;
  Object.assign(b.style,{transformOrigin:'0 0',transform:`scale(${k.toFixed(4)})`});
  t.style.height=(b.offsetHeight*k)+'px';t.style.overflow='hidden';
  const w=t.closest('.wrap'); if(w&&w._h!=null) w._h=w.offsetHeight;
}
let henVua=null;const vuaSau=()=>{clearTimeout(henVua);henVua=setTimeout(vuaMan,120);};
addEventListener('resize',vuaSau);addEventListener('orientationchange',vuaSau);
// nội dung đổi cao sau khi đã đo (font, ảnh, chữ xuống dòng) ⇒ đo lại
if(window.ResizeObserver){const ro=new ResizeObserver(()=>{if(secs.some(s=>{const w=s.querySelector(':scope>.wrap');return w&&w._h!=null&&Math.abs(w.offsetHeight-w._h)>1;}))vuaSau();});secs.forEach(s=>{const w=s.querySelector(':scope>.wrap');if(w)ro.observe(w);});}
document.fonts.ready.then(vuaMan);addEventListener('load',vuaMan);vuaMan();

/* ---------- quạt trang sách ---------- */
const NHOM={hanhtrinh:['005','003','009','030','185','225'],tuvung:['044','045','059','004','055','001'],baitap:['036','055','171','186','031','030']};
const quat=$('#quat');
function veQuat(nhom){
  $$('.tr',quat).forEach(c=>{c.style.opacity='0';c.style.transform='translateY(60px) scale(.9)';setTimeout(()=>c.remove(),600);});
  const ds=NHOM[nhom],n=ds.length,hep=innerWidth<900?.42:1;
  ds.forEach((p,i)=>{
    const d=document.createElement('div');d.className='tr';
    d.innerHTML=`<img src="assets/page-${p}.jpg" alt="Trang ${+p}" loading="lazy">`;
    const k=i-(n-1)/2, goc=k*11*hep, x=k*62*hep, y=Math.abs(k)*14;
    d.dataset.t=`translate(${x}px,${y}px) rotate(${goc}deg)`;d.style.zIndex=i;
    d.style.opacity='0';d.style.transform='translateY(120px) scale(.8)';
    d.addEventListener('mouseenter',()=>d.style.transform=`translate(${x}px,${y-40}px) rotate(${goc*.4}deg) scale(1.08)`);
    d.addEventListener('mouseleave',()=>d.style.transform=d.dataset.t);
    d.addEventListener('click',()=>{$('#lb img').src=`assets/page-${p}.jpg`;$('#lb').classList.add('mo');});
    quat.appendChild(d);
    setTimeout(()=>{d.style.opacity='1';d.style.transform=d.dataset.t;},80+i*90);
  });
}
let quatVe=false;
new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!quatVe){quatVe=true;veQuat('hanhtrinh');}}),{threshold:.3}).observe(quat);
$$('#quatNut button').forEach(b=>b.addEventListener('click',()=>{$$('#quatNut button').forEach(x=>x.classList.toggle('on',x===b));veQuat(b.dataset.nhom);}));
$('#lb').addEventListener('click',()=>$('#lb').classList.remove('mo'));
addEventListener('keydown',e=>{if(e.key==='Escape')$('#lb').classList.remove('mo');});

/* ---------- lộ trình: đường nối rắn lượn theo thứ tự chặng ---------- */
const lt=$('#lt'), ltSvg=$('#ltDuong');
const chs=$$('.ch',lt).map(el=>({el,n:el.classList.contains('dich')?9:+$('.sn',el).textContent}));
chs.forEach(c=>c.el.style.setProperty('--o',c.n));
function veDuong(){
  if(innerWidth<900){ltSvg.innerHTML='';return;}
  // đo bằng vị trí BỐ CỤC (offset) — không bị lệch bởi hiệu ứng trượt/hiện dần (transform) của thẻ
  const r0={width:lt.clientWidth};
  const pts=chs.slice().sort((a,b)=>a.n-b.n).map(c=>[c.el.offsetLeft+c.el.offsetWidth/2,c.el.offsetTop+c.el.offsetHeight/2]);
  let d=`M${pts[0][0]},${pts[0][1]}`;
  for(let i=1;i<pts.length;i++){const[x0,y0]=pts[i-1],[x1,y1]=pts[i];
    if(Math.abs(y1-y0)<5) d+=` L${x1},${y1}`;
    else{const cx=x0+(x0>r0.width/2?1:-1)*r0.width*.12;d+=` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;}}
  ltSvg.innerHTML=`<defs><linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8893a"/><stop offset="1" stop-color="#2f6b55"/></linearGradient></defs><path class="nen" d="${d}"/><path d="${d}" stroke="url(#gd)" style="stroke-dasharray:2 14"/>`;
}
addEventListener('resize',veDuong);document.fonts.ready.then(veDuong);setTimeout(veDuong,1200);addEventListener('load',veDuong);
if(window.ResizeObserver) new ResizeObserver(veDuong).observe(lt);                 // khung lộ trình đổi cỡ ⇒ vẽ lại
new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)veDuong();}),{threshold:.1}).observe(lt);
const ltStyle=document.createElement('style');ltStyle.textContent='@media (max-width:900px){.lt .ch{order:var(--o)}}';document.head.appendChild(ltStyle);

/* ---------- một bài học ---------- */
const mb=$('#mb'), buocs=$$('.buoc',mb), canhs=$$('.canh',mb), TG=[4200,3200,4000,3200,3000,5400];
let buoc=0,hen=null,mbThay=false;
function denBuoc(i,tu){
  buoc=i;
  buocs.forEach((b,k)=>{b.classList.remove('on');void b.offsetWidth;b.classList.toggle('on',k===i);b.style.setProperty('--t',TG[k]+'ms');});
  canhs.forEach((c,k)=>c.classList.toggle('on',k===i));
  if(i===2) goChu();
  clearTimeout(hen);
  if(tu!==false&&mbThay&&!mb.classList.contains('dung')) hen=setTimeout(()=>denBuoc((buoc+1)%buocs.length),TG[i]);
}
buocs.forEach((b,k)=>b.addEventListener('click',()=>{mb.classList.add('dung');denBuoc(k,false);
  clearTimeout(mb._th);mb._th=setTimeout(()=>{mb.classList.remove('dung');denBuoc(buoc);},8000);}));
new IntersectionObserver(es=>es.forEach(e=>{mbThay=e.isIntersecting;if(mbThay)denBuoc(buoc);else clearTimeout(hen);}),{threshold:.35}).observe(mb);
let goHen=[];
function goChu(){
  goHen.forEach(clearTimeout);goHen=[];
  const cau='She is my best friend.',el=$('#goChu'),o=$('#goO'),kq=$('#goKq');
  el.textContent='';o.classList.remove('dung');kq.classList.remove('on');
  [...cau].forEach((ch,k)=>goHen.push(setTimeout(()=>{el.textContent+=ch;},300+k*60)));
  goHen.push(setTimeout(()=>{o.classList.add('dung');kq.classList.add('on');},300+cau.length*60+300));
}

/* ---------- thẻ game nghiêng ---------- */
if(matchMedia('(hover:hover)').matches&&!giam){
  $$('[data-tilt]').forEach(c=>{
    c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.style.transform=`perspective(900px) rotateY(${x*12}deg) rotateX(${-y*10}deg) translateY(-4px)`;});
    c.addEventListener('pointerleave',()=>c.style.transform='');
  });
}

/* ---------- khung game chạy thử (chỉ chạy khi màn Game đang hiện) ---------- */
const gameSec=$('#game');let gameThay=false,gameHen=[];
const gHen=(f,ms)=>gameHen.push(setTimeout(f,ms));
function gameDung(){gameHen.forEach(clearTimeout);gameHen=[];}
// Type the answer: gõ từng chữ, gõ xong là dừng + dấu ✓
function gtChay(){
  const cau='She doesn’t like fish.',el=$('#gtChu'),o=$('#gtO'),kq=$('#gtKq');
  el.textContent='';o.classList.remove('dung');kq.classList.remove('on');
  [...cau].forEach((ch,k)=>gHen(()=>{el.textContent+=ch;},500+k*95));
  const het=500+cau.length*95;
  gHen(()=>{o.classList.add('dung');kq.classList.add('on');},het+250);
  gHen(gtChay,het+3200);
}
// Unjumble: các cụm bị xáo trộn lần lượt bay xuống ghép thành câu đúng
const gu=$('#gu'),xao=$('.xao',gu),dich=$('.dich',gu),cumGoc=$$('b',xao);
function bay(el,dich){ // FLIP: đo chỗ cũ, chuyển chỗ, trượt từ chỗ cũ sang
  const a=el.getBoundingClientRect();dich.appendChild(el);const b=el.getBoundingClientRect();
  el.style.transition='none';el.style.transform=`translate(${a.left-b.left}px,${a.top-b.top}px)`;
  void el.offsetWidth;el.style.transition='transform .7s cubic-bezier(.2,.8,.2,1)';el.style.transform='';
}
function guChay(){
  gu.classList.remove('het');cumGoc.forEach(b=>{b.style.transition='none';b.style.transform='';b.classList.remove('vao');xao.appendChild(b);});
  const thuTu=cumGoc.slice().sort((a,b)=>a.dataset.i-b.dataset.i);
  thuTu.forEach((b,k)=>gHen(()=>{bay(b,dich);b.classList.add('vao');},1300+k*1000));
  gHen(()=>gu.classList.add('het'),1300+thuTu.length*1000+300);
  gHen(guChay,1300+thuTu.length*1000+3400);
}
// Open the box: mở hộp ⇒ thẻ câu hỏi, rồi hiện câu trả lời
const gb=$('#gb'),hops=$$('span',gb),the=$('.gb-the',gb);
const HOP=[[2,'Where are you from?','I’m from Vietnam.'],[5,'Can she swim?','Yes, she can.'],[0,'How many books are there?','There are three books.']];
let hopLuot=0;
function gbChay(){
  const [i,hoi,dap]=HOP[hopLuot++%HOP.length],h=hops[i];
  the.classList.remove('on','dap');$('small',the).textContent='Hộp '+(i+1);$('b',the).textContent=hoi;$('em',the).textContent=dap;
  gHen(()=>h.classList.add('mo'),700);
  gHen(()=>the.classList.add('on'),1300);
  gHen(()=>the.classList.add('dap'),3300);
  gHen(()=>{the.classList.remove('on');},5600);
  gHen(()=>{h.classList.remove('mo');h.classList.add('da');},6000);
  gHen(()=>{if(hopLuot%HOP.length===0)hops.forEach(x=>x.classList.remove('da'));gbChay();},6600);
}
new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting===gameThay) return; gameThay=e.isIntersecting; gameDung();
  if(gameThay&&!giam){gtChay();guChay();gbChay();}
  else if(gameThay){$('#gtChu').textContent='She doesn’t like fish.';$('#gtO').classList.add('dung');$('#gtKq').classList.add('on');cumGoc.slice().sort((a,b)=>a.dataset.i-b.dataset.i).forEach(b=>dich.appendChild(b));gu.classList.add('het');}
}),{threshold:.25}).observe(gameSec);

/* ---------- bảng xếp hạng động ---------- */
const MAU=['#b8613f','#b8893a','#2f6b55','#5f587f','#46648f','#9c5b67','#3b7a7d','#a8743f'];
const GOC=[27,26,26,24,23,22,20,19];
const HS=['Minh Anh','Gia Bảo','Khánh Linh','Đức Huy','Bảo Ngọc','Tuấn Kiệt','Hà My','Quang Minh'].map((t,i)=>({ten:t,d:GOC[i],s:[412,388,455,390,501,366,430,398][i],mau:MAU[i],id:i}));
const bxh=$('#bxh');
HS.forEach(h=>{const el=document.createElement('div');el.className='hs';
  el.innerHTML=`<span class="h"></span><span class="av" style="background:${h.mau}">${h.ten.split(' ').pop()[0]}</span><span class="t">${h.ten}</span><span class="d"></span><span class="tg"></span><span class="up">▲ lên hạng</span>`;
  h.el=el;bxh.appendChild(el);});
const mmss=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function xep(){
  HS.sort((a,b)=>b.d-a.d||a.s-b.s);
  const cao=bxh.clientHeight/8;
  HS.forEach((h,i)=>{h.el.style.transform=`translateY(${i*cao}px)`;h.el.classList.remove('r1','r2','r3');if(i<3)h.el.classList.add('r'+(i+1));
    $('.h',h.el).innerHTML=i<3?`<span class="medal m${i+1}">${i+1}</span>`:i+1;$('.d',h.el).innerHTML=`${h.d}<small>/30</small>`;$('.tg',h.el).textContent=mmss(h.s);});
}
xep();addEventListener('resize',xep);
let bxhThay=false;new IntersectionObserver(es=>es.forEach(e=>bxhThay=e.isIntersecting),{threshold:.2}).observe(bxh);
setInterval(()=>{
  if(!bxhThay||document.hidden) return;
  const truoc=HS.map(h=>h.id);const ung=HS.slice(2).filter(h=>h.d<30);
  if(!ung.length){HS.forEach(h=>h.d=GOC[h.id]);xep();return;}
  const h=ung[Math.floor(Math.random()*ung.length)];
  h.d=Math.min(30,h.d+1+Math.floor(Math.random()*3));h.s=Math.max(300,h.s-Math.floor(Math.random()*60));xep();
  if(HS.indexOf(h)<truoc.indexOf(h.id)){h.el.classList.remove('len');void h.el.offsetWidth;h.el.classList.add('len');}
},2600);

/* ---------- bảng theo dõi ---------- */
const TL=[['Minh Anh',98,48,1,72,1,55,1],['Gia Bảo',100,41,1,90,1,39,1],['Khánh Linh',86,65,1,52,0,0,0],['Đức Huy',95,37,1,104,1,47,1],['Bảo Ngọc',62,29,0,0,0,0,0]];
const gp=m=>m>=60?Math.floor(m/60)+'h'+String(m%60).padStart(2,'0'):m+' phút';
$('#tlBody').innerHTML=TL.map((r,i)=>{
  const tong=Math.round(60*r[1]/100)+r[2]+r[4]+r[6];
  const mv=r[1]>=95?'var(--mint)':r[1]>=70?'var(--sky)':r[1]>=40?'var(--orange)':'var(--pink)';
  const o=(m,ok,cau)=>m?`<span class="gio${ok?' ok':''}" style="--a:${Math.min(70,15+m/1.6)}%">${gp(m)}</span>`:`<span class="gio thieu">0/${cau}</span>`;
  return `<tr><td><span class="av" style="background:${MAU[i]}">${r[0].split(' ').pop()[0]}</span>${r[0]}</td><td><span class="pv" style="--w:${r[1]}%;--c:${mv}"><span>${r[1]}%</span></span></td><td>${o(r[2],r[3],60)}</td><td>${o(r[4],r[5],30)}</td><td>${o(r[6],r[7],60)}</td><td>${gp(tong)}</td></tr>`;
}).join('');
const dg=$('#dg');
$$('#dgTab button').forEach(t=>t.addEventListener('click',()=>{
  $$('#dgTab button').forEach(x=>x.classList.toggle('on',x===t));
  $$('.dg-panel').forEach((p,k)=>p.classList.toggle('on',k===+t.dataset.p));
  if(t.dataset.p==='1') veTienBo();
}));
const cot=$('#cot');
cot.innerHTML=[['25/9',38,22],['26/9',0,35],['27/9',21,48],['28/9',0,12],['29/9',8,5]].map(n=>`<div class="c"><i style="background:var(--sky)" data-h="${n[1]}"></i><i style="background:var(--mint)" data-h="${n[2]}"></i><small>${n[0]}</small></div>`).join('');
const ttSvg=$('#ttSvg');
(function(){
  const diem=[40,63,80,93,100],W=400,H=170,px=30,py=22,X=i=>px+i*(W-px*2)/(diem.length-1),Y=v=>H-py-(v/100)*(H-py*2);
  const pts=diem.map((v,i)=>[X(i),Y(v)]);let d=`M${pts[0]}`;
  for(let i=1;i<pts.length;i++){const[x0,y0]=pts[i-1],[x1,y1]=pts[i],c=(x0+x1)/2;d+=` C${c},${y0} ${c},${y1} ${x1},${y1}`;}
  ttSvg.innerHTML=`<defs><linearGradient id="gtt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6b55" stop-opacity=".25"/><stop offset="1" stop-color="#2f6b55" stop-opacity="0"/></linearGradient></defs>
  ${[0,50,100].map(v=>`<line class="luoi" x1="${px}" x2="${W-px}" y1="${Y(v)}" y2="${Y(v)}"/>`).join('')}
  <path class="vung" d="${d} L${pts.at(-1)[0]},${H-py} L${pts[0][0]},${H-py}Z"/><path class="duong" d="${d}"/>
  ${pts.map((p,i)=>`<circle class="diem" cx="${p[0]}" cy="${p[1]}" r="5"/><text x="${p[0]}" y="${p[1]-11}" text-anchor="middle" style="fill:#1c2431;font-weight:700">${diem[i]}%</text><text x="${p[0]}" y="${H-3}" text-anchor="middle">Lượt ${i+1}</text>`).join('')}`;
})();
function veTienBo(){
  dg.classList.remove('ve');$$('i',cot).forEach(i=>i.style.height='0');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{dg.classList.add('ve');$$('i',cot).forEach(i=>i.style.height=(i.dataset.h/80*100)+'%');}));
}

/* ---------- form ---------- */
const form=$('#form'),xong=$('#xong');
const kiem={'f-ph':v=>v.trim().length>=2,'f-sdt':v=>/^(\+?84|0)(3|5|7|8|9)\d{8}$/.test(v.replace(/[\s.\-]/g,'')),'f-con':v=>v.trim().length>=2,'f-ns':v=>v.trim().length>=4,'f-truong':v=>v.trim().length>=2,'f-lop':v=>v.trim().length>=1};
Object.keys(kiem).forEach(id=>{const el=$('#'+id);
  el.addEventListener('blur',()=>{if(el.value)el.closest('.fld').classList.toggle('sai',!kiem[id](el.value));});
  el.addEventListener('input',()=>el.closest('.fld').classList.remove('sai'));});
$('#f-ok').addEventListener('change',()=>$('#tick').classList.remove('sai'));
form.addEventListener('submit',e=>{
  e.preventDefault();let dau=null;
  Object.keys(kiem).forEach(id=>{const el=$('#'+id),ok=kiem[id](el.value);el.closest('.fld').classList.toggle('sai',!ok);if(!ok&&!dau)dau=el;});
  if(!$('#f-ok').checked){const t=$('#tick');t.classList.remove('sai');void t.offsetWidth;t.classList.add('sai');if(!dau)dau=$('#f-ok');}
  if(dau){dau.focus({preventScroll:true});return;}
  guiDangKy();
});

/* ---------- gửi phiếu lên Firebase (kho dangKyKNT — chỉ GHI, không đọc) ---------- */
const FB_SDK='https://www.gstatic.com/firebasejs/12.9.0';
const FB_CONFIG={apiKey:'AIzaSyAV_yoyAQM2fKKdOsJyuAxxf4AN7MsF7XY',authDomain:'aword-70dae.firebaseapp.com',projectId:'aword-70dae',
  storageBucket:'aword-70dae.firebasestorage.app',messagingSenderId:'399279049436',appId:'1:399279049436:web:b9b34dcfb34732aa744219'};
let _fb=null;
function fbDb(){
  if(!_fb) _fb=(async()=>{
    const appMod=await import(FB_SDK+'/firebase-app.js'), fsMod=await import(FB_SDK+'/firebase-firestore.js');
    const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(FB_CONFIG);
    return {fs:fsMod,db:fsMod.getFirestore(app)};
  })();
  return _fb;
}
const khongDau=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');
const chuanSdt=s=>{let x=s.replace(/[^0-9+]/g,'');if(x.startsWith('+84'))x='0'+x.slice(3);else if(x.startsWith('84')&&x.length===11)x='0'+x.slice(2);return x;};
const chamSdt=s=>s.length===10?s.slice(0,4)+'.'+s.slice(4,7)+'.'+s.slice(7):s;
const maCon=s=>khongDau(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'con';
const nutGui=form.querySelector('button[type=submit]'), guiLoi=$('#guiLoi');
let dangGui=false;
async function guiDangKy(){
  if(dangGui) return;
  const g=id=>$('#'+id).value.trim();
  const sdt=chuanSdt(g('f-sdt')), ten=g('f-ph');
  const hienXong=(daCo)=>{
    $('#xongTieuDe').textContent=daCo?'Thầy đã nhận đăng ký này!':'Đăng ký thành công!';
    $('#xongTxt').textContent=daCo
      ?`Phiếu của con ${g('f-con')} với số ${chamSdt(sdt)} đã có sẵn. Thầy Andrew sẽ liên hệ phụ huynh sớm.`
      :`Cảm ơn phụ huynh ${ten}. Thầy Andrew sẽ liên hệ qua số ${chamSdt(sdt)}.`;
    $('#xongTxt').append(document.createElement('br'),'Anh/chị cũng có thể liên hệ sớm với thầy qua số ',Object.assign(document.createElement('a'),{href:'tel:0359769765',textContent:'0359.769.765'}),'.');
    xong.classList.add('on');if(!daCo)phaoGiay();
  };
  if($('#f-web').value){hienXong(false);return;}          // ô bẫy máy spam: giả như xong, không gửi
  dangGui=true;nutGui.disabled=true;nutGui.classList.add('dang');guiLoi.textContent='';
  try{
    const {fs,db}=await fbDb();
    await fs.setDoc(fs.doc(db,'dangKyKNT',sdt+'_'+maCon(g('f-con'))),{
      phuHuynh:ten, soDienThoai:sdt, tenCon:g('f-con'), ngaySinh:g('f-ns').slice(0,40), truong:g('f-truong'), lop:g('f-lop'),
      nguyenVong:true, khoa:'NEN TANG K10', guiLuc:fs.serverTimestamp(), daXem:false, nguon:(location.hostname||'local').slice(0,40)
    });
    hienXong(false);
  }catch(err){
    // đã kiểm đủ trường phía máy ⇒ bị từ chối gần như chắc chắn là phiếu này đã có (trùng SĐT + tên con)
    if(String(err&&err.code).includes('permission')) hienXong(true);
    else guiLoi.textContent='Chưa gửi được (mạng chập chờn?). Phụ huynh bấm "Gửi đăng ký" lại giúp thầy nhé.';
  }finally{dangGui=false;nutGui.disabled=false;nutGui.classList.remove('dang');}
}
$('#xongLai').addEventListener('click',()=>{['f-ph','f-sdt','f-con','f-ns','f-truong','f-lop'].forEach(id=>$('#'+id).value='');$('#f-ok').checked=false;xong.classList.remove('on');});
function phaoGiay(){
  if(giam) return;
  const c=$('#conf'),x=c.getContext('2d'),dpr=devicePixelRatio;c.width=innerWidth*dpr;c.height=innerHeight*dpr;x.setTransform(dpr,0,0,dpr,0,0);
  const mau=['#b8893a','#e9cf97','#2f6b55','#46648f','#b8613f','#1c2431'];
  const ps=Array.from({length:200},()=>({x:innerWidth/2+(Math.random()-.5)*240,y:innerHeight*.55,vx:(Math.random()-.5)*16,vy:-Math.random()*18-6,r:Math.random()*6,vr:(Math.random()-.5)*.4,w:6+Math.random()*6,h:8+Math.random()*10,m:mau[Math.random()*6|0]}));
  let t=0;(function b(){x.clearRect(0,0,innerWidth,innerHeight);t++;
    ps.forEach(p=>{p.vy+=.45;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.m;x.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(t*.1+p.r)));x.restore();});
    if(t<200)requestAnimationFrame(b);else x.clearRect(0,0,innerWidth,innerHeight);})();
}
})();
