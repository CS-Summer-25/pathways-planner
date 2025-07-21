// Looks into acalog_programs.json file 
// loops over programs 

let majors = {};
let minors = {};
let GER_COURSES = null;
let GERS = null;

async function assignCourses(path) {
    // must wait to ensure that data is properly loaded into global var MAJORS
    const data = JSON.parse(await fetch(path).then(response => response.text()));
    // console.log("assignCourses called with data:", data);

    // loop through the data and assign majors and minors
    for (let programTitle in data) {
        // console.log("Program:", programTitle);
        let program = {programInfo: {"code" : "", "reqs": []}};
        // console.log("Program Title:", programTitle);
        // program.programTitle.reqs = [];
        for (let pattern in data[programTitle]) {
            if (pattern === "key") {
                let key = data[programTitle][pattern];
                // console.log("Key:", key);
                // this is the key for the program, we can use it to identify the program
                // e.g. "CSBS" for Computer Science, B.S.
                // we can also use it to identify the type of program (major or minor)
                // console.log(`Program Key: ${key}`);
                program.programInfo.code = key;
                // console.log("Program Key:", program.programInfo.code);
                continue; // skip to next pattern
            }
            else if (pattern.startsWith("required")) {
                // this is a required course pattern
                // each course will be a row, 
                let numRows = data[programTitle][pattern].length;
                let options = data[programTitle][pattern];
                // create row names
                let reqs = [];
                    for (let i = 0; i < numRows; i++) {
                        // the course code is the first part of the string
                        reqs.push(options[i].split(" ")[0]);
                    }
                reqs = reqs.join(", ");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);
                // console.log("Processing Required: ", pattern, "\n", program.programInfo.reqs);
            }
            else if (pattern.startsWith("choose")) {
                // this is a choice pattern
                // the number in the pattern indicates how many rows to create
                let numRows = parseInt(pattern.split("_")[1]);
                // options will be used for autocomplete down the line
                // let options = data[programTitle][pattern];
                // last index is the name
                let rowName = pattern.split("_")[2];
                let reqs = [];
                if (numRows > 1) {
                    for (let i = 1; i < numRows+1; i++) {
                        reqs.push(rowName + " " + i);
                    }
                }
                else {
                    reqs.push(rowName);
                }
                // console.log(reqs.trim().split(","));
                // if (reqs.trim().split(",").length == 1) {
                //     reqs = reqs.slice(0, -1); // remove trailing comma
                // }
                reqs = reqs.join(", ");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);

                // let rowName = pattern.split("_")[-1];
                // console.log("Processing Choice Pattern:", pattern, "Num Rows:", numRows, "Row Name:", rowName, "Options:", options);
                // console.log("Processing choose: ", pattern, "\n", program.programInfo.reqs);
            }
            else if (pattern.startsWith("condchoose")) {
                // this is a conditional choice pattern
                // i.e. there is least, most, or range condition in the pattern
                let numRows = parseInt(pattern.split("_")[1]);
                let reqs = [];
                let store = 0;
                for (let x = 0; x < data[programTitle][pattern].length; x++) {
                    if (data[programTitle][pattern][x].startsWith("least") || data[programTitle][pattern][x].startsWith("range")) {
                        // this is a least or range pattern - make that number of rows with that given pattern's name
                        let rowName = data[programTitle][pattern][x].split(" ")[1];
                        for (let i = 0; i < numRows; i++) {
                            reqs.push(rowName + " " + i);
                        }
                    }
                    store = x;
                }
                let rowName = pattern.split("_")[2];
                for (let i = store+1; i < numRows; i++) {
                    // this is a regular choice pattern, so we can just add the row name
                    reqs.push(rowName + " " + i);
                }
                reqs = reqs.join(", ");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);
                // console.log("Processing choose: ", pattern, "\n", program.programInfo.reqs);
            }
            // else if (pattern.startsWith("either")) {
            // }
            else if (pattern.startsWith("credit")) {
                // this is a credit pattern
                let numRows = Math.ceil(parseInt(pattern.split("_")[1]) / 4); 
                // if there are two credits, you still need to take 1 course
                console.log(programTitle, "NumRows: "+numRows)
                let options = data[programTitle][pattern];
                // rowName is the pattern name
                let rowName = pattern.split("_")[2];
                let reqs = [];
                if (numRows > 1) {
                    for (let i = 1; i < numRows+1; i++) {
                        reqs.push(rowName + " " + i);
                    }
                }
                else {
                    reqs.push(rowName);
                }
                reqs = reqs.join(", ");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);
                // console.log("Processing credit: ", pattern, "\n", program.programInfo.reqs);
            }
            else if (pattern.startsWith("condcredit")) {
                // this is a conditional credit pattern
                let numRows = parseInt(pattern.split("_")[1]) / 4;
                let options = data[programTitle][pattern];
                let reqs = [];
                for (let x = 0; x < data[programTitle][pattern].length; x++) {
                    if (data[programTitle][pattern][x].startsWith("least") || data[programTitle][pattern][x].startsWith("range")) {
                        // this is a least or range pattern - make that number of rows with that given pattern's name
                        let rowName = data[programTitle][pattern][x].split(" ")[1];
                        for (let i = 0; i < numRows; i++) {
                            reqs.push(rowName + " " + i);
                        }
                    }
                }
                let rowName = pattern.split("_")[2];
                for (let i = 0; i < numRows; i++) {
                    reqs.push(rowName + " " + i);
                }
                reqs = reqs.join(", ");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);
                // console.log("Processing credit: ", pattern, "\n", program.programInfo.reqs);
            }
        }
        program.programInfo.reqs = program.programInfo.reqs.join(", ");
        if (programTitle.endsWith("Minor")) {
            minors[programTitle] = [program.programInfo.code, program.programInfo.reqs]
            console.log("Program Title: ", programTitle, "\n", "REQS: ", minors[programTitle]);
        }
        else {
            
            majors[programTitle] = [program.programInfo.code, program.programInfo.reqs]
            console.log("Program Title: ", programTitle, "\n", "REQS: ", majors[programTitle]);
            // console.log("Assigned Major:", programTitle, "Row Name:", rowName, "Options:", options);
        }
        console.log("");
    }
}

