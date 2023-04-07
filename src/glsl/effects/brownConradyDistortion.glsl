vec2 brownConradyDistortion(vec2 uv, float effect1, float effect2) {
  float r2 = uv.x*uv.x + uv.y*uv.y;
  uv *= 2.0 + effect1 * r2 + effect2 * r2 * r2;
  return uv;
}
#pragma glslify: export(brownConradyDistortion)