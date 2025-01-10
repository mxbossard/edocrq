const width = 21
const positioningSquareSize = 7
const pixelWidth = 30


function buildPixel(x, y) {
	return {x: x, y: y, color: "white", value: 0, canvas: null}
}

let pixels = []
function initDrawer() {
	// Init canvas
	let divElt = document.querySelector("#qrcode-drawer");
	let canvas = document.createElement('canvas');
	canvas.style = "border: 1px solid black";
	canvas.width = width * pixelWidth;
	canvas.height = width * pixelWidth;
	divElt.append(canvas);
	let ctx = canvas.getContext("2d");

	// Init pixels double array
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < width; y++) {
			if (y == 0) {
				pixels[x] = []
			}
			let px = buildPixel(x, y)
			pixels[x][y] = px
			drawPixel(ctx, x, y, px.color)
		}
	}

	// Init click events
	canvas.addEventListener("click", (event) => {
		let x = Math.floor(event.layerX / pixelWidth)
		let y = Math.floor(event.layerY / pixelWidth)
		console.log("layerX", event.layerX, "layerY", event.layerY)
		console.log("x", x, "y", y)
		let px = pixels[x][y]
		px.value = !px.value
		if (px.value) {
			px.color = "black"
		} else {
			px.color = "white"
		}
		drawPixel(ctx, x, y, px.color)
	});

	// Init structure
	// positioning squares
	initPositionningSquare(ctx, 0, 0, positioningSquareSize)
	initPositionningSquare(ctx, width-positioningSquareSize, 0, positioningSquareSize)
	initPositionningSquare(ctx, 0, width-positioningSquareSize, positioningSquareSize)
	
}

function drawPixel(ctx, x, y, color) {
	ctx.fillStyle = color
	ctx.fillRect(x*pixelWidth, y*pixelWidth, pixelWidth, pixelWidth);
}

function initPositionningSquare(ctx, startX, startY, width) {
	for (let x = startX; x < startX + width; x++) {
		for (let y = startY; y < startY + width; y++) {
			let px = pixels[x][y]
			let color = "black"
			if (x != startX && x != (startX + width - 1) && y != startY && y != (startY + width - 1) && ((x == startX + 1 || x == startX + width - 2) || (y == startY + 1 || y == startY + width - 2))) {
				color = "white"
			}
			px.color = color
			
			drawPixel(ctx, x, y, color)
		}
	}
}

initDrawer()
