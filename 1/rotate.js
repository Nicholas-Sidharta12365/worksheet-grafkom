let animation, animationTimeout
let CIRCLE = 360
let deltaTheta = 0.05

function spin_mode() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  theta += deltaTheta;
  gl.uniform1f(thetaLoc, theta);

  for (var object of objects) {
    gl.lineWidth(object.width || lineWidth);

    /* Draws vertices according to object type. */
    if (object.type == 'line') gl.drawArrays(gl.LINES, object.start, 2)
    else if (object.type == 'triangle') gl.drawArrays(gl.TRIANGLE_STRIP, object.start, 3);
    else if (object.type == 'rectangle') gl.drawArrays(gl.TRIANGLE_FAN, object.start, 4);
    else if (object.type == 'polygon') gl.drawArrays(gl.TRIANGLE_FAN, object.start, object.vertexCount);
  }

  start_spin_mode()
}

function start_spin_mode() {
  animation = requestAnimationFrame(spin_mode);
}

function stop_spin_mode() {
  theta = 0
  gl.uniform1f(thetaLoc, theta);
  cancelAnimationFrame(animation)
}