uniform float time;
uniform float brightness;
uniform vec2 resolution;
varying vec2 vUv;

#include ../../glsl/glsl-noise/simplex/3d.glsl

const mat4 bayertl = mat4( 
  0.0/64.0, 32.0/64.0,  8.0/64.0, 40.0/64.0,
  48.0/64.0, 16.0/64.0, 56.0/64.0, 24.0/64.0,
  12.0/64.0, 44.0/64.0,  4.0/64.0, 36.0/64.0,
  60.0/64.0, 28.0/64.0, 52.0/64.0, 20.0/64.0
);

const mat4 bayertr = mat4( 
  2.0/64.0, 34.0/64.0, 10.0/64.0, 42.0/64.0,
  50.0/64.0, 18.0/64.0, 58.0/64.0, 26.0/64.0,
  14.0/64.0, 46.0/64.0,  6.0/64.0, 38.0/64.0,
  62.0/64.0, 30.0/64.0, 54.0/64.0, 22.0/64.0
);

const mat4 bayerbl = mat4( 
  3.0/64.0, 35.0/64.0, 11.0/64.0, 43.0/64.0,
  51.0/64.0, 19.0/64.0, 59.0/64.0, 27.0/64.0,
  15.0/64.0, 47.0/64.0,  7.0/64.0, 39.0/64.0,
  63.0/64.0, 31.0/64.0, 55.0/64.0, 23.0/64.0
);

const mat4 bayerbr = mat4( 
  1.0/64.0, 33.0/64.0,  9.0/64.0, 41.0/64.0,
  49.0/64.0, 17.0/64.0, 57.0/64.0, 25.0/64.0,
  13.0/64.0, 45.0/64.0,  5.0/64.0, 37.0/64.0,
  61.0/64.0, 29.0/64.0, 53.0/64.0, 21.0/64.0
);

float dither(mat4 m, ivec2 p) {
	if( p.y == 0 ) {
		if( p.x == 0 ) return m[0][0];
		else if( p.x == 1 ) return m[1][0];
		else if( p.x == 2 ) return m[2][0];
		else return m[3][0];
	}
	else if( p.y == 1 ) {
		if( p.x == 0 ) return m[0][1];
		else if( p.x == 1 ) return m[1][1];
		else if( p.x == 2 ) return m[2][1];
		else return m[3][1];
	}	else if( p.y == 2 ) {
		if( p.x == 0 ) return m[0][1];
		else if( p.x == 1 ) return m[1][2];
		else if( p.x == 2 ) return m[2][2];
		else return m[3][2];
	}	else {
		if( p.x == 0 ) return m[0][3];
		else if( p.x == 1 ) return m[1][3];
		else if( p.x == 2 ) return m[2][3];
		else return m[3][3];
	}	
}

vec3 ditherColor(vec3 c) {
  ivec2 p = ivec2(mod( gl_FragCoord.xy, 8.0 ));
  vec3 d = vec3(0.0);
	if( p.x <= 3 && p.y <= 3 ) {
		d.r = float(c.r > dither(bayertl, p));
		d.g = float(c.g > dither(bayertl, p));
		d.b = float(c.b > dither(bayertl, p));
	} else if ( p.x > 3 && p.y <= 3 ) {
		d.r = float(c.r > dither(bayertr, p -ivec2(4, 0)));
		d.g = float(c.g > dither(bayertr, p -ivec2(4, 0)));
		d.b = float(c.b > dither(bayertr, p -ivec2(4, 0)));
	} else if( p.x <= 3 && p.y > 3 ) {
		d.r = float(c.r > dither(bayerbl, p-ivec2(0, 4)));
		d.g = float(c.g > dither(bayerbl, p-ivec2(0, 4)));
		d.b = float(c.b > dither(bayerbl, p-ivec2(0, 4)));
	} else if ( p.x > 3 && p.y > 3 ) {
		d.r = float(c.r > dither(bayerbr, p -ivec2(4, 4)));
		d.g = float(c.g > dither(bayerbr, p -ivec2(4, 4)));
		d.b = float(c.b > dither(bayerbr, p -ivec2(4, 4)));
	}
  return d;
}

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
  color = ditherColor(color);
  gl_FragColor = vec4(color * brightness, 1.0);
}