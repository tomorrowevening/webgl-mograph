uniform float progress;
uniform sampler2D prevScene;
uniform sampler2D currentScene;
varying vec2 vUv;

void main() {
  float transition = 1.0 - step(vUv.x, progress);
  vec4 pScene = texture2D(prevScene, vUv);
  vec4 cScene = texture2D(currentScene, vUv);
  gl_FragColor = mix(cScene, pScene, transition);
}