/* NỀN TẢNG TIẾNG ANH — cảnh 3D (v10): sách thật (dịu sáng) + Trái Đất · Sao Hỏa · Sao Thổ (vành đai) trên 3 quỹ đạo + chữ quanh sách + 6 dụng cụ học tập */
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const canvas=document.getElementById('scene');
const loaderEl=document.getElementById('loader'), bar=document.getElementById('loaderBar');
const stage=document.getElementById('heroStage');
const giam=matchMedia('(prefers-reduced-motion: reduce)').matches;
const diDong=matchMedia('(max-width: 900px)').matches;
let daXong=false;
// v16: màn chờ do main.js quản (đợi đủ MỌI ảnh + phông + cảnh 3D); ở đây chỉ báo cảnh 3D đã sẵn sàng
function xongLoader(){if(daXong)return;daXong=true;window.__canh3d=1;dispatchEvent(new Event('canh3d-xong'));}

let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});}
catch(e){
  canvas.style.display='none';
  const img=new Image();img.src='assets/cover-front.jpg';img.alt='Sách Nền Tảng Tiếng Anh';
  img.style.cssText='position:absolute;left:50%;top:50%;height:74%;transform:translate(-50%,-52%) rotate(-6deg);border-radius:6px;box-shadow:0 30px 60px -20px rgba(60,50,120,.5)';
  stage.appendChild(img);xongLoader();
}

if(renderer){
renderer.setPixelRatio(Math.min(devicePixelRatio,diDong?1.6:1.8));
renderer.setSize(innerWidth,innerHeight,false);
renderer.setClearColor(0x000000,0);
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.86;
renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.1,200);
camera.position.set(0,0,10);
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(renderer),.04).texture;
scene.environmentIntensity=.45;

scene.add(new THREE.HemisphereLight(0xfbf6ec,0xd8dde0,.95));
const key=new THREE.DirectionalLight(0xffffff,1.15);key.position.set(-4,6,7);scene.add(key);
const fill=new THREE.DirectionalLight(0xe8e2d6,.7);fill.position.set(6,-2,4);scene.add(fill);

/* ---------- ảnh ---------- */
const mgr=new THREE.LoadingManager();
mgr.onProgress=(u,l,t)=>{window.__canh3dTien=l/t;dispatchEvent(new Event('canh3d-tien'));};
const tl=new THREE.TextureLoader(mgr), aniso=renderer.capabilities.getMaxAnisotropy();
const tai=s=>{const t=tl.load(s);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=aniso;return t;};
const texFront=tai('assets/cover-front.jpg'),texBack=tai('assets/cover-back.jpg'),texSpine=tai('assets/cover-spine.jpg');
const canvasTex=c=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=aniso;return t;};

function vanGiay(ngang){
  const c=document.createElement('canvas');c.width=ngang?512:64;c.height=ngang?64:512;
  const x=c.getContext('2d');x.fillStyle='#f6efe0';x.fillRect(0,0,c.width,c.height);
  const n=ngang?c.height:c.width;
  for(let i=0;i<n;i++){x.fillStyle=`rgba(150,130,100,${Math.random()*.25})`;if(ngang)x.fillRect(0,i,c.width,1);else x.fillRect(i,0,1,c.height);}
  return canvasTex(c);
}

/* ---------- cuốn sách ---------- */
const W=1.8,H=2.6,D=.17,B=.014;
const sach=new THREE.Group();
const bia=map=>new THREE.MeshPhysicalMaterial({map,color:0xe8e8e8,roughness:.55,clearcoat:.25,clearcoatRoughness:.45});
const mep=new THREE.MeshStandardMaterial({color:0x2e6b2c,roughness:.55});
const gd=new THREE.MeshStandardMaterial({map:vanGiay(false),roughness:.9}),gn=new THREE.MeshStandardMaterial({map:vanGiay(true),roughness:.9});
const truoc=new THREE.Mesh(new THREE.BoxGeometry(W,H,B),[mep,mep,mep,mep,bia(texFront),mep]);truoc.position.z=D/2-B/2;sach.add(truoc);
const sau=new THREE.Mesh(new THREE.BoxGeometry(W,H,B),[mep,mep,mep,mep,mep,bia(texBack)]);sau.position.z=-D/2+B/2;sach.add(sau);
const gay=new THREE.Mesh(new THREE.BoxGeometry(B,H,D),[mep,bia(texSpine),mep,mep,mep,mep]);gay.position.x=-W/2+B/2;sach.add(gay);
const ruot=new THREE.Mesh(new THREE.BoxGeometry(W-.05,H-.05,D-B*2),[gd,gd,gn,gn,gd,gd]);ruot.position.x=.01;sach.add(ruot);
const khung=new THREE.Group(),xoay=new THREE.Group();xoay.add(sach);khung.add(xoay);scene.add(khung);

