document.documentElement.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Procedural 3D upper assembly, inspired by the Apollo 1 / AS-204 stack.
// Geometry is illustrative, not an engineering reconstruction. No remote model
// or rendering library is required: WebGL depth-tests each opaque triangle.
const canvas = document.getElementById('rocket');
const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
const faces = [];
const white = [218, 218, 211], silver = [161, 170, 176], dark = [27, 30, 33];
const sub = (a,b) => a.map((v,i) => v-b[i]);
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit = v => { const n = Math.hypot(...v)||1; return v.map(x=>x/n); };
const point = (r,y,a) => [r*Math.cos(a),y,r*Math.sin(a)];
function face(vertices,color){
  let n=cross(sub(vertices[1],vertices[0]),sub(vertices[2],vertices[0]));
  if(Math.hypot(...n)<1e-10)n=cross(sub(vertices[2],vertices[0]),sub(vertices[3],vertices[0]));
  faces.push({vertices,color,normal:unit(n)});
}
function shell(y0,y1,r0,r1,color=white,segments=64,start=0,end=Math.PI*2){
  for(let i=0;i<segments;i++){
    const a=start+(end-start)*i/segments,b=start+(end-start)*(i+1)/segments;
    face([point(r0,y0,a),point(r1,y1,a),point(r1,y1,b),point(r0,y0,b)],typeof color==='function'?color(i):color);
  }
}
function band(y,r,color=silver,h=.045){shell(y,y+h,r,r,color);}
function rod(a,b,r=.025,color=silver){
  const axis=unit(sub(b,a)),u=unit(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);
  const end=(p,t)=>p.map((x,i)=>x+r*(u[i]*Math.cos(t)+v[i]*Math.sin(t)));
  for(let i=0;i<8;i++){const t=i*Math.PI/4,n=(i+1)*Math.PI/4;face([end(a,t),end(a,n),end(b,n),end(b,t)],color);}
}

// S-IVB upper stage, instrument unit and tapered spacecraft adapter.
shell(-2,2.6,1.65,1.65,white);
shell(2.6,3.6,1.65,1.65,i=>Math.floor(i/8)%2?white:dark);
shell(3.6,4.7,1.65,1.65,white);
for(let i=0;i<80;i++){
  const a=i*Math.PI/40;
  rod(point(1.66,-1.5,a),point(1.66,2.55,a),.009,[163,166,164]);
}
for(const y of [0,2.55,3.62,4.4,4.67])band(y,1.67);
shell(4.72,5.05,1.66,1.66,dark);
band(4.74,1.68,silver);band(5.01,1.68,silver);
shell(5.06,7.9,1.65,1.02,white);
for(let i=0;i<4;i++){
  const a=i*Math.PI/2;
  rod(point(1.655,5.1,a),point(1.026,7.9,a),.014,[103,107,108]);
}
band(7.9,1.04);

// Service module: separate panels, radiator strips and four RCS clusters.
shell(7.95,10.5,1.02,1.02,silver);
for(let i=0;i<12;i++){
  const a=i*Math.PI/6;
  rod(point(1.025,8,a),point(1.025,10.48,a),.012,[67,74,79]);
  if(i%3!==0){
    shell(8.12,9.8,1.034,1.034,white,6,a+.06,a+.45);
    for(let j=0;j<8;j++)shell(8.23+j*.18,8.25+j*.18,1.039,1.039,[124,132,135],6,a+.07,a+.44);
  }
}
for(const y of [7.98,10.36,10.49])band(y,1.045,[200,202,200]);
for(let i=0;i<4;i++){
  const a=Math.PI/4+i*Math.PI/2,p=point(1.07,9.98,a);
  rod(point(1,9.98,a),point(1.3,9.98,a),.09,silver);
  for(const dy of [-.12,.12])rod([p[0],p[1]+dy,p[2]],point(1.38,9.98+dy,a),.055,dark);
  rod(point(1.2,9.78,a),point(1.2,10.18,a),.055,dark);
}

// Command module and boost protective cover, with panel lines and access hatch.
shell(10.54,12.12,1.06,.23,white);
band(10.53,1.075,[93,98,101],.07);
shell(12.12,12.27,.23,.23,silver);
for(let i=0;i<8;i++){
  const a=i*Math.PI/4;
  rod(point(1.065,10.56,a),point(.24,12.1,a),.007,[130,133,131]);
}
// Match overlays to the capsule slope and keep each layer clear of its surface.
const capsuleRadius = y => 1.06 - (y - 10.54) * .83 / 1.58;
function capsulePanel(y0,y1,offset,color,start,end){
  shell(y0,y1,capsuleRadius(y0)+offset,capsuleRadius(y1)+offset,color,16,start,end);
}
capsulePanel(10.8,11.4,.018,[117,123,124],.95,1.48);
capsulePanel(10.84,11.36,.035,[202,204,199],.99,1.44);
capsulePanel(11.45,11.62,.02,dark,2.25,2.54);
capsulePanel(11.45,11.62,.02,dark,3.73,4.02);