async function initialize() {
    // assign majors, minors, GERS from respective files
    await assignCourses("acalog_programs.json");
    // sort the majors and minors by their keys
    majors = Object.fromEntries(Object.entries(majors).sort());
    minors = Object.fromEntries(Object.entries(minors).sort());
    console.log("MAJORS/MINORS Initialized: ");
    console.log(majors, minors);
    console.log("Starting GER Population");

    constructCourses();
    
    setGERSAutocomplete();
    console.log("Initialization complete!")
}


function setGERSAutocomplete() {
    $( function() {        
        fetch('gers.json')
        .then(response => response.json())
        .then(gers => {
            GERS = Object.keys(gers);
            console.log("GERS: ", GERS);
            if (!document.getElementById("GERS-table")) {
                createTable("GERS", "GERS", GERS);
            }
            // convert all keys to lowercase
            GER_COURSES = Object.fromEntries(Object.entries(gers).map(([key, value]) => [key.toLowerCase(), value]));
            // Loop over gers dictionary to set up autocomplete for all GER fields
            for (let gerKey in GER_COURSES) {
                if (GER_COURSES.hasOwnProperty(gerKey)) {
                    const gerElements = document.getElementsByClassName(gerKey);
                    for (let i = 0; i < gerElements.length; i++) {
                        const gerElement = gerElements[i];
                        $(gerElement).autocomplete({
                            source: GER_COURSES[gerKey],
                            select: function(event, ui) {
                                inputValue = ui.item.label;
                                rowLabel = event.target.classList[1];
                                console.log("LABEL: ", rowLabel);

                                if (Object.keys(event.target.classList).indexOf("clps") == -1) {
                                    console.log("Row Label: ", rowLabel);
                                    console.log("Courses ", GER_COURSES);
                                    console.log("GER ", GER_COURSES[rowLabel]);                        
                                    if (!isValidCredit(inputValue, rowLabel)){
                                        event.target.setAttribute("style", "background-color: red;");
                                    }
                                    else {
                                        event.target.setAttribute("style", "background-color: lightgreen;");
                                    }
                                }
                            }
                        });
                    }
                }
            }
        });

      } 
    );
}

function togglePanel(){
    var panel = document.getElementById("controlPanel");
    var toggleButton = document.getElementById("togglePanel");
    if (panel.style.display === "none") {
        panel.style.display = "flex";
        toggleButton.innerHTML = "&and;";
    } else {
        panel.style.display = "none";
        toggleButton.innerHTML = "&or;";
    }
}

