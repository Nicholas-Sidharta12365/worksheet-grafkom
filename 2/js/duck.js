// MultiJointModel_segment.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  // The followings are some shading calculation to make the arm look three-dimensional
  '  vec3 lightDirection = normalize(vec3(0.2, 0.3, 0.5));\n' + // Light direction
  '  vec4 color = vec4(0.992, 0.992, 0.588, 1.00);\n' +  // Chick color
  '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
  '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
  '  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var demo = false;
var arah = 1;
var arah2 = 1;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of attribute and uniform variables
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (a_Position < 0 || !u_MvpMatrix || !u_NormalMatrix) {
    console.log('Failed to get the storage location of attribute or uniform variable');
    return;
  }

  // Calculate the view projection matrix
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(15.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  viewProjMatrix.translate(1.0, 2.0, 0.0);

  // Register the event handler to be called on key press
  document.onkeydown = function (ev) { keydown(ev, gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); };

  document.getElementById("end-polygon").onclick = function () {
    demo = !demo;
    if (demo) {
      const btn = document.getElementById("end-polygon");
      btn.textContent = "Stop Animation"
      animation(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    } else {
      const btn = document.getElementById("end-polygon");
      btn.textContent = "Demo Animation"
      stop_animation();
    }
  }

  draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

// All in degrees
var ANGLE_STEP = 1.0;       // The increments of rotation angle
var g_angleHead = 0.0;    // The rotation angle of head
var g_angleWing = 0.0;     // The rotation angle of wing
var g_angleBeak = 0.0;   // The rotation angle of beak
var g_angleLeg = 0.0;      // The rotation angle of leg
var g_angleFeet = 0.0;   // The rotation angle of feet

function keydown(ev, gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
  switch (ev.keyCode) {
    case 40: // Up arrow key -> the positive rotation of head joint
      if (g_angleHead < 10.0) g_angleHead += ANGLE_STEP;
      break;
    case 38: // Down arrow key -> the negative rotation of head joint
      if (g_angleHead > -10.0) g_angleHead -= ANGLE_STEP;
      break;
    case 39: // Right arrow key -> the positive rotation of wing joint
      if (g_angleWing < 35.0) g_angleWing = (g_angleWing + ANGLE_STEP * 4) % 360;
      break;
    case 37: // Left arrow key -> the negative rotation of wings joint
      if (g_angleWing > 0.0) g_angleWing = (g_angleWing - ANGLE_STEP * 4) % 360;
      break;
    case 90: // 'ｚ'key -> the positive rotation of beak joint
      if (g_angleBeak < 0.0) g_angleBeak = (g_angleBeak + ANGLE_STEP) % 360;
      break;
    case 88: // 'x'key -> the negative rotation of beak joint
      if (g_angleBeak > -30.0) g_angleBeak = (g_angleBeak - ANGLE_STEP) % 360;
      break;
    case 86: // 'v'key -> the positive rotation of leg joint
      if (g_angleLeg < 30.0) g_angleLeg += ANGLE_STEP
      break;
    case 67: // 'c'key -> the nagative rotation of leg joint
      if (g_angleLeg > -30.0) g_angleLeg -= ANGLE_STEP
      break;
    case 66: // 'b'key -> the positive rotation of feet joint
      if (g_angleFeet < 60.0) g_angleFeet += ANGLE_STEP
      break;
    case 78: // 'n'key -> the nagative rotation of feet joint
      if (g_angleFeet > -30.0) g_angleFeet -= ANGLE_STEP
      break;
    default: return; // Skip drawing at no effective action
  }
  // Draw
  draw(gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

var g_baseBuffer = null;     // Buffer object for a base
var g_headBuffer = null;     // Buffer object for head
var g_wingBuffer = null;     // Buffer object for wings
var g_beakBuffer = null;     // Buffer object for beak
var g_legBuffer = null;     // Buffer object for legs
var g_feetBuffer = null;     // Buffer object for feet

function initVertexBuffers(gl) {
  // Vertex coordinate (prepare coordinates of cuboids for all segments)
  var vertices_base = new Float32Array([ // Body(10x7x10)
    5.0, 12.0, 5.0, -5.0, 12.0, 5.0, -5.0, 5.0, 5.0, 5.0, 5.0, 5.0, // v0-v1-v2-v3 front
    5.0, 12.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, -5.0, 5.0, 12.0, -5.0, // v0-v3-v4-v5 right
    5.0, 12.0, 5.0, 5.0, 12.0, -5.0, -5.0, 12.0, -5.0, -5.0, 12.0, 5.0, // v0-v5-v6-v1 up
    -5.0, 12.0, 5.0, -5.0, 12.0, -5.0, -5.0, 5.0, -5.0, -5.0, 5.0, 5.0, // v1-v6-v7-v2 left
    -5.0, 5.0, -5.0, 5.0, 5.0, -5.0, 5.0, 5.0, 5.0, -5.0, 5.0, 5.0, // v7-v4-v3-v2 down
    5.0, 5.0, -5.0, -5.0, 5.0, -5.0, -5.0, 12.0, -5.0, 5.0, 12.0, -5.0  // v4-v7-v6-v5 back
  ]);

  var vertices_head = new Float32Array([  // Head(8x7x6)
    4.0, 15.0, 9.5, -4.0, 15.0, 9.5, -4.0, 8.0, 9.5, 4.0, 8.0, 9.5, // v0-v1-v2-v3 front
    4.0, 15.0, 9.5, 4.0, 8.0, 9.5, 4.0, 8.0, 3.5, 4.0, 15.0, 3.5, // v0-v3-v4-v5 right
    4.0, 15.0, 9.5, 4.0, 15.0, 3.5, -4.0, 15.0, 3.5, -4.0, 15.0, 9.5, // v0-v5-v6-v1 up
    -4.0, 15.0, 9.5, -4.0, 15.0, 3.5, -4.0, 8.0, 3.5, -4.0, 8.0, 9.5, // v1-v6-v7-v2 left
    -4.0, 8.0, 3.5, 4.0, 8.0, 3.5, 4.0, 8.0, 9.5, -4.0, 8.0, 9.5, // v7-v4-v3-v2 down
    4.0, 8.0, 3.5, -4.0, 8.0, 3.5, -4.0, 15.0, 3.5, 4.0, 15.0, 3.5  // v4-v7-v6-v5 back
  ]);

  var vertices_wing = new Float32Array([  // Wing(2x6x9.8)
    1.0, -3.0, 4.9, -1.0, -3.0, 4.9, -1.0, 3.0, 4.9, 1.0, 3.0, 4.9,  // v4-v7-v6-v5 front
    1.0, 3.0, -4.9, 1.0, -3.0, -4.9, 1.0, -3.0, 4.9, 1.0, 3.0, 4.9, // v0-v3-v4-v5 right
    1.0, 3.0, -4.9, 1.0, 3.0, 4.9, -1.0, 3.0, 4.9, -1.0, 3.0, -4.9, // v0-v5-v6-v1 up
    -1.0, 3.0, -4.9, -1.0, 3.0, 4.9, -1.0, -3.0, 4.9, -1.0, -3.0, -4.9, // v1-v6-v7-v2 left
    -1.0, -3.0, 4.9, 1.0, -3.0, 4.9, 1.0, -3.0, -4.9, -1.0, -3.0, -4.9, // v7-v4-v3-v2 down
    1.0, 3.0, -4.9, -1.0, 3.0, -4.9, -1.0, -3.0, -4.9, 1.0, -3.0, -4.9, // v0-v1-v2-v3 back
  ]);

  var vertices_beak = new Float32Array([  // Beak(7x1x7)
    3.5, 1.0, 2.0, -3.5, 1.0, 2.0, -3.5, 0.0, 2.0, 3.5, 0.0, 2.0, // v0-v1-v2-v3 front
    3.5, 1.0, 2.0, 3.5, 0.0, 2.0, 3.5, 0.0, -2.0, 3.5, 1.0, -2.0, // v0-v3-v4-v5 right
    3.5, 1.0, 2.0, 3.5, 1.0, -2.0, -3.5, 1.0, -2.0, -3.5, 1.0, 2.0, // v0-v5-v6-v1 up
    -3.5, 1.0, 2.0, -3.5, 1.0, -2.0, -3.5, 0.0, -2.0, -3.5, 0.0, 2.0, // v1-v6-v7-v2 left
    -3.5, 0.0, -2.0, 3.5, 0.0, -2.0, 3.5, 0.0, 2.0, -3.5, 0.0, 2.0, // v7-v4-v3-v2 down
    3.5, 0.0, -2.0, -3.5, 0.0, -2.0, -3.5, 1.0, -2.0, 3.5, 1.0, -2.0  // v4-v7-v6-v5 back
  ]);

  var vertices_leg = new Float32Array([  // Leg(2x4x2)
    1.0, 2.0, 1.0, -1.0, 2.0, 1.0, -1.0, -2.0, 1.0, 1.0, -2.0, 1.0, // v0-v1-v2-v3 front
    1.0, 2.0, 1.0, 1.0, -2.0, 1.0, 1.0, -2.0, -1.0, 1.0, 2.0, -1.0, // v0-v3-v4-v5 right
    1.0, 2.0, 1.0, 1.0, 2.0, -1.0, -1.0, 2.0, -1.0, -1.0, 2.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 2.0, 1.0, -1.0, 2.0, -1.0, -1.0, -2.0, -1.0, -1.0, -2.0, 1.0, // v1-v6-v7-v2 left
    -1.0, -2.0, -1.0, 1.0, -2.0, -1.0, 1.0, -2.0, 1.0, -1.0, -2.0, 1.0, // v7-v4-v3-v2 down
    1.0, -2.0, -1.0, -1.0, -2.0, -1.0, -1.0, 2.0, -1.0, 1.0, 2.0, -1.0  // v4-v7-v6-v5 back
  ]);

  var vertices_feet = new Float32Array([  // Feet(4x1x4)
    2.0, 0.0, 2.0, -2.0, 0.0, 2.0, -2.0, 1.0, 2.0, 2.0, 1.0, 2.0, // v0-v1-v2-v3 front
    2.0, 0.0, 2.0, 2.0, 1.0, 2.0, 2.0, 1.0, -2.0, 2.0, 0.0, -2.0, // v0-v3-v4-v5 right
    -2.0, 1.0, -2.0, 2.0, 1.0, -2.0, 2.0, 1.0, 2.0, -2.0, 1.0, 2.0, // v7-v4-v3-v2 up
    -2.0, 0.0, 2.0, -2.0, 0.0, -2.0, -2.0, 1.0, -2.0, -2.0, 1.0, 2.0, // v1-v6-v7-v2 left
    2.0, 0.0, 2.0, 2.0, 0.0, -2.0, -2.0, 0.0, -2.0, -2.0, 0.0, 2.0, // v0-v5-v6-v1 down
    2.0, 1.0, -2.0, -2.0, 1.0, -2.0, -2.0, 0.0, -2.0, 2.0, 0.0, -2.0  // v4-v7-v6-v5 back
  ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0  // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
  ]);

  // Write coords to buffers, but don't assign to attribute variables
  g_baseBuffer = initArrayBufferForLaterUse(gl, vertices_base, 3, gl.FLOAT);
  g_headBuffer = initArrayBufferForLaterUse(gl, vertices_head, 3, gl.FLOAT);
  g_wingBuffer = initArrayBufferForLaterUse(gl, vertices_wing, 3, gl.FLOAT);
  g_beakBuffer = initArrayBufferForLaterUse(gl, vertices_beak, 3, gl.FLOAT);
  g_legBuffer = initArrayBufferForLaterUse(gl, vertices_leg, 3, gl.FLOAT);
  g_feetBuffer = initArrayBufferForLaterUse(gl, vertices_feet, 3, gl.FLOAT);

  if (!g_baseBuffer || !g_headBuffer || !g_wingBuffer || !g_beakBuffer || !g_legBuffer || !g_feetBuffer) return -1;

  // Write normals to a buffer, assign it to a_Normal and enable it
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
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
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}


// Coordinate transformation matrix
var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw a base
  var baseHeight = 2.0;
  g_modelMatrix.setTranslate(0.0, -10.0, 0.0);
  drawSegment(gl, n, g_baseBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

  // Head
  var arm1Length = 10.0;
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(0.0, baseHeight, 0.0);     // Move onto the base
  g_modelMatrix.rotate(g_angleHead, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  drawSegment(gl, n, g_headBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw

  // Top beak
  var moncongHeight = 10.0
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(0.0, moncongHeight, 10.0);
  g_modelMatrix.rotate(g_angleBeak, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  drawSegment(gl, n, g_beakBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw
  g_modelMatrix = popMatrix();

  // Bottom beak
  g_modelMatrix.translate(0.0, moncongHeight - 1, 10.0);
  g_modelMatrix.rotate(-g_angleBeak, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  drawSegment(gl, n, g_beakBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw
  g_modelMatrix = popMatrix();

  // Left wing
  var sayapHeight = 9.0
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(6.0, sayapHeight, 0.0);
  g_modelMatrix.rotate(g_angleWing, 0.0, 0.0, 1.0);  // Rotate around the z-axis
  drawSegment(gl, n, g_wingBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw
  g_modelMatrix = popMatrix();

  // Right wing
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(-6.0, sayapHeight, 0.0);
  g_modelMatrix.rotate(-g_angleWing, 0.0, 0.0, 1.0);  // Rotate around the z-axis
  drawSegment(gl, n, g_wingBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw
  g_modelMatrix = popMatrix();

  // Left leg
  var kakiHeight = 3.0
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(-5.0, kakiHeight, 0.0);
  g_modelMatrix.rotate(g_angleLeg, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  drawSegment(gl, n, g_legBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw
  g_modelMatrix = popMatrix();

  // Right leg
  g_modelMatrix.translate(1.0, kakiHeight, 0.0);
  g_modelMatrix.rotate(g_angleLeg, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  drawSegment(gl, n, g_legBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw

  // Left foot
  var telapakHeight = -2.5
  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(-6.0, telapakHeight, 1.0);
  g_modelMatrix.rotate(g_angleFeet, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  drawSegment(gl, n, g_feetBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw
  g_modelMatrix = popMatrix();

  // Right foot
  g_modelMatrix.translate(0.0, telapakHeight, 1.0);
  g_modelMatrix.rotate(g_angleFeet, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  drawSegment(gl, n, g_feetBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw

}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals

// Draw segments
function drawSegment(gl, n, buffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
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
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function animation(gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
  if (g_angleWing >= 35.0) {
    arah = 0;
  } else if (g_angleWing <= 0.0) {
    arah = 1;
  }

  if (arah == 1) g_angleWing = (g_angleWing + ANGLE_STEP * 4) % 360;
  if (arah == 0) g_angleWing = (g_angleWing - ANGLE_STEP * 4) % 360;

  if (g_angleHead >= 10.0) {
    arah2 = 0;
  } else if (g_angleHead <= -10.0) {
    arah2 = 1;
  }

  if (arah2 == 1) g_angleHead += ANGLE_STEP/2;
  if (arah2 == 0) g_angleHead -= ANGLE_STEP/2;

  draw(gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix)
  animationStart = requestAnimationFrame(() => animation(gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix));
}

function stop_animation() {
  cancelAnimationFrame(animationStart)
}