// Open launch escape tower: four legs, diagonal braces, motor and nozzles.
for(let i=0;i<4;i++){
  const a=Math.PI/4+i*Math.PI/2,b=a+Math.PI/2;
  const bottom=point(.69,11.45,a),middle=point(.43,12.72,a),top=point(.26,13.8,a);
  rod(bottom,top,.036,white);
  rod(middle,point(.43,12.72,b),.025,white);
  rod(bottom,point(.43,12.72,b),.023,white);
  rod(middle,point(.26,13.8,b),.023,white);
  rod(point(.18,13.92,a),point(.48,13.52,a),.075,[84,88,90]);
}
shell(13.8,16.15,.23,.23,white,40);
for(const y of [13.84,14.15,15.42,16.1])band(y,.243,silver,.035);
shell(16.15,16.55,.23,.13,white,40);
shell(16.55,17.05,.13,0,white,40);
rod([0,17,0],[0,17.38,0],.018,silver);

// A real depth buffer resolves intersecting trusses and long body panels per
// pixel. Average-depth painter sorting cannot render these surfaces correctly.
let width=550,height=800,raf=0,angle=.6,lastTime=0,inView=true;
let program, uniforms, vertexCount=0;
function shader(type,source){
  const result=gl.createShader(type);gl.shaderSource(result,source);gl.compileShader(result);
  if(!gl.getShaderParameter(result,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(result));
  return result;
}
function initRenderer(){
  const vertex=shader(gl.VERTEX_SHADER,`
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec3 color;
    uniform float angle;
    uniform vec2 resolution;
    varying mediump vec3 vNormal;
    varying mediump vec3 vColor;
    vec3 rotate(vec3 p){
      float c=cos(angle),s=sin(angle);
      vec3 v=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);
      float tilt=0.12,roll=0.21;
      v=vec3(v.x,v.y*cos(tilt)-v.z*sin(tilt),v.y*sin(tilt)+v.z*cos(tilt));
      return vec3(v.x*cos(roll)+v.y*sin(roll),v.y*cos(roll)-v.x*sin(roll),v.z);
    }
    void main(){
      vec3 p=rotate(position-vec3(0.,8.,0.));
      float distance=38.-p.z;
      float scale=min(resolution.y/20.,resolution.x/8.);
      // Perspective clip coordinates, near=20 and far=60 model units.
      gl_Position=vec4(p.x*scale*76./resolution.x-.02*distance,
                       p.y*scale*76./resolution.y,
                       2.*distance-60.,distance);
      vNormal=rotate(normal);vColor=color;
    }
  `);
  const fragment=shader(gl.FRAGMENT_SHADER,`
    precision mediump float;
    varying mediump vec3 vNormal;
    varying mediump vec3 vColor;
    void main(){
      vec3 n=normalize(vNormal);
      float light=max(0.,dot(n,normalize(vec3(-.55,.35,.76))));
      float rim=pow(max(0.,dot(n,normalize(vec3(.9,0.,.35)))),3.);
      float spec=pow(max(0.,dot(n,normalize(vec3(-.3,.15,.94)))),18.);
      vec3 rgb=vColor*(.20+.78*light)+rim*vec3(.263,.098,.024)+spec*.137;
      gl_FragColor=vec4(rgb,1.);
    }
  `);
  program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  gl.deleteShader(vertex);gl.deleteShader(fragment);gl.useProgram(program);
  const data=[];
  for(const f of faces){
    // Quads become independent triangles. No alpha blending or edge strokes.
    for(const triangle of [[0,1,2],[0,2,3]]){
      const [a,b,c]=triangle.map(i=>f.vertices[i]);
      if(Math.hypot(...cross(sub(b,a),sub(c,a)))<1e-10)continue;
      for(const i of triangle)data.push(...f.vertices[i],...f.normal,...f.color.map(v=>v/255));
    }
  }
  vertexCount=data.length/9;
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
  ['position','normal','color'].forEach((name,i)=>{
    const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,36,i*12);
  });
  uniforms={angle:gl.getUniformLocation(program,'angle'),resolution:gl.getUniformLocation(program,'resolution')};
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LESS);gl.depthMask(true);
  gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
}
function resize(){
  const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));
  if(gl)gl.viewport(0,0,canvas.width,canvas.height);
}
function render(){
  if(!gl||gl.isContextLost()||!program)return;
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.uniform1f(uniforms.angle,angle);gl.uniform2f(uniforms.resolution,width,height);
  gl.drawArrays(gl.TRIANGLES,0,vertexCount);
}
function tick(time){
  if(!inView||document.hidden){raf=0;return;}
  if(!lastTime||time-lastTime>=32){
    if(lastTime)angle+=Math.min(time-lastTime,100)*.000085;
    lastTime=time;render();
  }
  raf=requestAnimationFrame(tick);
}
function restart(){
  cancelAnimationFrame(raf);raf=0;lastTime=0;
  if(!gl||gl.isContextLost()||!program||!inView||document.hidden)return;
  render();if(!reducedMotion.matches)raf=requestAnimationFrame(tick);
}
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;restart();}).observe(canvas);
window.addEventListener('resize',()=>{resize();restart();});
document.addEventListener('visibilitychange',restart);
reducedMotion.addEventListener('change',restart);
if(gl){
  initRenderer();resize();restart();
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(raf);});
  canvas.addEventListener('webglcontextrestored',()=>{initRenderer();resize();restart();});
}else{
  // The research content remains usable on devices without WebGL.
  canvas.parentElement.hidden=true;
}

