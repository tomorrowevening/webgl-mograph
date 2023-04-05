vec2 brownConradyDistortion(vec2 uv, float effect1, float effect2) {
  // positive values of K1 give barrel distortion, negative give pincushion
  float barrelDistortion1 = effect1; // K1 in text books
  float barrelDistortion2 = effect2; // K2 in text books
  float r2 = uv.x*uv.x + uv.y*uv.y;
  uv *= 2.0 + barrelDistortion1 * r2 + barrelDistortion2 * r2 * r2;
  
  // tangential distortion (due to off center lens elements)
  // is not modeled in this function, but if it was, the terms would go here
  return uv;
}
#pragma glslify: export(brownConradyDistortion)