// Use strict mode to enforce stricter syntax rules and prevent common mistakes.
"use strict";

// Declare global variables for the canvas, WebGL context, and other settings.
var canvas;
var gl;

var primitiveType;
var offset = 0;
var count = 18;

var speed1 = 0;
var speed2 = 0;
var speed3 = 0;

var colorUniformLocation;
var translation = [200, 200]; // Top-left corner of rectangle
var angle = 0;
var angleInRadians = 0;
var scale = [1.0, 1.0]; // Default scale
var matrix;
var matrixLocation;
var translationMatrix;
var rotationMatrix;
var scaleMatrix;
var moveOriginMatrix; // Move origin to the center of the letter as the center of rotation
var projectionMatrix;

var movement = 1;
var currentposition = 0;
var scalefactor = 0.005;
var currentscale = 0.005;
var middlewidth = 0;

// Wait for the window to finish loading before initializing the program.
window.onload = function init() {
  // Get a reference to the canvas element and WebGL context.
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) alert("WebGL 2.0 isn't available");

  // Set the viewport size and background color.
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1.0);

  // Load the shaders and initialize attribute buffers.
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Create a buffer object for the rectangle data.
  var letterbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, letterbuffer);

  // Specify the vertex data for the rectangle.
  // TODO: Add code to fill the buffer with vertex data.

  // Associate our shader variables with the vertex buffer.
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Get references to the uniform variables in the shaders.
  colorUniformLocation = gl.getUniformLocation(program, "u_color");
  matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Set the middle width of the canvas for use in the rendering function.
  middlewidth = Math.floor(gl.canvas.width / 2);

  // Set up event listeners for buttons to control movement, rotation, and scaling.
  document.getElementById("speed-sq").onclick = function (event) {
    speed1 += 1;
  };
  document.getElementById("dec-sq").onclick = function (event) {
    speed1 -= 1;
  };
  document.getElementById("speed-tr").onclick = function (event) {
    speed2 += 1;
  };
  document.getElementById("dec-tr").onclick = function (event) {
    speed2 -= 1;
  };
  document.getElementById("speed-3").onclick = function (event) {
    speed3 += 1;
  };
  document.getElementById("dec-3").onclick = function (event) {
    speed3 -= 1;
  };

  // Set the default primitive type and render the rectangle.
  primitiveType = gl.TRIANGLES;
  render();
};

// The main rendering function
function render() {
  // Update the current position and scale of the objects
  currentposition += movement;
  currentscale += scalefactor;

  // Make the objects bounce off the sides of the screen
  if (currentposition > middlewidth) {
    currentposition = middlewidth;
    movement = -movement;
  }
  if (currentposition < 0) {
    currentposition = 0;
    movement = -movement;
  }

  // Limit the maximum and minimum scaling of the objects
  if (currentscale > 2) {
    currentscale = 2.0;
    scalefactor = -scalefactor;
  }
  if (currentscale < 0.005) {
    currentscale = 0.005;
    scalefactor = -scalefactor;
  }

  // Increment the rotation angle of the objects
  angle += 1.0;

  // Clear the screen and draw the objects
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawObject1();
  drawObject2();
  drawobject3();

  // Request the next animation frame to update the screen
  requestAnimationFrame(render);
}

// Draw the first object
function drawObject1() {
  count = 6; // Number of vertices in the geometry
  translation = [middlewidth - 130, gl.canvas.height / 2 - 90]; // Translation vector for the object

  angleInRadians = 360 - (angle * Math.PI) / 180; // Rotation angle in radians

  setGeometry(gl, 1); // Set the geometry of the object

  matrix = m3.identity(); // Initialize the transformation matrix

  projectionMatrix = m3.projection(gl.canvas.width, gl.canvas.height); // Create the projection matrix
  translationMatrix = m3.translation(
    translation[0] - currentposition,
    translation[1]
  ); // Create the translation matrix
  rotationMatrix = m3.rotation(angleInRadians); // Create the rotation matrix
  scaleMatrix = m3.scaling(scale[0] + currentscale, scale[1] + currentscale); // Create the scaling matrix
  moveOriginMatrix = m3.translation(-65, -90); // Create the matrix to move the origin to the center of the object

  // Multiply the matrices to create the final transformation matrix
  matrix = m3.multiply(projectionMatrix, rotationMatrix);
  if (speed1 > 0) {
    for (let i = 0; i < speed1; i++) {
      matrix = m3.multiply(matrix, rotationMatrix);
    }
  }
  matrix = m3.multiply(matrix, translationMatrix);
  matrix = m3.multiply(matrix, moveOriginMatrix);
  matrix = m3.multiply(matrix, scaleMatrix);

  // Set the color of the object
  gl.uniform4f(colorUniformLocation, 0.3765, 1, 0, 1.0);

  // Set the transformation matrix as a uniform variable in the shader program
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  // Draw the object using the WebGL context
  gl.drawArrays(primitiveType, offset, count);
}

