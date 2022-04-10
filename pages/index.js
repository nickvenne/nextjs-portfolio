import { Canvas, useFrame } from "@react-three/fiber"
import { softShadows } from "@react-three/drei"
import React, { useRef, useMemo, Suspense } from "react"
import { OrbitControls } from '@react-three/drei'
import EyeOfSauron from "../components/EyeOfSauron"

softShadows()

export default function IndexPage() {

  return (
    <>
      <Canvas shadows camera={{ fov: 45, aspect: 1, near: 0.01, far: 100}} >
        <color attach="background" args={['#593C4E']} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        <ambientLight color={"#59314f"}/>
        <hemisphereLight skyColor={"#F0D197"} groundColor={"#F0D197"} intensity={0.3}/>
        <spotLight position={[50,0,50]} color={"#F0D197"} power={2} castShadow={false}/>
        
        <EyeOfSauron/>
        
      </Canvas>
    </>
  )
}