// bóng mềm dưới sách
const bc=document.createElement('canvas');bc.width=bc.height=128;{const x=bc.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(28,36,49,.5)');g.addColorStop(1,'rgba(28,36,49,0)');x.fillStyle=g;x.fillRect(0,0,128,128);}
const bong=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.9),new THREE.MeshBasicMaterial({map:canvasTex(bc),transparent:true,depthWrite:false,opacity:.5}));
bong.position.set(0,-1.95,-.3);khung.add(bong);

/* ---------- 3 vòng quỹ đạo + Trái Đất, Sao Hỏa, Sao Mộc ---------- */
const vang=new THREE.MeshPhysicalMaterial({color:0xc9a15c,metalness:1,roughness:.28,clearcoat:.4});
const halo=new THREE.Group();khung.add(halo);
const vongHat=new THREE.Group();halo.add(vongHat);if(diDong)vongHat.scale.setScalar(.8);
// nhiễu mịn để vẽ bề mặt hành tinh
function nhieu(seed){
  const P=new Uint8Array(512);const a=[...Array(256).keys()];let s=seed;
  for(let i=255;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  for(let i=0;i<512;i++)P[i]=a[i&255];
  const f=t=>t*t*(3-2*t),h=(x,y)=>P[P[x&255]+(y&255)]/255;
  const n=(x,y)=>{const X=Math.floor(x),Y=Math.floor(y),u=f(x-X),v=f(y-Y);
    return (h(X,Y)*(1-u)+h(X+1,Y)*u)*(1-v)+(h(X,Y+1)*(1-u)+h(X+1,Y+1)*u)*v;};
  return (x,y,o=5)=>{let t=0,A=.5,F=1;for(let i=0;i<o;i++){t+=A*n(x*F,y*F);A*=.5;F*=2;}return t;};
}
function beMat(ve){
  const W2=256,H2=128,c=document.createElement('canvas');c.width=W2;c.height=H2;
  const x=c.getContext('2d'),im=x.createImageData(W2,H2);
  for(let j=0;j<H2;j++)for(let i=0;i<W2;i++){const [r,g,b]=ve(i/W2,j/H2),k=(j*W2+i)*4;im.data[k]=r;im.data[k+1]=g;im.data[k+2]=b;im.data[k+3]=255;}
  x.putImageData(im,0,0);return canvasTex(c);
}
const n1=nhieu(7),n2=nhieu(41),n3=nhieu(99);
const tron=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const texDat=beMat((u,v)=>{ // Trái Đất: biển xanh, lục địa xanh lá/nâu, mây trắng, cực băng
  const lat=Math.abs(v-.5)*2, d=n1(u*6,v*3.4), may=n2(u*9,v*5);
  let m=d>.53?tron([72,122,62],[150,128,86],Math.min(1,(d-.53)*6)):tron([22,74,140],[40,112,176],d/.53);
  if(lat>.86) m=[236,242,246];
  if(may>.6) m=tron(m,[250,250,252],Math.min(1,(may-.6)*4));
  return m;});
const texHoa=beMat((u,v)=>{ // Sao Hỏa: đỏ gỉ, mảng sẫm
  const d=n2(u*7,v*4), e=n3(u*16,v*9);
  let m=tron([196,98,52],[150,62,36],Math.max(0,Math.min(1,(d-.42)*3)));
  m=tron(m,[222,140,90],Math.max(0,e-.62)*2);
  if(Math.abs(v-.5)>.46) m=[240,226,214];
  return m;});
const texTho=beMat((u,v)=>{ // Sao Thổ: dải vàng kem dịu
  const w=v+(n3(u*6,v*5)-.5)*.03, b=Math.sin(w*Math.PI*11)*.5+.5;
  return tron([236,214,168],[196,160,104],b*b*.8);});
function vanhDai(ht,co){ // vành đai nhiều lớp, trong suốt dần
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),R=256;
  const trong=1.3/2.3; // bán kính trong / ngoài
  for(let i=0;i<220;i++){const t=i/220,r=R*(trong+(1-trong)*t);
    const gap=(t>.58&&t<.63)?.08:1, a=(.62+.3*Math.sin(t*38)*Math.sin(t*9)**2+.12*Math.random())*gap*(1-Math.pow(t,8));
    x.strokeStyle=`rgba(${214-60*t|0},${178-70*t|0},${120-50*t|0},${Math.max(0,Math.min(1,a))})`;x.lineWidth=R*(1-trong)/220*1.6;x.beginPath();x.arc(R,R,r,0,Math.PI*2);x.stroke();}
  const vd=new THREE.Mesh(new THREE.RingGeometry(co*1.3,co*2.3,128),new THREE.MeshStandardMaterial({map:canvasTex(c),transparent:true,side:THREE.DoubleSide,roughness:.9,depthWrite:false}));
  vd.rotation.x=-Math.PI/2+.42;ht.add(vd);return vd;
}
const hanhTinh=[];
// [bán kính vòng, góc nghiêng, tốc độ, cỡ hành tinh, bề mặt, tên]
[[2.15,[1.22,.22,0],.5,.19,texDat],[2.45,[1.05,-.45,.25],.36,.16,texHoa],[2.75,[1.38,.12,-.3],.26,.19,texTho]].forEach(([r,rot,tocDo,co,tex],i)=>{
  const g=new THREE.Group();g.rotation.set(...rot);
  g.add(new THREE.Mesh(new THREE.TorusGeometry(r,.009,12,240),vang));
  const ht=new THREE.Mesh(new THREE.SphereGeometry(co,48,32),new THREE.MeshStandardMaterial({map:tex,roughness:.85,metalness:0}));
  ht.rotation.x=-rot[0];g.add(ht);if(tex===texTho)vanhDai(ht,co);
  g.userData={r,tocDo,lech:i*2.1};vongHat.add(g);hanhTinh.push(ht);
});