function toggleTable(tableId) {
    var table = document.getElementById(tableId.concat("-table"));
    var rowBtn = document.getElementById(tableId.concat(" RowBtn"));
    var toggleSpan = document.getElementById(tableId.concat("-toggle"));
    if (table.style.display === "none") {
        table.style.display = "table-row-group";
        rowBtn.setAttribute("style", "display: block;");
        // toggleSpan.innerHTML = `<span>&and;</span>`;
        // change background image 
        toggleSpan.setAttribute("style", "background:url('imgs/down.png') no-repeat; background-size: contain;");
    } else {
        table.style.display = "none";
        rowBtn.setAttribute("style", "display: none;");
        // toggleSpan.innerHTML = `<span>&or;</span>`;
        toggleSpan.setAttribute("style", "background:url('imgs/up.png') no-repeat; background-size: contain;");
    }
}

// We should assign majors list based on what majors.csv has in the list
function constructCourses() {
    var progId = ["mainMajorSelect", "doubleMajorSelect", "minorSelect"];

    for (i = 0; i < progId.length; i++) {
        console.log(`constructCourses running. ID: ${progId[i]}`);
        var courses;
        if (progId[i] == "minorSelect") {
            courses = minors;
        }
        else {
            courses = majors;
        }
        // console.log(`FOUND : `+Object.entries(courses));
        var selectLoc = document.getElementById(progId[i]);
        
        // Create a none option by default
        const noneOption = document.createElement("option");
        noneOption.setAttribute("value", "None");
        noneOption.setAttribute("label", "");
        selectLoc.appendChild(noneOption);

        for (const [key, value] of Object.entries(courses)) {
            var courseOption = document.createElement("option");            
            courseOption.setAttribute("value", value[0]);
            courseOption.setAttribute("label", key);
            selectLoc.appendChild(courseOption);
        }
    }
}

function grabCourses(selectId) {
    var courses;
    var tableId = "";
    console.log(`SelectID = ${selectId}`);

    tableId = selectId.replace("Select", "");
    if (selectId == "mainMajorSelect" || selectId == "doubleMajorSelect") {
        courses = majors;
    }
    else {
        courses = minors;
    }
    
    // if (selectId == "mainMajorSelect") {
    //     tableId += "mainMajor";
    //     courses = majors;   
    // }
    // else if (selectId == "doubleMajorSelect") {
    //     tableId += "doubleMajor";
    //     courses = majors;   
    // }
    // else {
    //     tableId += "minor";
    //     courses = minors;
        
    // }

    console.log(`grabCourses(${selectId}) running.`);
    
    var filter = document.getElementById(selectId).value;

    removeTable(tableId);
    
    if (filter != "None") {
        console.log("Selected course Array: ", courses);
        // find selected program, csv file compliant
        console.log(`Selected: ${filter}`);
        
        var programidx = Object.entries(courses).findIndex(([key, value]) => value[0] == filter);
        
        console.log(`Program Index: ${programidx}`, `Program Name: ${Object.keys(courses)[programidx]}`);
        
        var tableName = Object.keys(courses)[programidx];
        
        var reqs = courses[Object.keys(courses)[programidx]].slice(1)[0].split(", ");
        console.log(tableId, tableName, reqs);
        createTable(tableName, tableId, reqs)
    }
}

// --------------------------------------------------------

