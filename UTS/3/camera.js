"use strict";

function main() {
	// Get A WebGL context
	/** @type {HTMLCanvasElement} */
	var canvas = document.querySelector("#gl-canvas");
	var gl = canvas.getContext("webgl");
	if (!gl) {
		return;
	}

	// creates buffers with position, normal, texcoord, and vertex color
	// data for primitives by calling gl.createBuffer, gl.bindBuffer,
	// and gl.bufferData
	const oxygenBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 20, 12, 10);
	const hydrogenBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 10, 12, 6);
	const hhydrogenBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 10, 12, 6);

	// setup GLSL program
	var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

	var fieldOfViewRadians = radians(60);
	var cameraPov = 0;

	// Uniforms for each object.
	var orbit = (radius) => vec3(radius, radius, 0);
	var oxygenUniforms = {
		u_colorMult: [94 / 255, 234 / 255, 212 / 255, 1],
		u_matrix: m4.identity(),
	};
	var hydrogenUniforms = {
		u_colorMult: [251 / 255, 113 / 255, 133 / 255, 1],
		u_matrix: m4.identity(),

	};
	var hhydrogenUniforms = {
		u_colorMult: [56 / 255, 189 / 255, 248 / 255, 1],
		u_matrix: m4.identity(),
	};
	var oxygenTranslation = [0, 0, 0];
	var hydrogen = {
		red: {
			oclock: 10,
			orbit: getOrbit(mult(orbit(30), clockPosition(10))),
			orbitRadius: 30,
		}, blue: {
			oclock: 2,
			orbit: getOrbit(mult(orbit(50), clockPosition(2))),
			orbitRadius: 50,
		}
	}
	var hydrogenTranslation = mult(hydrogen.red.orbitRadius, clockPosition(hydrogen.red.oclock));
	var hhydrogenTranslation = mult(hydrogen.blue.orbitRadius, clockPosition(hydrogen.blue.oclock));

	var objectsToDraw = [
		{
			programInfo: programInfo,
			bufferInfo: oxygenBufferInfo,
			uniforms: oxygenUniforms,
		},
		{
			programInfo: programInfo,
			bufferInfo: hydrogenBufferInfo,
			uniforms: hydrogenUniforms,
		},
		{
			programInfo: programInfo,
			bufferInfo: hhydrogenBufferInfo,
			uniforms: hhydrogenUniforms,
		},
	];

	function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
		var matrix = m4.translate(viewProjectionMatrix,
			translation[0],
			translation[1],
			translation[2]);
		matrix = m4.xRotate(matrix, xRotation);
		return m4.yRotate(matrix, yRotation);
	}

	requestAnimationFrame(drawScene);

	// Draw the scene.
	function drawScene(time) {
		time *= 0.0005;

		webglUtils.resizeCanvasToDisplaySize(gl.canvas);

		// Tell WebGL how to convert from clip space to pixels
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(1, 0.94, 0.94, 1.0);

		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		// Clear the canvas AND the depth buffer.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Compute the projection matrix
		var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		var projectionMatrix =
			m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

		// Compute the camera's matrix using look at.
		switch (cameraPov) {
			case 1:
				// oxygen cam
				var cameraPosition = oxygenTranslation;
				var target = [0, 0, 20];
				break;
			case 2:
				// red hydrogen cam
				var cameraPosition = hydrogenTranslation;
				var target = [0, 0, 20];
				break;
			case 3:
				// blue hydrogen cam
				var cameraPosition = hhydrogenTranslation;
				var target = [0, 0, 0];
				break;

			default:
				// default cam
				var cameraPosition = [0, 0, 100];
				var target = [0, 0, 0];
				break;
		}

		var up = [0, 1, 0];
		var cameraMatrix = m4.lookAt(cameraPosition, target, up);

		// Make a view matrix from the camera matrix.
		var viewMatrix = m4.inverse(cameraMatrix);

		var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

		var XRotation = 0;
		var YRotation = 2 * time;

		hydrogenTranslation = revolveClock(hydrogen.red.orbit, 200 * time, hydrogen.red.oclock)
		hhydrogenTranslation = revolveClock(hydrogen.blue.orbit, 200 * time, hydrogen.blue.oclock)

		// console.log(radians(200 * time) % Math.PI, (radians(200 * time) % Math.PI) < 0.01);
		if (radians(200 * time) % (2 * Math.PI) < 0.03) {
			console.log("🔴 One revolution!");
			hydrogen.red.orbit = getOrbit(mult(orbit(hydrogen.red.orbitRadius), clockPosition(--hydrogen.red.oclock % 12)))
			hydrogen.blue.orbit = getOrbit(mult(orbit(hydrogen.blue.orbitRadius), clockPosition(++hydrogen.blue.oclock % 12)))
		}

		// Compute the matrices for each object.
		oxygenUniforms.u_matrix = computeMatrix(
			viewProjectionMatrix,
			oxygenTranslation,
			XRotation,
			YRotation);

		hydrogenUniforms.u_matrix = computeMatrix(
			viewProjectionMatrix,
			hydrogenTranslation,
			XRotation,
			YRotation);

		hhydrogenUniforms.u_matrix = computeMatrix(
			viewProjectionMatrix,
			hhydrogenTranslation,
			XRotation,
			YRotation);

		// ------ Draw the objects --------

		objectsToDraw.forEach(function (object) {
			var programInfo = object.programInfo;
			var bufferInfo = object.bufferInfo;

			gl.useProgram(programInfo.program);

			// Setup all the needed attributes.
			webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

			// Set the uniforms.
			webglUtils.setUniforms(programInfo, object.uniforms);

			// Draw
			gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
		});

		requestAnimationFrame(drawScene);
	}

	const camSelect = document.querySelectorAll('input[name="camera"]')
	const camChangeHandler = (e) => {
		document.querySelectorAll("#cam-select label").forEach(label => label.classList.remove("ring-offset-2", "ring-2", "ring-pink-300"))
		const selected = document.querySelector('input[name="camera"]:checked')
		const label = document.querySelector(`label[for=${selected.id}]`)
		console.log("🚀 ~ file: shadedSphere3.js ~ line 196 ~ document.querySelector ~ selected.id", selected.id)
		label.classList.add("ring-offset-2", "ring-2", "ring-pink-300")
		cameraPov = parseInt(selected.value)
		console.log("🚀 ~ file: shadedSphere3.js ~ line 198 ~ document.querySelector ~ cameraPov", cameraPov)
	}
	Array.prototype.forEach.call(camSelect, function (radio) {
		radio.addEventListener('change', camChangeHandler);
	});
}

main();