/**
 * Draws the second object on the canvas.
 *
 * @function
 * @name drawObject2
 * @return {void}
 */
function drawObject2() {
  count = 4; // number of vertices in the object

  // Set the geometry.
  setGeometry(gl, 2);

  // Set the translation values for the object.
  translation = [middlewidth + 100, gl.canvas.height / 2 - 90];

  // Calculate the angle in radians for the rotation of the object.
  angleInRadians = 180 - (angle * Math.PI) / 180; // rotating counter clockwise

  // Create an identity matrix.
  matrix = m3.identity();

  // Create a projection matrix and a translation matrix for the object.
  projectionMatrix = m3.projection(gl.canvas.width, gl.canvas.height);
  translationMatrix = m3.translation(
    translation[0] + currentposition,
    translation[1]
  );

  // Create a rotation matrix, a scaling matrix, and a matrix to move the origin.
  rotationMatrix = m3.rotation(angleInRadians);
  scaleMatrix = m3.scaling(scale[0] + currentscale, scale[1] + currentscale);
  moveOriginMatrix = m3.translation(-50, -90);

  // Multiply the matrices.
  matrix = m3.multiply(projectionMatrix, rotationMatrix);
  matrix = m3.multiply(matrix, rotationMatrix);

  // If the speed of the object is greater than 0, rotate the object multiple times.
  if (speed2 > 0) {
    for (let i = 0; i < speed2; i++) {
      matrix = m3.multiply(matrix, rotationMatrix);
    }
  }

  // Set the color of the object.
  gl.uniform4f(colorUniformLocation, 0.4353, 0.7804, 0.9882, 1.0);

  // Set the matrix uniform.
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  // Draw the object.
  gl.drawArrays(primitiveType, offset, count);
}

// This function draws a 2D object using WebGL.
function drawobject3() {
  // Set the number of vertices.
  count = 18;

  // Set the geometry.
  setGeometry(gl, 3);

  // Set the translation.
  translation = [middlewidth + 100, gl.canvas.height / 2 - 90];

  // Set the angle of rotation.
  angleInRadians = (angle * Math.PI) / 180; //rotating counter clockwise

  // Create the transformation matrices.
  matrix = m3.identity();
  projectionMatrix = m3.projection(gl.canvas.width, gl.canvas.height);
  translationMatrix = m3.translation(
    translation[0] + currentposition,
    translation[1]
  );
  rotationMatrix = m3.rotation(angleInRadians);
  scaleMatrix = m3.scaling(scale[0] + currentscale, scale[1] + currentscale);
  moveOriginMatrix = m3.translation(-50, -90);

  // Multiply the matrices.
  matrix = m3.multiply(projectionMatrix, rotationMatrix);
  if (speed3 > 0) {
    for (let i = 0; i < speed3; i++) {
      matrix = m3.multiply(matrix, rotationMatrix);
    }
  }

  // Set the color.
  gl.uniform4f(colorUniformLocation, 1, 0.9647, 0.2196, 1.0);

  // Set the matrix.
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  // Draw the object.
  gl.drawArrays(primitiveType, offset, count);
}

// This object defines a set of functions for performing 3x3 matrix transformations.

var m3 = {
  // Return the identity matrix.
  identity: function () {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  },

  // Return a projection matrix that scales X and Y coordinates to the range [-1, 1].
  // The resulting matrix flips the Y axis so that 0 is at the top.
  projection: function (width, height) {
    return [2 / width, 0, 0, 0, -2 / height, 0, 0, 0, 0];
  },

  // Return a matrix that translates coordinates by (tx, ty).
  translation: function (tx, ty) {
    return [1, 0, 0, 0, 1, 0, tx, ty, 1];
  },

  // Return a matrix that rotates coordinates by the given angle in radians.
  rotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [c, -s, 0, s, c, 0, 0, 0, 1];
  },

  // Return a matrix that scales coordinates by (sx, sy).
  scaling: function (sx, sy) {
    return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
  },

  // Multiply two matrices together and return the result.
  multiply: function (a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
};

function setGeometry(gl, shape) {
  switch (shape) {
    case 1:
      // Define the vertex data for a letter 'G' and fill the buffer.
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          // Vertexes
          40, 0, 110, 0, 0, 150, 0, 150, 110, 0, 150, 150,
        ]),
        gl.STATIC_DRAW
      );
      break;
    case 2:
      // Define the vertex data for a line segment and fill the buffer.
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          // Vertexes
          30, 0, 180, 0,
        ]),
        gl.STATIC_DRAW
      );
      break;
    case 3:
      // Define the vertex data for a triangle and fill the buffer.
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          // Vertexes
          50, 0, 90, 25, 50, 50, 50, 50, 10, 25, 50, 0, 50, 0, 10, 25, 50, 50,
          50, 50, 10, 75, 50, 100, 50, 100, 90, 75, 50, 50, 50, 50, 90, 25, 50,
          0,
        ]),
        gl.STATIC_DRAW
      );
      break;
  }
}