function addInputRow(tableId, firstCol) {
    // firstCol is a list of elements to become the first column of the table - can be of length 1 (just make a list of [element])
    var table = document.getElementById(tableId.concat("-tablebody"));
    console.log(table);
    var tableLength = parseInt(document.getElementById("semesterSlider").max);
    console.log("tableLength: ", tableLength);
    

    // Populate table with GER column vals, input fields
    var tableHeight = table.rows.length;
    console.log("old table height: ", tableHeight);
    for (let i = 0; i < firstCol.length; i++){
        var tableIdx = i + tableHeight
        var newRow = table.insertRow(-1);
        // if (firstCol[i] == "custom") {
        var rowLabel = firstCol[i].toLowerCase().replaceAll(" ", "");
        if (firstCol[i] == "custom") {
            rowLabel += String(tableIdx);
        }
        // console.log(tableIdx, firstCol[i], rowLabel)
        // for (let j = 0; j < table.rows[0].cells.length; j++){
        for (let j = 0; j < tableLength+1; j++) {
            if(j === 0){
                cell = newRow.insertCell(j);
                cell.setAttribute("class", "firstCol");

                if (rowLabel.startsWith("custom")) {
                    cell.innerHTML = `<td>Custom ${tableIdx}</td>`;
                }
                else {
                    cell.innerHTML = `<td>${firstCol[i]}</td>`;
                }
                cell.classList.add(rowLabel);
                cell.setAttribute("id", tableId+"_"+tableIdx+"-"+j);
            }
            else{
                var cell = newRow.insertCell(j);
                var newInput = document.createElement("input");

                newInput.setAttribute("id", tableId+"_"+tableIdx+"-"+j);
                newInput.setAttribute("class", "courseInput");
                newInput.classList.add(rowLabel);

                // newInput.setAttribute("value", "-");
                // if row is CLPs, set to number inputs, string otherwise
                if (rowLabel == "clps") {
                    newInput.setAttribute("type", "number");
                    newInput.setAttribute("min", "0");
                }
                else if (rowLabel === "fyw" && j > 2) {
                    newInput.setAttribute("disabled", "true");
                }
                else {
                    newInput.setAttribute("type", "text");
                }
                // Add event listener to handle input changes
                // console.log("EVENT LISTENER ADDED:", table.rows[tableIdx], j);
                // we simply have no validation for custom rows - maybe a future feature
                // if (!rowLabel.startsWith("custom")) {
                newInput.addEventListener("change", updateFirstCol.bind(newInput, table.rows[tableIdx], j));
                // }
                // newInput.addEventListener("change", updateTableColorsOnSlider.bind(newInput, semester));
                cell.appendChild(newInput);
            }
        }        
    }
    console.log("New table height: ", table.rows.length);
    updateSemesterLabel();
}

