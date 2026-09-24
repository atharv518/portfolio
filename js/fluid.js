/*!
 * WebGL Fluid Simulation — Portfolio Background
 * Based on: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
 * Adapted for portfolio use: mouse-move interaction only (no click required),
 * no settings panel, optimised for background layer.
 *
 * Configuration (per spec):
 *   SIM_RESOLUTION     : 256
 *   DYE_RESOLUTION     : HIGH (1024)
 *   DENSITY_DISSIPATION: 1.1
 *   VELOCITY_DISSIPATION: 0.59
 *   PRESSURE           : 0.16
 *   PRESSURE_ITERATIONS: 20
 *   CURL              : 1   (vorticity)
 *   SPLAT_RADIUS       : 0.11
 *   SHADING            : true
 *   COLORFUL           : false
 *   BLOOM              : true  / intensity 0.54 / threshold 0.26
 *   SUNRAYS            : false
 *   PAUSED             : false
 */

(function () {
  'use strict';

  /* ────────────────── CONFIG ────────────────── */
  const config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 512,
    CAPTURE_RESOLUTION: 216,
    DENSITY_DISSIPATION: 3.0,   // slower fade so dark trails stay visible
    VELOCITY_DISSIPATION: 2.5,
    PRESSURE: 0.16,
    PRESSURE_ITERATIONS: 20,
    CURL: 2,
    SPLAT_RADIUS: 0.05,
    SPLAT_FORCE: 3600,
    SHADING: true,
    COLORFUL: false,
    COLOR_UPDATE_SPEED: 5,
    PAUSED: false,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    TRANSPARENT: true,
    BLOOM: true,                // off — no bright/glowing pixels
    BLOOM_ITERATIONS: 6,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.30,
    BLOOM_THRESHOLD: 0.35,
    BLOOM_SOFT_KNEE: 0.7,
    SUNRAYS: false,
    SUNRAYS_WEIGHT: 1.0,
    SUNRAYS_RESOLUTION: 196,
  };

  /* ────────────────── CANVAS SETUP ────────────────── */
  const canvas = document.getElementById('fluid-canvas');
  canvas.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:100%',
    'height:100%',
    'z-index:0',
    'pointer-events:none',
    'display:block',
  ].join(';');
  document.body.style.position = 'relative';

  /* ────────────────── WebGL CONTEXT ────────────────── */
  function getWebGLContext(canvas) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!gl) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
    let halfFloat, supportLinearFiltering;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat ? halfFloat.HALF_FLOAT_OES : null);
    let formatRGBA, formatRG, formatR;
    if (isWebGL2) {
      formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
      formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, gl.HALF_FLOAT);
      formatR = getSupportedFormat(gl, gl.R16F, gl.RED, gl.HALF_FLOAT);
    } else {
      formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }
    return { gl, ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering } };
  }

  function getSupportedFormat(gl, internalFormat, format, type) {
    if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
      switch (internalFormat) {
        case gl.R16F: return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
        case gl.RG16F: return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
        default: return null;
      }
    }
    return { internalFormat, format };
  }

  function supportRenderTextureFormat(gl, internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status === gl.FRAMEBUFFER_COMPLETE;
  }

  const { gl, ext } = getWebGLContext(canvas);

  /* ────────────────── SHADER SOURCES ────────────────── */
  const baseVertexShaderSrc = `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const blurVertexShaderSrc = `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      float offset = 1.33333333;
      vL = vUv - texelSize * offset;
      vR = vUv + texelSize * offset;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const blurShaderSrc = `
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform sampler2D uTexture;
    void main () {
      vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
      sum += texture2D(uTexture, vL) * 0.35294117;
      sum += texture2D(uTexture, vR) * 0.35294117;
      gl_FragColor = sum;
    }
  `;

  const copyShaderSrc = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    void main () {
      gl_FragColor = texture2D(uTexture, vUv);
    }
  `;

  const clearShaderSrc = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () {
      gl_FragColor = value * texture2D(uTexture, vUv);
    }
  `;

  const colorShaderSrc = `
    precision mediump float;
    uniform vec4 color;
    void main () {
      gl_FragColor = color;
    }
  `;

  const checkerboardShaderSrc = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float aspectRatio;
    #define SCALE 25.0
    void main () {
      vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
      float v = mod(uv.x + uv.y, 2.0);
      v = v * 0.1 + 0.8;
      gl_FragColor = vec4(vec3(v), 1.0);
    }
  `;

  const displayShaderSrc = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;
    vec3 linearToGamma (vec3 color) {
      color = max(color, vec3(0));
      return max(1.055 * pow(color, vec3(0.4166666667)) - 0.055, vec3(0));
    }
    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
      #endif
      #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
      #endif
      #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
        #ifdef BLOOM
          bloom *= sunrays;
        #endif
      #endif
      #ifdef BLOOM
        float noise = texture2D(uDithering, vUv * ditherScale).r;
        noise = noise * 2.0 - 1.0;
        bloom += noise / 255.0;
        bloom = linearToGamma(bloom);
        c += bloom;
      #endif
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, a);
    }
  `;

  const bloomPrefilterShaderSrc = `
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 curve;
    uniform float threshold;
    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      float br = max(c.r, max(c.g, c.b));
      float rq = clamp(br - curve.x, 0.0, curve.y);
      rq = (rq * rq) * curve.z;
      c *= max(rq, br - threshold) / max(br, 0.0001);
      gl_FragColor = vec4(c, 0.0);
    }
  `;

  const bloomBlurShaderSrc = `
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    void main () {
      vec4 sum = vec4(0.0);
      sum += texture2D(uTexture, vL);
      sum += texture2D(uTexture, vR);
      sum += texture2D(uTexture, vT);
      sum += texture2D(uTexture, vB);
      sum *= 0.25;
      gl_FragColor = sum;
    }
  `;

  const bloomFinalShaderSrc = `
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform float intensity;
    void main () {
      vec4 sum = vec4(0.0);
      sum += texture2D(uTexture, vL);
      sum += texture2D(uTexture, vR);
      sum += texture2D(uTexture, vT);
      sum += texture2D(uTexture, vB);
      sum *= 0.25;
      gl_FragColor = sum * intensity;
    }
  `;

  const splatShaderSrc = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }
  `;

  const advectionShaderSrc = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
      vec2 st = uv / tsize - 0.5;
      vec2 iuv = floor(st);
      vec2 fuv = fract(st);
      vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
      vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
      vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
      vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
      return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    void main () {
      #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
      #endif
      float decay = 1.0 + dissipation * dt;
      gl_FragColor = result / decay;
    }
  `;

  const divergenceShaderSrc = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) { L = -C.x; }
      if (vR.x > 1.0) { R = -C.x; }
      if (vT.y > 1.0) { T = -C.y; }
      if (vB.y < 0.0) { B = -C.y; }
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `;

  const curlShaderSrc = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
  `;

  const vorticityShaderSrc = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 v = texture2D(uVelocity, vUv).xy;
      gl_FragColor = vec4(v + force * dt, 0.0, 1.0);
    }
  `;

  const pressureShaderSrc = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float C = texture2D(uPressure, vUv).x;
      float divergence = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T - divergence) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
  `;

  const gradientSubtractShaderSrc = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `;

  /* ────────────────── MATERIAL / PROGRAM HELPERS ────────────────── */
  function compileShader(type, source, keywords) {
    source = addKeywords(source, keywords);
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      console.error(gl.getShaderInfoLog(shader));
    return shader;
  }

  function addKeywords(source, keywords) {
    if (!keywords) return source;
    let keywordsStr = '';
    keywords.forEach(k => { keywordsStr += '#define ' + k + '\n'; });
    return keywordsStr + source;
  }

  function createProgram(vertexShader, fragmentShader) {
    const prog = gl.createProgram();
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.error(gl.getProgramInfoLog(prog));
    return prog;
  }

  function getUniforms(program) {
    const uniforms = [];
    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(program, i);
      uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    return uniforms;
  }

  class Material {
    constructor(vertexShader, fragmentShaderSource) {
      this.vertexShader = vertexShader;
      this.fragmentShaderSource = fragmentShaderSource;
      this.programs = [];
      this.activeProgram = null;
      this.uniforms = [];
    }
    setKeywords(keywords) {
      let hash = 0;
      for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);
      let program = this.programs[hash];
      if (!program) {
        const fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
        program = createProgram(this.vertexShader, fragmentShader);
        this.programs[hash] = program;
      }
      if (program === this.activeProgram) return;
      this.uniforms = getUniforms(program);
      this.activeProgram = program;
    }
    bind() {
      gl.useProgram(this.activeProgram);
    }
  }

  class Program {
    constructor(vertexShader, fragmentShader) {
      this.uniforms = {};
      this.program = createProgram(vertexShader, fragmentShader);
      this.uniforms = getUniforms(this.program);
    }
    bind() {
      gl.useProgram(this.program);
    }
  }

  function hashCode(s) {
    if (s.length === 0) return 0;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  /* ────────────────── COMPILE SHADERS ────────────────── */
  const baseVertexShader = compileShader(gl.VERTEX_SHADER, baseVertexShaderSrc);
  const blurVertexShader = compileShader(gl.VERTEX_SHADER, blurVertexShaderSrc);
  const blurShader = compileShader(gl.FRAGMENT_SHADER, blurShaderSrc);
  const copyShader = compileShader(gl.FRAGMENT_SHADER, copyShaderSrc);
  const clearShader = compileShader(gl.FRAGMENT_SHADER, clearShaderSrc);
  const colorShader = compileShader(gl.FRAGMENT_SHADER, colorShaderSrc);
  const checkerboardShader = compileShader(gl.FRAGMENT_SHADER, checkerboardShaderSrc);
  const bloomPrefilterShader = compileShader(gl.FRAGMENT_SHADER, bloomPrefilterShaderSrc);
  const bloomBlurShader = compileShader(gl.FRAGMENT_SHADER, bloomBlurShaderSrc);
  const bloomFinalShader = compileShader(gl.FRAGMENT_SHADER, bloomFinalShaderSrc);
  const splatShader = compileShader(gl.FRAGMENT_SHADER, splatShaderSrc);
  const advectionShader = compileShader(gl.FRAGMENT_SHADER, advectionShaderSrc,
    ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']);
  const divergenceShader = compileShader(gl.FRAGMENT_SHADER, divergenceShaderSrc);
  const curlShader = compileShader(gl.FRAGMENT_SHADER, curlShaderSrc);
  const vorticityShader = compileShader(gl.FRAGMENT_SHADER, vorticityShaderSrc);
  const pressureShader = compileShader(gl.FRAGMENT_SHADER, pressureShaderSrc);
  const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, gradientSubtractShaderSrc);

  /* ────────────────── PROGRAMS ────────────────── */
  const blurProgram = new Program(blurVertexShader, blurShader);
  const copyProgram = new Program(baseVertexShader, copyShader);
  const clearProgram = new Program(baseVertexShader, clearShader);
  const colorProgram = new Program(baseVertexShader, colorShader);
  const checkerboardProgram = new Program(baseVertexShader, checkerboardShader);
  const bloomPrefilterProgram = new Program(baseVertexShader, bloomPrefilterShader);
  const bloomBlurProgram = new Program(baseVertexShader, bloomBlurShader);
  const bloomFinalProgram = new Program(baseVertexShader, bloomFinalShader);
  const splatProgram = new Program(baseVertexShader, splatShader);
  const advectionProgram = new Program(baseVertexShader, advectionShader);
  const divergenceProgram = new Program(baseVertexShader, divergenceShader);
  const curlProgram = new Program(baseVertexShader, curlShader);
  const vorticityProgram = new Program(baseVertexShader, vorticityShader);
  const pressureProgram = new Program(baseVertexShader, pressureShader);
  const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

  const displayMaterial = new Material(baseVertexShader, displayShaderSrc);

  /* ────────────────── FRAMEBUFFER HELPERS ────────────────── */
  function createFBO(w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const texelSizeX = 1.0 / w;
    const texelSizeY = 1.0 / h;
    return {
      texture, fbo, width: w, height: h, texelSizeX, texelSizeY,
      attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; }
    };
  }

  function createDoubleFBO(w, h, internalFormat, format, type, param) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);
    return {
      width: w, height: h, texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
      get read() { return fbo1; },
      set read(v) { fbo1 = v; },
      get write() { return fbo2; },
      set write(v) { fbo2 = v; },
      swap() { [fbo1, fbo2] = [fbo2, fbo1]; }
    };
  }

  function resizeFBO(target, w, h, internalFormat, format, type, param) {
    const newFBO = createFBO(w, h, internalFormat, format, type, param);
    copyProgram.bind();
    gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
    blit(newFBO);
    return newFBO;
  }

  function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
    if (target.width === w && target.height === h) return target;
    target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
    target.write = createFBO(w, h, internalFormat, format, type, param);
    target.width = w; target.height = h;
    target.texelSizeX = 1.0 / w; target.texelSizeY = 1.0 / h;
    return target;
  }

  /* ────────────────── GEOMETRY ────────────────── */
  const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    return (target, clear = false) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      if (clear) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  })();

  /* ────────────────── FBO STATE ────────────────── */
  let dye, velocity, divergence, curl, pressure, bloom;
  let bloomFramebuffers = [];
  let ditheringTexture;

  function getResolution(resolution) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);
    if (gl.drawingBufferWidth > gl.drawingBufferHeight)
      return { width: max, height: min };
    return { width: min, height: max };
  }

  function initFramebuffers() {
    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);
    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    gl.disable(gl.BLEND);

    if (!dye)
      dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    else
      dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

    if (!velocity)
      velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    else
      velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

    divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);

    initBloomFramebuffers();
  }

  function initBloomFramebuffers() {
    const res = getResolution(config.BLOOM_RESOLUTION);
    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    bloom = createFBO(res.width, res.height, rgba.internalFormat, rgba.format, texType, filtering);
    bloomFramebuffers.length = 0;
    for (let i = 0; i < config.BLOOM_ITERATIONS; i++) {
      const width = res.width >> (i + 1);
      const height = res.height >> (i + 1);
      if (width < 2 || height < 2) break;
      const fbo = createFBO(width, height, rgba.internalFormat, rgba.format, texType, filtering);
      bloomFramebuffers.push(fbo);
    }
  }

  /* ────────────────── DITHER TEXTURE ────────────────── */
  function createTextureAsync(url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255]));
    const obj = {
      texture, width: 1, height: 1,
      attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; }
    };
    const img = new Image();
    img.onload = () => {
      obj.width = img.width;
      obj.height = img.height;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    };
    img.src = url;
    return obj;
  }

  /* Generate a small noise texture inline so no external asset is needed */
  function createDitheringTexture() {
    const size = 64;
    const data = new Uint8Array(size * size * 3);
    for (let i = 0; i < size * size * 3; i++) data[i] = Math.random() * 255;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
    return {
      texture, width: size, height: size,
      attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; }
    };
  }

  ditheringTexture = createDitheringTexture();

  /* ────────────────── UPDATE KEYWORDS ────────────────── */
  function updateKeywords() {
    const keywords = [];
    if (config.SHADING) keywords.push('SHADING');
    if (config.BLOOM) keywords.push('BLOOM');
    if (config.SUNRAYS) keywords.push('SUNRAYS');
    displayMaterial.setKeywords(keywords);
  }

  updateKeywords();
  initFramebuffers();

  /* ────────────────── RESIZE ────────────────── */
  function resizeCanvas() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      initFramebuffers();
    }
  }

  /* ────────────────── POINTER STATE ────────────────── */
  function Pointer() {
    this.id = -1;
    this.texcoordX = 0;
    this.texcoordY = 0;
    this.prevTexcoordX = 0;
    this.prevTexcoordY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.down = false;
    this.moved = false;
    this.color = [30, 0, 300];
  }

  const pointers = [new Pointer()];

  /* ────────────────── COLOUR ────────────────── */
  function generateColor() {
    /* Warm dark embers — deep reds, oranges, ambers. Very low brightness
       so the fluid looks like dark glowing embers, never bright. */
    const warmRanges = [
      Math.random() * 0.08,            // deep red → orange-red  (0.00–0.08)
      0.06 + Math.random() * 0.07,     // orange → amber         (0.06–0.13)
      0.93 + Math.random() * 0.07,     // crimson / burgundy     (0.93–1.00)
    ];
    const hue = warmRanges[Math.floor(Math.random() * warmRanges.length)];
    const sat = 0.80 + Math.random() * 0.15;  // 0.80–0.95  rich, warm
    const val = 0.18 + Math.random() * 0.14;  // 0.18–0.32  dark ember range
    return HSVtoRGB(hue, sat, val);
  }

  function HSVtoRGB(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return { r, g, b };
  }

  function normalizeColor(input) {
    return { r: input.r / 255, g: input.g / 255, b: input.b / 255 };
  }

  function wrap(val, min, max) {
    const range = max - min;
    if (range === 0) return min;
    return ((val - min) % range + range) % range + min;
  }

  /* ────────────────── SPLAT ────────────────── */
  function splat(x, y, dx, dy, color) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(dye.write);
    dye.swap();
  }

  function correctRadius(radius) {
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) radius *= aspectRatio;
    return radius;
  }

  function splatPointer(pointer) {
    const dx = pointer.deltaX * config.SPLAT_FORCE;
    const dy = pointer.deltaY * config.SPLAT_FORCE;
    splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
  }

  /* ────────────────── SIMULATION STEP ────────────────── */
  let lastUpdateTime = Date.now();
  let colorUpdateTimer = 0.0;

  function calcDeltaTime() {
    const now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016667);
    lastUpdateTime = now;
    return dt;
  }

  function updateColors(dt) {
    if (!config.COLORFUL) return;
    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorUpdateTimer >= 1) {
      colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
      pointers.forEach(p => { p.color = generateColor(); });
    }
  }

  function step(dt) {
    gl.disable(gl.BLEND);

    /* Curl */
    curlProgram.bind();
    gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    /* Vorticity */
    vorticityProgram.bind();
    gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    /* Divergence */
    divergenceProgram.bind();
    gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    /* Clear pressure */
    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    /* Pressure solve */
    pressureProgram.bind();
    gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    /* Gradient subtract */
    gradienSubtractProgram.bind();
    gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    /* Advect velocity */
    advectionProgram.bind();
    gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!ext.supportLinearFiltering)
      gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    /* Advect dye */
    if (!ext.supportLinearFiltering)
      gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  }

  /* ────────────────── BLOOM ────────────────── */
  function applyBloom(source, destination) {
    if (bloomFramebuffers.length < 2) return;
    let last = destination;

    gl.disable(gl.BLEND);
    bloomPrefilterProgram.bind();
    const knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
    const curve0 = config.BLOOM_THRESHOLD - knee;
    const curve1 = knee * 2;
    const curve2 = 0.25 / knee;
    gl.uniform3f(bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
    gl.uniform1f(bloomPrefilterProgram.uniforms.threshold, config.BLOOM_THRESHOLD);
    gl.uniform1i(bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
    blit(last);

    bloomBlurProgram.bind();
    for (let i = 0; i < bloomFramebuffers.length; i++) {
      const dest = bloomFramebuffers[i];
      gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
      gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
      blit(dest);
      last = dest;
    }

    gl.blendFunc(gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);
    for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
      const baseTex = bloomFramebuffers[i];
      gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
      gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
      blit(baseTex);
      last = baseTex;
    }
    gl.disable(gl.BLEND);

    bloomFinalProgram.bind();
    gl.uniform2f(bloomFinalProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
    gl.uniform1i(bloomFinalProgram.uniforms.uTexture, last.attach(0));
    gl.uniform1f(bloomFinalProgram.uniforms.intensity, config.BLOOM_INTENSITY);
    blit(destination);
  }

  /* ────────────────── RENDER ────────────────── */
  function render(target) {
    if (config.BLOOM) applyBloom(dye.read, bloom);

    if (target == null || !config.TRANSPARENT) {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
    } else {
      gl.disable(gl.BLEND);
    }

    if (!config.TRANSPARENT) {
      drawColor(target, normalizeColor(config.BACK_COLOR));
    }

    drawDisplay(target);
  }

  function drawColor(fbo, color) {
    colorProgram.bind();
    gl.uniform4f(colorProgram.uniforms.color, color.r, color.g, color.b, 1);
    blit(fbo);
  }

  function drawDisplay(target) {
    const width = target ? target.width : gl.drawingBufferWidth;
    const height = target ? target.height : gl.drawingBufferHeight;
    displayMaterial.bind();
    if (config.SHADING) gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
    gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
    if (config.BLOOM) {
      gl.uniform1i(displayMaterial.uniforms.uBloom, bloom.attach(1));
      gl.uniform1i(displayMaterial.uniforms.uDithering, ditheringTexture.attach(2));
      const ditherScale = {
        x: width / ditheringTexture.width,
        y: height / ditheringTexture.height
      };
      gl.uniform2f(displayMaterial.uniforms.ditherScale, ditherScale.x, ditherScale.y);
    }
    if (config.SUNRAYS) gl.uniform1i(displayMaterial.uniforms.uSunrays, 3);
    blit(target);
  }

  /* ────────────────── ANIMATION LOOP ────────────────── */
  let animFrame;
  function update() {
    resizeCanvas();
    if (!config.PAUSED) {
      const dt = calcDeltaTime();
      updateColors(dt);
      applyInputs();
      step(dt);
    }
    render(null);
    animFrame = requestAnimationFrame(update);
  }

  function applyInputs() {
    pointers.forEach(p => {
      if (p.moved) {
        p.moved = false;
        splatPointer(p);
      }
    });
  }

  /* ────────────────── PAGE VISIBILITY ────────────────── */
  document.addEventListener('visibilitychange', () => {
    config.PAUSED = document.hidden;
    if (!document.hidden) lastUpdateTime = Date.now();
  });

  /* ────────────────── INPUT — MOUSE / TOUCH ────────────────── */
  function updatePointerMoveData(pointer, posX, posY) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
  }

  function correctDeltaX(delta) {
    const ar = canvas.width / canvas.height;
    if (ar < 1) delta *= ar;
    return delta;
  }

  function correctDeltaY(delta) {
    const ar = canvas.width / canvas.height;
    if (ar > 1) delta /= ar;
    return delta;
  }

  /* Immediate burst splat at a canvas-pixel coordinate.
     Fires 5 radial micro-splats (centre + 4 directions) so a single
     tap blooms outward like an ink drop — clearly visible on touch. */
  function splatAtPoint(posX, posY, color) {
    const x = posX / canvas.width;
    const y = 1.0 - posY / canvas.height;
    const s = config.SPLAT_FORCE * 0.0005; // base strength per sub-splat

    /* Centre burst with random direction */
    const a0 = Math.random() * Math.PI * 2;
    splat(x, y, correctDeltaX(Math.cos(a0) * s), correctDeltaY(Math.sin(a0) * s), color);

    /* 4 cardinal sub-splats so the fluid fans out visibly */
    const dirs = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
    dirs.forEach(a => {
      splat(x, y, correctDeltaX(Math.cos(a) * s * 0.6), correctDeltaY(Math.sin(a) * s * 0.6), color);
    });
  }

  /* ── Mouse: move triggers continuous trail ── */
  window.addEventListener('mousemove', e => {
    const p = pointers[0];
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (!p._hasColor) { p.color = generateColor(); p._hasColor = true; }
    updatePointerMoveData(p, x, y);
  }, { passive: true });

  /* ── Mouse: click on empty background fires an instant burst ── */
  window.addEventListener('mousedown', e => {
    /* Only react to the background / canvas itself, not portfolio UI elements.
       If the click target is or contains an interactive element, skip. */
    const tag = e.target.tagName;
    if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' ||
      tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'LABEL') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = generateColor();
    splatAtPoint(x, y, color);
    /* Also update the move pointer so the next mousemove doesn't jump */
    pointers[0].texcoordX = x / canvas.width;
    pointers[0].texcoordY = 1.0 - y / canvas.height;
    pointers[0].color = color;
    pointers[0]._hasColor = true;
  }, { passive: true });

  /* ── Touch: touchstart fires an instant burst at each finger ── */
  window.addEventListener('touchstart', e => {
    const touches = e.changedTouches;
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < touches.length; i++) {
      let pointer = pointers[i];
      if (!pointer) { pointer = new Pointer(); pointers.push(pointer); }
      const x = touches[i].clientX - rect.left;
      const y = touches[i].clientY - rect.top;
      const color = generateColor();
      pointer.color = color;
      pointer._hasColor = true;
      /* Seed the position so the first touchmove delta is zero */
      pointer.texcoordX = x / canvas.width;
      pointer.texcoordY = 1.0 - y / canvas.height;
      splatAtPoint(x, y, color);
    }
  }, { passive: true });

  /* ── Touch: touchmove drives continuous fluid trail ── */
  window.addEventListener('touchmove', e => {
    const touches = e.changedTouches;
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < touches.length; i++) {
      let pointer = pointers[i];
      if (!pointer) { pointer = new Pointer(); pointers.push(pointer); }
      const x = touches[i].clientX - rect.left;
      const y = touches[i].clientY - rect.top;
      if (!pointer._hasColor) { pointer.color = generateColor(); pointer._hasColor = true; }
      updatePointerMoveData(pointer, x, y);
    }
  }, { passive: true });

  /* ────────────────── KICK OFF ────────────────── */
  update();

})();