/* ---------- chữ tiếng Anh bay quanh (Montserrat) ---------- */
const CHU=[['Is there any milk in the fridge?','#9c5b67'],['He never gets up late on Sundays.','#3b7a7d'],['Whose bag is this? It’s Linh’s.','#1c2431'],['Are they watching TV at the moment?','#b8893a'],['How often do you read books?','#1c2431'],['She is playing the piano now.','#2f6b55'],['They didn’t go to school yesterday.','#b8893a'],['Where will you live in the future?','#46648f'],['My brother can’t swim very well.','#1c2431'],['Does your father usually cook dinner?','#2f6b55'],['We were at the library last night.','#b8893a'],['What is your best friend doing?','#46648f']];
const CUM=[['twice a week','#b8893a'],['at the weekend','#2f6b55'],['a lot of homework','#1c2431'],['in the morning','#46648f'],['next summer','#b8893a'],['on the table','#2f6b55'],['every day','#1c2431'],['right now','#46648f'],['How much…?','#b8893a'],['last year','#2f6b55'],['because','#1c2431'],['these books','#46648f'],['Are you ready?','#9c5b67'],['Yes, I can.','#2f6b55'],['No, she isn’t.','#b8613f'],['my favourite subject','#46648f'],['What time is it?','#1c2431'],['at 7 o’clock','#b8893a'],['in front of the house','#3b7a7d'],['some water','#2f6b55'],['an orange','#b8613f'],['How old are you?','#46648f'],['usually','#9c5b67'],['my father’s car','#1c2431']];
const chus=[];
function bongChu(s,mau){
  const f=42,c=document.createElement('canvas'),x=c.getContext('2d');
  x.font=`700 ${f}px "Montserrat",sans-serif`;const w=Math.ceil(x.measureText(s).width)+70,h=f+44;
  c.width=w;c.height=h+10;
  x.fillStyle='rgba(28,36,49,.08)';x.beginPath();x.roundRect(4,10,w-8,h-6,h/2);x.fill();
  x.fillStyle='rgba(255,255,255,.95)';x.beginPath();x.roundRect(2,2,w-4,h-4,h/2);x.fill();
  x.strokeStyle='rgba(184,137,58,.35)';x.lineWidth=2;x.stroke();
  x.font=`700 ${f}px "Montserrat",sans-serif`;x.textBaseline='middle';x.textAlign='center';x.fillStyle=mau;x.fillText(s,w/2,h/2+2);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:canvasTex(c),transparent:true,depthWrite:false,opacity:0}));
  const k=diDong?.0036:.0027;sp.scale.set(c.width*k,c.height*k,1);return sp;
}
document.fonts.load('700 50px "Montserrat"').catch(()=>{}).then(()=>{
  CHU.forEach(([s,m])=>{const sp=bongChu(s,m);sp.userData={nhom:'dai'};halo.add(sp);chus.push(sp);});
  CUM.forEach(([s,m])=>{const sp=bongChu(s,m);sp.scale.multiplyScalar(.9);sp.userData={nhom:'ngan'};halo.add(sp);chus.push(sp);});
});