function updateFirstCol(relevantRow, j) {

    // console.log(this);
    console.log("Updating First Column: ");
    // console.log(relevantRow);
    // console.log(j);

    var inputValue = this.value;

    // Handle input change if necessary
    console.log(`Input changed (${inputValue}) for ${relevantRow.cells[0].innerHTML} in Semester ${j}`);
    var currentSemester = document.getElementById("semesterValue");
    currentSemester = parseInt(currentSemester.innerHTML);

    var firstCell = relevantRow.cells[0];
    var relevantRowInputs = relevantRow.getElementsByTagName("input");
    // console.log(relevantRow.cells[0].innerHTML)
    var rowLabel = firstCell.innerHTML.toLowerCase();
    var allEmpty = Array.from(relevantRowInputs).every(input => input.value === "");

    // if all inputs are empty, set first cell to red, reenable any relevant inputs
    if (allEmpty) {
        firstCell.setAttribute("style", "background-color: rgb(199, 2, 2);");
        for (let k = 0; k < relevantRowInputs.length; k++) {
            if (rowLabel != "fyw") {   
                relevantRowInputs[k].disabled = false;
            }
            else {
                if (k < 2) {
                    relevantRowInputs[k].disabled = false;
                }
            }
            relevantRowInputs[k].setAttribute("style", compareInputSemestersJ(relevantRowInputs[k], k+1, currentSemester));
        }
    }  
    if (inputValue != "") {
        // check if it is a valid GER course (if its a clp, it has to be a valid credit if not empty)
        console.log(relevantRowInputs[j-1], inputValue);
        // If valid, set background of input cell to lightgreen
        if (isValidCredit(inputValue, rowLabel)) {
            
            relevantRowInputs[j-1].setAttribute("style", "background-color: lightgreen");
        }
        // invalid course
        else {
            // console.log(typeof parseInt(inputValue))
            console.log(`Invalid course input: ${inputValue} for ${rowLabel}`);
            relevantRowInputs[j-1].setAttribute("style", "background-color: crimson");
            // pink indicates something is wrong with the input, but it's not empty
            firstCell.setAttribute("style", "background-color: pink;");
            if (rowLabel != "clps" && rowLabel != "fyw") {
                // re-enable all inputs in the row
                for (let k = 0; k < relevantRowInputs.length; k++) {
                    relevantRowInputs[k].disabled = false;
                    if (relevantRowInputs[k].value == "") {
                        relevantRowInputs[k].setAttribute("style", compareInputSemestersJ(relevantRowInputs[k], k+1, currentSemester));
                    }
                }
            }
        }
        // now begin handling first cell background color
        // if semester is current, set first cell to yellow
        // Pathways, CLPs, and HB are special cases - they need/can have multiple inputs
        if (rowLabel == "clps" || rowLabel == "pathways" || rowLabel == "hb") {
            // CLPs - if the sum of all inputs up to the current semester >= 32, set to green, otherwise, set to yellow (if all empty, set to red)
            if (rowLabel == "clps") {
                var total = 0;
                for (let k = 0; k < relevantRowInputs.length; k++) {
                    if (!isNaN(parseInt(relevantRowInputs[k].value))) {
                        total += parseInt(relevantRowInputs[k].value);
                    }
                }

                console.log("Total CLPs: ", total);
                if (total >= 32) {
                    firstCell.setAttribute("style", "background-color: green;");
                } else if (allEmpty) {
                    firstCell.setAttribute("style", "background-color: rgb(199, 2, 2);");
                } else {
                    firstCell.setAttribute("style", "background-color: #FFC000;");
                }
            }
                // pathways - if all 4 semesters are filled with the right courses, set to green, otherwise, set to yellow
            if (rowLabel == "pathways" || rowLabel == "hb") {
                if (rowLabel == "pathways") {
                    // construct an array from the input values of relevantRowInputs
                    var pathwaysInputs = Array.from(relevantRowInputs).map(input => input.value.toLowerCase().split("-")[0].trim())
                    // console.log("pathwaysInputs: ", pathwaysInputs);
                    if (pathwaysInputs.includes("pth 101") && pathwaysInputs.includes("pth 102") && pathwaysInputs.includes("pth 201") && pathwaysInputs.includes("pth 202")) {
                        firstCell.setAttribute("style", compareLabelSemestersJ(currentSemester, pathwaysInputs.indexOf("pth 202")));
                        // console.log("PATHWAYSC" + pathwaysInputs);

                        // disable all other inputs in row except inputs
                        var disabledArr = Array.from(relevantRowInputs).map(input => input.value);
                        for (let k = 0; k < disabledArr.length; k++) {
                            if (disabledArr[k] == "") {
                                relevantRowInputs[k].disabled = true;
                                relevantRowInputs[k].setAttribute("style", compareInputSemestersJ(relevantRowInputs[k], k+1, currentSemester));
                                
                            }
                        }
                    }
                }
                // hb is a special case - must have more than 1 input (2 HB credits required)
                if (rowLabel == "hb") {
                    var hbInputs = Array.from(relevantRowInputs).map(input => input.value)
                    for (let val = 0; val < hbInputs.length; val++) {
                        // if the input is empty, remove it from the array
                        if (hbInputs[val] == "") {
                            hbInputs.splice(val, 1);
                            val--;
                        }
                        else if (!isValidCredit(hbInputs[val], rowLabel)) {
                            hbInputs.splice(val, 1);
                            val--;
                        }
                    }
                    console.log("HB Inputs: ", hbInputs);
                    var disabledArr = Array.from(relevantRowInputs).map(input => input.value);
                    if (hbInputs.length >= 2) {
                        firstCell.setAttribute("style", "background-color: green;");
                        // disable all other rows
                        // var disabledArr = Array.from(relevantRowInputs).map(input => input.value);
                        for (let k = 0; k < disabledArr.length; k++) {
                            if (disabledArr[k] == "" || !isValidCredit(disabledArr[k], rowLabel)) {
                                relevantRowInputs[k].value = "";
                                relevantRowInputs[k].disabled = true;
                                relevantRowInputs[k].setAttribute("style", compareInputSemestersJ(relevantRowInputs[k], k+1, currentSemester));
                            }
                        }
                    }
                    else {
                        if (hbInputs.length > 0) {
                            firstCell.setAttribute("style", "background-color: #FFC000;");
                        }
                        else {
                            firstCell.setAttribute("style", "background-color: rgb(199, 2, 2);");
                        }
                        // re-enable all inputs in the row
                        for (let k = 0; k < relevantRowInputs.length; k++) {
                            relevantRowInputs[k].disabled = false;
                            if (disabledArr[k] == "" || !isValidCredit(disabledArr[k], rowLabel)) {
                                relevantRowInputs[k].setAttribute("style", compareInputSemestersJ(relevantRowInputs[k], k+1, currentSemester));
                            }
                        }
                    }
                }
                
            }
        }
        // if it's not a special case - it only needs 1 input to be fulfilled
        else {
            if (isValidCredit(inputValue, rowLabel)) {
                firstCell.setAttribute("style", compareLabelSemestersJ(j, currentSemester));
            // disable all other inputs in row except input semester
            for (let k = 0; k < relevantRowInputs.length; k++) {
                if (k+1 != j) {
                    relevantRowInputs[k].value = "";
                    relevantRowInputs[k].disabled = true;
                    relevantRowInputs[k].setAttribute("style", compareInputSemestersJ(relevantRowInputs[k], k+1, currentSemester));
                }
            }
        }
        }
    }
    // if the input field is empty
    else {
        console.log("Input field empty, resetting input styling.");
        console.log(relevantRowInputs[j].value);
        // if input is current semester, set to purple, otherwise set to enabled/disabled color
        relevantRowInputs[j-1].setAttribute("style", compareInputSemestersJ(relevantRowInputs[j-1], j, currentSemester));
        // reset first cell to red if all inputs in row are empty
        if (Array.from(relevantRowInputs).every(input => input.value === "")) {
            firstCell.setAttribute("style", "background-color: rgb(199, 2, 2);");
        }

    }
    updateTableColorsOnSlider(currentSemester);
}

