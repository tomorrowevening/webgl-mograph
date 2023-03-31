#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

uniform float opacity;
uniform float intensity;
uniform float time;
uniform vec2 resolution;
uniform vec3 color;
uniform sampler2D map;

in vec2 vUv;

#define alphaTest 2.0 / 255.0
float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

/**
 * Triangle Effect author: @zlnimda
 * https://www.shadertoy.com/view/4dV3Dh
 */

float rand(vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float GetLocation(vec2 s, float d) {
  vec2 f = s*d;

  // tris
  f = mod(f, 8.);
  
  f = f + vec2(0,0.5)*floor(f).x;
  s = fract(f);
  f = floor(f);

  d = s.y - 0.5;
  float l = abs(d) + 0.5 * s.x;
  float ff = f.x+f.y;
  f = mix(f, f+sign(d)*vec2(0,0.5), step(0.5, l));
  l = mix(ff, ff+sign(d)*0.5, step(0.5, l));

  return l * rand(vec2(f));
}

vec3 hsv2rgb(float h, float s, float v) {
  h = fract(h);
  vec3 c = smoothstep(2./6., 1./6., abs(h - vec3(0.5, 2./6., 4./6.)));
  c.r = 1.-c.r;
  return mix(vec3(s), vec3(1.0), c) * v;
}

vec3 getRandomColor(float f, float t) {
  return hsv2rgb(f+t, 0.1+cos(sin(f))*0.25, 0.9);
}

vec3 desaturate(in vec3 color, in float amount ) {
  return mix(color, vec3(dot(vec3(.3, .59, .11), color)), amount);
}

float triangleEffect() {
  float mx = max( resolution.x, resolution.y );
  float t = time*0.3;
  vec2 s = (vUv + vec2(1.0 / resolution.x, 0.0)) / mx;

  float f[3];
  f[0] = GetLocation(s, 12.);
  f[1] = GetLocation(s, 6.);
  f[2] = GetLocation(s, 3.);

  vec3 color = getRandomColor(f[1] *0.05 + 0.01*f[0] + 0.9*f[2], t);
  color = desaturate(color, 1.0);
  color *= intensity;
  return clamp(color.r, 0.0, 1.0);
}

void main() {
  vec3 img = texture(map, vUv).rgb;
  float sigDist = median(img.r, img.g, img.b) - 0.5;
  float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
  float effect = triangleEffect();
  pc_fragColor = vec4(color.xyz, alpha * opacity * effect);
  if (pc_fragColor.a < alphaTest) discard;
}