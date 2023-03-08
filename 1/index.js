var canvas;
var gl;

var maxNumTriangles = 200;
var maxNumPositions = 3 * maxNumTriangles;
var index = 0;

var selectedTool = 0
var cIndex = 0
var lineWidth = 1
var program, vBuffer, positionLoc, cBuffer, colorLoc

var theta = 0.0;
var thetaLoc;

var spin = false

/* List of objects to render */
var objects = [];

/* List of colors available */
var colors = [
  vec4(1.0, 0.784, 0.749, 1.0),     // light salmon
  vec4(0.796, 0.667, 0.796, 1.0),   // purple
  vec4(0.686, 0.831, 0.929, 1.0),   // sky blue
  vec4(0.878, 0.839, 0.651, 1.0),   // yellow
  vec4(0.89, 0.702, 0.808, 1.0),    // pink
  vec4(0.741, 0.859, 0.686, 1.0),   // light green
  vec4(1.0, 0.588, 0.541, 1.0),     // salmon
  vec4(0.745, 0.702, 0.902, 1.0),   // violet
  vec4(0.902, 0.82, 0.773, 1.0),    // cream
  vec4(0.584, 0.812, 0.71, 1.0),    // forest green
  vec4(.929, 0.929, 0.929, 1.0),    // white
  vec4(0.122, 0.122, 0.122, 1.0),   // black
];

$(document).ready(function () {
  canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext('webgl2');
  if (!gl) alert("WebGL 2.0 isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.337, 0.373, 0.537, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);


  /* Load shaders and initialize attribute buffers */

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumPositions, gl.STATIC_DRAW);

  positionLoc = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumPositions, gl.STATIC_DRAW);

  colorLoc = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  thetaLoc = gl.getUniformLocation(program, "uTheta");

  render();
  connectListeners()
})

/* Render objects */

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (var object of objects) {
    gl.lineWidth(object.width || lineWidth);

    /* Draws vertices according to object type. */
    if (object.type == 'line') gl.drawArrays(gl.LINES, object.start, 2)
    else if (object.type == 'triangle') gl.drawArrays(gl.TRIANGLE_STRIP, object.start, 3);
    else if (object.type == 'rectangle') gl.drawArrays(gl.TRIANGLE_STRIP, object.start, 4);
    else if (object.type == 'parallelogram') gl.drawArrays(gl.TRIANGLE_FAN, object.start, 5);
    else if (object.type == 'polygon') gl.drawArrays(gl.TRIANGLE_FAN, object.start, object.vertexCount);
  }
  requestAnimationFrame(render);
}

function connectListeners() {
  /* Change color */
  $("input[name=color]").change(function () {
    $("#color-selection label").removeClass("ring-offset-2 ring-2 ring-purple-300")

    const selected = $('input[name=color]:checked')
    const label = $(`label[for=${selected.attr('id')}]`)
    label.addClass("ring-offset-2 ring-2 ring-purple-300")
    cIndex = parseInt(selected.val())
  })

  /* Change tool/shape */
  $("input[name=tool]").change(function () {
    $("#end-polygon").hide()
    $("#tool-selection label").removeClass("ring-offset-2 ring-2 ring-blue-300")

    const selected = $('input[name=tool]:checked')
    const label = $(`label[for=${selected.attr('id')}]`)
    label.addClass("ring-offset-2 ring-2 ring-blue-300")
    selectedTool = parseInt(selected.val())

    if (selectedTool == 3) $("#end-polygon").show()
  })

  /* End polygon */
  $("#end-polygon").click(() => endPolygon())

  /* Clear canvas */
  $('#clear-canvas').click(() => {
    index = 0
    objects = []
  })

  /* Spin mode */
  $('#spin-mode-1').click(() => {
    if (objects.length >= 1) {
      if (!spin) {
        spin = true

        spin_mode()
      }
      else {
        spin = false

        stop_spin_mode()
        render()
      }
    }
  })

    /* Spin mode */
    $('#spin-mode-2').click(() => {
      if (objects.length >= 1) {
        if (!spin) {
          spin = true
  
          spin_clockwise_mode()
        }
        else {
          spin = false
  
          stop_spin_mode()
          render()
        }
      }
    })

  /* Update rendering strategy */
  canvas.addEventListener('mousedown', function (e) {
    if (selectedTool == 0) drawLine(e)
    else if (selectedTool == 1) drawTriangle(e)
    else if (selectedTool == 2) drawRectangle(e)
    else if (selectedTool == 3) drawPolygon(e)
    else if (selectedTool == 4) drawParallelogram(e)
  })
}
