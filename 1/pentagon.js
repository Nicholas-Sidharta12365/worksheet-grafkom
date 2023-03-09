// Method To Create A Pentagon

"use strict";

var firstPentagon = true;
var secondPentagon = false;
var thirdPentagon = false;
var fourthPentagon = false;
var pPentagon = [];

function drawPentagon(event) {
    const { left: leftOffset, top: topOffset } = $("canvas").offset()
    const { clientX, clientY } = event
    const { width, height } = canvas
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    if (firstPentagon) {
        firstPentagon = false;
        secondPentagon = true;
        var xPosFirst = clientX - leftOffset;
        var yPosFirst = clientY - topOffset;
        pPentagon[0] = vec2(2 * xPosFirst / width - 1,
            2 * (height - yPosFirst) / height - 1);
    }

    else if (secondPentagon) {
        secondPentagon = false;
        thirdPentagon = true;
        var xPosSecond = clientX - leftOffset;
        var yPosSecond = clientY - topOffset;
        pPentagon[1] = vec2(2 * xPosSecond / width - 1,
            2 * (height - yPosSecond) / height - 1);
    }

    else if (thirdPentagon) {
        thirdPentagon = false;
        fourthPentagon = true;
        var xPosThird = clientX - leftOffset;
        var yPosThird = clientY - topOffset;
        pPentagon[2] = vec2(2 * xPosThird / width - 1,
            2 * (height - yPosThird) / height - 1);
    }

    else if (fourthPentagon) {
        fourthPentagon = false;
        var xPosFourth = clientX - leftOffset;
        var yPosFourth = clientY - topOffset;
        pPentagon[3] = vec2(2 * xPosFourth / width - 1,
            2 * (height - yPosFourth) / height - 1);
    }

    else {
        firstPentagon = true;
        var xPosFifth = clientX - leftOffset;
        var yPosFifth = clientY - topOffset;
        pPentagon[4] = vec2(2 * xPosFifth / width - 1,
            2 * (height - yPosFifth) / height - 1);

        for (var i = 0; i < 5; i++) gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + i), flatten(pPentagon[i]));

        /* Register vertices to objects list as a pentagon
        and increment index to where next object would start
        */
        objects.push({
            type: 'pentagon',
            start: index,
        })
        index += 5;

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        var pp = vec4(colors[cIndex]);
        for (var i = 0; i < 5; i++) gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index - 5 + i), flatten(pp));
    }
}