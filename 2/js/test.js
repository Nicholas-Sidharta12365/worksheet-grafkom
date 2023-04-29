// MultiJointModel_segment.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "attribute vec4 a_Normal;\n" +
  "uniform mat4 u_MvpMatrix;\n" +
  "uniform mat4 u_NormalMatrix;\n" +
  "varying vec4 v_Color;\n" +
  "void main() {\n" +
  "  gl_Position = u_MvpMatrix * a_Position;\n" +
  // The followings are some shading calculation to make the arm look three-dimensional
  "  vec3 lightDirection = normalize(vec3(0.7, 0.5, 0.2));\n" + // Light direction
  "  vec4 color = vec4(1.00, 0.91, 0.19, 1.00);\n" + // Chick color
  "  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n" +
  "  float nDotL = max(dot(normal, lightDirection), 0.0);\n" +
  "  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n" +
  "}\n";

// Fragment shader program
var FSHADER_SOURCE =
  "#ifdef GL_ES\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "varying vec4 v_Color;\n" +
  "void main() {\n" +
  "  gl_FragColor = v_Color;\n" +
  "}\n";

var demo = false;
var wireframe = false;
let animationStart;
var arah = 1;
var arah2 = 1;
var wireframe;
//var pointLightPosition = vec4(-5.0, 1.0, 10.0, 0.0);

