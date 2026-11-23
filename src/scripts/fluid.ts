/**
 * Liquid cursor background: a small WebGL2 fluid simulation
 * (stable-fluids method). Moving the pointer pushes orange/blue "ink"
 * around a dark background. Based on the approach of Pavel Dobryakov's
 * MIT-licensed WebGL-Fluid-Simulation, rewritten compactly for this site.
 *
 * Returns false when the browser can't run it, so the page keeps its
 * static gradient background instead.
 */

const CONFIG = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 768,
  DENSITY_DISSIPATION: 1.6, // higher = ink fades faster (keeps text readable)
  VELOCITY_DISSIPATION: 0.35,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 18,
  CURL: 24,
  SPLAT_RADIUS: 0.22,
  SPLAT_FORCE: 5200,
  INK: 0.11, // brightness of each splat
};

// Site palette, in 0–1 RGB (keep in sync with tokens.css)
const ORANGE: [number, number, number] = [1.0, 0.478, 0.102];
const BLUE: [number, number, number] = [0.184, 0.482, 1.0];
// Paper background (keep in sync with --bg in tokens.css)
const BG: [number, number, number] = [245 / 255, 241 / 255, 234 / 255];

type FBO = {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
  w: number;
  h: number;
  attach: (unit: number) => number;
};
type DoubleFBO = { read: FBO; write: FBO; w: number; h: number; swap: () => void };

const VERT = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
`;

const FRAG = {
  splat: `${HEAD}
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}`,
  advection: `${HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  vec4 result = texture(uSource, coord);
  fragColor = result / (1.0 + dissipation * dt);
}`,
  divergence: `${HEAD}
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,
  curl: `${HEAD}
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  fragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,
  vorticity: `${HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture(uVelocity, vUv).xy + force * dt;
  velocity = clamp(velocity, -1000.0, 1000.0);
  fragColor = vec4(velocity, 0.0, 1.0);
}`,
  pressure: `${HEAD}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  fragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`,
  gradient: `${HEAD}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  fragColor = vec4(velocity, 0.0, 1.0);
}`,
  clear: `${HEAD}
uniform sampler2D uTexture;
uniform float value;
void main () {
  fragColor = value * texture(uTexture, vUv);
}`,
  display: `${HEAD}
