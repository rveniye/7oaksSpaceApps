const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../dist/script.js'), 'utf8');

// Contract tests for geometry and renderer configuration. Shader compilation
// and visual appearance still require a browser with a real WebGL context.
function setup(available = true) {
  const calls = [], events = {}, frames = new Map();
  let next = 0, mesh;
  const gl = new Proxy({}, { get(_, name) {
    if (name === name.toUpperCase()) return name;
    return (...args) => {
      calls.push([name, ...args]);
      if (name === 'bufferData') mesh = args[1];
      if (name === 'getShaderParameter' || name === 'getProgramParameter') return true;
      if (name === 'isContextLost') return false;
      if (name.startsWith('create')) return {};
      if (name === 'getAttribLocation') return ['position','normal','color'].indexOf(args[1]);
      if (name === 'getUniformLocation') return args[1];
    };
  }});
  const canvas = { parentElement: {}, getContext: () => available ? gl : null,
    getBoundingClientRect: () => ({ width: 550, height: 800 }),
    addEventListener: (name, fn) => events[name] = fn };
  const motion = { matches: false, addEventListener: (_, fn) => events.motion = fn };
  const document = { hidden: false, documentElement: { classList: { add() {} } },
    getElementById: () => canvas, querySelectorAll: () => [],
    addEventListener: (name, fn) => events[name] = fn };
  vm.runInNewContext(source, {
    document, window: { devicePixelRatio: 2, matchMedia: () => motion,
      addEventListener: (name, fn) => events[name] = fn },
    IntersectionObserver: class { observe() {} unobserve() {} },
    requestAnimationFrame: fn => { frames.set(++next, fn); return next; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  return { calls, events, frames, canvas, document, motion, mesh };
}
test('opaque triangles use a depth buffer instead of painter sorting', () => {
  const { calls, mesh } = setup();
  assert(calls.some(c => c[0] === 'enable' && c[1] === 'DEPTH_TEST'));
  assert(calls.some(c => c[0] === 'depthMask' && c[1] === true));
  assert(calls.some(c => c[0] === 'disable' && c[1] === 'BLEND'));
  assert(calls.some(c => c[0] === 'drawArrays' && c[1] === 'TRIANGLES'));
  assert(mesh.length > 10000);
  assert([...mesh].every(Number.isFinite));
  for(let i=0; i<mesh.length; i+=9) {
    assert(Math.abs(Math.hypot(mesh[i+3],mesh[i+4],mesh[i+5])-1)<1e-5);
  }
  // Every triangle's winding must agree with its outward lighting normal.
  for(let i=0; i<mesh.length; i+=27) {
    const a=[mesh[i+9]-mesh[i],mesh[i+10]-mesh[i+1],mesh[i+11]-mesh[i+2]];
    const b=[mesh[i+18]-mesh[i],mesh[i+19]-mesh[i+1],mesh[i+20]-mesh[i+2]];
    const n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    assert(n.reduce((sum,v,j)=>sum+v*mesh[i+3+j],0)>0);
  }
});
test('mobile resize, motion preference and hidden tabs are handled', () => {
  const app=setup();
  app.canvas.getBoundingClientRect=()=>({width:320,height:520});
  app.events.resize();
  assert.equal(app.canvas.width,640);assert.equal(app.canvas.height,1040);
  app.motion.matches=true;app.events.motion();assert.equal(app.frames.size,0);
  app.motion.matches=false;app.events.motion();assert.equal(app.frames.size,1);
  app.document.hidden=true;app.events.visibilitychange();assert.equal(app.frames.size,0);
});
test('no WebGL hides only the decorative model without failing the page', () => {
  const app=setup(false);
  assert.equal(app.canvas.parentElement.hidden,true);
  assert.equal(app.frames.size,0);
});
