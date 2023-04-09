// creating constants on sin and cos
const cos = (x) => Math.cos(radians(x))
const sin = (x) => Math.sin(radians(x))

// getting the orbit
const getOrbit = (center) => vec3(center[1], -center[0], center[2])

// getting the clockPosition
const clockPosition = (oclock) => vec3(sin(oclock * 30), cos(oclock * 30), 0)

// Revolve the clock
const revolveClock = (v, deg, oclock) => {
  const u = clockPosition(oclock)
  const c = cos(deg), s = sin(deg), oneMinCos = (1 - c);

  // rotate vector around arbitrary axis
  // Source for rotation matrix https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
  const R = [
    c + u[0] * u[0] * oneMinCos,
    u[0] * u[1] * oneMinCos - u[2] * s,
    u[0] * u[2] * oneMinCos + u[1] * s,
    u[0] * u[1] * oneMinCos + u[2] * s,
    c + u[1] * u[1] * oneMinCos,
    u[2] * u[1] * oneMinCos - u[0] * s,
    u[2] * u[0] * oneMinCos - u[1] * s,
    u[2] * u[1] * oneMinCos + u[0] * s,
    c + u[2] * u[2] * oneMinCos,
  ]

  return [
    R[0] * v[0] + R[1] * v[1] + R[2] * v[2],
    R[3] * v[0] + R[4] * v[1] + R[5] * v[2],
    R[6] * v[0] + R[7] * v[1] + R[8] * v[2],
  ]
}

// finding the number given below the tolerance so that we may get the correct calculation
const matEqual = (a, b) => {
  const tolerance = Number.EPSILON
  return a.reduce((prev, cur, idx) => prev && Math.abs(a[idx] - b[idx]) < tolerance, true)
}