function updateSemesterLabel() {
    var semesterValue = document.getElementById("semesterValue");
    var slider = document.getElementById("semesterSlider");
    
    semesterValue.innerHTML = `${slider.value}`;
    console.log(`Semester Val is ${slider.value}`);
    updateTableColorsOnSlider(slider.value);

}

function compareLabelSemestersJ(j, semester) {
    if (j == semester) {
        return "background-color: #FFC000;";
    }
    else if (j < semester) {
        return "background-color: green;";
    }
    else {
        return "background-color: blue;";
    }
}

function compareInputSemestersJ(input, j, semester) {
    if (j == semester && input.disabled == false) {
        return "background-color: rgb(196, 83, 196);";
    }
    else if (input.disabled == false) {
        return "background-color: rgb(255, 255, 255, 0.75);";
    }
    else if (j == semester && input.disabled == true) {
        return "background-color: rgb(196, 83, 196, 0.25)";
    }
    else {
        return "background-color: rgb(255, 255, 255, 0.25);";
    }
}

function updateTableColorsOnSlider(semester) {
    // Get all tables GER and Major 
    // console.log("Semester: ", semester);
    var tables = document.querySelectorAll("table");
    console.log("Tables: ", tables);
    // Loop through each table
    tables.forEach(function(table) {
        // Get all rows in the table
        var rows = table.rows;
        console.log("Updating table rows: ", rows);
        // Loop through each row, except the header rows
        for (let i = 2; i < rows.length; i++) {
            var relevantRow = rows[i];
            var firstCell = relevantRow.cells[0];
            var relevantRowInputs = relevantRow.getElementsByTagName("input");
            // if (Array.from(firstCell.classList).some(cls => cls.match(/custom/))) {
            //     break;
            // }

            // Set all inputs to enabled
            for (let j = 0; j < relevantRowInputs.length; j++) {
                if(relevantRowInputs[j].value != "" && Object.values(firstCell.classList).indexOf("clps") == -1 && isValidCredit(relevantRowInputs[j].value, firstCell.classList[1])) {
                    firstCell.setAttribute("style", compareLabelSemestersJ(j, semester-1));
                }
                else if (relevantRowInputs[j].value != "" && Object.values(firstCell.classList).indexOf("clps") == -1 && !isValidCredit(relevantRowInputs[j].value, firstCell.classList[1])) {
                    relevantRowInputs[j].setAttribute("style", "background-color: crimson;");
                    firstCell.setAttribute("style", "background-color: pink;");
                }
                // console.log("I: ", i, "J: ", j, "Semester: ", semester);
                if (relevantRowInputs[j].value == "") {
                    relevantRowInputs[j].setAttribute("style", compareInputSemestersJ(relevantRowInputs[j], j+1, semester));
                }
            }
        }
    });
}

function isValidCredit(inputValue, creditType) {
    // console.log(`isValidCredit called with inputValue: ${inputValue}, creditType: ${creditType}`, creditType.length);
    if (Object.keys(GER_COURSES).indexOf(creditType) >= 0 && creditType != "clps") {
        return GER_COURSES[creditType].indexOf(inputValue) >= 0;
    }
    else if (creditType == "clps") {
        return parseInt(inputValue) >= 0;
    }
    else {
        return false
    }
}

// --------------------------------------------------------