uniform sampler2D uTexture;
uniform vec3 bg;
void main () {
  // Light theme: blend the ink colour onto the paper instead of adding light.
  vec3 c = texture(uTexture, vUv).rgb;
  float m = max(max(c.r, c.g), c.b);
  float a = 1.0 - exp(-m * 2.2);
  vec3 hue = c / max(m, 0.0001);
  float vignette = smoothstep(1.25, 0.35, length(vUv - 0.5) * 1.4);
  fragColor = vec4(mix(bg, hue * 0.88, a * 0.45 * (0.6 + 0.4 * vignette)), 1.0);
}`,
};

export function initFluid(canvas: HTMLCanvasElement): boolean {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return false;
  if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return false;

  const isSmall = Math.min(window.innerWidth, window.innerHeight) < 700;
  const dyeRes = isSmall ? 512 : CONFIG.DYE_RESOLUTION;

  /* ── Shader programs ── */
  function compile(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(s) || 'shader error');
    return s;
  }
  const vert = compile(gl.VERTEX_SHADER, VERT);
  function program(fragSrc: string) {
    const p = gl!.createProgram()!;
    gl!.attachShader(p, vert);
    gl!.attachShader(p, compile(gl!.FRAGMENT_SHADER, fragSrc));
    gl!.bindAttribLocation(p, 0, 'aPosition');
    gl!.linkProgram(p);
    if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) throw new Error(gl!.getProgramInfoLog(p) || 'link error');
    const u: Record<string, WebGLUniformLocation> = {};
    const n = gl!.getProgramParameter(p, gl!.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < n; i++) {
      const name = gl!.getActiveUniform(p, i)!.name;
      u[name] = gl!.getUniformLocation(p, name)!;
    }
    return { use: () => gl!.useProgram(p), u };
  }
  const P = {
    splat: program(FRAG.splat),
    advection: program(FRAG.advection),
    divergence: program(FRAG.divergence),
    curl: program(FRAG.curl),
    vorticity: program(FRAG.vorticity),
    pressure: program(FRAG.pressure),
    gradient: program(FRAG.gradient),
    clear: program(FRAG.clear),
    display: program(FRAG.display),
  };

  /* ── Full-screen quad ── */
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function blit(target: FBO | null) {
    if (target) {
      gl!.viewport(0, 0, target.w, target.h);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
    } else {
      gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    }
    gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
  }

  /* ── Framebuffers ── */
  function createFBO(w: number, h: number): FBO {
    gl!.activeTexture(gl!.TEXTURE0);
    const tex = gl!.createTexture()!;
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA16F, w, h, 0, gl!.RGBA, gl!.HALF_FLOAT, null);
    const fbo = gl!.createFramebuffer()!;
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
    if (gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) !== gl!.FRAMEBUFFER_COMPLETE) throw new Error('FBO incomplete');
    gl!.viewport(0, 0, w, h);
    gl!.clearColor(0, 0, 0, 1);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    return {
      tex,
      fbo,
      w,
      h,
      attach(unit) {
        gl!.activeTexture(gl!.TEXTURE0 + unit);
        gl!.bindTexture(gl!.TEXTURE_2D, tex);
        return unit;
      },
    };
  }
  function createDouble(w: number, h: number): DoubleFBO {
    let a = createFBO(w, h);
    let b = createFBO(w, h);
    return {
      w,
      h,
      get read() {
        return a;
      },
      get write() {
        return b;
      },
      swap() {
        [a, b] = [b, a];
      },
    };
  }
  function resolution(res: number) {
    let aspect = gl!.drawingBufferWidth / gl!.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(res);
    const max = Math.round(res * aspect);
    return gl!.drawingBufferWidth > gl!.drawingBufferHeight ? { w: max, h: min } : { w: min, h: max };
  }

  let dye: DoubleFBO, velocity: DoubleFBO, pressure: DoubleFBO, divergence: FBO, curl: FBO;
  function initFramebuffers() {
    const sim = resolution(CONFIG.SIM_RESOLUTION);
    const d = resolution(dyeRes);
    dye = createDouble(d.w, d.h);
    velocity = createDouble(sim.w, sim.h);
    pressure = createDouble(sim.w, sim.h);
    divergence = createFBO(sim.w, sim.h);
    curl = createFBO(sim.w, sim.h);
  }

  function resizeCanvas() {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.floor(canvas.clientWidth * scale);
    const h = Math.floor(canvas.clientHeight * scale);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      return true;
    }
    return false;
  }
  resizeCanvas();
  initFramebuffers();

  /* ── Simulation ── */
  const aspect = () => canvas.width / canvas.height;
  const texel = (f: { w: number; h: number }) => [1 / f.w, 1 / f.h] as const;

  function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    P.splat.use();
    gl!.uniform1i(P.splat.u.uTarget, velocity.read.attach(0));
    gl!.uniform1f(P.splat.u.aspectRatio, aspect());
    gl!.uniform2f(P.splat.u.point, x, y);
    gl!.uniform3f(P.splat.u.color, dx, dy, 0);
    let r = CONFIG.SPLAT_RADIUS / 100;
    if (aspect() > 1) r *= aspect();
    gl!.uniform1f(P.splat.u.radius, r);
    blit(velocity.write);
    velocity.swap();
    gl!.uniform1i(P.splat.u.uTarget, dye.read.attach(0));
    gl!.uniform3f(P.splat.u.color, color[0], color[1], color[2]);
    blit(dye.write);
    dye.swap();
  }

  function step(dt: number) {
    const vt = texel(velocity);

    P.curl.use();
    gl!.uniform2f(P.curl.u.texelSize, vt[0], vt[1]);
    gl!.uniform1i(P.curl.u.uVelocity, velocity.read.attach(0));
    blit(curl);

    P.vorticity.use();
    gl!.uniform2f(P.vorticity.u.texelSize, vt[0], vt[1]);
    gl!.uniform1i(P.vorticity.u.uVelocity, velocity.read.attach(0));
    gl!.uniform1i(P.vorticity.u.uCurl, curl.attach(1));
    gl!.uniform1f(P.vorticity.u.curl, CONFIG.CURL);
    gl!.uniform1f(P.vorticity.u.dt, dt);
    blit(velocity.write);
    velocity.swap();

    P.divergence.use();
    gl!.uniform2f(P.divergence.u.texelSize, vt[0], vt[1]);
    gl!.uniform1i(P.divergence.u.uVelocity, velocity.read.attach(0));
    blit(divergence);

    P.clear.use();
    gl!.uniform1i(P.clear.u.uTexture, pressure.read.attach(0));
    gl!.uniform1f(P.clear.u.value, CONFIG.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    P.pressure.use();
    gl!.uniform2f(P.pressure.u.texelSize, vt[0], vt[1]);
    gl!.uniform1i(P.pressure.u.uDivergence, divergence.attach(0));
    for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i++) {
      gl!.uniform1i(P.pressure.u.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    P.gradient.use();
    gl!.uniform2f(P.gradient.u.texelSize, vt[0], vt[1]);
    gl!.uniform1i(P.gradient.u.uPressure, pressure.read.attach(0));
    gl!.uniform1i(P.gradient.u.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    P.advection.use();
    gl!.uniform2f(P.advection.u.texelSize, vt[0], vt[1]);
    const vId = velocity.read.attach(0);
    gl!.uniform1i(P.advection.u.uVelocity, vId);
    gl!.uniform1i(P.advection.u.uSource, vId);
    gl!.uniform1f(P.advection.u.dt, dt);
    gl!.uniform1f(P.advection.u.dissipation, CONFIG.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    gl!.uniform1i(P.advection.u.uVelocity, velocity.read.attach(0));
    gl!.uniform1i(P.advection.u.uSource, dye.read.attach(1));
    gl!.uniform1f(P.advection.u.dissipation, CONFIG.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  }

  function render() {
    P.display.use();
    gl!.uniform1i(P.display.u.uTexture, dye.read.attach(0));
    gl!.uniform3f(P.display.u.bg, BG[0], BG[1], BG[2]);
    blit(null);
  }

  /* ── Pointer input ── */
  const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, moved: false, ready: false };
  let hue = 0;
  function inkColor(): [number, number, number] {
    // Drift smoothly between school orange and blue
    const t = (Math.sin(hue) + 1) / 2;
    const k = CONFIG.INK;
    return [
      (ORANGE[0] * (1 - t) + BLUE[0] * t) * k,
      (ORANGE[1] * (1 - t) + BLUE[1] * t) * k,
      (ORANGE[2] * (1 - t) + BLUE[2] * t) * k,
    ];
  }
  function onMove(clientX: number, clientY: number) {
    // Position relative to the canvas, so it also works when the mist only covers the hero
    const r = canvas.getBoundingClientRect();
    const x = (clientX - r.left) / r.width;
    const y = 1 - (clientY - r.top) / r.height;
    if (!pointer.ready) {
      pointer.px = x;
      pointer.py = y;
      pointer.ready = true;
    } else {
      pointer.px = pointer.x;
      pointer.py = pointer.y;
    }
    pointer.x = x;
    pointer.y = y;
    pointer.moved = true;
  }
  window.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => e.touches[0] && onMove(e.touches[0].clientX, e.touches[0].clientY), {
    passive: true,
  });

  function randomSplat(strength = 1) {
    const color = inkColor().map((c) => c * 2.2 * strength) as [number, number, number];
    splat(
      Math.random() * 0.8 + 0.1,
      Math.random() * 0.8 + 0.1,
      (Math.random() - 0.5) * 900 * strength,
      (Math.random() - 0.5) * 900 * strength,
      color,
    );
  }

  /* ── Loop ── */
  let last = performance.now();
  let idle = 0;
  let resizeQueued = false;
  window.addEventListener('resize', () => (resizeQueued = true));

  // Intro burst so the page looks alive before anyone moves the mouse
  for (let i = 0; i < 6; i++) {
    hue += 0.9;
    randomSplat(1.2);
  }

  function frame(now: number) {
    requestAnimationFrame(frame);
    if (document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000, 1 / 60);
    last = now;
    hue += dt * 0.6;

    if (resizeQueued) {
      resizeQueued = false;
      if (resizeCanvas()) initFramebuffers();
    }

    if (pointer.moved) {
      pointer.moved = false;
      idle = 0;
      let dx = pointer.x - pointer.px;
      let dy = pointer.y - pointer.py;
      if (aspect() < 1) dx *= aspect();
      else dy /= aspect();
      splat(pointer.x, pointer.y, dx * CONFIG.SPLAT_FORCE, dy * CONFIG.SPLAT_FORCE, inkColor());
    } else {
      // Gentle ambient swirl when nobody is moving (also what phones see)
      idle += dt;
      if (idle > 2.4) {
        idle = 0;
        randomSplat(0.55);
      }
    }

    step(dt);
    render();
  }
  requestAnimationFrame(frame);
  return true;
}
