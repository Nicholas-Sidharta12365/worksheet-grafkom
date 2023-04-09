const cos = (x) => Math.cos(radians(x))
const sin = (x) => Math.sin(radians(x))
const getOrbit = (center) => vec3(center[1], -center[0], center[2])
const clockPosition = (oclock) => vec3(sin(oclock * 30), cos(oclock * 30), 0)
const revolveClock = (v, deg, oclock) => {
  const u = clockPosition(oclock)
  const c = cos(deg), s = sin(deg), oneMinCos = (1 - c);

  // rotate vector around arbitrary axis
  // Source for rotation matrix https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
  const R = mat3(
    c + u[0] * u[0] * oneMinCos,
    u[0] * u[1] * oneMinCos - u[2] * s,
    u[0] * u[2] * oneMinCos + u[1] * s,
    u[0] * u[1] * oneMinCos + u[2] * s,
    c + u[1] * u[1] * oneMinCos,
    u[2] * u[1] * oneMinCos - u[0] * s,
    u[2] * u[0] * oneMinCos - u[1] * s,
    u[2] * u[1] * oneMinCos + u[0] * s,
    c + u[2] * u[2] * oneMinCos,
  )

  return mult(R, v)
}
const matEqual = (a, b) => {
  const tolerance = Number.EPSILON
  return a.reduce((prev, cur, idx) => prev && Math.abs(a[idx], b[idx]) < tolerance,)
}