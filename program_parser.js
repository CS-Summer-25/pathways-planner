// Looks into acalog_programs.json file 
// loops over programs 

let majors = {};
let minors = {};
let GER_COURSES = null;
GERS = ["CLPs", "FYW", "WR", "Pathways", "NE", "IEJ", "WC", "HA", "TA", "VP", "UQ", "FL", "MB", "MR", "HB", "NW", "NWL"];


async function assignCourses(path) {
    // must wait to ensure that data is properly loaded into global var MAJORS
    const data = JSON.parse(await fetch(path).then(response => response.text()));
    console.log("assignCourses called with data:", data);

    // loop through the data and assign majors and minors
    for (let programTitle in data) {
        console.log("Program:", programTitle);
        let program = {programTitle: {"code" : "", "reqs": []}};
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
                program.programTitle.code = key;
                console.log("Program Key:", program.programTitle.code);
                continue; // skip to next pattern
            }
            else if (pattern.startsWith("required")) {
                // this is a required course pattern
                // each course will be a row, 
                let numRows = data[programTitle][pattern].length;
                let options = data[programTitle][pattern];
                // create row names
                let reqs = [];
                if (numRows > 1) {
                    for (let i = 0; i < numRows; i++) {
                        // the course code is the first part of the string
                        reqs.push(options[i].split(" ")[0]);
                    }
                }
                else {
                    reqs.push(options[0].split(" ")[0]);
                }
                reqs = reqs.join(", ");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programTitle.reqs.push(reqs);
                console.log("Processing Required: ", pattern, "\n", program.programTitle.reqs);
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
                program.programTitle.reqs.push(reqs);

                // let rowName = pattern.split("_")[-1];
                // console.log("Processing Choice Pattern:", pattern, "Num Rows:", numRows, "Row Name:", rowName, "Options:", options);
                console.log("Processing choose: ", pattern, "\n", program.programTitle.reqs);
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
                program.programTitle.reqs.push(reqs);
                console.log("Processing choose: ", pattern, "\n", program.programTitle.reqs);
            }
            // else if (pattern.startsWith("either")) {
            // }
            else if (pattern.startsWith("credit")) {
                // this is a credit pattern
                let numRows = parseInt(pattern.split("_")[1]) / 4; 
                let options = data[programTitle][pattern];
                // rowName is the pattern name
                let rowName = pattern.split("_")[2];
                let reqs = [];
                if (numRows > 4) {
                    for (let i = 1; i < numRows+1; i++) {
                        reqs.push(rowName + " " + i);
                    }
                }
                else {
                    reqs.push(rowName);
                }
                reqs = reqs.join(", ");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programTitle.reqs.push(reqs);
                console.log("Processing credit: ", pattern, "\n", program.programTitle.reqs);
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
                program.programTitle.reqs.push(reqs);
                console.log("Processing credit: ", pattern, "\n", program.programTitle.reqs);
            }

            // console.log(`Type = ${programTitle.split(", ").slice(-1)}`);

            // console.log("Processing Choice Pattern:", pattern, "Num Rows:", numRows, "Row Name:", rowName, "Options:", options);     
            // console.log("Processing Pattern:", pattern, "Row Name:", reqs);
            // console.log("Processing Pattern:", pattern);
        }
        program.programTitle.reqs = program.programTitle.reqs.join(", ");
        if (programTitle.endsWith("Minor")) {
            // minors.keys.push(programTitle);
            // minors.push({programTitle : [rowName, options]});
            // minors[programTitle] = {"rowName": rowName, "options": options};
            minors[programTitle] = [program.programTitle.code, program.programTitle.reqs]
            console.log("REQS: ", minors[programTitle]);
        }
        else {
            // (programTitle.split(",").slice(-1).toString().trim() == "B.A." ||
            // programTitle.split(",").slice(-1).toString().trim() == "B.S." || 
            // programTitle.split(",").slice(-1).toString().trim() == "B.M.") {
            // assign majors a key of programTitle
            // majors.push(programTitle);
            // majors.push({programTitle : rowName, options});
            // majors[programTitle] = {"rowName": rowName, "options": options};
            majors[programTitle] = [program.programTitle.code, program.programTitle.reqs]
            console.log("REQS: ", majors[programTitle]);
            // majors.push(programTitle);
            // console.log("Assigned Major:", programTitle, "Row Name:", rowName, "Options:", options);
        }
        console.log("");
    }

    // for (i = 0; i < data.length; i++) {
    //     if (!data[i]["Program"].startsWith("#")) {
    //         var type = data[i]["Type"];
    //         var program = data[i]["Program"];
    //         var name = data[i]["Name"];
    //         // this was more painful than I initially anticipated
    //         var vals = data[i]["Reqs"].split(',');
    //         // console.log(vals)

    //         if (type == "major") {
    //             majors.push([program, name, vals]);
    //         }
    //         else if (type == "minor") {
    //             minors.push([program, name, vals]);
    //         }
    //     }
    // }
}

