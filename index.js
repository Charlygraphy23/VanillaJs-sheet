const sheet = document.querySelector(".sheet");
const save = document.getElementById("save");
const importOption = document.getElementById("import");

const COL_LABEL = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z",
];
const NEW_LINE = "\n"
const ROW = 30;
const COL = 10;
let sheetData = [];

class Cell {
	constructor(
		rowIndex = 0,
		colIndex = 0,
		value = "",
		isDisabled = false,
		isHeader = false,
		isSidebar = false,
		isSelected = false,
		className = ""
	) {
		this.rowIndex = rowIndex;
		this.colIndex = colIndex;
		this.value = value;
		this.isDisabled = isDisabled;
		this.isHeader = isHeader;
		this.cell = `${rowIndex}-${colIndex}`;
		this.isSidebar = isSidebar;
		this.isSelected = isSelected;
		this.className = className;
	}
}

const initSheet = () => {
	sheetData = Array(ROW)
		.fill(Array(COL).fill(""))
		.map((colArr, rowIndex) => {
			const div = document.createElement("div");
			div.className = "row";
			div.setAttribute("data-rowIndex" , rowIndex)

			let updatedCell = Array.from(colArr).map((_, colIndex) => {
				const cell = new Cell(rowIndex, colIndex);
				cell.rowIndex = rowIndex;
				cell.colIndex = colIndex;

				if (rowIndex === 0) {
					cell.isDisabled = true;
					if (colIndex > 0) {
						cell.value = COL_LABEL[colIndex - 1];
						cell.isHeader = true;
					}
				}

				if (rowIndex > 0 && colIndex === 0) {
					cell.value = rowIndex;
					cell.isDisabled = true;
					cell.isSidebar = true;
				}

				div.append(addBoxes(cell));
				return cell;
			});

			sheet.append(div);
			return updatedCell;
		});

};
const addBoxes = (cell) => {
	const div = document.createElement("div");
	div.className = genCellClass(`col col-${cell.cell}`, cell);
	div.setAttribute("data-index" , `${cell.rowIndex}-${cell.colIndex}`)
	const input = document.createElement("input");
	input.type = "text";
	input.className = "col-input";

	div.onclick = () => {
		console.log("Click");

		if (cell.isHeader) {
			clearSelection(".col.selected", "selected");
			clearSelection(".col.end-cell", "end-cell");
			clearSelection(".col.focused", "focused");

			for (let i = 0; i < ROW; i++) {
				const cellDiv = document.querySelector(`.col-${i}-${cell.colIndex}`);
				const sideBars = document.querySelector(`.col-${i}-${0}`);
				
				if(i=== ROW - 1){
					cellDiv.classList.toggle("end-cell");
				}
				if(i > 0){
					sideBars.classList.toggle("selected");
				}

				cellDiv.classList.toggle("selected");
			}
		}
	};

	input.onfocus = () => {
		const headClass = `.head-0-${cell.colIndex}`;
		const sideClass = `.side-${cell.rowIndex}-0`;

		clearSelection(".col.focused", "focused");
		clearSelection(".col.selected", "selected");

		const head = document.querySelector(headClass);
		const side = document.querySelector(sideClass);

		input.parentElement.classList.toggle("focused");
		head.classList.add("focused");
		side.classList.add("focused");

	};

	input.value = cell.value;
	input.disabled = cell.isDisabled;
	input.onchange = (e) => handleChange(e.target.value, cell);

	div.append(input);
	return div;
};
function genCellClass(initial, cell) {
	let newClass = `${initial} `;
	if (cell.isHeader) newClass += "sheet-header" + ` head-${cell.cell}`;
	if (cell.isSidebar) newClass += "sheet-sidebar" + ` side-${cell.cell}`;

	newClass += ` ${cell.className} `;

	return newClass;
}
function handleChange(value, cell) {
	cell.value = value;
}
function clearSelection(className, classToRemove) {
	const elements = document.querySelectorAll(className);
	elements.forEach((elem) => elem.classList.remove(classToRemove));
}
function download() {

	const csvData = sheetData.map(arr => {
		return arr.reduce((prev, curr) => {
			if(!curr.isHeader &&!curr.isSidebar) return [...prev , curr.value] 
			return prev
		} , []).join(',')
	}).join(NEW_LINE);
	console.log(csvData)
	const blob = new Blob([csvData], { type: 'text/csv' });
	const url = URL.createObjectURL(blob)

	const aTag = document.createElement('a')
	aTag.href=url
	aTag.download = "download.csv"
	aTag.click();

	setTimeout(() => {
		URL.revokeObjectURL(url)
	}, 100);

}
function parseData(data) {
	console.log(data)
	let _row = data?.split(NEW_LINE)
	return _row.reduce((prev = [] , curr , i) => {
		const _col = ["NULL" , ...curr?.split(",")]
		if(i ===0 && _col.length > 1){
			const headerFill = Array(_col.length).fill("HEAD")
			return [headerFill , _col]
		}
		  prev.push(_col)
		  return prev
		
	} , [])
}
function addInputValue(cell) {

	const rowIndex = cell.rowIndex
	const colIndex = `${cell.rowIndex}-${cell.colIndex}`

	const col = document.querySelector(`[data-index="${colIndex}"]`)
	const input = col.firstChild
	input.value = cell.value

}
function updateSheetData(data) {
	sheetData = sheetData
		.map((colArr, rowIndex) => {
			let updatedCell = Array.from(colArr).map((cell, colIndex) => {
				if(rowIndex > 0 && colIndex > 0){
					cell.value = data?.[rowIndex]?.[colIndex] ?? "";
					addInputValue(cell)
					return cell
				}
				return cell;
				
			});
			return updatedCell;
		});
}

save.onclick = () => {
	download()
}

importOption.onchange = (e) => {

	const file = e?.target?.files?.[0]

	if(!["text/csv"].includes(file.type)) return

	const reader = new FileReader()

	reader.onload = (res) => {
		const data = res?.target?.result
		const formatedData = parseData(data)
		console.log({formatedData})
		updateSheetData(Array.from(formatedData))
	}

	reader.readAsText(file)
}

initSheet();
