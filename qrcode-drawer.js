const initialVersion = 1
const initialEcLevel = "M"
//const width = 21
const positioningSquareSize = 7
const pixelWidth = 30
const defaultColor0 = "white"
const defaultColor1 = "black"
const lockedColor0 = "lightblue"
const lockedColor1 = "darkblue"
const reservedColor0 = "lightpink"
const reservedColor1 = "darkred"


function buildContext(version, ecLevel) {
	const versionEcTable = {
		"1-L": [19, 7, 1, 19, 0, 0],
		"1-M": [16, 10, 1, 16, 0, 0],
		"1-Q": [13, 13, 1, 13, 0, 0],
		"1-H": [9, 17, 1, 9, 0, 0],
		"2-L": [34, 10, 1, 34, 0, 0],
		"2-M": [28, 16, 1, 28, 0, 0],
		"2-Q": [22, 22, 1, 22, 0, 0],
		"2-H": [16, 28, 1, 16, 0, 0],
		"3-L": [55, 15, 1, 55, 0, 0],
		"3-M": [44, 26, 1, 44, 0, 0],
		"3-Q": [34, 18, 2, 17, 0, 0],
		"3-H": [26, 22, 2, 13, 0, 0],
	}
	let context = {
		_version: version,
		_ecLevel: "L",
		_maskPattern: 4,
		_size: null,
		_versionEcInfo: null,
	}
	context.setEcLevel = function(lvl) {
		if (lvl === "L" || lvl === "M" || lvl === "Q" || lvl === "H") {
			context._ecLevel = lvl
		} else {
			throw "error correction level do not exists: " + lvl
		}
	}
	context.setMaskPattern = function(pattern) {
		if (pattern < 0 || pattern > 7) {
			throw "mask pattern do not exists: " + pattern
		}
		context._maskPattern = pattern
	}
	context.getWidth = function(pattern) {
		return (context._version + 2) * 7
	}
	context.getCodewordsCount = function(pattern) {
		return context._versionEcInfo[0]
	}
	context.getErrorCorrectionCodewordsCountPerBlock = function(pattern) {
		return context._versionEcInfo[1]
	}
	context.getGroup1BlocksCount = function(pattern) {
		return context._versionEcInfo[2]
	}
	context.getGroup1DataCodewordsCount = function(pattern) {
		return context._versionEcInfo[3]
	}
	
	context.setEcLevel(ecLevel)
	let key = version + "-" + ecLevel
	context._versionEcInfo = versionEcTable[key]
	if (context._versionEcInfo == null) {
		throw "versionEcTable not configured for level: " + level + " and ecLevel: " + ecLevel
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

let context = buildContext(initialVersion, initialEcLevel)
let pixels = []
function initDrawer() {
	// Init canvas
	let divElt = document.querySelector("#qrcode-drawer");
	let canvas = document.createElement('canvas');
	canvas.style = "border: 1px solid black";
	canvas.width = context.getWidth() * pixelWidth;
	canvas.height = context.getWidth() * pixelWidth;
	divElt.append(canvas);
	let ctx = canvas.getContext("2d");

	// Init pixels double array
	for (let x = 0; x < context.getWidth(); x++) {
		for (let y = 0; y < context.getWidth(); y++) {
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
	initPositionningSquare(ctx, context.getWidth()-positioningSquareSize, 0, positioningSquareSize)
	initPositionningSquare(ctx, 0, context.getWidth()-positioningSquareSize, positioningSquareSize)
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
	for (let y = 0; y < context.getWidth(); y++) {
		if (y < positioningSquareSize + 1 || y > context.getWidth() - positioningSquareSize - 2) {
			let px = pixels[x][y]
			px.setValue(0)
			px.reserved = true
			px.draw(ctx)
		}
	}
	// second vertical
	x = context.getWidth() - positioningSquareSize - 1
	for (let y = 0; y < context.getWidth(); y++) {
		if (y < positioningSquareSize + 1) {
			let px = pixels[x][y]
			px.setValue(0)
			px.reserved = true
			px.draw(ctx)
		}
	}
	// first horizontal
	let y = positioningSquareSize
	for (let x = 0; x < context.getWidth(); x++) {
		if (x < positioningSquareSize + 1 || x > context.getWidth() - positioningSquareSize - 2) {
			let px = pixels[x][y]
			px.setValue(0)
			px.reserved = true
			px.draw(ctx)
		}
	}
	// second horizontal
	y = context.getWidth() - positioningSquareSize - 1
	for (let x = 0; x < context.getWidth(); x++) {
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
	for (let y = positioningSquareSize + 1; y < context.getWidth() - positioningSquareSize - 1; y++) {
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
	for (let x = positioningSquareSize + 1; x < context.getWidth() - positioningSquareSize - 1; x++) {
		let px = pixels[x][y]
		px.setValue(0)
		if (x % 2 == 0) {
			px.setValue(1)
		}
		px.reserved = true
		px.draw(ctx)
	}
	// Dark module (lone pixel)
	let px = pixels[positioningSquareSize + 1][context.getWidth() - positioningSquareSize - 1]
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
	const width = context.getWidth()
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
	throw "error padding generator: " + ecbits
}

function padBinaryWordString(word, size) {
	// Add zeros to pad binary word to the size
	if (word.length < size) {
		while (word.length < size) {
			word = "0" + word
		}
	}
	return word
}

function byteModeEncode(data) {
	const modeIndicator = "0100" // byte encoding mode indicator
	const finishingPattern = "1110110000010001"
	let codewordsCount = context.getCodewordsCount()

	let encodedData = ""
	
	// 1- Mode Indicator
	encodedData += modeIndicator

	// 2- Data length
	let charCount = padBinaryWordString(data.length.toString(2), 9)
	encodedData += charCount // data length encoded on 9 bits for v1 qrcode

	// 3- Data bytes
	let binaryData = ""
	for (let k = 0; k < data.length; k++) {
		// encoding in ISO 8859-1
		const encoder = new TextEncoder('iso-8859-1');
		let charInt = encoder.encode(data[k])[0]
		console.log("encoded char:", data[k], "=>", charInt)
		binaryData += charInt.toString(2)
	}
	encodedData += binaryData

	// 4- Terminator (up to 4 zeros)
	if (encodedData.length < codewordsCount * 8) {
		// Add terminator
		let terminatorLength = Math.min(4, codewordsCount * 8 - encodedData.length)
		for (let k = 0; k < terminatorLength; k++) {
			encodedData += "0"
		}
	}

	// 5- Complete last code word
	while (encodedData.length % 8 != 0) {
		encodedData += "0"
	}
	
	console.log("encoding data:", data, "charCount", charCount, "binaryData", binaryData, "=>", encodedData) 

	// 6- Add finishing pattern
	while (encodedData.length < codewordsCount * 8) {
		if (codewordsCount * 8 - encodedData.length > 8) {
			encodedData += finishingPattern
		} else {
			encodedData += finishingPattern[0,8]
		}
	}

	console.log("finished encoded data:", encodedData) 
	return encodedData
}

initDrawer()

byteModeEncode("foo")