/* ---------- dụng cụ học tập bay khắp trang (bo tròn, không đầu nhọn) ---------- */
const nhua=(c,r=.45)=>new THREE.MeshPhysicalMaterial({color:c,roughness:r,clearcoat:.5,clearcoatRoughness:.35});

// thước kẻ: gỗ sáng, vạch chia + số
function thuoc(){
  const c=document.createElement('canvas');c.width=1024;c.height=160;const x=c.getContext('2d');
  x.fillStyle='#e8d3a6';x.fillRect(0,0,1024,160);
  for(let i=0;i<60;i++){x.fillStyle=`rgba(160,120,60,${Math.random()*.08})`;x.fillRect(0,Math.random()*160,1024,1+Math.random()*2);}
  x.strokeStyle='#5a4526';x.lineWidth=3;
  for(let i=0;i<=50;i++){const px=40+i*18.9,d=i%10===0?64:i%5===0?44:28;x.beginPath();x.moveTo(px,0);x.lineTo(px,d);x.stroke();
    if(i%10===0){x.fillStyle='#5a4526';x.font='600 30px Montserrat,sans-serif';x.textAlign='center';x.fillText(i/10,px,100);}}
  const mat=new THREE.MeshStandardMaterial({map:canvasTex(c),roughness:.6});
  const canh=new THREE.MeshStandardMaterial({color:0xd9bf8b,roughness:.6});
  return new THREE.Mesh(new RoundedBoxGeometry(2.1,.33,.045,3,.02),[canh,canh,canh,canh,mat,mat]);
}
// bút sáp màu: thân tròn + vỏ giấy + đầu bo tròn
function sap(mau){
  const g=new THREE.Group(), m=nhua(mau,.55);
  const pts=[];const L=.72,R=.075;
  pts.push(new THREE.Vector2(0,-L/2));pts.push(new THREE.Vector2(R,-L/2));pts.push(new THREE.Vector2(R,L/2));
  for(let i=0;i<=10;i++){const t=i/10;pts.push(new THREE.Vector2(R-(R-.03)*t,L/2+.13*t));}
  for(let i=1;i<=6;i++){const a=i/6*Math.PI/2;pts.push(new THREE.Vector2(.03*Math.cos(a),L/2+.13+.03*Math.sin(a)));}
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts,32),m));
  const vc=document.createElement('canvas');vc.width=256;vc.height=64;const x=vc.getContext('2d');
  x.fillStyle='#f3ecdf';x.fillRect(0,0,256,64);x.fillStyle=new THREE.Color(mau).getStyle();x.fillRect(0,0,256,8);x.fillRect(0,56,256,8);
  x.globalAlpha=.8;x.fillRect(40,26,176,12);
  const vo=new THREE.Mesh(new THREE.CylinderGeometry(R+.006,R+.006,.46,32,1,true),new THREE.MeshStandardMaterial({map:canvasTex(vc),roughness:.8}));
  vo.position.y=-.06;g.add(vo);
  return g;
}
// compa: tay cầm + khớp + 2 chân bo tròn (không kim)
function compa(){
  const g=new THREE.Group(), kim=new THREE.MeshPhysicalMaterial({color:0xb9bec6,metalness:1,roughness:.3}), den=nhua(0x2a3342,.4);
  const tay=new THREE.Mesh(new THREE.CapsuleGeometry(.045,.16,6,16),den);tay.position.y=.72;g.add(tay);
  const khop=new THREE.Mesh(new THREE.SphereGeometry(.09,24,24),vang);khop.position.y=.55;g.add(khop);
  [-1,1].forEach(s=>{
    const chan=new THREE.Group();chan.position.y=.55;chan.rotation.z=s*.28;
    const than=new THREE.Mesh(new THREE.CapsuleGeometry(.032,.95,6,16),kim);than.position.y=-.5;chan.add(than);
    const dau=new THREE.Mesh(new THREE.SphereGeometry(.045,16,16),s<0?den:nhua(0x5b6472));dau.position.y=-1;chan.add(dau);
    g.add(chan);
  });
  g.position.y=-.1;const bo=new THREE.Group();bo.add(g);return bo;
}
// giấy vẽ cuộn + nơ buộc
function cuonGiay(){
  const g=new THREE.Group();
  const t=tai('assets/page-004.jpg');t.wrapS=THREE.RepeatWrapping;
  const giay=new THREE.MeshStandardMaterial({map:t,roughness:.85});
  const mep=new THREE.MeshStandardMaterial({color:0xf3ecdf,roughness:.9});
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,1.15,40),[giay,mep,mep]));
  const no=new THREE.Mesh(new THREE.TorusGeometry(.14,.018,12,48),nhua(0xb8613f,.5));no.rotation.x=Math.PI/2;g.add(no);
  return g;
}
// cục tẩy: thân trắng + bao giấy màu
function tay(mau){
  const g=new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(.62,.26,.2,3,.06),nhua(0xf4f1ea,.6)));
  const bao=new THREE.Mesh(new RoundedBoxGeometry(.34,.28,.22,3,.03),nhua(mau,.5));bao.position.x=.12;g.add(bao);
  return g;
}
// tờ giấy (trang sách thật) cong nhẹ
const geoGiay=(()=>{const g=new THREE.PlaneGeometry(1.05,1.52,16,1),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,-Math.cos(x/1.05*Math.PI)*.07);}g.computeVertexNormals();return g;})();
const toGiay=src=>new THREE.Mesh(geoGiay,new THREE.MeshStandardMaterial({map:tai(src),roughness:.85,side:THREE.DoubleSide}));

