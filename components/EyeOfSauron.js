import RingGeometry from "./RingGeometry"

const AMOUNT_RINGS = 30;

const RADIUS_MAX = 1.0;
const RADIUS_MIN = 0.0;

const WIDTH_MAX = 0.3 * Math.PI; // radians
const WIDTH_MIN = 1.0 * Math.PI; // radians

export default function EyeOfSauron() {

  let index, progress, radius, width;

  return (
    <group rotation={[Math.PI, 0, 0]}>
      {Array.from({length: AMOUNT_RINGS}).map((_, index) => {
        progress = (index / (AMOUNT_RINGS - 1));
        radius = ((RADIUS_MAX - RADIUS_MIN) * progress) + RADIUS_MIN;
        width = ((WIDTH_MAX - WIDTH_MIN) * progress) + WIDTH_MIN;
        if (index < 8) return null
        return <RingGeometry key={`ring-${index}`} index={index} radius={radius} horizontal={162} vertical={3} width={width}/>
      })}
    </group>
  )
}