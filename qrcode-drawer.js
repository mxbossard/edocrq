const width = 21
const positioningSquareSize = 7
const pixelWidth = 30
const defaultColor0 = "white"
const defaultColor1 = "black"
const lockedColor0 = "lightblue"
const lockedColor1 = "darkblue"
const reservedColor0 = "lightpink"
const reservedColor1 = "darkred"


function buildContext() {
	let context = {
		_ecLevel: "L",
		_maskPattern: 4,
		_size: width,
	}
	context.setEcLevel = function(lvl) {
		if (lvl === "L" || lvl === "M" || lvl === "Q" || lvl === "H") {
			context._ecLevel = lvl
		} else {
			error("error correction level do not exists:", lvl)
		}
	}
	context.setMaskPattern = function(pattern) {
		if (pattern < 0 || pattern > 7) {
			error("mask pattern do not exists:", pattern)
		}
		context._maskPattern = pattern
	}

	return context
}

function buildPixel(x, y) {
	let px = {
		x: x, 
		y: y, 
		_color: defaultColor1, 
		_value: 0,
		locked: false,
		reserved: false,
		//canvas: null
	}

	px.setColor = function(color) {
		//if (px.locked) return
		px._color = color
	}

	px.getColor = function() {
		if (px._value == 0) {
			if (px.reserved) return reservedColor0
			if (px.locked) return lockedColor0
			return defaultColor0
		}
		if (px.reserved) return reservedColor1
		if (px.locked) return lockedColor1
		return px._color
	}

	px.setValue = function(val) {
		if (px.reserved || px.locked) return
		px._value = val
	}

	px.invert = function() {
		if (px.reserved || px.locked) return
		px._value = !px._value
	}

	px.draw = function (ctx) {
		ctx.fillStyle = px.getColor()
		ctx.fillRect(px.x*pixelWidth, px.y*pixelWidth, pixelWidth, pixelWidth);
	}

	return px
}

let context = buildContext()
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
			px.draw(ctx)
		}
	}

	// Init click events
	canvas.addEventListener("click", (event) => {
		let x = Math.floor(event.layerX / pixelWidth)
		let y = Math.floor(event.layerY / pixelWidth)
		console.log("layerX", event.layerX, "layerY", event.layerY)
		console.log("x", x, "y", y)
		let px = pixels[x][y]
		console.log("reserved", px.reserved, "locked", px.locked)
		px.invert()
		px.draw(ctx)
	});

	// Init structure
	// positioning squares
	initPositionningSquare(ctx, 0, 0, positioningSquareSize)
	initPositionningSquare(ctx, width-positioningSquareSize, 0, positioningSquareSize)
	initPositionningSquare(ctx, 0, width-positioningSquareSize, positioningSquareSize)
	initBorders(ctx)
	initDotLines(ctx)
	
	drawFormatInfo(ctx)
}

function initPositionningSquare(ctx, startX, startY, width) {
	for (let x = startX; x < startX + width; x++) {
		for (let y = startY; y < startY + width; y++) {
			let px = pixels[x][y]
			let value = 1
			if (x != startX && x != (startX + width - 1) && y != startY && y != (startY + width - 1) && ((x == startX + 1 || x == startX + width - 2) || (y == startY + 1 || y == startY + width - 2))) {
				value = 0
			}
			px.setValue(value)
			px.reserved = true
			px.draw(ctx)
		}
	}
}

function initBorders(ctx) {
	// first vertical
	let x = positioningSquareSize
	for (let y = 0; y < width; y++) {
		if (y < positioningSquareSize + 1 || y > width - positioningSquareSize - 2) {
			let px = pixels[x][y]
			px.setValue(0)
			px.reserved = true
			px.draw(ctx)
		}
	}
	// second vertical
	x = width - positioningSquareSize - 1
	for (let y = 0; y < width; y++) {
		if (y < positioningSquareSize + 1) {
			let px = pixels[x][y]
			px.setValue(0)
			px.reserved = true
			px.draw(ctx)
		}
	}
	// first horizontal
	let y = positioningSquareSize
	for (let x = 0; x < width; x++) {
		if (x < positioningSquareSize + 1 || x > width - positioningSquareSize - 2) {
			let px = pixels[x][y]
			px.setValue(0)
			px.reserved = true
			px.draw(ctx)
		}
	}
	// second horizontal
	y = width - positioningSquareSize - 1
	for (let x = 0; x < width; x++) {
		if (x < positioningSquareSize + 1) {
			let px = pixels[x][y]
			px.setValue(0)
			px.reserved = true
			px.draw(ctx)
		}
	}
}

