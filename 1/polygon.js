"use strict";

var tPolygon
var polygonVertexCount = 0

function drawPolygon(event) {
    const { left: leftOffset, top: topOffset } = $("canvas").offset()
    const { clientX, clientY } = event
    const { width, height } = canvas

    var xPos = clientX - leftOffset;
    var yPos = clientY - topOffset;

    tPolygon = vec2(2 * xPos / width - 1,
        2 * (height - yPos) / height - 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(tPolygon));

    var tt = vec4(colors[cIndex]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(tt));

    polygonVertexCount += 1
    index += 1;
}

function endPolygon() {
    /*  Register vertices to objects list as a polygon */
    if (polygonVertexCount > 0) {
        objects.push({
            type: 'polygon',
            start: index - polygonVertexCount,
            vertexCount: polygonVertexCount
        })

        // resets vertex count
        polygonVertexCount = 0
    }
}
