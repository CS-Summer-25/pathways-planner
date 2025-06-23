// GERS = ["CLPs", "FYW", "WR", "Pathways", "NE", "IEJ", "WC", "HA", "TA", "VP", "UQ", "FL", "MB", "MR", "NW1", "NW2", "HB1", "HB2"];
GERS = ["CLPs", "FYW", "WR", "Pathways", "NE", "IEJ", "WC", "HA", "TA", "VP", "UQ", "FL", "MB", "MR", "NW", "HB"];
// make sure to have NW and HB be given two slots

let MAJORS = [];
let MINORS = [];

async function assignCourses(type) {
    // must wait to ensure that data is properly loaded into global var MAJORS
    const data = await d3.csv("csv-files/programs.csv")

    for (i = 0; i < data.length; i++) {
        if (!data[i]["Program"].startsWith("#")) {
            var type = data[i]["Type"];
            var program = data[i]["Program"];
            var name = data[i]["Name"];
            // this was more painful than I initially anticipated
            var vals = data[i]["Reqs"].split(',');
            // console.log(vals)
            if (type == "major") {
                MAJORS.push([program, name, vals]);
            }
            else if (type == "minor") {
                MINORS.push([program, name, vals]);
            }
        }
    }
}

async function initialize() {
    // Recall, waiting so that MAJORS assigned properly
    await assignCourses("programs.csv");
    console.log("Starting Table Population");
    createTable("GERS", "GERS", GERS);    
    console.log("MAJORS/MINORS Initialized: ");
    console.log(MAJORS, MINORS);
    constructCourses();
    console.log("Initialization complete!");
}


// We should assign majors list based on what majors.csv has in the list
function constructCourses() {
    var progId = ["mainMajorSelect", "doubleMajorSelect", "minorSelect"];

    for (i = 0; i < progId.length; i++) {
        console.log(`constructCourses running. ID: ${progId[i]}`);
        var courses;
        if (progId[i] == "minorSelect") {
            courses = MINORS;
        }
        else {
            courses = MAJORS;
        }
        console.log(courses)
        var selectLoc = document.getElementById(progId[i]);
        
        // Create a none option by default
        const noneOption = document.createElement("option");
        noneOption.setAttribute("value", "None");
        noneOption.setAttribute("label", "");
        selectLoc.appendChild(noneOption);

        for (courseidx=0; courseidx < courses.length; courseidx++) {
            var courseOption = document.createElement("option");
            courseOption.setAttribute("value", courses[courseidx][0]);
            courseOption.setAttribute("label", courses[courseidx][1]);
            selectLoc.appendChild(courseOption);
        }
    }
}

// -----------------------------------------------------------
function addInputRow(tableId, firstCol) {
    var table = document.getElementById(tableId.concat("-table"));
    console.log(table);

    // Populate table with GER column vals, input fields
    for (let i = 0; i < firstCol.length; i++){
        var newRow = table.insertRow(-1);
        for (let j = 0; j < 9; j++){
            if(j === 0){
                cell = newRow.insertCell(j);
                cell.setAttribute("class", "firstCol");
                
                cell.innerHTML = `<td>${firstCol[i]}</td>`;
                cell.setAttribute("tableClass", tableId.concat("-rows"));
            }
            else{
                var cell = newRow.insertCell(j);
                var newInput = document.createElement("input");

                newInput.setAttribute("class", "courseTitle");

                newInput.setAttribute("tableClass", tableId.concat("-rows"));
                
                // if row is CLPs, set to number inputs, string otherwise
                if (firstCol[i] == "CLPs") {
                    newInput.setAttribute("type", "number");
                    newInput.setAttribute("min", "0");
                }
                // Pathways is constant, so set to text with values in first 4 accordingly,  last 4 disabled
                else if (firstCol[i] == "Pathways") {                    
                    newInput.setAttribute("value", ["PTH-101", "PTH-102", "PTH-201", "PTH-210", "", "", "", ""][j-1]);
                    if (j > 4) {
                        newInput.setAttribute("disabled", "true");
                    }
                    else {
                        // This ensures that this info still gets sent, but can't be edited
                        // Now, let's hope semester slider updates table correclty
                        newInput.setAttribute("readonly", "true");
                    }
                }
                // Can only take an FYW in freshman year
                else if (firstCol[i] === "FYW" && j > 2) {
                    newInput.setAttribute("disabled", "true");
                }
                else {
                    newInput.setAttribute("type", "text");
                }
                

                // Add event listener to handle input changes
                // Can Event Listener go outside of function?
                newInput.addEventListener("input", function() {

                    // Get value of the input - not utilized yet
                    var inputValue = this.value;


                    // Handle input change if necessary
                    console.log(`Input changed for ${firstCol[i]} in Semester ${j}`);
                    // Get rows 
                    // var idx = i;
                    var rows = table.rows;
                    var relevantRow = rows[i+1];

                    var firstCell = relevantRow.cells[0];
                    var relevantRowInputs = relevantRow.getElementsByTagName("input");
                    
                    // if val is empty, reset background to red and enable all input slots in row
                    if(this.value == "") {
                        firstCell.setAttribute("style", "background-color: #ff0000;");
                        for (let k = 0; k < relevantRowInputs.length; k++) {
                            relevantRowInputs[k].disabled = false;
                        }
                    }                        
                    else{
                        var currentSemester = document.getElementById("semesterLabel");
                        currentSemester = parseInt(currentSemester.innerHTML);
                        console.log(currentSemester, j);
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
                                    firstCell.setAttribute("style", "background-color: khaki;");
                                }
                                else {
                                    firstCell.setAttribute("style", "background-color: #ff0000;");
                                }
                            }
                        }

                        // Pathways check, If all 4 semesters are filled, set to green, otherwise, set to yellow
                            // In all honesty, probably should just disable all inputs except for first 4 on startup, as well as populate info
                            // thus relying on current semester to determine if ongoing or done.
                            // Do we want validation (i.e. specific course names) for pathways in the planner?
                        else if (firstCol[i] == "Pathways") {
                            if (currentSemester > 4) // &&
                            // relevantRowInputs[0].value.toLowerCase().replace("-", "") == "pth101" &&
                            // relevantRowInputs[1].value.toLowerCase().replace("-", "") == "pth102" &&
                            // relevantRowInputs[2].value.toLowerCase().replace("-", "") == "pth201" &&
                            // relevantRowInputs[3].value.toLowerCase().replace("-", "") == "pth210") 
                            {
                                firstCell.setAttribute("style", "background-color: green;");
                            }
                            else {
                                firstCell.setAttribute("style", "background-color: khaki;");
                            }
                        }
                        
                        else if (currentSemester > j) {
                           // Get first cell of the relevant row
                            firstCell.setAttribute("style", "background-color: green;");
                        }
                        // If semester is current, set to ongoing
                        else if (currentSemester == j) { 
                            firstCell.setAttribute("style", "background-color: khaki;");
                        }
                        // Else, set to planned
                        else {
                            firstCell.setAttribute("style", "background-color: #0000ff;");
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
                });
                cell.appendChild(newInput);
            }
        }
    }
}

