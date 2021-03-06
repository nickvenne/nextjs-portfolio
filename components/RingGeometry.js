import * as THREE from "three"
import gsap from "gsap";


import {useMemo, useRef, useEffect} from "react"

const vertexShader = `
    
  vec4 mod289(vec4 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x)
  {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec2 fade2d(vec2 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  // Classic Perlin noise
  float classic2d(vec2 P)
  {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod289(Pi); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;

    vec4 i = permute(permute(ix) + iy);

    vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
    vec4 gy = abs(gx) - 0.5 ;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;

    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);

    vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;

    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));

    vec2 fade2d_xy = fade2d(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade2d_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade2d_xy.y);
    return 2.3 * n_xy;
  }

  vec4 fade4d(vec4 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  // Classic Perlin noise
  float classic4d(vec4 P)
  {
    vec4 Pi0 = floor(P); // Integer part for indexing
    vec4 Pi1 = Pi0 + 1.0; // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec4 Pf0 = fract(P); // Fractional part for interpolation
    vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = vec4(Pi0.zzzz);
    vec4 iz1 = vec4(Pi1.zzzz);
    vec4 iw0 = vec4(Pi0.wwww);
    vec4 iw1 = vec4(Pi1.wwww);

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 ixy00 = permute(ixy0 + iw0);
    vec4 ixy01 = permute(ixy0 + iw1);
    vec4 ixy10 = permute(ixy1 + iw0);
    vec4 ixy11 = permute(ixy1 + iw1);

    vec4 gx00 = ixy00 * (1.0 / 7.0);
    vec4 gy00 = floor(gx00) * (1.0 / 7.0);
    vec4 gz00 = floor(gy00) * (1.0 / 6.0);
    gx00 = fract(gx00) - 0.5;
    gy00 = fract(gy00) - 0.5;
    gz00 = fract(gz00) - 0.5;
    vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
    vec4 sw00 = step(gw00, vec4(0.0));
    gx00 -= sw00 * (step(0.0, gx00) - 0.5);
    gy00 -= sw00 * (step(0.0, gy00) - 0.5);

    vec4 gx01 = ixy01 * (1.0 / 7.0);
    vec4 gy01 = floor(gx01) * (1.0 / 7.0);
    vec4 gz01 = floor(gy01) * (1.0 / 6.0);
    gx01 = fract(gx01) - 0.5;
    gy01 = fract(gy01) - 0.5;
    gz01 = fract(gz01) - 0.5;
    vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
    vec4 sw01 = step(gw01, vec4(0.0));
    gx01 -= sw01 * (step(0.0, gx01) - 0.5);
    gy01 -= sw01 * (step(0.0, gy01) - 0.5);

    vec4 gx10 = ixy10 * (1.0 / 7.0);
    vec4 gy10 = floor(gx10) * (1.0 / 7.0);
    vec4 gz10 = floor(gy10) * (1.0 / 6.0);
    gx10 = fract(gx10) - 0.5;
    gy10 = fract(gy10) - 0.5;
    gz10 = fract(gz10) - 0.5;
    vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
    vec4 sw10 = step(gw10, vec4(0.0));
    gx10 -= sw10 * (step(0.0, gx10) - 0.5);
    gy10 -= sw10 * (step(0.0, gy10) - 0.5);

    vec4 gx11 = ixy11 * (1.0 / 7.0);
    vec4 gy11 = floor(gx11) * (1.0 / 7.0);
    vec4 gz11 = floor(gy11) * (1.0 / 6.0);
    gx11 = fract(gx11) - 0.5;
    gy11 = fract(gy11) - 0.5;
    gz11 = fract(gz11) - 0.5;
    vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
    vec4 sw11 = step(gw11, vec4(0.0));
    gx11 -= sw11 * (step(0.0, gx11) - 0.5);
    gy11 -= sw11 * (step(0.0, gy11) - 0.5);

    vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
    vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
    vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
    vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
    vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
    vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
    vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
    vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
    vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
    vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
    vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
    vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
    vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
    vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
    vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
    vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);

    vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
    g0000 *= norm00.x;
    g0100 *= norm00.y;
    g1000 *= norm00.z;
    g1100 *= norm00.w;

    vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
    g0001 *= norm01.x;
    g0101 *= norm01.y;
    g1001 *= norm01.z;
    g1101 *= norm01.w;

    vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
    g0010 *= norm10.x;
    g0110 *= norm10.y;
    g1010 *= norm10.z;
    g1110 *= norm10.w;

    vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
    g0011 *= norm11.x;
    g0111 *= norm11.y;
    g1011 *= norm11.z;
    g1111 *= norm11.w;

    float n0000 = dot(g0000, Pf0);
    float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
    float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
    float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
    float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
    float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
    float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
    float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
    float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
    float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
    float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
    float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
    float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
    float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
    float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
    float n1111 = dot(g1111, Pf1);

    vec4 fade4d_xyzw = fade4d(Pf0);
    vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade4d_xyzw.w);
    vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade4d_xyzw.w);
    vec4 n_zw = mix(n_0w, n_1w, fade4d_xyzw.z);
    vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade4d_xyzw.y);
    float n_xyzw = mix(n_yzw.x, n_yzw.y, fade4d_xyzw.x);
    return 2.2 * n_xyzw;
  }

  #define PI 3.14159265359;

  uniform float time;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    
    vec3 newPosition = position;
    
    vec3 origin = vec3(50.0, 0.0, 0.0);

    float radius = sqrt(pow(position.x, 2.0) + pow(position.y, 2.0) + pow(position.z, 2.0));
    float rotation = sin(time) * PI;
    float offset = classic2d(vec2(position)) + time;
    float noise = (0.2) * classic4d(vec4(position * 5.0, offset));
      
    float phi = atan(position.y, position.x);
    float theta = acos(position.z / radius);

    newPosition.x = radius * sin(theta + noise) * cos(phi);
    newPosition.y = radius * sin(theta + noise) * sin(phi);
    newPosition.z = radius * cos(theta + noise);

    vNormal = normal;
    vViewPosition = newPosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  }
`;

