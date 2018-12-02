"use strict";


let board;

var data = "060084070900201080000070261006000500590120400038500126010043700000000003800050002";

var cols = [];
var rows = [];
var bigCells = [];
var cells = [];


function cellHideNumber(number) {
	if (!number) {
		return;
	}
	let helper = byId(this.id + "_" + (number - 1));
	helper.style.opacity = 0;
}

function cellSetNumber(number) {
	if (!number) {
		return;
	}

	let illegalOperation = false;
	for (let section of this.sections) {
		for (let cell of section) {
			if (cell.innerText == number) {
				return;
			}
		}
	}
	for (let i in this.sections) {
		this.sections[i].forEach(cell => cell.hideNumber(number));
	}
	this.style.visibility = "";
	this.innerHTML = number;
	this.helpers.style.visibility = "hidden";
}

function helperClick() {
	this.cell.setNumber(Number(this.innerText));
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
		cells.push(cell);
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
		cell.style.visibility = "hidden";

		for (let i = 0; i < 9; ++i) {
			let helper = byId(cellId + "_" + i);
			helper.cell = cell;
			helper.addEventListener("click", helperClick);
		}
	}

	return board;
}

function loadBoard(data) {
	for (let i = 0; i < 81; ++i) {
		let c = data[i];
		let element = byId(i);
		element.innerText = c;
		let number = Number(c);
		if (c != "0") {
			byId("helper" + i).style.visibility = "hidden";
		}
		else {
			element.style.visibility = "hidden";
		}
		if (number) {
			element.setNumber(Number(number));
		}
	}
}

function init() {
	board = byId("board");
	createBoard();
	loadBoard(data);
}

