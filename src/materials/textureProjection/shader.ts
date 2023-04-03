export const vertexHeader = `// Texture Projection
uniform mat4 tpCamViewMatrix; // viewMatrixCamera
uniform mat4 tpCamProjectionMatrix; // projectionMatrixCamera
varying vec4 vTPWorldPosition;
varying vec3 vTPNormal;
varying vec4 vTPTexCoords;

#include <common>`

export const vertexReplacement = `#include <fog_vertex>

  // Texture Projection
  vTPNormal = mat3(modelMatrix) * normal;
  vTPWorldPosition = modelMatrix * vec4(position, 1.0);
  vTPTexCoords = tpCamProjectionMatrix * tpCamViewMatrix * vTPWorldPosition;
`
export const fragmentHeader = `// Texture Projection
uniform float tpBlend;
uniform sampler2D tpMap;
uniform vec3 tpTargetPos;
varying vec4 vTPWorldPosition;
varying vec3 vTPNormal;
varying vec4 vTPTexCoords;

#include <common>`

export const fragmentReplacement = `#include <dithering_fragment>
  // Texture Projection
  vec2 uv = (vTPTexCoords.xy / vTPTexCoords.w) * 0.5 + 0.5;
  vec4 texProjected = texture2D(tpMap, uv);

  // this makes sure we don't render the texture also on the back of the object
  float blendAmt = 1.0;
  vec3 projectorDirection = normalize(tpTargetPos - vTPWorldPosition.xyz);
  float dotProduct = dot(vTPNormal, projectorDirection);
  // if (dotProduct < 0.0 || uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    blendAmt = 0.0;
  }
  gl_FragColor = mix(gl_FragColor, texProjected, blendAmt * tpBlend);
`
