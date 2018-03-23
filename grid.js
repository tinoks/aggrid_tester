
function getCharCodeFromEvent(event) {
    event = event || window.event;
    return (typeof event.which == "undefined") ? event.keyCode : event.which;
}

function isCharNumeric(charStr) {
    return !!/\d|\./.test(charStr);
}

function isKeyPressedNumeric(event) {
    var charCode = getCharCodeFromEvent(event);
    var charStr = String.fromCharCode(charCode);
    return isCharNumeric(charStr);
}

// function to act as a class
function NumericCellEditor() {
}

// gets called once before the renderer is used
NumericCellEditor.prototype.init = function (params) {
    // create the cell
    this.eInput = document.createElement('input');

    if (isCharNumeric(params.charPress)) {
        this.eInput.value = params.charPress;
    } else {
        if (params.value !== undefined && params.value !== null) {
            this.eInput.value = params.value;
        }
    }

    var that = this;
    this.eInput.addEventListener('keypress', function (event) {
        if (!isKeyPressedNumeric(event)) {
            that.eInput.focus();
            if (event.preventDefault) event.preventDefault();
        } else if (that.isKeyPressedNavigation(event)){
            event.stopPropagation();
        }
    });

    // only start edit if key pressed is a number, not a letter
    var charPressIsNotANumber = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    this.cancelBeforeStart = charPressIsNotANumber;
};

NumericCellEditor.prototype.isKeyPressedNavigation = function (event){
    return event.keyCode===39
        || event.keyCode===37;
};


// gets called once when grid ready to insert the element
NumericCellEditor.prototype.getGui = function () {
    return this.eInput;
};

// focus and select can be done after the gui is attached
NumericCellEditor.prototype.afterGuiAttached = function () {
    this.eInput.focus();
};

// returns the new value after editing
NumericCellEditor.prototype.isCancelBeforeStart = function () {
    return this.cancelBeforeStart;
};

// example - will reject the number if it contains the value 007
// - not very practical, but demonstrates the method.
NumericCellEditor.prototype.isCancelAfterEnd = function () {
    var value = this.getValue();
    return value.indexOf('007') >= 0;
};

// returns the new value after editing
NumericCellEditor.prototype.getValue = function () {
    return this.eInput.value;
};

// any cleanup we need to be done here
NumericCellEditor.prototype.destroy = function () {
    // but this example is simple, no cleanup, we could  even leave this method out as it's optional
};

// if true, then this editor will appear in a popup 
NumericCellEditor.prototype.isPopup = function () {
    // and we could leave this method out also, false is the default
    return false;
};



data.features.forEach((e,i)=>{e.properties.id = i})

var tabledata = data.features.map(e=>e.properties);

			
var columnDefs = tabledata.map(e=> Object.entries(e))[0].map((e)=>{
	var singleDef = {headerName: e[0], field: e[0], filter:'agTextColumnFilter'};
	if(typeof e[1] == "number"){
		singleDef["filter"]='agNumberColumnFilter';
		singleDef["cellEditor"]='numericCellEditor';
	}
    return singleDef
})

var rowSelection = (e)=>{
		if(e.node.selected){
			console.log(turf.bbox(data.features[e.node.id].geometry))
			map.setFilter("data_select", ["==", "id", parseInt(e.node.id)]);		
			map.flyTo({
				center: data.features[e.node.id].geometry.coordinates,
				zoom:12
			})
		}
	};

var cellValueChanged = (e)=>{
		if(e.colDef.cellEditor=="numericCellEditor") {e.data[e.colDef.field] = parseFloat(e.newValue)}
		data.features[e.node.id].properties = e.data;
		map.getSource('data').setData(data)
	};

var filterChanged = (e)=>{
		map.setFilter("data")
		console.log(gridOptions.api.getFilterModel())
		var filters = Object.entries(gridOptions.api.getFilterModel())
		
		filters.forEach((e)=>{
			if(e[1].filterType == "text"){
				var filterValue = [];
				gridOptions.api.forEachNodeAfterFilter( function(rowNode, index) {
					filterValue.push(rowNode.data[e[0]]);
				});
				map.setFilter("data", ["==", e[0], [...new Set(filterValue)][0]])
			}
		})
		
	};
	
	
var gridOptions = {
	defaultColDef: {
        editable: true
    },   
	onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    },
    columnDefs: columnDefs,
    rowData: tabledata,
	enableColResize: true,
	enableFilter: true,
	enableSorting: true,
    multiSortKey: 'ctrl',
	rowSelection:'single',
	onRowSelected: rowSelection,
	stopEditingWhenGridLosesFocus: true,
	onCellValueChanged: cellValueChanged,
	components:{
        numericCellEditor: NumericCellEditor
	},
	onFilterChanged: filterChanged
};


var gridDiv = document.querySelector('#myGrid');
new agGrid.Grid(gridDiv, gridOptions);
    var allColumnIds = [];
    gridOptions.columnApi.getAllColumns().forEach(function(column) {
        allColumnIds.push(column.colId);
    });
    gridOptions.columnApi.autoSizeColumns(allColumnIds);