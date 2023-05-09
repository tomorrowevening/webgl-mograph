uniform float debug;
uniform float opacity;
uniform vec3 scalar;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

#include <common>
#include <clipping_planes_pars_fragment>

void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( vec3(vUv, 0.0), opacity );
  vec3 color = vec3(vUv, 0.0);
  if (debug > 1.0) {
    diffuseColor.rgb = vPosition / scalar;
  } else if (debug > 0.0) {
    diffuseColor.rgb = vNormal;
  }
	gl_FragColor = diffuseColor;
	#include <encodings_fragment>
}