"use strict";

var firstRectangle = true
var t = []

function drawRectangle(event) {
  const { left: leftOffset, top: topOffset } = $("canvas").offset()
  const { clientX, clientY } = event
  const { width, height } = canvas
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

  if (firstRectangle) {
    firstRectangle = false;
    var xPosFirst = clientX - leftOffset;
    var yPosFirst = clientY - topOffset;
    t[0] = vec2(2 * xPosFirst / width - 1,
      2 * (height - yPosFirst) / height - 1);
  }

  else {
    firstRectangle = true;
    var xPosSecond = clientX - leftOffset;
    var yPosSecond = clientY - topOffset;
    t[2] = vec2(2 * xPosSecond / width - 1,
      2 * (height - yPosSecond) / height - 1);
    t[1] = vec2(t[0][0], t[2][1]);
    t[3] = vec2(t[2][0], t[0][1]);
    for (var i = 0; i < 4; i++) gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + i), flatten(t[i]));

    /*  Register vertices to objects list as a rectangle
        and increment index to where next object would start
    */
    objects.push({
      type: 'rectangle',
      start: index,
    })
    index += 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    var tt = vec4(colors[cIndex]);
    for (var i = 0; i < 4; i++) gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index - 4 + i), flatten(tt));
  }
}