uniform sampler2D currentSceneTex;
uniform sampler2D prevSceneTex;
uniform sampler2D transitionTex;
uniform sampler2D uiTex;
uniform vec2 resolution;
uniform bool transitioning;
varying vec2 vUv;
// FXAA
varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;
#include ../effects/fxaa.glsl;

#ifdef DEBUG_GRID
#include ../utils/debugGrid.glsl;
uniform vec2 gridSize;
uniform vec2 gridOffset;
#endif

void main() {
  vec2 fragCoord = vUv * resolution;
  vec4 color = fxaa(currentSceneTex, fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);

  // Transition
  if (transitioning) {
    vec4 previousScene = fxaa(prevSceneTex, fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
    vec4 transition = texture2D(transitionTex, vUv);
    color = mix(color, previousScene, transition.a);
  }

  // Overlay UI
  vec4 ui = texture2D(uiTex, vUv);
  color = mix(color, ui, ui.a);

#ifdef DEBUG_GRID
  vec2 pos = fragCoord.xy + vec2(gridSize.y);
  color += vec4(debugGrid(pos, resolution, gridOffset, gridSize.x, gridSize.y), 1.0);
#endif

  gl_FragColor = color;
}