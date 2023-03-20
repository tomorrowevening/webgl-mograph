varying vec2 vUv;
varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;
uniform vec2 resolution;

void texcoords(vec2 fragCoord, vec2 resolution,
      out vec2 v_rgbNW, out vec2 v_rgbNE,
      out vec2 v_rgbSW, out vec2 v_rgbSE,
      out vec2 v_rgbM) {
  vec2 inverseVP = 1.0 / resolution.xy;
  v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
  v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
  v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
  v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
  v_rgbM = vec2(fragCoord * inverseVP);
}

void main() {
  vUv = uv;
  vec2 fragCoord = uv * resolution;
  texcoords(fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}