var indexBuffer;
var indices;
var indices_pohon;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("Failed to set the vertex information");
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(1, 0.94, 0.94, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of attribute and uniform variables
  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
  var u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  if (a_Position < 0 || !u_MvpMatrix || !u_NormalMatrix) {
    console.log(
      "Failed to get the storage location of attribute or uniform variable"
    );
    return;
  }

  // Lightings
  //gl.uniform4fv(gl.getUniformLocation(gl.program, "pointLightPosition"), flatten(pointLightPosition));

  // Calculate the view projection matrix
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(80.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(20.0, 10.0, 50.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  viewProjMatrix.translate(-10.0, 0.0, 0.0);

  // Register the event handler to be called on key press
  document.onkeydown = function (ev) {
    keydown(ev, gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
  };

  draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

  // Wireframe
  document.getElementById("wireframe").onclick = function () {
    wireframe = !wireframe;
    console.log(wireframe);
    if (wireframe) {
      const btn = document.getElementById("wireframe");
      btn.textContent = "Wireframe on";
      draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    } else {
      const btn = document.getElementById("wireframe");
      btn.textContent = "Wireframe off";
      draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    }
  };

  // Animation
  document.getElementById("end-polygon").onclick = function () {
    demo = !demo;
    console.log(demo);
    if (demo) {
      const btn = document.getElementById("end-polygon");
      btn.textContent = "Stop Animation";
      animation(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    } else {
      const btn = document.getElementById("end-polygon");
      btn.textContent = "Demo Animation";
      stop_animation();
    }
  };
}

var ANGLE_STEP = 3.0; // The increments of rotation angle (degrees)

// PUPPY
var g_headAngle = 0.0; // The rotation angle of arm1 (degrees)
var g_joint1Angle = 0.0; // The rotation angle of joint1 (degrees)
var g_joint2Angle = 0.0; // The rotation angle of joint2 (degrees)
var g_joint3Angle = -45.0; // The rotation angle of joint3 (degrees)
var g_earAngle = 0.0;

// DUCKLING
var g_kepalaAngle = 0.0; // The rotation angle of head
var g_sayapAngle = 0.0; // The rotation angle of wing
var g_moncongAngle = 0.0; // The rotation angle of beak
var g_kakiAngle = 0.0; // The rotation angle of leg
var g_telapakAngle = 0.0; // The rotation angle of feet

function animation(
  gl,
  o,
  viewProjMatrix,
  a_Position,
  u_MvpMatrix,
  u_NormalMatrix
) {
  if (g_headAngle >= 15.0) {
    arah = 0;
  } else if (g_headAngle <= -15.0) {
    arah = 1;
  }
  if (arah == 1) g_headAngle += ANGLE_STEP;
  if (arah == 0) g_headAngle -= ANGLE_STEP;

  if (g_joint3Angle >= 5.0) {
    arah2 = 0;
  } else if (g_joint3Angle <= -65.0) {
    arah2 = 1;
  }
  if (arah2 == 1) g_joint3Angle += ANGLE_STEP;
  if (arah2 == 0) g_joint3Angle -= ANGLE_STEP;

  draw(gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
  animationStart = requestAnimationFrame(() =>
    animation(gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix)
  );
}

function stop_animation() {
  cancelAnimationFrame(animationStart);
}

function keydown(
  ev,
  gl,
  o,
  viewProjMatrix,
  a_Position,
  u_MvpMatrix,
  u_NormalMatrix
) {
  switch (ev.keyCode) {
    // PUPPY
    case 40: // Up arrow key -> the positive rotation of joint1 around the z-axis
      if (g_earAngle < 5.0) g_earAngle = (g_earAngle + ANGLE_STEP) % 360;
      break;
    case 38: // Down arrow key -> the negative rotation of joint1 around the z-axis
      if (g_earAngle > -20.0) g_earAngle = (g_earAngle - ANGLE_STEP) % 360;
      break;
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      if (g_headAngle < 15.0) g_headAngle += ANGLE_STEP;
      break;
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      if (g_headAngle > -15.0) g_headAngle -= ANGLE_STEP;
      break;
    case 90: // 'ｚ'key -> the positive rotation of joint2
      if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
      break;
    case 88: // 'x'key -> the negative rotation of joint2
      if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
      break;
    case 86: // 'v'key -> the positive rotation of joint3
      if (g_joint2Angle < 105.0) g_joint2Angle += ANGLE_STEP;
      break;
    case 67: // 'c'key -> the nagative rotation of joint3
      if (g_joint2Angle > -105.0) g_joint2Angle -= ANGLE_STEP;
      break;
    case 66: // 'b'key -> the positive rotation of joint3
      if (g_joint3Angle < 5.0) g_joint3Angle += ANGLE_STEP;
      break;
    case 78: // 'n'key -> the nagative rotation of joint3
      if (g_joint3Angle > -65.0) g_joint3Angle -= ANGLE_STEP;
      break;
    // DUCKLING
    case 73: // 'i'key -> the positive rotation of head joint
      if (g_kepalaAngle < 10.0) g_kepalaAngle += ANGLE_STEP;
      break;
    case 75: // 'k'key -> the negative rotation of head joint
      if (g_kepalaAngle > -10.0) g_kepalaAngle -= ANGLE_STEP;
      break;
    case 76: // 'l'key -> the positive rotation of wing joint
      if (g_sayapAngle < 35.0)
        g_sayapAngle = (g_sayapAngle + ANGLE_STEP * 4) % 360;
      break;
    case 74: // 'j'key -> the negative rotation of wings joint
      if (g_sayapAngle > 0.0)
        g_sayapAngle = (g_sayapAngle - ANGLE_STEP * 4) % 360;
      break;
    case 65: // 'a'key -> the positive rotation of beak joint
      if (g_moncongAngle < 0.0)
        g_moncongAngle = (g_moncongAngle + ANGLE_STEP) % 360;
      break;
    case 83: // 's'key -> the negative rotation of beak joint
      if (g_moncongAngle > -30.0)
        g_moncongAngle = (g_moncongAngle - ANGLE_STEP) % 360;
      break;
    case 68: // 'd'key -> the positive rotation of leg joint
      if (g_kakiAngle < 30.0) g_kakiAngle += ANGLE_STEP;
      break;
    case 70: // 'f'key -> the nagative rotation of leg joint
      if (g_kakiAngle > -30.0) g_kakiAngle -= ANGLE_STEP;
      break;
    case 71: // 'g'key -> the positive rotation of feet joint
      if (g_telapakAngle < 60.0) g_telapakAngle += ANGLE_STEP;
      break;
    case 72: // 'h'key -> the nagative rotation of feet joint
      if (g_telapakAngle > -30.0) g_telapakAngle -= ANGLE_STEP;
      break;
    default:
      return; // Skip drawing at no effective action
  }
  // Draw
  draw(gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

var g_baseBuffer = null; // Buffer object for a base
var g_headBuffer = null; // Buffer object for arm1
var g_legBuffer = null; // Buffer object for arm2
var g_leg2Buffer = null; // Buffer object for arm2
var g_leg3Buffer = null; // Buffer object for arm3
var g_leg4Buffer = null; // Buffer object for arm3
var g_arm5Buffer = null; // Buffer object for arm3
var g_ear1Buffer = null; // Buffer object for a palm
var g_ear2Buffer = null; // Buffer object for a palm
var g_snoutBuffer = null; // Buffer object for a palm
var g_jaw2Buffer = null; // Buffer object for a palm
var g_tailBuffer = null; // Buffer object for a palm
var g_fingerBuffer = null; // Buffer object for fingers
var g_pohon = null;

function initVertexBuffers(gl) {
  // PUPPY Vertex coordinate (prepare coordinates of cuboids for all segments)
  var vertices_base = new Float32Array([
    // Base(10x2x10) // Badan anjing
    5.0,
    10.0,
    0.0,
    0.0,
    10.0,
    0.0,
    0.0,
    5.0,
    0.0,
    5.0,
    5.0,
    0.0, // v0-v1-v2-v3 front OK
    5.0,
    10.0,
    0.0,
    5.0,
    5.0,
    0.0,
    5.0,
    5.0,
    10.0,
    5.0,
    10.0,
    10.0, // v0-v3-v4-v5 right
    5.0,
    10.0,
    0.0,
    5.0,
    10.0,
    10.0,
    0.0,
    10.0,
    10.0,
    0.0,
    10.0,
    0.0, // v0-v5-v6-v1 up OK
    0.0,
    10.0,
    0.0,
    0.0,
    10.0,
    10.0,
    0.0,
    5.0,
    10.0,
    0.0,
    5.0,
    0.0, // v1-v6-v7-v2 left
    0.0,
    5.0,
    10.0,
    5.0,
    5.0,
    10.0,
    5.0,
    5.0,
    0.0,
    0.0,
    5.0,
    0.0, // v7-v4-v3-v2 down OK
    5.0,
    5.0,
    10.0,
    0.0,
    5.0,
    10.0,
    0.0,
    10.0,
    10.0,
    5.0,
    10.0,
    10.0, // v4-v7-v6-v5 back
  ]);

  var vertices_head = new Float32Array([
    // Arm1(3x10x3) // kepala anjing
    2.5,
    5.0,
    0.0,
    -2.5,
    5.0,
    0.0,
    -2.5,
    0.0,
    0.0,
    2.5,
    0.0,
    0.0, // v0-v1-v2-v3 front
    2.5,
    5.0,
    0.0,
    2.5,
    0.0,
    0.0,
    2.5,
    0.0,
    3.0,
    2.5,
    5.0,
    3.0, // v0-v3-v4-v5 right
    2.5,
    5.0,
    0.0,
    2.5,
    5.0,
    3.0,
    -2.5,
    5.0,
    3.0,
    -2.5,
    5.0,
    0.0, // v0-v5-v6-v1 up
    -2.5,
    5.0,
    0.0,
    -2.5,
    5.0,
    3.0,
    -2.5,
    0.0,
    3.0,
    -2.5,
    0.0,
    0.0, // v1-v6-v7-v2 left
    -2.5,
    0.0,
    3.0,
    2.5,
    0.0,
    3.0,
    2.5,
    0.0,
    0.0,
    -2.5,
    0.0,
    0.0, // v7-v4-v3-v2 down
    2.5,
    0.0,
    3.0,
    -2.5,
    0.0,
    3.0,
    -2.5,
    5.0,
    3.0,
    2.5,
    5.0,
    3.0, // v4-v7-v6-v5 back
  ]);

  var vertices_jaw = new Float32Array([
    // Arm1(3x10x3) // kepala anjing
    1.5,
    1.0,
    0.0,
    -1.5,
    1.0,
    0.0,
    -1.5,
    0.0,
    0.0,
    1.5,
    0.0,
    0.0, // v0-v1-v2-v3 front
    1.5,
    1.0,
    0.0,
    1.5,
    0.0,
    0.0,
    1.5,
    0.0,
    2.0,
    1.5,
    1.0,
    2.0, // v0-v3-v4-v5 right
    1.5,
    1.0,
    0.0,
    1.5,
    1.0,
    2.0,
    -1.5,
    1.0,
    2.0,
    -1.5,
    1.0,
    0.0, // v0-v5-v6-v1 up
    -1.5,
    1.0,
    0.0,
    -1.5,
    1.0,
    2.0,
    -1.5,
    0.0,
    2.0,
    -1.5,
    0.0,
    0.0, // v1-v6-v7-v2 left
    -1.5,
    0.0,
    2.0,
    1.5,
    0.0,
    2.0,
    1.5,
    0.0,
    0.0,
    -1.5,
    0.0,
    0.0, // v7-v4-v3-v2 down
    1.5,
    0.0,
    2.0,
    -1.5,
    0.0,
    2.0,
    -1.5,
    1.0,
    2.0,
    1.5,
    1.0,
    2.0, // v4-v7-v6-v5 back
  ]);

  var vertices_leg = new Float32Array([
    // Arm2(4x10x4)
    -0.5,
    0,
    -0.5,
    0.5,
    0,
    -0.5,
    0.5,
    -4,
    -0.5,
    -0.5,
    -4,
    -0.5, // v4-v7-v6-v5 front
    0.5,
    0,
    -0.5,
    0.5,
    0,
    0.5,
    0.5,
    -4,
    0.5,
    0.5,
    -4,
    -0.5, // v0-v3-v4-v5 right
    -0.5,
    0,
    -0.5,
    0.5,
    0,
    -0.5,
    0.5,
    0,
    0.5,
    -0.5,
    0,
    0.5, // v0-v5-v6-v1 up
    -0.5,
    0,
    0.5,
    -0.5,
    0,
    -0.5,
    -0.5,
    -4,
    0.5,
    -0.5,
    -4,
    -0.5, // v1-v6-v7-v2 left
    -0.5,
    -4,
    -0.5,
    0.5,
    -4,
    -0.5,
    0.5,
    -4,
    0.5,
    -0.5,
    -4,
    0.5, // v7-v4-v3-v2 down
    0.5,
    0,
    0.5,
    -0.5,
    0,
    0.5,
    -0.5,
    -4,
    0.5,
    0.5,
    -4,
    0.5, // v0-v1-v2-v3 backz
  ]);

  var vertices_ear1 = new Float32Array([
    // Palm(2x2x6)
    1,
    2,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    1,
    0,
    0, // v0-v1-v2-v3 front
    1,
    2,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    2,
    1, // v0-v3-v4-v5 right
    1,
    2,
    0,
    1,
    2,
    1,
    0,
    2,
    1,
    0,
    2,
    0, // v0-v5-v6-v1 up
    0,
    2,
    0,
    0,
    2,
    1,
    0,
    0,
    1,
    0,
    0,
    0, // v1-v6-v7-v2 left
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    0,
    0,
    0,
    0, // v7-v4-v3-v2 down
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    2,
    1,
    1,
    2,
    1, // v4-v7-v6-v5 back
  ]);

  var vertices_tail = new Float32Array([
    // Palm(2x2x6)
    0.5,
    8.0,
    -1.0,
    -0.5,
    8.0,
    -1.0,
    -0.5,
    4.0,
    -1.0,
    0.5,
    4.0,
    -1.0, // v0-v1-v2-v3 front
    0.5,
    8.0,
    -1.0,
    0.5,
    4.0,
    -1.0,
    0.5,
    4.0,
    0.0,
    0.5,
    8.0,
    0.0, // v0-v3-v4-v5 right
    0.5,
    8.0,
    -1.0,
    0.5,
    8.0,
    0.0,
    -0.5,
    8.0,
    0.0,
    -0.5,
    8.0,
    -1.0, // v0-v5-v6-v1 up
    -0.5,
    8.0,
    -1.0,
    -0.5,
    8.0,
    0.0,
    -0.5,
    4.0,
    0.0,
    -0.5,
    4.0,
    -1.0, // v1-v6-v7-v2 left
    -0.5,
    4.0,
    0.0,
    0.5,
    4.0,
    0.0,
    0.5,
    4.0,
    -1.0,
    -0.5,
    4.0,
    -1.0, // v7-v4-v3-v2 down
    0.5,
    4.0,
    0.0,
    -0.5,
    4.0,
    0.0,
    -0.5,
    8.0,
    0.0,
    0.5,
    8.0,
    0.0, // v4-v7-v6-v5 back
  ]);

  var vertices_finger = new Float32Array([
    // Fingers(1x2x1)
    0.5,
    2.0,
    0.5,
    -0.5,
    2.0,
    0.5,
    -0.5,
    0.0,
    0.5,
    0.5,
    0.0,
    0.5, // v0-v1-v2-v3 front
    0.5,
    2.0,
    0.5,
    0.5,
    0.0,
    0.5,
    0.5,
    0.0,
    -0.5,
    0.5,
    2.0,
    -0.5, // v0-v3-v4-v5 right
    0.5,
    2.0,
    0.5,
    0.5,
    2.0,
    -0.5,
    -0.5,
    2.0,
    -0.5,
    -0.5,
    2.0,
    0.5, // v0-v5-v6-v1 up
    -0.5,
    2.0,
    0.5,
    -0.5,
    2.0,
    -0.5,
    -0.5,
    0.0,
    -0.5,
    -0.5,
    0.0,
    0.5, // v1-v6-v7-v2 left
    -0.5,
    0.0,
    -0.5,
    0.5,
    0.0,
    -0.5,
    0.5,
    0.0,
    0.5,
    -0.5,
    0.0,
    0.5, // v7-v4-v3-v2 down
    0.5,
    0.0,
    -0.5,
    -0.5,
    0.0,
    -0.5,
    -0.5,
    2.0,
    -0.5,
    0.5,
    2.0,
    -0.5, // v4-v7-v6-v5 back
  ]);

  // DUCKLING Vertex coordinate (prepare coordinates of cuboids for all segments)
  var vertices_base_duckling = new Float32Array([
    // Body(10x7x10)
    5.0,
    12.0,
    5.0,
    -5.0,
    12.0,
    5.0,
    -5.0,
    5.0,
    5.0,
    5.0,
    5.0,
    5.0, // v0-v1-v2-v3 front
    5.0,
    12.0,
    5.0,
    5.0,
    5.0,
    5.0,
    5.0,
    5.0,
    -5.0,
    5.0,
    12.0,
    -5.0, // v0-v3-v4-v5 right
    5.0,
    12.0,
    5.0,
    5.0,
    12.0,
    -5.0,
    -5.0,
    12.0,
    -5.0,
    -5.0,
    12.0,
    5.0, // v0-v5-v6-v1 up
    -5.0,
    12.0,
    5.0,
    -5.0,
    12.0,
    -5.0,
    -5.0,
    5.0,
    -5.0,
    -5.0,
    5.0,
    5.0, // v1-v6-v7-v2 left
    -5.0,
    5.0,
    -5.0,
    5.0,
    5.0,
    -5.0,
    5.0,
    5.0,
    5.0,
    -5.0,
    5.0,
    5.0, // v7-v4-v3-v2 down
    5.0,
    5.0,
    -5.0,
    -5.0,
    5.0,
    -5.0,
    -5.0,
    12.0,
    -5.0,
    5.0,
    12.0,
    -5.0, // v4-v7-v6-v5 back
  ]);

  var vertices_kepala = new Float32Array([
    // Head(8x7x6)
    4.0,
    15.0,
    9.5,
    -4.0,
    15.0,
    9.5,
    -4.0,
    8.0,
    9.5,
    4.0,
    8.0,
    9.5, // v0-v1-v2-v3 front
    4.0,
    15.0,
    9.5,
    4.0,
    8.0,
    9.5,
    4.0,
    8.0,
    3.5,
    4.0,
    15.0,
    3.5, // v0-v3-v4-v5 right
    4.0,
    15.0,
    9.5,
    4.0,
    15.0,
    3.5,
    -4.0,
    15.0,
    3.5,
    -4.0,
    15.0,
    9.5, // v0-v5-v6-v1 up
    -4.0,
    15.0,
    9.5,
    -4.0,
    15.0,
    3.5,
    -4.0,
    8.0,
    3.5,
    -4.0,
    8.0,
    9.5, // v1-v6-v7-v2 left
    -4.0,
    8.0,
    3.5,
    4.0,
    8.0,
    3.5,
    4.0,
    8.0,
    9.5,
    -4.0,
    8.0,
    9.5, // v7-v4-v3-v2 down
    4.0,
    8.0,
    3.5,
    -4.0,
    8.0,
    3.5,
    -4.0,
    15.0,
    3.5,
    4.0,
    15.0,
    3.5, // v4-v7-v6-v5 back
  ]);

  var vertices_sayap = new Float32Array([
    // Wing(2x6x9.8)
    1.0,
    -3.0,
    4.9,
    -1.0,
    -3.0,
    4.9,
    -1.0,
    3.0,
    4.9,
    1.0,
    3.0,
    4.9, // v4-v7-v6-v5 front
    1.0,
    3.0,
    -4.9,
    1.0,
    -3.0,
    -4.9,
    1.0,
    -3.0,
    4.9,
    1.0,
    3.0,
    4.9, // v0-v3-v4-v5 right
    1.0,
    3.0,
    -4.9,
    1.0,
    3.0,
    4.9,
    -1.0,
    3.0,
    4.9,
    -1.0,
    3.0,
    -4.9, // v0-v5-v6-v1 up
    -1.0,
    3.0,
    -4.9,
    -1.0,
    3.0,
    4.9,
    -1.0,
    -3.0,
    4.9,
    -1.0,
    -3.0,
    -4.9, // v1-v6-v7-v2 left
    -1.0,
    -3.0,
    4.9,
    1.0,
    -3.0,
    4.9,
    1.0,
    -3.0,
    -4.9,
    -1.0,
    -3.0,
    -4.9, // v7-v4-v3-v2 down
    1.0,
    3.0,
    -4.9,
    -1.0,
    3.0,
    -4.9,
    -1.0,
    -3.0,
    -4.9,
    1.0,
    -3.0,
    -4.9, // v0-v1-v2-v3 back
  ]);

  var vertices_moncong = new Float32Array([
    // Beak(7x1x7)
    3.5,
    1.0,
    2.0,
    -3.5,
    1.0,
    2.0,
    -3.5,
    0.0,
    2.0,
    3.5,
    0.0,
    2.0, // v0-v1-v2-v3 front
    3.5,
    1.0,
    2.0,
    3.5,
    0.0,
    2.0,
    3.5,
    0.0,
    -2.0,
    3.5,
    1.0,
    -2.0, // v0-v3-v4-v5 right
    3.5,
    1.0,
    2.0,
    3.5,
    1.0,
    -2.0,
    -3.5,
    1.0,
    -2.0,
    -3.5,
    1.0,
    2.0, // v0-v5-v6-v1 up
    -3.5,
    1.0,
    2.0,
    -3.5,
    1.0,
    -2.0,
    -3.5,
    0.0,
    -2.0,
    -3.5,
    0.0,
    2.0, // v1-v6-v7-v2 left
    -3.5,
    0.0,
    -2.0,
    3.5,
    0.0,
    -2.0,
    3.5,
    0.0,
    2.0,
    -3.5,
    0.0,
    2.0, // v7-v4-v3-v2 down
    3.5,
    0.0,
    -2.0,
    -3.5,
    0.0,
    -2.0,
    -3.5,
    1.0,
    -2.0,
    3.5,
    1.0,
    -2.0, // v4-v7-v6-v5 back
  ]);

  var vertices_kaki = new Float32Array([
    // Leg(2x4x2)
    1.0,
    2.0,
    1.0,
    -1.0,
    2.0,
    1.0,
    -1.0,
    -2.0,
    1.0,
    1.0,
    -2.0,
    1.0, // v0-v1-v2-v3 front
    1.0,
    2.0,
    1.0,
    1.0,
    -2.0,
    1.0,
    1.0,
    -2.0,
    -1.0,
    1.0,
    2.0,
    -1.0, // v0-v3-v4-v5 right
    1.0,
    2.0,
    1.0,
    1.0,
    2.0,
    -1.0,
    -1.0,
    2.0,
    -1.0,
    -1.0,
    2.0,
    1.0, // v0-v5-v6-v1 up
    -1.0,
    2.0,
    1.0,
    -1.0,
    2.0,
    -1.0,
    -1.0,
    -2.0,
    -1.0,
    -1.0,
    -2.0,
    1.0, // v1-v6-v7-v2 left
    -1.0,
    -2.0,
    -1.0,
    1.0,
    -2.0,
    -1.0,
    1.0,
    -2.0,
    1.0,
    -1.0,
    -2.0,
    1.0, // v7-v4-v3-v2 down
    1.0,
    -2.0,
    -1.0,
    -1.0,
    -2.0,
    -1.0,
    -1.0,
    2.0,
    -1.0,
    1.0,
    2.0,
    -1.0, // v4-v7-v6-v5 back
  ]);

  var vertices_telapak = new Float32Array([
    // Feet(4x1x4)
    2.0,
    0.0,
    2.0,
    -2.0,
    0.0,
    2.0,
    -2.0,
    1.0,
    2.0,
    2.0,
    1.0,
    2.0, // v0-v1-v2-v3 front
    2.0,
    0.0,
    2.0,
    2.0,
    1.0,
    2.0,
    2.0,
    1.0,
    -2.0,
    2.0,
    0.0,
    -2.0, // v0-v3-v4-v5 right
    -2.0,
    1.0,
    -2.0,
    2.0,
    1.0,
    -2.0,
    2.0,
    1.0,
    2.0,
    -2.0,
    1.0,
    2.0, // v7-v4-v3-v2 up
    -2.0,
    0.0,
    2.0,
    -2.0,
    0.0,
    -2.0,
    -2.0,
    1.0,
    -2.0,
    -2.0,
    1.0,
    2.0, // v1-v6-v7-v2 left
    2.0,
    0.0,
    2.0,
    2.0,
    0.0,
    -2.0,
    -2.0,
    0.0,
    -2.0,
    -2.0,
    0.0,
    2.0, // v0-v5-v6-v1 down
    2.0,
    1.0,
    -2.0,
    -2.0,
    1.0,
    -2.0,
    -2.0,
    0.0,
    -2.0,
    2.0,
    0.0,
    -2.0, // v4-v7-v6-v5 back
  ]);

  // PERSON Vertex coordinate (prepare coordinates of cuboids for all segments)
  var vertices_badan = new Float32Array([
    // Base(10x2x10) // Badan orang
    5.0,
    15.0,
    0.0,
    0.0,
    15.0,
    0.0,
    0.0,
    5.0,
    0.0,
    5.0,
    5.0,
    0.0, // v0-v1-v2-v3 front OK
    5.0,
    15.0,
    0.0,
    5.0,
    5.0,
    0.0,
    5.0,
    5.0,
    10.0,
    5.0,
    15.0,
    15.0, // v0-v3-v4-v5 right
    5.0,
    15.0,
    0.0,
    5.0,
    15.0,
    15.0,
    0.0,
    15.0,
    15.0,
    0.0,
    10.0,
    0.0, // v0-v5-v6-v1 up OK
    0.0,
    15.0,
    0.0,
    0.0,
    15.0,
    15.0,
    0.0,
    5.0,
    10.0,
    0.0,
    5.0,
    0.0, // v1-v6-v7-v2 left
    0.0,
    5.0,
    15.0,
    5.0,
    5.0,
    15.0,
    5.0,
    5.0,
    0.0,
    0.0,
    5.0,
    0.0, // v7-v4-v3-v2 down OK
    5.0,
    5.0,
    15.0,
    0.0,
    5.0,
    15.0,
    0.0,
    15.0,
    15.0,
    5.0,
    15.0,
    15.0, // v4-v7-v6-v5 back
  ]);

  // KITTEN

  var vertices_base_kitten = new Float32Array([
    // Base(10x2x10) // Badan anjing
    5.0,
    10.0,
    0.0,
    0.0,
    10.0,
    0.0,
    0.0,
    5.0,
    0.0,
    5.0,
    5.0,
    0.0, // v0-v1-v2-v3 front OK
    5.0,
    10.0,
    0.0,
    5.0,
    5.0,
    0.0,
    5.0,
    5.0,
    10.0,
    5.0,
    10.0,
    10.0, // v0-v3-v4-v5 right
    5.0,
    10.0,
    0.0,
    5.0,
    10.0,
    10.0,
    0.0,
    10.0,
    10.0,
    0.0,
    10.0,
    0.0, // v0-v5-v6-v1 up OK
    0.0,
    10.0,
    0.0,
    0.0,
    10.0,
    10.0,
    0.0,
    5.0,
    10.0,
    0.0,
    5.0,
    0.0, // v1-v6-v7-v2 left
    0.0,
    5.0,
    10.0,
    5.0,
    5.0,
    10.0,
    5.0,
    5.0,
    0.0,
    0.0,
    5.0,
    0.0, // v7-v4-v3-v2 down OK
    5.0,
    5.0,
    10.0,
    0.0,
    5.0,
    10.0,
    0.0,
    10.0,
    10.0,
    5.0,
    10.0,
    10.0, // v4-v7-v6-v5 back
  ]);

  var vertices_head_kitten = new Float32Array([
    // Arm1(3x10x3) // kepala anjing
    2.5,
    5.0,
    0.0,
    -2.5,
    5.0,
    0.0,
    -2.5,
    0.0,
    0.0,
    2.5,
    0.0,
    0.0, // v0-v1-v2-v3 front
    2.5,
    5.0,
    0.0,
    2.5,
    0.0,
    0.0,
    2.5,
    0.0,
    3.0,
    2.5,
    5.0,
    3.0, // v0-v3-v4-v5 right
    2.5,
    5.0,
    0.0,
    2.5,
    5.0,
    3.0,
    -2.5,
    5.0,
    3.0,
    -2.5,
    5.0,
    0.0, // v0-v5-v6-v1 up
    -2.5,
    5.0,
    0.0,
    -2.5,
    5.0,
    3.0,
    -2.5,
    0.0,
    3.0,
    -2.5,
    0.0,
    0.0, // v1-v6-v7-v2 left
    -2.5,
    0.0,
    3.0,
    2.5,
    0.0,
    3.0,
    2.5,
    0.0,
    0.0,
    -2.5,
    0.0,
    0.0, // v7-v4-v3-v2 down
    2.5,
    0.0,
    3.0,
    -2.5,
    0.0,
    3.0,
    -2.5,
    5.0,
    3.0,
    2.5,
    5.0,
    3.0, // v4-v7-v6-v5 back
  ]);

  var vertices_jaw_kitten = new Float32Array([
    // Arm1(3x10x3) // kepala anjing
    1.5,
    1.0,
    0.0,
    -1.5,
    1.0,
    0.0,
    -1.5,
    0.0,
    0.0,
    1.5,
    0.0,
    0.0, // v0-v1-v2-v3 front
    1.5,
    1.0,
    0.0,
    1.5,
    0.0,
    0.0,
    1.5,
    0.0,
    2.0,
    1.5,
    1.0,
    2.0, // v0-v3-v4-v5 right
    1.5,
    1.0,
    0.0,
    1.5,
    1.0,
    2.0,
    -1.5,
    1.0,
    2.0,
    -1.5,
    1.0,
    0.0, // v0-v5-v6-v1 up
    -1.5,
    1.0,
    0.0,
    -1.5,
    1.0,
    2.0,
    -1.5,
    0.0,
    2.0,
    -1.5,
    0.0,
    0.0, // v1-v6-v7-v2 left
    -1.5,
    0.0,
    2.0,
    1.5,
    0.0,
    2.0,
    1.5,
    0.0,
    0.0,
    -1.5,
    0.0,
    0.0, // v7-v4-v3-v2 down
    1.5,
    0.0,
    2.0,
    -1.5,
    0.0,
    2.0,
    -1.5,
    1.0,
    2.0,
    1.5,
    1.0,
    2.0, // v4-v7-v6-v5 back
  ]);

  var vertices_leg_kitten = new Float32Array([
    // Arm2(4x10x4)
    -0.5,
    0,
    -0.5,
    0.5,
    0,
    -0.5,
    0.5,
    -4,
    -0.5,
    -0.5,
    -4,
    -0.5, // v4-v7-v6-v5 front
    0.5,
    0,
    -0.5,
    0.5,
    0,
    0.5,
    0.5,
    -4,
    0.5,
    0.5,
    -4,
    -0.5, // v0-v3-v4-v5 right
    -0.5,
    0,
    -0.5,
    0.5,
    0,
    -0.5,
    0.5,
    0,
    0.5,
    -0.5,
    0,
    0.5, // v0-v5-v6-v1 up
    -0.5,
    0,
    0.5,
    -0.5,
    0,
    -0.5,
    -0.5,
    -4,
    0.5,
    -0.5,
    -4,
    -0.5, // v1-v6-v7-v2 left
    -0.5,
    -4,
    -0.5,
    0.5,
    -4,
    -0.5,
    0.5,
    -4,
    0.5,
    -0.5,
    -4,
    0.5, // v7-v4-v3-v2 down
    0.5,
    0,
    0.5,
    -0.5,
    0,
    0.5,
    -0.5,
    -4,
    0.5,
    0.5,
    -4,
    0.5, // v0-v1-v2-v3 backz
  ]);

  var vertices_ear1_kitten = new Float32Array([
    // Palm(2x2x6)
    1,
    2,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    1,
    0,
    0, // v0-v1-v2-v3 front
    1,
    2,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    2,
    1, // v0-v3-v4-v5 right
    1,
    2,
    0,
    1,
    2,
    1,
    0,
    2,
    1,
    0,
    2,
    0, // v0-v5-v6-v1 up
    0,
    2,
    0,
    0,
    2,
    1,
    0,
    0,
    1,
    0,
    0,
    0, // v1-v6-v7-v2 left
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    0,
    0,
    0,
    0, // v7-v4-v3-v2 down
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    2,
    1,
    1,
    2,
    1, // v4-v7-v6-v5 back
  ]);

  var vertices_tail_kitten = new Float32Array([
    // Palm(2x2x6)
    0.5,
    8.0,
    -1.0,
    -0.5,
    8.0,
    -1.0,
    -0.5,
    4.0,
    -1.0,
    0.5,
    4.0,
    -1.0, // v0-v1-v2-v3 front
    0.5,
    8.0,
    -1.0,
    0.5,
    4.0,
    -1.0,
    0.5,
    4.0,
    0.0,
    0.5,
    8.0,
    0.0, // v0-v3-v4-v5 right
    0.5,
    8.0,
    -1.0,
    0.5,
    8.0,
    0.0,
    -0.5,
    8.0,
    0.0,
    -0.5,
    8.0,
    -1.0, // v0-v5-v6-v1 up
    -0.5,
    8.0,
    -1.0,
    -0.5,
    8.0,
    0.0,
    -0.5,
    4.0,
    0.0,
    -0.5,
    4.0,
    -1.0, // v1-v6-v7-v2 left
    -0.5,
    4.0,
    0.0,
    0.5,
    4.0,
    0.0,
    0.5,
    4.0,
    -1.0,
    -0.5,
    4.0,
    -1.0, // v7-v4-v3-v2 down
    0.5,
    4.0,
    0.0,
    -0.5,
    4.0,
    0.0,
    -0.5,
    8.0,
    0.0,
    0.5,
    8.0,
    0.0, // v4-v7-v6-v5 back
  ]);

  var vertices_finger_kitten = new Float32Array([
    // Fingers(1x2x1)
    0.5,
    2.0,
    0.5,
    -0.5,
    2.0,
    0.5,
    -0.5,
    0.0,
    0.5,
    0.5,
    0.0,
    0.5, // v0-v1-v2-v3 front
    0.5,
    2.0,
    0.5,
    0.5,
    0.0,
    0.5,
    0.5,
    0.0,
    -0.5,
    0.5,
    2.0,
    -0.5, // v0-v3-v4-v5 right
    0.5,
    2.0,
    0.5,
    0.5,
    2.0,
    -0.5,
    -0.5,
    2.0,
    -0.5,
    -0.5,
    2.0,
    0.5, // v0-v5-v6-v1 up
    -0.5,
    2.0,
    0.5,
    -0.5,
    2.0,
    -0.5,
    -0.5,
    0.0,
    -0.5,
    -0.5,
    0.0,
    0.5, // v1-v6-v7-v2 left
    -0.5,
    0.0,
    -0.5,
    0.5,
    0.0,
    -0.5,
    0.5,
    0.0,
    0.5,
    -0.5,
    0.0,
    0.5, // v7-v4-v3-v2 down
    0.5,
    0.0,
    -0.5,
    -0.5,
    0.0,
    -0.5,
    -0.5,
    2.0,
    -0.5,
    0.5,
    2.0,
    -0.5, // v4-v7-v6-v5 back
  ]);

  var vertices_pohon = new Float32Array([
    //Circle.001

    2.064122, 23.499067, -17.300314, -11.737388, 25.764738, -10.884738,
    -18.94017, 20.814314, -1.951102, -15.326112, 24.470467, 13.243949,
    -0.088431, 20.408447, 18.058214, 14.99091, 20.393021, 12.787786, 19.639038,
    25.520189, 0.036745, 13.905548, 21.727205, -12.799134, -0.089301, 34.859619,
    -8.899817, -6.286034, 33.762421, -6.293122, -8.852807, 33.307945, -0.000001,
    -6.286034, 33.762421, 6.293118, -0.0893, 34.859619, 8.899814, 6.107434,
    35.956818, 6.293117, 8.674205, 36.411293, -0.000002, 6.107434, 35.956818,
    -6.293121, -0.121452, 36.42424, -16.553156, -10.416856, 35.702477,
    -10.803579, -16.625179, 30.850273, -0.796343, -11.645451, 34.383789,
    11.700972, -0.377262, 33.576088, 16.58499, 11.402543, 38.464691, 11.700969,
    16.552139, 36.419609, -0.06588, 11.402543, 38.464691, -11.705514, -0.089301,
    45.076851, -6.726863, -4.912837, 45.408524, -4.756611, -6.91081, 46.209267,
    -0.000003, -4.912837, 47.010002, 4.756604, -0.0893, 47.341675, 6.726854,
    4.734235, 47.010002, 4.756603, 6.732208, 46.209267, -0.000003, 4.734235,
    45.408524, -4.756611, 0.166691, 45.299309, -11.72431, -8.868371, 45.920586,
    -8.033793, -13.681742, 44.960045, 0.508634, -8.868371, 48.920334, 9.785601,
    -0.4705, 47.247795, 14.336117, 9.201752, 48.920334, 9.785599, 13.44323,
    45.321823, 1.437241, 8.220491, 47.663689, -7.11271, -0.272159, 55.874847,
    -5.402517, -4.191218, 57.016678, -3.726604, -5.652026, 58.202751, 0.26473,
    -3.798863, 58.738274, 4.233416, 0.282715, 58.309563, 5.85465, 4.201774,
    57.16774, 4.178737, 5.662581, 55.981667, 0.187404, 3.809419, 55.446136,
    -3.781282, 1.569271, 65.451492, -2.328117, -0.55909, 66.004097, -1.41729,
    -1.440686, 66.232986, 0.781639, -0.55909, 66.004097, 2.980568, 1.569271,
    65.451492, 3.891393, 3.697633, 64.898888, 2.980568, 4.579228, 64.669991,
    0.781639, 3.697633, 64.898888, -1.41729, 2.93418, 74.953621, 2.916236,
    -0.089301, 23.33857, -4.543018, -3.3017, 23.33857, -3.212399, -4.632319,
    23.33857, 0, -3.3017, 23.33857, 3.212399, -0.089301, 23.33857, 4.543018,
    3.123098, 23.33857, 3.212398, 4.453717, 23.33857, 0, 3.123098, 23.33857,
    -3.212399, -0.253425, 17.69154, -4.22114, -3.831959, 18.30476, -2.717257,
    -5.314237, 18.558764, 0.913439, -3.831959, 18.30476, 4.544135, -0.253424,
    17.691542, 6.048018, 3.325111, 17.078318, 4.544135, 4.807388, 16.824314,
    0.913439, 3.325111, 17.078318, -2.717256, -0.028691, 11.324992, -7.312461,
    -4.460969, 10.840245, -5.541702, -6.296878, 9.669967, -1.266713, -4.460969,
    8.499687, 3.008276, -0.02869, 8.014942, 4.779034, 4.403588, 8.499687,
    3.008276, 6.239497, 9.669967, -1.266713, 4.403588, 10.840245, -5.541702,
    -0.089301, -0.176852, -8.656096, -6.210089, -0.176852, -6.120784, -8.745401,
    -0.176851, 0.000004, -6.210089, -0.17685, 6.120791, -0.0893, -0.176849,
    8.656103, 6.031487, -0.17685, 6.12079, 8.566799, -0.176851, 0.000004,
    6.031487, -0.176852, -6.120783,
  ]);

  // Normal
  var normals = new Float32Array([
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0, // v0-v1-v2-v3 front
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0, // v0-v3-v4-v5 right
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0, // v0-v5-v6-v1 up
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0, // v1-v6-v7-v2 left
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0, // v7-v4-v3-v2 down
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0, // v4-v7-v6-v5 back
  ]);

  var vertices_kakiorang = new Float32Array([
    // Arm2(4x10x4)
    -0.5,
    0,
    -0.5,
    0.5,
    0,
    -0.5,
    0.5,
    -4,
    -0.5,
    -0.5,
    -4,
    -0.5, // v4-v7-v6-v5 front
    0.5,
    0,
    -0.5,
    0.5,
    0,
    0.5,
    0.5,
    -4,
    0.5,
    0.5,
    -4,
    -0.5, // v0-v3-v4-v5 right
    -0.5,
    0,
    -0.5,
    0.5,
    0,
    -0.5,
    0.5,
    0,
    0.5,
    -0.5,
    0,
    0.5, // v0-v5-v6-v1 up
    -0.5,
    0,
    0.5,
    -0.5,
    0,
    -0.5,
    -0.5,
    -4,
    0.5,
    -0.5,
    -4,
    -0.5, // v1-v6-v7-v2 left
    -0.5,
    -4,
    -0.5,
    0.5,
    -4,
    -0.5,
    0.5,
    -4,
    0.5,
    -0.5,
    -4,
    0.5, // v7-v4-v3-v2 down
    0.5,
    0,
    0.5,
    -0.5,
    0,
    0.5,
    -0.5,
    -4,
    0.5,
    0.5,
    -4,
    0.5, // v0-v1-v2-v3 backz
  ]);

  // Indices of the vertices
  indices = new Uint8Array([
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // right
    8,
    9,
    10,
    8,
    10,
    11, // up
    12,
    13,
    14,
    12,
    14,
    15, // left
    16,
    17,
    18,
    16,
    18,
    19, // down
    20,
    21,
    22,
    20,
    22,
    23, // back
  ]);

  indices_pohon = new Uint8Array([
    //Circle.001

    64, 65, 57, 70, 77, 78, 62, 71, 63, 61, 68, 69, 59, 66, 67, 63, 72, 64, 61,
    70, 62, 60, 67, 68, 58, 65, 66, 79, 88, 80, 67, 76, 68, 65, 74, 66, 72, 73,
    65, 71, 78, 79, 69, 76, 77, 66, 75, 67, 72, 79, 80, 86, 84, 82, 77, 86, 78,
    76, 83, 84, 74, 81, 82, 80, 81, 73, 78, 87, 79, 77, 84, 85, 75, 82, 83, 64,
    72, 65, 70, 69, 77, 62, 70, 71, 61, 60, 68, 59, 58, 66, 63, 71, 72, 61, 69,
    70, 60, 59, 67, 58, 57, 65, 79, 87, 88, 67, 75, 76, 65, 73, 74, 72, 80, 73,
    71, 70, 78, 69, 68, 76, 66, 74, 75, 72, 71, 79, 82, 81, 88, 88, 87, 86, 86,
    85, 84, 84, 83, 82, 82, 88, 86, 77, 85, 86, 76, 75, 83, 74, 73, 81, 80, 88,
    81, 78, 86, 87, 77, 76, 84, 75, 74, 82, 1, 57, 58, 9, 18, 17, 0, 15, 7, 6,
    13, 5, 4, 11, 3, 1, 10, 9, 6, 15, 14, 5, 12, 4, 3, 10, 2, 1, 8, 0, 23, 24,
    31, 14, 23, 22, 12, 21, 20, 10, 19, 18, 8, 17, 16, 15, 16, 23, 14, 21, 13,
    11, 20, 19, 27, 34, 26, 21, 30, 29, 20, 27, 19, 17, 26, 25, 22, 31, 30, 21,
    28, 20, 19, 26, 18, 17, 24, 16, 39, 46, 38, 25, 32, 24, 31, 32, 39, 29, 38,
    37, 28, 35, 27, 26, 33, 25, 30, 39, 38, 28, 37, 36, 44, 51, 43, 37, 44, 36,
    35, 42, 34, 33, 40, 32, 39, 40, 47, 37, 46, 45, 35, 44, 43, 34, 41, 33, 55,
    48, 56, 42, 49, 41, 46, 55, 54, 44, 53, 52, 43, 50, 42, 41, 48, 40, 47, 48,
    55, 45, 54, 53, 53, 54, 56, 51, 52, 56, 49, 50, 56, 54, 55, 56, 52, 53, 56,
    50, 51, 56, 48, 49, 56, 0, 64, 57, 5, 63, 6, 4, 60, 61, 1, 59, 2, 7, 63, 64,
    4, 62, 5, 3, 59, 60, 1, 0, 57, 9, 10, 18, 0, 8, 15, 6, 14, 13, 4, 12, 11, 1,
    2, 10, 6, 7, 15, 5, 13, 12, 3, 11, 10, 1, 9, 8, 23, 16, 24, 14, 15, 23, 12,
    13, 21, 10, 11, 19, 8, 9, 17, 15, 8, 16, 14, 22, 21, 11, 12, 20, 27, 35, 34,
    21, 22, 30, 20, 28, 27, 17, 18, 26, 22, 23, 31, 21, 29, 28, 19, 27, 26, 17,
    25, 24, 39, 47, 46, 25, 33, 32, 31, 24, 32, 29, 30, 38, 28, 36, 35, 26, 34,
    33, 30, 31, 39, 28, 29, 37, 44, 52, 51, 37, 45, 44, 35, 43, 42, 33, 41, 40,
    39, 32, 40, 37, 38, 46, 35, 36, 44, 34, 42, 41, 42, 50, 49, 46, 47, 55, 44,
    45, 53, 43, 51, 50, 41, 49, 48, 47, 40, 48, 45, 46, 54, 0, 7, 64, 5, 62, 63,
    4, 3, 60, 1, 58, 59, 7, 6, 63, 4, 61, 62, 3, 2, 59,
  ]);

  // Write coords to buffers, but don't assign to attribute variables
  // PUPPY
  g_baseBuffer = initArrayBufferForLaterUse(gl, vertices_base, 3, gl.FLOAT);
  g_headBuffer = initArrayBufferForLaterUse(gl, vertices_head, 3, gl.FLOAT);
  g_legBuffer = initArrayBufferForLaterUse(gl, vertices_leg, 3, gl.FLOAT);
  g_leg2Buffer = initArrayBufferForLaterUse(gl, vertices_leg, 3, gl.FLOAT);
  g_leg3Buffer = initArrayBufferForLaterUse(gl, vertices_leg, 3, gl.FLOAT);
  g_leg4Buffer = initArrayBufferForLaterUse(gl, vertices_leg, 3, gl.FLOAT);
  g_arm5Buffer = initArrayBufferForLaterUse(gl, vertices_leg, 3, gl.FLOAT);
  g_ear1Buffer = initArrayBufferForLaterUse(gl, vertices_ear1, 3, gl.FLOAT);
  g_ear2Buffer = initArrayBufferForLaterUse(gl, vertices_ear1, 3, gl.FLOAT);
  g_snoutBuffer = initArrayBufferForLaterUse(gl, vertices_jaw, 3, gl.FLOAT);
  g_jaw2Buffer = initArrayBufferForLaterUse(gl, vertices_jaw, 3, gl.FLOAT);
  g_tailBuffer = initArrayBufferForLaterUse(gl, vertices_tail, 3, gl.FLOAT);
  g_fingerBuffer = initArrayBufferForLaterUse(gl, vertices_finger, 3, gl.FLOAT);
  // DUCKLING
  g_baseBufferDuckling = initArrayBufferForLaterUse(
    gl,
    vertices_base_duckling,
    3,
    gl.FLOAT
  );
  g_kepalaBuffer = initArrayBufferForLaterUse(gl, vertices_kepala, 3, gl.FLOAT);
  g_sayapBuffer = initArrayBufferForLaterUse(gl, vertices_sayap, 3, gl.FLOAT);
  g_moncongBuffer = initArrayBufferForLaterUse(
    gl,
    vertices_moncong,
    3,
    gl.FLOAT
  );
  g_kakiBuffer = initArrayBufferForLaterUse(gl, vertices_kaki, 3, gl.FLOAT);
  g_telapakBuffer = initArrayBufferForLaterUse(
    gl,
    vertices_telapak,
    3,
    gl.FLOAT
  );
  // PERSON
  // g_badanBuffer = initArrayBufferForLaterUse(gl, vertices_badan, 3, gl.FLOAT);
  // g_kakiOrang1 = initArrayBufferForLaterUse(gl, vertices_kakiorang, 3, gl.FLOAT);
  // g_kakiOrang2 = initArrayBufferForLaterUse(gl, vertices_kakiorang, 3, gl.FLOAT);
  // KITTEN
  g_baseBuffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_base_kitten,
    3,
    gl.FLOAT
  );
  g_headBuffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_head_kitten,
    3,
    gl.FLOAT
  );
  g_legBuffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_leg_kitten,
    3,
    gl.FLOAT
  );
  g_leg2Buffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_leg_kitten,
    3,
    gl.FLOAT
  );
  g_leg3Buffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_leg_kitten,
    3,
    gl.FLOAT
  );
  g_leg4Buffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_leg_kitten,
    3,
    gl.FLOAT
  );
  g_arm5Buffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_leg_kitten,
    3,
    gl.FLOAT
  );
  g_ear1Buffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_ear1_kitten,
    3,
    gl.FLOAT
  );
  g_ear2Buffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_ear1_kitten,
    3,
    gl.FLOAT
  );
  g_snoutBuffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_jaw_kitten,
    3,
    gl.FLOAT
  );
  g_jaw2Buffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_jaw_kitten,
    3,
    gl.FLOAT
  );
  g_tailBuffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_tail_kitten,
    3,
    gl.FLOAT
  );
  g_fingerBuffer_kitten = initArrayBufferForLaterUse(
    gl,
    vertices_finger_kitten,
    3,
    gl.FLOAT
  );
  // POHON
  g_pohon = initArrayBufferForLaterUse(gl, vertices_pohon, 3, gl.FLOAT);
  // Buffer
  if (
    !g_pohon ||
    !g_baseBuffer ||
    !g_headBuffer ||
    !g_legBuffer ||
    !g_leg2Buffer ||
    !g_leg3Buffer ||
    !g_leg4Buffer ||
    !g_arm5Buffer ||
    !g_ear1Buffer ||
    !g_ear2Buffer ||
    !g_snoutBuffer ||
    !g_jaw2Buffer ||
    !g_tailBuffer ||
    !g_fingerBuffer ||
    !g_baseBufferDuckling ||
    !g_kepalaBuffer ||
    !g_sayapBuffer ||
    !g_moncongBuffer ||
    !g_kakiBuffer ||
    !g_telapakBuffer ||
    !g_baseBuffer_kitten ||
    !g_headBuffer_kitten ||
    !g_legBuffer_kitten ||
    !g_leg2Buffer_kitten ||
    !g_leg3Buffer_kitten ||
    !g_leg4Buffer_kitten ||
    !g_arm5Buffer_kitten ||
    !g_ear1Buffer_kitten ||
    !g_ear2Buffer_kitten ||
    !g_snoutBuffer_kitten ||
    !g_jaw2Buffer_kitten ||
    !g_tailBuffer_kitten ||
    !g_fingerBuffer_kitten
  )
    return -1;

  // Write normals to a buffer, assign it to a_Normal and enable it
  if (!initArrayBuffer(gl, "a_Normal", normals, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices_pohon, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
  var buffer = gl.createBuffer(); // Create a buffer object
  if (!buffer) {
    console.log("Failed to create the buffer object");
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Store the necessary information to assign the object to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initArrayBuffer(gl, attribute, data, num, type) {
  var buffer = gl.createBuffer(); // Create a buffer object
  if (!buffer) {
    console.log("Failed to create the buffer object");
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log("Failed to get the storage location of " + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

// Coordinate transformation matrix
var g_modelMatrix = new Matrix4(),
  g_mvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  // PUPPY

  // Draw a base
  var baseHeight = 5;
  var baseCenter = 2.5;
  var baseWidth = 10;
  g_modelMatrix.setTranslate(0.0, 0.0, 0.0);
  drawSegment(
    gl,
    n,
    g_baseBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  );

  // Head
  var headHeight = 4.5;
  var headCenter = 1.0;
  var headFront = 3.0;
  g_modelMatrix.translate(0, 0, 0); // Move onto the base
  g_modelMatrix.translate(baseCenter, baseHeight + baseHeight / 2, baseWidth); // Move onto the base
  g_modelMatrix.rotate(g_headAngle, 0.0, 1.0, 0.0); // Rotate around the y-axis
  drawSegment(
    gl,
    n,
    g_headBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
  pushMatrix(g_modelMatrix);
  pushMatrix(g_modelMatrix);

  // Ear 1
  g_modelMatrix.translate(1.4, headHeight, headCenter); // Move ear relative to head
  g_modelMatrix.rotate(g_earAngle, 0.0, 0.0, 1.0); // Rotate around the z-axis
  drawSegment(
    gl,
    n,
    g_ear1Buffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Ear 2
  g_modelMatrix = popMatrix();
  g_modelMatrix.translate(-2.0, headHeight, headCenter); // Move ear relative to head
  g_modelMatrix.rotate(-g_earAngle, 0.0, 0.0, 1.0); // Rotate around the z-axis
  drawSegment(
    gl,
    n,
    g_ear2Buffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
  // g_modelMatrix = popMatrix();

  // Snout
  g_modelMatrix = popMatrix();
  g_modelMatrix.translate(0, headCenter, headFront); // Move snout relative to head
  drawSegment(
    gl,
    n,
    g_snoutBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Leg1
  var legLength = 6.0;
  g_modelMatrix.setTranslate(0.0, 0.0, 0.0);
  g_modelMatrix.translate(0.0, legLength, 0.0); // Move to leg 1 joint
  g_modelMatrix.rotate(g_joint1Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_legBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Leg2
  g_modelMatrix.setTranslate(0.0, 0.0, 0.0);
  g_modelMatrix.translate(4.0, legLength, 0.0); // Move to leg 2 joint
  g_modelMatrix.rotate(g_joint1Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_leg2Buffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Leg3
  g_modelMatrix.setTranslate(0.0, 0.0, 0.0);
  g_modelMatrix.translate(0.5, legLength, 9.0); // Move to leg 3 joint
  g_modelMatrix.rotate(g_joint2Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_leg3Buffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Leg4
  g_modelMatrix.setTranslate(0.0, 0.0, 0.0);
  g_modelMatrix.translate(4.0, legLength, 9.0); // Move to leg 4 joint
  g_modelMatrix.rotate(g_joint2Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_leg4Buffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Tail
  g_modelMatrix.setTranslate(-1.0, 0.0, 0.0);
  g_modelMatrix.translate(4.0, legLength, 1.0); // Move to tail joint
  g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_tailBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // DUCKLING

  // Draw a base
  var baseHeight = 2.0;
  g_modelMatrix.setTranslate(10.0, -10.0, -10.0);
  drawSegment(
    gl,
    n,
    g_baseBufferDuckling,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  );

  // Head
  var arm1Length = 10.0;
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(0.0, baseHeight, 0.0); // Move onto the base
  g_modelMatrix.rotate(g_kepalaAngle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_kepalaBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Top beak
  var moncongHeight = 10.0;
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(0.0, moncongHeight, 10.0);
  g_modelMatrix.rotate(g_moncongAngle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_moncongBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
  g_modelMatrix = popMatrix();

  // Bottom beak
  g_modelMatrix.translate(0.0, moncongHeight - 1, 10.0);
  g_modelMatrix.rotate(-g_moncongAngle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_moncongBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
  g_modelMatrix = popMatrix();

  // Left wing
  var sayapHeight = 9.0;
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(6.0, sayapHeight, 0.0);
  g_modelMatrix.rotate(g_sayapAngle, 0.0, 0.0, 1.0); // Rotate around the z-axis
  drawSegment(
    gl,
    n,
    g_sayapBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
  g_modelMatrix = popMatrix();

  // Right wing
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(-6.0, sayapHeight, 0.0);
  g_modelMatrix.rotate(-g_sayapAngle, 0.0, 0.0, 1.0); // Rotate around the z-axis
  drawSegment(
    gl,
    n,
    g_sayapBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
  g_modelMatrix = popMatrix();

  // Left leg
  var kakiHeight = 3.0;
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(-5.0, kakiHeight, 0.0);
  g_modelMatrix.rotate(g_kakiAngle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_kakiBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
  g_modelMatrix = popMatrix();

  // Right leg
  g_modelMatrix.translate(1.0, kakiHeight, 0.0);
  g_modelMatrix.rotate(g_kakiAngle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_kakiBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Left foot
  var telapakHeight = -2.5;
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(-6.0, telapakHeight, 1.0);
  g_modelMatrix.rotate(g_telapakAngle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_telapakBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
  g_modelMatrix = popMatrix();

  // Right foot
  g_modelMatrix.translate(0.0, telapakHeight, 1.0);
  g_modelMatrix.rotate(g_telapakAngle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_telapakBuffer,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // PERSON

  // // Draw a badan
  // var basebadan = 2.0;
  // g_modelMatrix.setTranslate(30.0, -5.0, -10.0);
  // drawSegment(gl, n, g_badanBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

  // // Draw kaki orang 1
  // var legLength = 6.0;
  // g_modelMatrix.setTranslate(30.0, 0.0, 0.0);
  // g_modelMatrix.translate(0.0, legLength, 0.0);       // Move to leg 1 joint
  // // g_modelMatrix.rotate(g_joint1Angle, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  // drawSegment(gl, n, g_kakiOrang1, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw

  // KITTEN

  // Draw a base
  var baseHeight = 5;
  var baseCenter = 2.5;
  var baseWidth = 10;
  g_modelMatrix.setTranslate(30.0, 0.0, 0.0);
  drawSegment(
    gl,
    n,
    g_baseBuffer_kitten,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  );

  // Head
  var headHeight = 4.5;
  var headCenter = 1.0;
  var headFront = 3.0;
  g_modelMatrix.translate(0, 0, 0); // Move onto the base
  g_modelMatrix.translate(baseCenter, baseHeight + baseHeight / 2, baseWidth); // Move onto the base
  g_modelMatrix.rotate(g_headAngle, 0.0, 1.0, 0.0); // Rotate around the y-axis
  drawSegment(
    gl,
    n,
    g_headBuffer_kitten,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
  pushMatrix(g_modelMatrix);
  pushMatrix(g_modelMatrix);

  // Ear 1
  g_modelMatrix.translate(1.4, headHeight, headCenter); // Move ear relative to head
  g_modelMatrix.rotate(g_earAngle, 0.0, 0.0, 1.0); // Rotate around the z-axis
  drawSegment(
    gl,
    n,
    g_ear1Buffer_kitten,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Ear 2
  g_modelMatrix = popMatrix();
  g_modelMatrix.translate(-2.0, headHeight, headCenter); // Move ear relative to head
  g_modelMatrix.rotate(-g_earAngle, 0.0, 0.0, 1.0); // Rotate around the z-axis
  drawSegment(
    gl,
    n,
    g_ear2Buffer_kitten,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
  // g_modelMatrix = popMatrix();

  // Snout
  g_modelMatrix = popMatrix();
  g_modelMatrix.translate(0, headCenter, headFront); // Move snout relative to head
  drawSegment(
    gl,
    n,
    g_snoutBuffer_kitten,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Leg1
  var legLength = 6.0;
  g_modelMatrix.setTranslate(31.0, 0.0, 0.0);
  g_modelMatrix.translate(0.0, legLength, 0.0); // Move to leg 1 joint
  g_modelMatrix.rotate(g_joint1Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_legBuffer_kitten,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Leg2
  g_modelMatrix.setTranslate(31.0, 0.0, 0.0);
  g_modelMatrix.translate(4.0, legLength, 0.0); // Move to leg 2 joint
  g_modelMatrix.rotate(g_joint1Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_leg2Buffer_kitten,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Leg3
  g_modelMatrix.setTranslate(30.0, 0.0, 0.0);
  g_modelMatrix.translate(0.5, legLength, 9.0); // Move to leg 3 joint
  g_modelMatrix.rotate(g_joint2Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_leg3Buffer_kitten,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Leg4
  g_modelMatrix.setTranslate(30.0, 0.0, 0.0);
  g_modelMatrix.translate(4.0, legLength, 9.0); // Move to leg 4 joint
  g_modelMatrix.rotate(g_joint2Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_leg4Buffer_kitten,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // Tail
  g_modelMatrix.setTranslate(30.0, 0.0, 0.0);
  g_modelMatrix.translate(4.0, legLength, 1.0); // Move to tail joint
  g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
  drawSegment(
    gl,
    n,
    g_tailBuffer_kitten,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw

  // POHON
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices_pohon, gl.STATIC_DRAW);
  g_modelMatrix.setTranslate(0.0, 0.0, 0.0);
  g_modelMatrix.translate(0.0, 0.0, 0.0); // Move to tail joint
  drawSegment(
    gl,
    n,
    g_pohon,
    viewProjMatrix,
    a_Position,
    u_MvpMatrix,
    u_NormalMatrix
  ); // Draw
}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) {
  // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() {
  // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

var g_normalMatrix = new Matrix4(); // Coordinate transformation matrix for normals

// Draw segments
function drawSegment(
  gl,
  n,
  buffer,
  viewProjMatrix,
  a_Position,
  u_MvpMatrix,
  u_NormalMatrix
) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // Assign the buffer object to the attribute variable
  gl.vertexAttribPointer(a_Position, buffer.num, buffer.type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_Position);

  // Calculate the model view project matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
  // Calculate matrix for normal and pass it to u_NormalMatrix
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
  // Draw
  // Check wireframe
  //gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  if (wireframe == true) {
    gl.drawElements(gl.LINE_STRIP, n, gl.UNSIGNED_BYTE, 0);
  } else {
    console.log(wireframe);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }
}