function removeTable(tableId) {
    var oldTable = document.getElementById(tableId.concat("-table"));
    // Ensures that the <h1> tag also gets removed
    var oldRows = document.querySelectorAll(`[tableClass=${tableId}-rows]`);
    // console.log(`table ${oldTable}`);
    // console.log(`rows ${oldRows}`);
    if (oldTable) {

        oldTable.remove()
        oldRows.forEach(function(row) {
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
    
    name.innerHTML = `${tableName}`;
    name.setAttribute("id", "tableHeader");
    name.setAttribute("tableClass", tableId.concat("-rows"));

    var table = document.createElement("table");
    // DON't CHANGE - NEED THIS TO ACCESS TABLE IN JS
    table.setAttribute("id", tableId.concat("-table"));

    loc.appendChild(name);
    loc.appendChild(table);

    // Create header row
    var headerRow = table.insertRow(0);
    headerRow.setAttribute("id", "headerRow");
    headerRow.setAttribute("tableClass", tableId.concat("-rows"));
    for (let i = 0; i < 9; i++){
        if (i === 0) {
            headerRow.insertCell(i).innerHTML = `<th>Requirements</th>`;
        }
        else {
            headerRow.insertCell(i).innerHTML = `<th>Semester ${i}</th>`;
        }
    }
    addInputRow(tableId, data);
}

function filterCourses(selectId) {
    var courses;
    var tableId = "";
    console.log(`SelectID = ${selectId}`);
    
    if (selectId == "mainMajorSelect") {
        tableId += "mainMajor";
        courses = MAJORS;   
    }
    else if (selectId == "doubleMajorSelect") {
        tableId += "doubleMajor";
        courses = MAJORS;   
    }
    else {
        tableId += "minor";
        courses = MINORS;
        
    }

    console.log(`filterCourses(${selectId}) running.`);
    console.log(courses);
    
    var filter = document.getElementById(selectId).value;
    removeTable(tableId);
    
    if (filter != "None") {
        // find selected program, csv file compliant
        console.log(`Selected: ${filter}`);
        var programidx = 0;
        while (programidx < courses.length && filter != courses[programidx][0]) {
            programidx++;
        }
        var tableName = courses[programidx][1];
        var reqs = courses[programidx][2];
        console.log(tableId, tableName, reqs);
        createTable(tableName, tableId, reqs)
    }
}

// Should we add an option for a "Year 5" selection? May be a headache
// function addYear5Col() {
//}
         
function updateSemesterLabel() {
    // Should we add something about updating the table when this function is called? Otherwise, data must be re-entered to refresh table
    var semesterLabel = document.getElementById("semesterLabel");
    var slider = document.getElementById("semesterSlider");
    semesterLabel.innerHTML = `${slider.value}`;
    console.log(`Semester Val is ${slider.value}`);
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
