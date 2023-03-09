// Method To Create A Line

"use strict";

var tLine = []
var firstLine = true

function drawLine(event) {
  const { left: leftOffset, top: topOffset } = $("canvas").offset()
  const { clientX, clientY } = event
  const { width, height } = canvas
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

  if (firstLine) {
    firstLine = false;
    var x_position_first = clientX - leftOffset;
    var y_position_first = clientY - topOffset;

    /* Saves mouse position as first vertex of the line */
    tLine[0] = vec2(2 * x_position_first / width - 1,
      2 * (height - y_position_first) / height - 1);
  }

  else {
    firstLine = true;
    var x_position_second = clientX - leftOffset;
    var y_position_second = clientY - topOffset;

    /* Saves second vertex of the line */
    tLine[1] = vec2(2 * x_position_second / width - 1,
      2 * (height - y_position_second) / height - 1);

    for (var i = 0; i < 2; i++)
      gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + i), flatten(tLine[i]));

    /* Register vertices to objects list as a line 
    (with line width according to selected line width) 
    and increment index to where next object would start    
    */
    objects.push({
      type: 'line',
      start: index,
      width: lineWidth,
    })
    index += 2

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    var tt = vec4(colors[cIndex]);
    for (var i = 0; i < 2; i++) gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index - 2 + i), flatten(tt));
  }
}