const dochoi=[];
const toa=[ // chỉ 6 món, xếp gọn quanh mép màn đầu: x, y (tỉ lệ nửa khung), z, loại, thêm
  [-.82,.7,-2.5,'thuoc'],[.8,.72,-3.5,'compa'],[.86,-.66,-2,'sap',0xb8613f],
  [-.84,-.66,-3.5,'giay','assets/page-045.jpg'],[.55,-.92,-4.5,'cuon'],[-.28,.9,-5,'sap',0x46648f],
];
// điện thoại (≤700px): KHÔNG có đồ dùng học tập ở màn đầu (thầy: màn nhỏ trông rối)
(matchMedia('(max-width: 700px)').matches?[]:diDong?toa.slice(0,4):toa).forEach(t=>{
  let m;
  switch(t[3]){
    case 'thuoc':m=thuoc();break;
    case 'sap':m=sap(t[4]);break;
    case 'compa':m=compa();break;
    case 'cuon':m=cuonGiay();break;
    case 'tay':m=tay(t[4]);break;
    default:m=toGiay(t[4]);
  }
  m.userData={nx:t[0],ny:t[1],z:t[2],ph:Math.random()*6,giay:true,pl:.4+Math.random()*.8};
  m.rotation.set((Math.random()-.5)*1.4,(Math.random()-.5)*1.4,(Math.random()-.5)*2.4);
  scene.add(m);dochoi.push(m);
});

/* ---------- đặt sách theo khung hero ---------- */
const tam=new THREE.Vector3();let tyLe=1;
function datKhung(){
  const r=stage.getBoundingClientRect();
  const nx=((r.left+r.width/2)/innerWidth)*2-1, ny=-(((r.top+r.height/2)/innerHeight)*2-1);
  const v=new THREE.Vector3(nx,ny,.5).unproject(camera).sub(camera.position).normalize();
  tam.copy(camera.position).addScaledVector(v,-camera.position.z/v.z);
  const cao=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z;
  tyLe=(r.height/innerHeight)*cao*(innerWidth<900?.6:.55)/H;
}
function nuaKhung(z){const d=camera.position.z-z,h=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*d;return[h*camera.aspect,h];}

/* ---------- kéo xoay ---------- */
let keoTay=false,lx=0,vy=0,keoY=0,mx=0,my=0,smx=0,smy=0;
stage.addEventListener('pointerdown',e=>{keoTay=true;lx=e.clientX;vy=0;stage.setPointerCapture(e.pointerId);stage.style.cursor='grabbing';});
stage.addEventListener('pointermove',e=>{if(!keoTay)return;const dx=e.clientX-lx;lx=e.clientX;vy=dx*.012;keoY+=vy;});
const tha=()=>{keoTay=false;stage.style.cursor='grab';};
stage.addEventListener('pointerup',tha);stage.addEventListener('pointercancel',tha);
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;},{passive:true});