async function initialize() {
    // Recall, waiting so that MAJORS assigned properly
    await assignCourses("acalog_programs.json");
    console.log("Starting Table Population");
    createTable("GERS", "GERS", GERS);  
    console.log("MAJORS/MINORS Initialized: ");
    console.log(majors, minors);
    // sort the majors and minors by their keys
    majors = Object.fromEntries(Object.entries(majors).sort());
    minors = Object.fromEntries(Object.entries(minors).sort());

    constructCourses();
    setGERSAutocomplete();
    console.log("Initialization complete!")
}


function setGERSAutocomplete() {
    $( function() {        
        fetch('gers.json')
        .then(response => response.json())
        .then(gers => {
            GER_COURSES = gers;
            GERS = Object.keys(gers);
            // Loop over gers dictionary to set up autocomplete for all GER fields
            for (let gerKey in gers) {
                if (gers.hasOwnProperty(gerKey)) {
                    const gerElements = document.getElementsByClassName(gerKey);
                    for (let i = 0; i < gerElements.length; i++) {
                        const gerElement = gerElements[i];
                        $(gerElement).autocomplete({
                            source: gers[gerKey],
                            select: function(event, ui) {
                                inputValue = ui.item.label;
                                rowLabel = event.target.classList[1];
                                // firstCol = 
                                console.log("LABEL: ", rowLabel);

                                if (Object.values(event.target.classList).indexOf("CLPs") == -1) {

                                    // make rowLabel all uppercase 
                                    rowLabel = rowLabel.toUpperCase();
                                    var isValidGER = GER_COURSES[rowLabel].indexOf(inputValue) >= 0;
                        
                                    if (isValidGER == false){
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
        console.log(`FOUND : `+Object.entries(courses));
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
    
    if (selectId == "mainMajorSelect") {
        tableId += "mainMajor";
        courses = majors;   
    }
    else if (selectId == "doubleMajorSelect") {
        tableId += "doubleMajor";
        courses = majors;   
    }
    else {
        tableId += "minor";
        courses = minors;
        
    }

    console.log(`filterCourses(${selectId}) running.`);
    console.log(courses);
    
    var filter = document.getElementById(selectId).value;
    removeTable(tableId);
    
    if (filter != "None") {
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

function addInputRow(tableId, firstCol) {
    var table = document.getElementById(tableId.concat("-table"));
    console.log(table);

    // Populate table with GER column vals, input fields
    for (let i = 0; i < firstCol.length; i++){
        var newRow = table.insertRow(-1);
        var rowLabel = firstCol[i].toLowerCase().replaceAll(" ", "");
        for (let j = 0; j < 9; j++){
            if(j === 0){
                cell = newRow.insertCell(j);
                cell.setAttribute("class", "firstCol");
                
                cell.innerHTML = `<td>${firstCol[i]}</td>`;
                cell.classList.add(rowLabel);
            }
            else{
                var cell = newRow.insertCell(j);
                var newInput = document.createElement("input");

                newInput.setAttribute("id", tableId+"_"+i+"-"+j);
                newInput.setAttribute("class", "courseInput");
                newInput.classList.add(rowLabel);

                // newInput.setAttribute("value", "-");
                // if row is CLPs, set to number inputs, string otherwise
                if (firstCol[i] == "CLPs") {
                    newInput.setAttribute("type", "number");
                    newInput.setAttribute("min", "0");
                }
                // Pathways is constant, so set to text with values in first 4 accordingly,  last 4 disabled
                // <!-- disabled because there are more than 4 pth classes
                // else if (firstCol[i] == "Pathways") {                    
                //     // newInput.setAttribute("value", ["PTH-101", "PTH-102", "PTH-201", "PTH-210", "", "", "", ""][j-1]);
                //     if (j > 4) {
                //         newInput.setAttribute("disabled", "true");
                //     }
                //     // else {
                //     //     // This ensures that this info still gets sent, but can't be edited
                //     //     // Now, let's hope semester slider updates table correclty
                //     //     newInput.setAttribute("readonly", "true");
                //     // }
                // }
                // Can only take an FYW in freshman year
                else if (firstCol[i] === "FYW" && j > 2) {
                    newInput.setAttribute("disabled", "true");
                }
                else {
                    newInput.setAttribute("type", "text");
                }
                

                // Add event listener to handle input changes
                // Can Event Listener go outside of function?
                newInput.addEventListener("change", updateFirstCol.bind(newInput, i, j, table, firstCol));
                cell.appendChild(newInput);
            }
        }
    }
}

function updateFirstCol(i, j, table, firstCol) {

    console.log(this);
    console.log(i);
    console.log(j);
    console.log(table);
    console.log(firstCol);

    var inputValue = this.value;


    // Handle input change if necessary
    console.log(`Input changed for ${firstCol[i]} in Semester ${j}`);
    // Get rows 
    var rows = table.rows;
    var relevantRow = rows[i+1];

    var firstCell = relevantRow.cells[0];
    var relevantRowInputs = relevantRow.getElementsByTagName("input");
    var rowLabel = firstCol[i].toUpperCase();
    if (firstCol[i] != "CLPs") {
        var isValidGER = GER_COURSES[rowLabel].indexOf(inputValue) >= 0;
    }
    // console.log(inputValue);
    // console.log(GER_COURSES[rowLabel]);
    // console.log(isValidGER);

    // if val is empty, reset background to red and enable all input slots in row
    if(inputValue == "") {
        firstCell.setAttribute("style", "background-color: rgb(199, 2, 2);");
        relevantRow.cells[j].setAttribute("style", "background-color:255, 255, 255, 0.75")
        for (let k = 0; k < relevantRowInputs.length; k++) {
            relevantRowInputs[k].disabled = false;
            relevantRowInputs[k].setAttribute("style", "background-color: 255, 255, 255, 0.75;");
            // relevantRow.cells[j].setAttribute("style", "background-color:yellow"); //TODO: Fix shade of gray here 
        }
    }                        
    else{
        
        var currentSemester = document.getElementById("semesterLabel");
        currentSemester = parseInt(currentSemester.innerHTML);
        console.log(currentSemester, j);
        // console.log(relevantRow.cells[j])
        console.log(relevantRowInputs)
        if (isValidGER == false) {// && firstCol[i] != "CLPs"){
            relevantRow.cells[j].setAttribute("style", "background-color: crimson;");
            firstCell.setAttribute("style", "background-color: rgb(199, 2, 2);");
            
        }
        else {
            relevantRow.cells[j].setAttribute("style", "background-color:255, 255, 255, 0.75;");
            // CLP Check, check sum of all semester, if input is CLPs, check if sum of all inputs >= 32, if so, set to green (done), otherwise, set to yellow (ongoing). 
            // Follows different logic than other GERS - all inputs are enabled
            if (firstCol[i] == "CLPs") {
                var total = 0;
                
                for (let k = 0; k < relevantRowInputs.length; k++) {
                    if (relevantRowInputs[k].value != "") {
                        total += parseInt(relevantRowInputs[k].value);
                    }
                    if (total >= 32) {
                        firstCell.setAttribute("style", "background-color: green;");
                    }
                    else if (total < 32 && total > 0) {
                        firstCell.setAttribute("style", "background-color: #FFC000;");
                    }
                    else {
                        firstCell.setAttribute("style", "background-color: rgb(199, 2, 2);");
                    }
                }
            }

            // Pathways check, If all 4 semesters are filled, set to green, otherwise, set to yellow
                // In all honesty, probably should just disable all inputs except for first 4 on startup, as well as populate info
                // thus relying on current semester to determine if ongoing or done.
                // Do we want validation (i.e. specific course names) for pathways in the planner?
            else if (firstCol[i] == "Pathways") {
                if (currentSemester > 4 &&
                relevantRowInputs[0].value.toLowerCase().split("-")[0].trim() == "pth 101" &&
                relevantRowInputs[1].value.toLowerCase().split("-")[0].trim() == "pth 102" &&
                relevantRowInputs[2].value.toLowerCase().split("-")[0].trim() == "pth 201" &&
                relevantRowInputs[3].value.toLowerCase().split("-")[0].trim() == "pth 202") 
                {
                    firstCell.setAttribute("style", "background-color: green;");
                }
                else {
                    firstCell.setAttribute("style", "background-color: #FFC000;");
                }
            }
            
            else if (currentSemester > j) {
            // Get first cell of the relevant row
                firstCell.setAttribute("style", "background-color: green;");
            }
            // If semester is current, set to ongoing
            else if (currentSemester == j) { 
                firstCell.setAttribute("style", "background-color: #FFC000;");
            }
            // Else, set to planned
            else {
                firstCell.setAttribute("style", "background-color: #0000ff;");
            }
        }
        // Make sure to add validation for special cases NW and HB - they need at least 2 credits
        // if you have multiple slots (you need to have two NWs and HBs)
        // if (GERS[i] == "NW" || GERS[i] == "HB") {
        //     var total = 0;
            
        // Disable all other inputs in row except input semester
         if (firstCol[i] != "CLPs" && firstCol[i] != "Pathways") {
            for (let k = 0; k < relevantRowInputs.length; k++) {
                if (k+1!=j) {
                    relevantRowInputs[k].disabled = true;
                }
            }
        }
    }
}

function removeTable(tableId) {
    var oldTable = document.getElementById(tableId.concat("-table"));
    // Ensures that the <h1> tag also gets removed
    var oldHeader = document.querySelectorAll(`[class=${tableId}]`);
    if (oldTable) {

        oldTable.remove()
        oldHeader.forEach(function(row) {
            row.parentNode.removeChild(row);
        });
    }
    console.log(`Previous rows of type: ${tableId} removed.`);
}


// Remember to add HB and NW validation
function createTable(tableName, tableId, data) {
    // expected table IDs: GERS, mainMajor, doubleMajor, minor
    // How to implement table order? (i.e. GERS, main, double, always in that order)
    var loc = document.getElementById("mainBody");
    var name = document.createElement("h2");
    console.log(tableId)

    
    name.innerHTML = `${tableName}`;
    name.setAttribute("id", "tableHeader");
    name.classList.add(tableId);

    var table = document.createElement("table");
    // DON'T CHANGE - NEED THIS TO ACCESS TABLE IN JS
    table.setAttribute("id", tableId.concat("-table"));

    loc.appendChild(name);
    loc.appendChild(table);

    // Create header row
    var headerRow = table.insertRow(0);
    headerRow.setAttribute("id", "headerRow");
    headerRow.classList.add(tableId);
    for (let i = 0; i < 9; i++){
        if (i === 0) {
            headerRow.insertCell(i).innerHTML = `<th>Reqs</th>`;
        }
        else {
            headerRow.insertCell(i).innerHTML = `<th>Semester ${i}</th>`;
        }
    }
    addInputRow(tableId, data);
}

         
function updateSemesterLabel() {
    // Should we add something about updating the table when this function is called? Otherwise, data must be re-entered to refresh table
    var semesterLabel = document.getElementById("semesterLabel");
    var slider = document.getElementById("semesterSlider");
    semesterLabel.innerHTML = `${slider.value}`;
    console.log(`Semester Val is ${slider.value}`);

    updateTableColorsOnSlider(slider.value);

}

function updateTableColorsOnSlider(semester) {
    // Get all tables GER and Major 
    var tables = document.querySelectorAll("table");

    // Loop through each table
    tables.forEach(function(table) {
        // Get all rows in the table
        var rows = table.rows;
        console.log(rows);
        // Loop through each row, except the header row
        for (let i = 1; i < rows.length; i++) {
            var relevantRow = rows[i];
            var firstCell = relevantRow.cells[0];
            var relevantRowInputs = relevantRow.getElementsByTagName("input");
            
            // Set all inputs to enabled
            for (let j = 0; j < relevantRowInputs.length; j++) {
                if(relevantRowInputs[j].value != "" && Object.values(firstCell.classList).indexOf("CLPs") == -1){

                    if (semester-1 == j) {
                        // If semester is current, set to ongoing
                        firstCell.setAttribute("style", "background-color: yellow;");
                    }
                    else if (semester-1 > j) {
                        // If semester is past current semester, set to green
                        firstCell.setAttribute("style", "background-color: green;");
                    }
                    else {
                        // If semester is before current semester, set to planned
                        firstCell.setAttribute("style", "background-color: blue;");
                    }
                }

                if ((j == semester-1) && (relevantRowInputs[j].disabled == false) && (relevantRowInputs[j].value == "")) {
                    relevantRowInputs[j].setAttribute("style", "background-color: rgb(196, 83, 196);");
                }
                else if (relevantRowInputs[j].disabled == false && relevantRowInputs[j].value == "") {
                    relevantRowInputs[j].setAttribute("style", "background-color: rgb(255, 255, 255, 0.75);");
                }
                else if (relevantRowInputs[j].disabled == true && relevantRowInputs[j].value == "") {
                    relevantRowInputs[j].setAttribute("style", "background-color: rgb(255, 255, 255, 0.25);");
                }
            }
        }
    });
}

// Make sure that savePlan and loadPlan save the programs as well
function savePlan() {

    var currentSemester = document.getElementById("semesterLabel").innerHTML;

    var password = document.getElementById("password").value;
    console.log(password);
    var table = document.getElementById("courses");
    var countGers = GERS.length;
    var plan = {};

    // Saving plan in compressed form for GET requests 
    var compressed = "";
    for (let i = 0; i < countGers; i++){
        var relevantRow = table.rows[i+1];
        var inputs = relevantRow.getElementsByTagName("input");
        var courses = [];
        for (let j = 0; j < inputs.length; j++) {
            if (inputs[j].value !== "") {
                courses.push(inputs[j].value);
                compressed += `${GERS[i]}_${j+1}_${inputs[j].value};`;
            }
        }
    }

    // Make get request and pass password and plan as query parameters
    // var xhr = new XMLHttpRequest();
    plan = "Abc"; // Placeholder for plan, replace with actual plan data
    var constructedUrl = `https://furmancs.com/tabot/savePlan?password=${encodeURIComponent(password)}&plan=${encodeURIComponent(compressed)}&semester=${currentSemester}`;
    console.log(constructedUrl);
    // xhr.open("GET", constructedUrl, true);
    // xhr.onreadystatechange = function() {
    //     if (xhr.readyState === 4 && xhr.status === 200) {
    //         alert("Plan saved successfully!");
    //     } else if (xhr.readyState === 4) {
    //         alert("Failed to save plan. Please try again.");
    //     }
    //     else{
    //         console.log("Request in progress...");
    //     }
    // };

    fetch(constructedUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    });

}

function loadPlan() {

    var password = document.getElementById("password").value;

    console.log(password);
    console.log("Load Plan");
    var constructedUrl = `https://furmancs.com/tabot/loadPlan?password=${encodeURIComponent(password)}`;

    fetch(constructedUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        var coursesInfo = response.json();

        coursesInfo.then(data => {

            for(i = 0; i<data.length; i++){
                console.log(data[i]);
                let course = data[i];
                let ger = course.ger;
                let semester = parseInt(course.sem);
                let courseName = course.title;

                console.log(ger);

                // Find the row corresponding to the GER
                let gerIndex = GERS.indexOf(ger);
                console.log(gerIndex);
                let table = document.getElementById("courses");
                let relevantRow = table.rows[gerIndex + 1];
                let inputs = relevantRow.getElementsByTagName("input");
                console.log(semester);
                // Find the input corresponding to the semester
                if (semester >= 1 && semester <= 8) {
                    let inputIndex = semester - 1; // Adjust for zero-based index
                    console.log(inputs[inputIndex]);
                    if (inputs[inputIndex]) {
                        inputs[inputIndex].value = courseName;
                        inputs[inputIndex].dispatchEvent(new Event('input')); // Trigger input event to update styles
                    }
                }
            }
            
        }).catch(error => {
            console.error("There was a problem with the fetch operation:", error);
            alert("Failed to load plan. Please check your password and try again.");

        
        });
    });
}

function togglePanel(){
    var panel = document.getElementById("controlPanel");
    var mainBody = document.getElementById("mainBody");
    if (panel.style.display === "none") {
        panel.style.display = "block";
        mainBody.style.paddingTop = "1%";
    } else {
        panel.style.display = "none";
        mainBody.style.paddingTop = "6%";
    }
}