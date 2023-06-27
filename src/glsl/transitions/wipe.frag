uniform float progress;
uniform sampler2D prevScene;
uniform sampler2D currentScene;
varying vec2 vUv;

const float border = 0.1;

void main() {
  float percent = mix(-border, 1.0 + border, progress);
  float transition = smoothstep(
    percent - border,
    percent,
    vUv.x
  );
  vec4 pScene = texture2D(prevScene, vUv);
  vec4 cScene = texture2D(currentScene, vUv);
  gl_FragColor = mix(cScene, pScene, transition);
}