function createTable(tableName, tableId, data) {
    var tableDiv = document.getElementById(tableId.concat("-wrapper"));
    tableDiv.setAttribute("style", "border: red solid 1px; border-radius: 5px;");

    var name = document.createElement("h2");
    var semesterMax = parseInt(document.getElementById("semesterSlider").max)+1;
    console.log("tableId: ", tableId);

    
    name.innerHTML = `${tableName}`;
    name.setAttribute("id", "tableHeader");
    name.classList.add(tableId);

    var table = document.createElement("table");
    // DON'T CHANGE - NEED THIS TO ACCESS TABLE IN JS
    table.setAttribute("id", tableId.concat("-table"));
    
    tableDiv.appendChild(name);
    tableDiv.appendChild(table);

    // Add header row 
    var tableHeader = document.createElement("thead");
    tableHeader.setAttribute("id", tableId.concat("-tableheaders"));

    table.appendChild(tableHeader);
    // Create year row
    var yearRow = tableHeader.insertRow(0);
    // yearRow = document.createElement("th");
    yearRow.setAttribute("id", "yearRow");
    yearRow.classList.add(tableId);

    values = ['Year', 'Freshman', 'Sophomore', 'Junior', 'Senior'];

    for (let i = 0; i < values.length; i++) {
        var cell = document.createElement("th");

        cell.setAttribute("colspan", i == 0 ? 1 : 2);
        cell.innerHTML = values[i];
    
        yearRow.appendChild(cell);
    }
    

    // Create header row
    var headerRow = tableHeader.insertRow(1);
    headerRow.setAttribute("id", "headerRow");
    headerRow.classList.add(tableId);
    for (let i = 0; i < semesterMax; i++){
        if (i === 0) {
            headerRow.insertCell(i).innerHTML = `<th>Reqs</th>`;
        }
        else {
            // headerRow.insertCell(i).innerHTML = `<th>Semester ${i}</th>`;
            headerRow.insertCell(i).innerHTML = i % 2 == 0 ? `<th>Spring</th>` : `<th>Fall</th>`;
        }
    }       

    var tbody = document.createElement("tbody");
    tbody.setAttribute("id", tableId.concat("-tablebody"));
    table.appendChild(tbody);
    // Add input rows based on data
    

    addInputRow(tableId, data);

    // add a custom - add row button below existing rows
    var addRowBtn = document.createElement("button");
    addRowBtn.innerHTML = "+";
    addRowBtn.setAttribute("id", tableId+" RowBtn");
    addRowBtn.setAttribute("class", "addRowBtns");
    addRowBtn.onclick = function() {
        customAddRow(tableId);
    };
    console.log("Adding Add Row Button for: ", tableId);
    tableDiv.appendChild(addRowBtn);

    // add a toggle span to header
    var toggleSpan = document.createElement("input");
    toggleSpan.setAttribute("id", tableId.concat("-toggle"));
    toggleSpan.setAttribute("class", "toggleBtn");
    toggleSpan.setAttribute("type", "button");
    // toggleSpan.innerHTML = `<span>&and;</span>`;
    toggleSpan.onclick = function() {
        toggleTable(tableId);
    };
    console.log("Adding Toggle for: ", tableId);
    name.appendChild(toggleSpan);
}

function removeTable(tableId) {
    var oldGroup = document.getElementById(tableId.concat("-wrapper"));
    if (oldGroup) {
        for (let i = oldGroup.children.length - 1; i >= 0; i--) {
            if (oldGroup.children[i].id != "selects") {
                oldGroup.children[i].remove();
            }
        }
    }
    console.log(`Table: ${tableId} and its components removed.`);
}

function customAddRow(tableId) {
    // remove the old button - plan to move below new row
    var table = document.getElementById(tableId.concat("-table"));
    var numCols = table.rows[1].cells.length; // Get number of columns from the header row
    console.log("Number of columns: "+numCols);
    addInputRow(tableId, ["custom"]);
    console.log("Custom row added to table: ", tableId);

    var oldButton = document.getElementById(tableId.concat(" RowBtn"));
    oldButton.remove(); 
    // Create a new button and append it to the table

    var newButton = document.createElement("button");
    newButton.innerHTML = "+";
    newButton.setAttribute("id", tableId+" RowBtn");
    newButton.setAttribute("class", "addRowBtns");
    newButton.onclick = function() {
        customAddRow(tableId);
    };
    table.appendChild(newButton);
}

