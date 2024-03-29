#include <common>
#include <uv_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  #include <uv_vertex>
  #include <morphcolor_vertex>

#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
#endif

  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  vNormal = normal;
  vPosition = position;
}