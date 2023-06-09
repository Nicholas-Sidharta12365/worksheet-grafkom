function drawCapyBase(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.7, 0.8, 2.0]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(2, shadow);
    setupMaterial(cameraMaterial, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawCapyEars(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.25, 0.25, 0.15]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(2, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawCapyBody(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [1.5, 1.0, 2.0]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(2, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawCapyLegs(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.3, 0.75, 0.3]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(2, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}


function drawCapyBeak(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.25, 0.15, 0.25]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(6, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function initCapyTree() {
    // CAT
    baseCatNode = { "draw": drawCapyBase, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(baseCatNode.matrix, [-1.0, -3.75, 8.0]);
    mat4.rotate(baseCatNode.matrix, baseCatAngle, [0.0, 1.5, 0.0]);

    firstCatEarNode = { "draw": drawCapyEars, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(firstCatEarNode.matrix, [0.25, 0.0, 0.45]);
    mat4.rotate(firstCatEarNode.matrix, -catEarAngle, [0.0, 0.0, 1.0]);
    mat4.translate(firstCatEarNode.matrix, [0.0, 1.0, 0.0]);

    secondCatEarNode = { "draw": drawCapyEars, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(secondCatEarNode.matrix, [-0.25, 0.0, 0.45]);
    mat4.rotate(secondCatEarNode.matrix, catEarAngle, [0.0, 0.0, 1.0]);
    mat4.translate(secondCatEarNode.matrix, [0.0, 1.0, 0.0]);

    catBodyNode = { "draw": drawCapyBody, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(catBodyNode.matrix, [0.0, -1.75, -2.5]);

    firstCatLegNode = { "draw": drawCapyLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(firstCatLegNode.matrix, [-0.75, -1.25, 1.0]);

    secondCatLegNode = { "draw": drawCapyLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(secondCatLegNode.matrix, [1.5, 0.0, 0.0]);

    thirdCatLegNode = { "draw": drawCapyLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(thirdCatLegNode.matrix, [0.0, 0.0, -2.25]); //0.2

    fourthCatLegNode = { "draw": drawCapyLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(fourthCatLegNode.matrix, [-1.0, 0.0, 0.0]); //0.2

    catBeakNode = { "draw": drawCapyBeak, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(catBeakNode.matrix, [0.0, 1.5, 3.5]);

}