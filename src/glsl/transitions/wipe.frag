uniform float progress;
varying vec2 vUv;

void main() {
  float transition = 1.0 - step(vUv.x, progress);
  gl_FragColor = vec4(transition);
}