"use strict";


let board;

var data = "060084070900201080000070261006000500590120400038500126010043700000000003800050002";

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
				let cellId = (bx + by * 3) * 9 + i + 1; 
				let helperContent = "";
				for (let j = 0; j < 9; ++j) {
					helperContent += mustache(helperTemplate, {content: j + 1, cell: cellId, id: j});
				}
				let cellContent = mustache(helperContainerTemplate, {content: helperContent});
				bigCellHtml += mustache(cellTemplate, {helper: cellContent, id: cellId, number: cellId})
			}
			rowHtml += mustache(bigCellTemplate, {content: bigCellHtml});
		}

		html += mustache(rowTemplate, {content: rowHtml, id: by});

	}
	board.innerHTML = html;

	return board;
}

function init() {
	board = byId("board");
	createBoard();

}

