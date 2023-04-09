"use strict";

var gl;
var vertexCount;

var theta = 0.0;
var thetaLoc;

var delay = 100;
var direction = true;


var xA, yA, xB, yB;
var listx = [];
var listy = [];
var pointCount;
var listLines = [];

init();

function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 0.94, 0.94, 1.0);



    document.getElementById("confirm").onclick = function () {
        // Menerima start dan end point
        xA = document.getElementById("x1").value;
        yA = document.getElementById("y1").value;
        xB = document.getElementById("x2").value;
        yB = document.getElementById("y2").value;

        // Melakukan algoritma MidpointLine
        MidpointLine(xA, xB, yA, yB, listx, listy); 

        pointCount = listy.length;

        listLines.length = 0;

        // Membuat verteks dari titik 
        for (let i = 0; i < pointCount; i++) {
            var current_x = listx[i];
            var current_y = listy[i];
            listLines.push(vec2(current_x / 10, current_y / 10));
        }

        //  Load shaders and initialize attribute buffers

        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        // Load the data into the GPU

        var bufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(listLines), gl.STATIC_DRAW);

        // Associate out shader variables with our data buffer

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        thetaLoc = gl.getUniformLocation(program, "uTheta");

        render();
    }
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.LINE_STRIP, 0, pointCount);
}

// Algoritma midpoint line

function MidpointLine(xA, xB, yA, yB, listx, listy) {
    var Po, dx, dxAbs, dy, dyAbs, xk, yk;

    dx = xB - xA;
    dy = yB - yA;

    dxAbs = Math.abs(dx);
    dyAbs = Math.abs(dy);

    listx.length = 0;
    listy.length = 0;

    listx.push(parseInt(xA));
    listy.push(parseInt(yA));

    if (dy > dx || dy <= 0) {
        if (dy > dx && dy > 0) {
            Po = (2 * dxAbs) - dyAbs;
            xk = xA;
            yk = yA;

            while (yA < yB) {
                yA++;

                if (Po < 0) {
                    yk++;
                    Po = Po + (2 * dxAbs);
                } else {
                    xk++;
                    yk++;
                    Po = Po + (2 * dxAbs) - (2 * dyAbs);
                }

                listx.push(parseInt(xk));
                listy.push(parseInt(yk));
            }
        } else {
            if (dy >= (dx * -1)) {
                Po = (2 * dyAbs) - dxAbs;
                xk = xA;
                yk = yA;

                while (xA < xB) {
                    xA++;

                    if (Po < 0) {
                        xk++;
                        Po = Po + (2 * dyAbs);
                    } else {
                        xk++;
                        yk--;
                        Po = Po + (2 * dyAbs) - (2 * dxAbs);
                    }

                    listx.push(parseInt(xk));
                    listy.push(parseInt(yk));
                }
            } else {
                if (dy < (dx * -1)) {
                    Po = (2 * dyAbs) - dxAbs;
                    xk = xA;
                    yk = yA;

                    while (yA > yB) {
                        yA--;

                        if (Po < 0) {
                            yk--;
                            Po = Po + (2 * dxAbs);
                        } else {
                            xk++;
                            yk--;
                            Po = Po + (2 * dxAbs) - (2 * dyAbs);
                        }

                        listx.push(parseInt(xk));
                        listy.push(parseInt(yk));
                    }
                }
            }
        }
    } else {
        Po = (2 * dyAbs) - dxAbs;
        xk = xA;
        yk = yA;

        while (xA < xB) {
            xA++;

            if (Po < 0) {
                xk++;
                Po = Po + (2 * dyAbs);
            } else {
                xk++;
                yk++;
                Po = Po + (2 * dyAbs) - (2 * dxAbs);
            }

            listx.push(parseInt(xk));
            listy.push(parseInt(yk));
        }
    }
}