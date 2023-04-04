uniform sampler2D currentSceneTex;
uniform sampler2D transitionTex;
uniform sampler2D uiTex;
uniform vec2 resolution;
uniform bool transitioning;
varying vec2 vUv;

#ifdef DEBUG_GRID
uniform vec2 gridSize;
uniform vec2 gridOffset;
#include "../utils/debugGrid.glsl";
#endif

void main() {
  vec4 color = texture2D(currentSceneTex, vUv);

  // Transition
  if (transitioning) {
    color = texture2D(transitionTex, vUv);
  }

  // Overlay UI
  vec4 ui = texture2D(uiTex, vUv);
  color = mix(color, ui, ui.a);

#ifdef DEBUG_GRID
  vec2 pos = vUv * resolution + vec2(gridSize.y);
  color += vec4(debugGrid(pos, resolution, gridOffset, gridSize.x, gridSize.y), 1.0);
#endif

  gl_FragColor = color;
}