function initDotLines(ctx) {
	// vertical one
	let x = positioningSquareSize - 1
	for (let y = positioningSquareSize + 1; y < width - positioningSquareSize - 1; y++) {
		let px = pixels[x][y]
		px.setValue(0)
		if (y % 2 == 0) {
			px.setValue(1)
		}
		px.reserved = true
		px.draw(ctx)
	}
	// horizontal one
	let y = positioningSquareSize - 1
	for (let x = positioningSquareSize + 1; x < width - positioningSquareSize - 1; x++) {
		let px = pixels[x][y]
		px.setValue(0)
		if (x % 2 == 0) {
			px.setValue(1)
		}
		px.reserved = true
		px.draw(ctx)
	}
	// Dark module (lone pixel)
	let px = pixels[positioningSquareSize + 1][width - positioningSquareSize - 1]
	px.setValue(1)
	px.reserved = true
	px.draw(ctx)
}

function drawCorrectionLevel(ctx) {
	
	//
}

function drawMaskPattern(ctx, pattern) {
	// TODO
}

function drawFormatInfo(ctx) {
	// correction level
	let ec = null
	if (context._ecLevel == "L") {
		//ec = [0, 0]
		ec = 1
	} else if (context._ecLevel == "M") {
		//ec = [0, 1]
		ec = 0
	} else if (context._ecLevel == "Q") {
		//ec = [1, 0]
		ec = 3
	} else if (context._ecLevel == "H") {
		//ec = [1, 1]
		ec = 2
	}
	// mask pattern
	let mask = context._maskPattern

	// 5 bit format
	let format = (ec << 3) + mask

	console.log("ec", ec.toString(2), "mask", mask.toString(2), "format", format.toString(2))

	// error correction bits
	const generator = 1335
	let ecBits = format << 10

	while (ecBits > (1 << 10)) {
		// Tant que ecBits est un mot de plus de 10 bits
		let paddedGenerator = padGenerator(ecBits)
		let newEcBits = ecBits ^ paddedGenerator // XOR
		console.log("calculating new ecBits; ecBits:", ecBits.toString(2), "paddedGenerator:", paddedGenerator.toString(2), "=> new:", newEcBits.toString(2))
		ecBits = newEcBits	
	}

	console.log("final ecBits:", ecBits.toString(2))

	const formatMask = 21522
	format = ((format << 10) + ecBits) ^ formatMask
	console.log("final format:", format.toString(2))

	let formatString = format.toString(2)
	
	// top left format
	const topLeftFormatCoords = [[0,positioningSquareSize+1],[1,positioningSquareSize+1],[2,positioningSquareSize+1],[3,positioningSquareSize+1],[4,positioningSquareSize+1],[5,positioningSquareSize+1],[7,positioningSquareSize+1],[8,positioningSquareSize+1],[positioningSquareSize+1,7],[positioningSquareSize+1,5],[positioningSquareSize+1,4],[positioningSquareSize+1,3],[positioningSquareSize+1,2],[positioningSquareSize+1,1],[positioningSquareSize+1,0]]
	const secondFormatCoords = [[positioningSquareSize+1,width-1],[positioningSquareSize+1,width-2],[positioningSquareSize+1,width-3],[positioningSquareSize+1,width-4],[positioningSquareSize+1,width-5],[positioningSquareSize+1,width-6],[positioningSquareSize+1,width-7],[width-8,positioningSquareSize+1],[width-7,positioningSquareSize+1],[width-6,positioningSquareSize+1],[width-5,positioningSquareSize+1],[width-4,positioningSquareSize+1],[width-3,positioningSquareSize+1],[width-2,positioningSquareSize+1],[width-1,positioningSquareSize+1]]

	for (let k = 0; k < 15; k++) {
		let val = 0
		if (k < formatString.length) {
			val = formatString[k]
		}
		let [x1,y1] = topLeftFormatCoords[k]
		let px = pixels[x1][y1]
		px.setValue(val)
		px.reserved = true
		px.draw(ctx)
		let [x2,y2] = secondFormatCoords[k]
		px = pixels[x2][y2]
		px.setValue(val)
		px.reserved = true
		px.draw(ctx)
	}
	// TODO
}

function padGenerator(ecBits) {
	const generator = 1335
	for (let k = 0; k < 6; k++) {
		// searchind pad count
		if ((1 << (10+k)) < ecBits) continue
		let padded = generator << (k - 1)
		return padded
	}
	error("error padding generator", ecbits)
}

initDrawer()

