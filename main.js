"use strict";


let board;

var data = "060084070900201080000070261006000500590120400038500126010043700000000003800050002";
var solution = "";

var cols = [];
var rows = [];
var bigCells = [];
var cells = [];
var boardHistory = [];

var hideInvalid = false;

function toggleInvalidDisplay() {
	hideInvalid = !hideInvalid;
	document.documentElement.style.setProperty("--invalid-opacity", hideInvalid? 0: 1);
}

function cellHideNumber(number) {
	if (!number) {
		return;
	}
	let helper = byId(this.id + "_" + (number - 1));
	helper.classList.add("invalid");
	// helper.style.opacity = 0;
}

function cellSetNumber(number) {
	if (!number) {
		return false;
	}

	let illegalOperation = false;
	for (let section of this.sections) {
		for (let cell of section) {
			if (cell.innerText == number) {
				return false;
			}
		}
	}
	for (let i in this.sections) {
		this.sections[i].forEach(cell => cell.hideNumber(number));
	}
	this.style.visibility = "";
	this.innerHTML = number;
	this.helpers.style.visibility = "hidden";
	if (number != Number(solution[this.id])) {
		this.classList.add("wrong");
	}
	return true;
}

function cellClear(persistMarkers) {
	this.innerHTML = 0;
	this.style.visibility = "hidden";
	this.helpers.style.visibility = "";
	this.classList.remove("solution");
	this.classList.remove("wrong");
	for (let i = 0; i < 9; ++i) {
		let helper = byId(this.id + "_" + i);
		// helper.style.opacity = 1;
		helper.classList.remove("invalid");
		if (!persistMarkers) {
			helper.classList.remove("marked");
		}
	}
}

function helperClick(event) {
	let hist = serialize();
	if (this.cell.setNumber(Number(this.innerText))) {
		boardHistory.push(hist);
	}
}

function helperRightClick(event) {
	event.preventDefault();
	this.classList.toggle("marked");
	return false;
}


function createBoard() {
	let bigCellTemplate = byId("bigCellTemplate").innerHTML;
	let cellTemplate = byId("cellTemplate").innerHTML;
	let rowTemplate = byId("rowTemplate").innerHTML;
	let helperTemplate = byId("helperTemplate").innerHTML;
	let helperContainerTemplate = byId("helperContainerTemplate").innerHTML;
	let html = "";

	for (let by = 0; by < 3; ++by) {
		let rowHtml = "";
		for (let bx = 0; bx < 3; ++bx) {
			let bigCellHtml = "";
			for (let i = 0; i < 9; ++i) {
				let cellX = i % 3 + bx * 3;
				let cellY = by * 3 + Math.floor(i / 3);
				let cellId = cellX + cellY * 9;
				let helperContent = "";
				for (let j = 0; j < 9; ++j) {
					helperContent += mustache(helperTemplate, {content: j + 1, cell: cellId, id: j});
				}
				let cellContent = mustache(helperContainerTemplate, {content: helperContent, cell: cellId});
				bigCellHtml += mustache(cellTemplate, {helper: cellContent, id: cellId, number: 0})
			}
			rowHtml += mustache(bigCellTemplate, {content: bigCellHtml});
		}

		html += mustache(rowTemplate, {content: rowHtml, id: by});

	}
	board.innerHTML = html;

	for (let i = 0; i < 9; ++i) {
		rows.push([]);
		cols.push([]);
		bigCells.push([]);
	}

	for (let x = 0; x < 9; ++x) for (let y = 0; y < 9; ++y) {
		let cellId = x + y * 9;
		let cell = byId(cellId);
		cell.x = x;
		cell.y = y;
		cols[x].push(cell);
		rows[y].push(cell);

		let bx = Math.floor(x / 3);
		let by = Math.floor(y / 3);
		let bigCellId = bx + by * 3;
		bigCells[bigCellId].push(cell);

		cell.sections = [cols[x], rows[y], bigCells[bigCellId]];
		cell.setNumber = cellSetNumber;
		cell.hideNumber = cellHideNumber;
		cell.helpers = byId("helper" + cellId);
		cell.clear = cellClear;
		cell.style.visibility = "hidden";

		for (let i = 0; i < 9; ++i) {
			let helper = byId(cellId + "_" + i);
			helper.cell = cell;
			helper.addEventListener("click", helperClick);
			helper.addEventListener("contextmenu", helperRightClick);
		}
	}

	for (let i = 0; i < 81; ++i) {
		cells.push(byId(i));
	}

	return board;
}

function loadBoard(data, preserveData) {
	clearBoard(Boolean(preserveData));
	data = data.trim();
	if (data.length != 81) {
		throw "data has wrong length";
	}
	if (!preserveData) {
		boardHistory = [data];
	}
	for (let i = 0; i < 81; ++i) {
		let c = data[i];
		let element = byId(i);
		let number = Number(c);
		if (number) {
			element.setNumber(Number(number));
		}
	}
}

function serialize() {
	let output = "";
	cells.forEach(cell => output += Number(cell.innerText));
	return output;
}

function clearBoard(preserveMarkers) {
	cells.forEach(cell => cell.clear(Boolean(preserveMarkers)));
}

function undo() {
	if (boardHistory.length > 1) {
		loadBoard(boardHistory.pop(), true);
	}
}

function retry() {
	loadBoard(boardHistory[0]);
}

function solve() {
	let histData = serialize();
	if (histData.length == 81) {
		boardHistory.push(histData);
	}
	else {
		return; //Something is wrong with the values
	}
	for (let cell of cells) {
		let value = Number(cell.innerText);
		let rightValue = Number(solution[cell.id]);
		if (value == 0) {
			cell.innerText = solution[cell.id];
			cell.classList.add("solution");
			cell.style.visibility = "";
			cell.helpers.style.visibility = "hidden";
		}
		else if (value != rightValue) {
			cell.innerText = cell.innerText + "(" + solution[cell.id] + ")";
			cell.classList.add("wrong");
			cell.style.visibility = "";
			cell.helpers.style.visibility = "hidden";
		}
	}
}

function newBoard() {
	get("generate.php", function(data) {
		data = data.trim().split("\n").filter(x => x.length > 0);
		solution = data[0];
		console.log();
		loadBoard(data[data.length - 1]);
	});	
}


function init() {
	board = byId("board");
	createBoard();

	newBoard();
}

