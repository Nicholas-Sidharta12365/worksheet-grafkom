function drawCube(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [1.5, 1.5, 1.5]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(8, shadow);
    setupMaterial(cameraMaterial, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawBox(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [3.5, 1.5, 1.5]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(8, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawChairBase(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [1.0, 0.2, 1.0]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(12, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawChairLeg(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.2, -1.5, 0.2]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(12, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}


function initCubeBoxTree() {
    // CUBE
    baseCubeNode = { "draw": drawCube, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(baseCubeNode.matrix, [9.0,3.5, 0.0]);
    mat4.rotate(baseCubeNode.matrix, baseCubeAngle, [0.0, 1.5, -5.0]);

  
    // CHAIR

    baseChairNode = { "draw": drawChairBase, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(baseChairNode.matrix, [-9.0, 3.5, 0.0]);
    mat4.rotate(baseChairNode.matrix, baseChairAngle, [1.0, 1.0, 1.0]);

    firstChairLegNode = { "draw": drawChairLeg, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(firstChairLegNode.matrix, [0.8, -0.8, 0.8]);
    mat4.rotate(firstChairLegNode.matrix, firstChairLegAngle, [0.0, 1.0, 0.0]);

    secondChairLegNode = { "draw": drawChairLeg, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(secondChairLegNode.matrix, [-0.8, -0.8, 0.8]);
    mat4.rotate(secondChairLegNode.matrix, secondChairLegAngle, [0.0, 1.0, 0.0]);

    thirdChairLegNode = { "draw": drawChairLeg, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(thirdChairLegNode.matrix, [0.8, -0.8, -0.8]);
    mat4.rotate(thirdChairLegNode.matrix, thirdChairLegAngle, [0.0, 1.0, 0.0]);

    fourthChairLegNode = { "draw": drawChairLeg, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(fourthChairLegNode.matrix, [-0.8, -0.8, -0.8]);
    mat4.rotate(fourthChairLegNode.matrix, fourthChairLegAngle, [0.0, 1.0, 0.0]);

}