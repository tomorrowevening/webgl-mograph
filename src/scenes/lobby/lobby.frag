uniform float time;
uniform float brightness;
uniform vec2 resolution;
varying vec2 vUv;

#include ../../glsl/glsl-noise/simplex/3d.glsl

vec3 hueShift( vec3 color, float hueAdjust ){
	const vec3 kRGBToYPrime = vec3 (0.299, 0.587, 0.114);
	const vec3 kRGBToI      = vec3 (0.596, -0.275, -0.321);
	const vec3 kRGBToQ      = vec3 (0.212, -0.523, 0.311);

	const vec3 kYIQToR     = vec3 (1.0, 0.956, 0.621);
	const vec3 kYIQToG     = vec3 (1.0, -0.272, -0.647);
	const vec3 kYIQToB     = vec3 (1.0, -1.107, 1.704);

	float YPrime  = dot (color, kRGBToYPrime);
	float I       = dot (color, kRGBToI);
	float Q       = dot (color, kRGBToQ);
	float hue     = atan (Q, I);
	float chroma  = sqrt (I * I + Q * Q);
	hue += hueAdjust;

	Q = chroma * sin (hue);
	I = chroma * cos (hue);
	vec3 yIQ = vec3 (YPrime, I, Q);
	return vec3( dot (yIQ, kYIQToR), dot (yIQ, kYIQToG), dot (yIQ, kYIQToB) );
}

void main() {
  vec2 uv = vUv * 1.57;
	uv.x *= resolution.x / resolution.y;
	float t = time * 0.2;
	vec3 color = vec3(
		snoise(vec3(uv.x, uv.y, t + 0.00)) * 0.5 + 0.33,
		snoise(vec3(uv.x, uv.y, t + 0.25)) * 0.5 + 0.33,
		snoise(vec3(uv.x, uv.y, t + 0.50)) * 0.5 + 0.33
	);
	color = hueShift(color, time * 0.5);
  gl_FragColor = vec4(color * brightness, 1.0);
}