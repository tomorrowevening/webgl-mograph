vec3 debugGrid(vec2 pos, vec2 res, vec2 offset, float gridSize, float gridWidth) {
  vec3 grid = vec3(0.0);
  float mainGrid = step(mod(pos.x - offset.x, gridSize), gridWidth) + step(mod(pos.y - offset.y, gridSize), gridWidth);
  grid = mix(grid, vec3(1.0), mainGrid * 0.25);
  float quads = step(mod(pos.x, res.x * 0.5), gridWidth * 2.0) + step(mod(pos.y, res.y * 0.5), gridWidth * 2.0);
  grid = mix(grid, vec3(1.0, 1.0, 0.0), quads * 0.75);
  return grid;
}
#pragma glslify: export(debugGrid)