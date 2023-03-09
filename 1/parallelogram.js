// Method To Create A Parallelogram

"use strict";

var firstParallelogram = true;
var t = [];

function drawParallelogram(event) {
    const { left: leftOffset, top: topOffset } = $("canvas").offset();
    const { clientX, clientY } = event;
    const { width, height } = canvas;
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    if (firstParallelogram) {
        firstParallelogram = false;
        var xPosFirst = clientX - leftOffset;
        var yPosFirst = clientY - topOffset;
        t[0] = vec2(2 * xPosFirst / width - 1,
        2 * (height - yPosFirst) / height - 1);
    }

    else {
        firstParallelogram = true;
        var xPosSecond = clientX - leftOffset;
        var yPosSecond = clientY - topOffset;
        t[2] = vec2(2 * xPosSecond / width - 1,
        2 * (height - yPosSecond) / height - 1);
        var xDiff = t[2][0] - t[0][0];
        var yDiff = t[2][1] - t[0][1];
        var tHeight = Math.abs(yDiff);
        var tWidth = Math.abs(xDiff) / 2;
        var xSign = xDiff > 0 ? 1 : -1;
        var ySign = yDiff > 0 ? 1 : -1;
        t[1] = vec2(t[0][0] + xSign * tWidth, t[0][1] + ySign * tHeight);
        t[3] = vec2(t[2][0] - xSign * tWidth, t[2][1] - ySign * tHeight);
        var xDiff2 = t[3][0] - t[0][0];
        var yDiff2 = t[3][1] - t[0][1];
        t[4] = vec2(t[0][0] + xDiff2, t[0][1] + yDiff2);
        for (var i = 0; i < 5; i++) gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + i), flatten(t[i]));
        /*  Register vertices to objects list as a pentagon
            and increment index to where next object would start
        */
        objects.push({
            type: 'parallelogram',
            start: index,
        });
        index += 5;

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        var tt = vec4(colors[cIndex]);
        for (var i = 0; i < 5; i++) gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index - 5 + i), flatten(tt));
    }
}