const fragmentShader = THREE.ShaderLib.phong.fragmentShader;

const animateRing = (ring, index) => {
  return gsap.to(ring.current.rotation, {
    x: Math.PI * 2,
    y: -Math.PI,
    ease: "power4.easeInOut",
    yoyo: true,
    repeat: -1,
    delay: index / 40,
    duration: 2.0,
  })
}

const animateRingReverse = (ring, index) => {
  gsap.to(ring.current.rotation, {
    x: 0,
    y: 0,
    ease: "power4.easeInOut",
    // delay: index / 40,
    duration: 2.0,
    onComplete: () => animateRing(ring, index)
  })
}

const useAnimateRing = (index) => {
  const ref = useRef()
  const tween = useRef(null)
  useEffect(() => {
    tween.current = gsap.to(ref.current.rotation, {
      x: Math.PI * 2,
      y: -Math.PI,
      ease: "power4.easeInOut",
      yoyo: true,
      repeat: -1,
      delay: index / 40,
      duration: 2.0,
    })
  }, [ref])
  return {ref, tween}
}

export default function RingGeometry ({radius, horizontal, vertical, width, index}) {

  const [vertices, uvs, normals] = useMemo(() => {
    const origin = new THREE.Vector3(0.0, 0.0, 0.0);

    const vertices = [];
    const normals = [];
    const uvs = [];

    const horizontalStep = (2 * Math.PI)  / (horizontal - 1);
    const verticalOffset = (width / 4) * -1;
    const verticalStep = (width / 2) / (vertical - 1);
    
    let vertex = new THREE.Vector3();
    let normal = new THREE.Vector3();

    let phi, theta; 

    // Generate vertices
    for (let indexHorizontal = 0; indexHorizontal < horizontal; indexHorizontal++) {
      for (let indexVertical = 0; indexVertical < vertical; indexVertical++) {
        phi = indexHorizontal * horizontalStep;
        theta = (indexVertical * verticalStep) + verticalOffset;

        vertex.x = radius * Math.cos(theta) * Math.sin(phi);
        vertex.y = radius * Math.cos(theta) * Math.cos(phi);
        vertex.z = radius * Math.sin(theta);

        vertices.push(vertex.x, vertex.y, vertex.z);

        // Normals
        normal.subVectors(vertex, origin).normalize();
            normals.push(normal.x, normal.y, normal.z);

        // Uv's
        uvs.push(indexHorizontal / horizontal);
        uvs.push(indexVertical / vertical)

      }
    }
    return [new THREE.Float32BufferAttribute(vertices, 3), new THREE.Float32BufferAttribute(uvs, 2), new THREE.Float32BufferAttribute(normals, 3)]
  }, [radius, horizontal, vertical, width])

  const [indices] = useMemo(() => {
    // Generate indices
    let indiceIndex = 0;
    const indices = [];
    let indice = new THREE.Vector4();

    for (let indexHorizontal = 0; indexHorizontal < horizontal; indexHorizontal++) {
    
      for (let indexVertical = 0; indexVertical < vertical; indexVertical++) {

        indiceIndex = (indexHorizontal * vertical) + indexVertical;

        indice.x = indiceIndex;
        indice.y = indiceIndex + vertical;
        indice.z = indiceIndex + 1;
        indice.w = indiceIndex + vertical + 1;

        if (indexVertical < (vertical - 1) && indiceIndex < ((vertical * horizontal) - vertical)) {
          indices.push(indice.x, indice.y, indice.z);
          indices.push(indice.y, indice.w, indice.z);
        }
      }
    }
    return [new THREE.Uint32BufferAttribute(indices, 1)];
  }, [horizontal, vertical])

  const data = useMemo(() => ({
    uniforms: Object.assign(THREE.ShaderLib.phong.uniforms, {
      time: {value: 0.0},
      color: {value: new THREE.Color('red')},
      shininess: {value: 100}
    }),
    vertexShader,
    fragmentShader
  }), [])

  const {ref: ring, tween} = useAnimateRing(index)

  useEffect(() => {
    tween.current.play()
  }, [])

  return (
    <mesh ref={ring}>
      <bufferGeometry>
        <bufferAttribute
          array={indices.array}
          attach="index"
          count={indices.count}
          itemSize={1}
        />
        <bufferAttribute
          attachObject={["attributes", "position"]}
          array={vertices.array}
          count={vertices.count / 3}
          itemSize={3}
        />
        <bufferAttribute
          attachObject={["attributes", "uv"]}
          array={uvs.array}
          count={uvs.count / 2}
          itemSize={2}
        />
        <bufferAttribute
          attachObject={["attributes", "normal"]}
          array={normals.array}
          count={normals.count / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial attach="material" {...data} side={THREE.DoubleSide} lights={true}/>
    </mesh>
  )
}