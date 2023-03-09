// Method To Create A Triangle

"use strict";

var firstTriangle = true;
var secondTriangle = false;
var tTriangle = []

function drawTriangle(event) {
    const { left: leftOffset, top: topOffset } = $("canvas").offset()
    const { clientX, clientY } = event
    const { width, height } = canvas
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    if (firstTriangle) {
        firstTriangle = false;
        secondTriangle = true;
        var xPosFirst = clientX - leftOffset;
        var yPosFirst = clientY - topOffset;
        tTriangle[0] = vec2(2 * xPosFirst / width - 1,
            2 * (height - yPosFirst) / height - 1);
    }

    else if (secondTriangle) {
        secondTriangle = false;
        var xPosSecond = clientX - leftOffset;
        var yPosSecond = clientY - topOffset;
        tTriangle[1] = vec2(2 * xPosSecond / width - 1,
            2 * (height - yPosSecond) / height - 1);
    }

    else {
        firstTriangle = true;
        var xPosThird = clientX - leftOffset;
        var yPosThird = clientY - topOffset;
        tTriangle[2] = vec2(2 * xPosThird / width - 1,
            2 * (height - yPosThird) / height - 1);

        for (var i = 0; i < 3; i++) gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + i), flatten(tTriangle[i]));

        /* Register vertices to objects list as a triangle
        and increment index to where next object would start
        */
        objects.push({
            type: 'triangle',
            start: index,
        })
        index += 3;

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        var tt = vec4(colors[cIndex]);
        for (var i = 0; i < 3; i++) gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index - 3 + i), flatten(tt));
    }
}