function customAddColumn() {
    // adds a new column to all tables with incremented column number
    var tables = document.querySelectorAll("table");
    var semesterSlider = document.getElementById("semesterSlider");
    semesterSlider.max++;
    // update tick marks
    // var tickMarks = document.getElementById("semesterList");
    // var width = semesterSlider.getBoundingClientRect();
    // console.log("Slider width: ", width);
    // console.log(semesterSlider.offsetWidth)
    // var calc = (width - 12) / (semesterSlider.max - 1) + "px";
    // console.log("slider css width: ", calc);
    // tickMarks.innerHTML = "";
    // for (let i = 0; i <= semesterSlider.max; i++) {
    //     var tick = document.createElement("option");
    //     tick.value = i;
    //     tick.innerHTML = "|";

    //     if (i == 0 || i == semesterSlider.max) {
    //         var w = (parseInt(calc) * 2 + 6) + "px";
    //         tick.setAttribute("style", `width: ${w};`);
    //         if (i == 0) {
    //             tick.setAttribute("style", "text-align: left;");
    //         }
    //         else {
    //             tick.setAttribute("style", "text-align: right;");
    //         }
    //     }
    //     else {
    //         var w = (calc) + "px";
    //         tick.setAttribute("style", `width: ${w};`);
    //         tick.setAttribute("style", "text-align: center;");
    //     }
    //     tickMarks.appendChild(tick);
    // }
    // tickMarks.setAttribute("style", `width: ${width}`);
    // semesterSlider.setAttribute("--list-length", semesterSlider.max);
    // tickMarks("--list-length", semesterSlider.max);

    tables.forEach(function(table) {
        var yearRow = table.rows[0];
        var headerRow = table.rows[1];
        var tableId = table.id.replace("-table", "");
        var numCols = table.rows[1].cells.length; // Get number of columns from the header row
        console.log("Adding new column to table: ", tableId, " with numCols: ", numCols);

        // retrieve the text of the last cell in the year row
        
        // console.log("Year Row: ", yearRow.lastChild.innerHTML);
        if (yearRow.lastChild.innerHTML == "Senior") {
            yearRow.insertCell(yearRow.cells.length).innerHTML = `<th>Other</th>`;
        }
        else {
            yearRow.lastChild.setAttribute("colspan", `${yearRow.lastChild.colSpan + 1}`);
        }
        headerRow.insertCell(numCols).innerHTML = `<th>Semester ${numCols}</th>`;
        // Loop through each row and add a new input cell
        var j = numCols; 
        for (let i = 2; i < table.rows.length; i++) {
            var relevantRow = table.rows[i];
            var firstCell = relevantRow.cells[0];
            var rowLabel = firstCell.innerHTML.toLowerCase().replaceAll(" ", "");

            console.log("FirstCell:", firstCell);
            console.log("Row: ", Array.from(relevantRow.getElementsByTagName("input")).map(input => input.disabled));

            var newCell = table.rows[i].insertCell(-1);
            var newInput = document.createElement("input");
            newInput.setAttribute("id", tableId+"_"+i+"-"+numCols);
            newInput.setAttribute("class", "courseInput");
            newInput.classList.add(rowLabel);

            // if row is CLPs, set to number inputs, string otherwise
            if (rowLabel == "clps") {
                newInput.setAttribute("type", "number");
                newInput.setAttribute("min", "0");
            }
            else if (rowLabel === "fyw" && j > 2) {
                newInput.setAttribute("disabled", "true");
            }
            else {
                newInput.setAttribute("type", "text");
            }
            // we simply have no validation for custom rows - maybe a future feature
            newInput.addEventListener("change", updateFirstCol.bind(newInput, relevantRow, numCols));

            // if there are disabled rows and the firstCell is colored blue/green/orange, disable the new input
            if (Array.from(relevantRow.getElementsByTagName("input")).some(cell => cell.disabled == true) &&
            (firstCell.getAttribute("style") == "background-color: #FFC000;" || 
            firstCell.getAttribute("style") == "background-color: green;" || 
            firstCell.getAttribute("style") == "background-color: blue;")
            ) {
                console.log("Disabling new input for row: ", rowLabel);
                newInput.disabled = true;
            }
            newCell.appendChild(newInput);
        }
        if (tableId == "GERS") {
            setGERSAutocomplete(); // Reapply autocomplete to the new input fields
        }
        updateSemesterLabel();
        
    });
    console.log("New column added to tables.");
}
