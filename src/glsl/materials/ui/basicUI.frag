uniform sampler2D map;
uniform vec3 diffuse;
uniform float opacity;
uniform vec2 mapOffset;
uniform vec2 mapScale;
varying vec2 vUv;

#define ALPHA_TEST 2.0 / 255.0

void main() {
  vec4 outgoingColor = vec4(diffuse, opacity);
  vec4 img = texture2D(map, vUv * mapScale - mapOffset);
  outgoingColor *= img;
  if (outgoingColor.a < ALPHA_TEST) discard;
  gl_FragColor = outgoingColor;
}