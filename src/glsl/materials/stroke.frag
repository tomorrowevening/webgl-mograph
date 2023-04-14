uniform vec3 diffuse;
uniform float opacity;
uniform vec3 dash; // x = dash,  y = gap, z = offset
uniform vec3 trim; // x = start, y = end, z = offset
varying vec2 lineU; // x = pos, y = total length

#ifdef GL_OES_standard_derivatives
  #extension GL_OES_standard_derivatives : enable
#endif

float aastep(float threshold, float value) {
#if !defined(GL_ES) || __VERSION__ >= 300 || defined(GL_OES_standard_derivatives)
  float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
  return smoothstep(threshold-afwidth, threshold+afwidth, value);
#elif defined(AA_EDGE)
  float afwidth = AA_EDGE;
  return smoothstep(threshold-afwidth, threshold+afwidth, value);
#else 
  return step(threshold, value);
#endif
}

#define ALPHA_TEST 2.0 / 255.0

void main() {
  float opacityMod = 1.0;
  float offset = trim.z;
  
  // Dash
  if(dash.x > 0.0 && dash.y > 0.0) {
    offset = (dash.z * 0.5) - (trim.z * lineU.y);
    float dashEnd = dash.x + dash.y;
    float lineUMod = mod(lineU.x + offset, dashEnd);
    opacityMod = aastep(lineUMod, dash.x);
  }
  
  // Trim
  if(trim.x > 0.0 || trim.y < 1.0) {
    offset = trim.z;
    float per = lineU.x / lineU.y;
    float start = min(trim.x, trim.y) + offset;
    float end = max(trim.x, trim.y) + offset;

    if(start == end) {
      opacityMod = 0.0;
    } else if(end > 1.0) {
      if(per > end - 1.0 && per < start) {
        opacityMod = 0.0;
      }
    } else if(start < 0.0) {
      if(per > end && per < start + 1.0) {
        opacityMod = 0.0;
      }
    } else if(per < start || per > end) {
      opacityMod = 0.0;
    }
  }

  opacityMod *= opacity;
  if(opacityMod < ALPHA_TEST) discard;

  gl_FragColor = vec4(diffuse, opacityMod);
}