let t0=null;
mgr.onLoad=()=>{xongLoader();const bd=()=>{t0=performance.now();};if(window.__trangHien)bd();else addEventListener('trang-hien',bd,{once:true});};
mgr.onError=()=>{};

function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.position.z=innerWidth<900?12:10;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();

const ease=x=>1-Math.pow(1-x,4);
const clock=new THREE.Clock();
function lap(){
  requestAnimationFrame(lap);
  if(document.hidden) return;
  const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime,cuon=scrollY/innerHeight;
  datKhung();
  const vao=t0===null?0:(giam?1:Math.min(1,(performance.now()-t0)/2000)),e=ease(vao);
  smx+=(mx-smx)*.05;smy+=(my-smy)*.05;
  if(!keoTay){keoY+=vy;vy*=.95;}

  khung.position.set(tam.x,tam.y+(giam?0:Math.sin(t*.9)*.1),(1-e)*-18);
  khung.scale.setScalar(tyLe*(.5+.5*e));
  khung.visible=cuon<1.3;
  xoay.rotation.y=-.45+(giam?0:Math.sin(t*.4)*.22)+keoY+smx*.5+cuon*2.4+(1-e)*Math.PI*2.5;
  xoay.rotation.x=.08+smy*.22-cuon*.2+(1-e)*.5;
  xoay.rotation.z=-.05;
  bong.material.opacity=.45*e*(1-Math.min(1,cuon*2));
  vongHat.children.forEach(g=>{const u=g.userData,w=t*u.tocDo+u.lech;g.children[1].position.set(Math.cos(w)*u.r,Math.sin(w)*u.r,0);g.visible=e>.25;});
  hanhTinh.forEach((h,i)=>h.rotation.y=i===2?.35+Math.sin(t*.3)*.25:t*(.5+i*.15));
  // 5 ô quanh sách: 2 ô câu dài (trên/dưới) + 3 ô cụm ngắn (hai bên); mỗi ô lần lượt hiện rồi mờ, lệch nhịp nhau
  if(chus.length){
    const P=4.2, O=[['dai',-.15,1.74,0],['dai',.25,-1.6,.5],['ngan',1.42,.78,.2],['ngan',1.5,-.62,.7],['ngan',-1.2,1.3,.45],['ngan',-1.42,-.9,.9]];
    chus.forEach(c=>c.material.opacity=0);
    const dai=chus.filter(c=>c.userData.nhom==='dai'), ngan=chus.filter(c=>c.userData.nhom==='ngan');
    const dem={dai:0,ngan:0}, soO={dai:2,ngan:4};
    O.forEach(([nh,x,y,lech])=>{
      const ds=nh==='dai'?dai:ngan; if(!ds.length) return;
      const thu=dem[nh]++, ts=t+lech*P, n=Math.floor(ts/P), ph=(ts%P)/P;
      const c=ds[(n*soO[nh]+thu)%ds.length];
      const op=Math.max(0,Math.min(1,ph/.14,(1-ph)/.14));
      c.material.opacity=e*op*(nh==='ngan'?.92:1);
      c.position.set(x,y+(ph-.5)*.12,.35);
    });
  }


  // đồ chơi: bám mép màn hình, trôi lên khi cuộn
  dochoi.forEach(m=>{
    const u=m.userData,[hx,hy]=nuaKhung(u.z);
    // rời màn đầu ⇒ trôi thẳng ra ngoài khung theo hướng của mình rồi ẩn
    const k=Math.min(1,Math.max(0,cuon/.85)),ra=k*k*(3-2*k);
    const dl=Math.hypot(u.nx,u.ny)||1;
    m.visible=ra<.999;
    m.position.set(u.nx*hx+u.nx/dl*ra*hx*1.1+smx*(.6/(1+Math.abs(u.z)*.2)),
                   u.ny*hy+u.ny/dl*ra*hy*1.1+(giam?0:Math.sin(t*.8+u.ph)*.14),u.z);
    if(u.giay){if(!u.r0)u.r0=m.rotation.clone();if(!giam)m.rotation.set(u.r0.x+Math.sin(t*.3+u.ph)*.3,u.r0.y+Math.sin(t*.22+u.ph)*.45,u.r0.z+Math.sin(t*.18+u.ph)*.12);}
    else if(!giam){m.rotation.x+=u.vr.x*dt;m.rotation.y+=u.vr.y*dt;m.rotation.z+=u.vr.z*dt;}
    const s=Math.min(1,e*1.5);m.scale.setScalar(s);
  });
  renderer.render(scene,camera);
}
lap();
}
