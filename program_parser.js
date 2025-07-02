let majors = {};
let minors = {};


async function assignCourses(path) {
    // must wait to ensure that data is properly loaded into global var MAJORS
    const data = JSON.parse(await fetch(path).then(response => response.text()));
    console.log("assignCourses called with data:", data);
    // console.log("Data length:", data.());

    // loop through the data and assign majors and minors
    for (let programTitle in data) {
        console.log("Processing Titles:", programTitle);
        for (let pattern in data[programTitle]) {
            if (pattern.startsWith("choose")) {
                // this is a choice pattern
                // the number in the pattern indicates how many rows to create
                let numRows = parseInt(pattern.split("_")[1]);
                let options = data[programTitle][pattern];
                // last index is the name
                let rowName = pattern.split("_")[2];
                // let rowName = pattern.split("_")[-1];
                // console.log("Processing Choice Pattern:", pattern, "Num Rows:", numRows, "Row Name:", rowName, "Options:", options);
            }
            else if (pattern === "required") {
                // this is a required course pattern
                // each course will be a row, 
                let numRows = data[programTitle][pattern].length;
                let options = data[programTitle][pattern];
                // create row names
                let rowName = [];
            for (let i = 0; i < numRows; i++) {
                // the course code is the first part of the string
                rowName.push(options[i].split(" ")[0]);
            }
            console.log(`Type = ${programTitle.split(", ").slice(-1)}`);

            console.log("Processing Choice Pattern:", pattern, "Num Rows:", numRows, "Row Name:", rowName, "Options:", options);     

            if (programTitle.split(",").slice(-1).toString().trim() == "B.A." ||
                programTitle.split(",").slice(-1).toString().trim() == "B.S." || 
                programTitle.split(",").slice(-1).toString().trim() == "B.M.") {
                // assign majors a key of programTitle
                // majors.push(programTitle);
                // majors.push({programTitle : rowName, options});
                majors[programTitle] = {"rowName": rowName, "options": options};
                console.log("Assigned Major:", programTitle, "Row Name:", rowName, "Options:", options);
            }
            else {
                // minors.keys.push(programTitle);
                // minors.push({programTitle : [rowName, options]});
                minors[programTitle] = {"rowName": rowName, "options": options};
            }
            // console.log("Processing Pattern:", pattern);
            }
        
        }
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
    // await assignCourses("csv-files/programs.csv");
    await assignCourses("acalog_programs.json");
    console.log("MAJORS/MINORS Initialized: ");
    // console.log(majors, minors);
    console.log(majors, majors);

    constructCourses();
    console.log("Initialization complete!")
}


// We should assign majors list based on what majors.csv has in the list
function constructCourses() {
    var progId = ["mainMajorSelect"];//, "doubleMajorSelect", "minorSelect"];

    for (i = 0; i < progId.length; i++) {
        console.log(`constructCourses running. ID: ${progId[i]}`);
        var courses;
        if (progId[i] == "minorSelect") {
            // courses = Object.keys(minors);
            // courses = Object.keys(minors);//.map(key => [key, minors[key].rowName, minors[key].options]);
            courses = minors;
        }
        else {
            // 
            // courses = Object.keys(majors);
            courses = majors;
        }
        console.log(`FOUND : `+Object.entries(courses));
        var selectLoc = document.getElementById(progId[i]);
        
        // Create a none option by default
        const noneOption = document.createElement("option");
        noneOption.setAttribute("value", "None");
        noneOption.setAttribute("label", "");
        selectLoc.appendChild(noneOption);

        // for (courseidx=0; courseidx < courses.length; courseidx++) {
        //     var courseOption = document.createElement("option");
        //     courseOption.setAttribute("value", courses[courseidx][0]);
        //     courseOption.setAttribute("label", courses[courseidx][1]);
        //     selectLoc.appendChild(courseOption);
        // }
        for (const [key, value] of Object.entries(courses)) {
            // console.log(`${key}: ${value}`);
            var courseOption = document.createElement("option");
            // grab only the capital letters for the value, do not uppercase the key
            // that is, if the key is "Computer Science, B.S.", the value should be "CSBS"
            
            courseOption.setAttribute("value", key.replace(".", " ").split(" ").map(word => word[0].toUpperCase()).join(""));
            // courseOption.setAttribute("value", key);
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
    // removeTable(tableId);
    
    if (filter != "None") {
        // find selected program, csv file compliant
        console.log(`Selected: ${filter}`);
        var programidx = 0;
        // while (programidx < courses.length && filter != courses[programidx][0]) {
        //     programidx++;
        // }
        // remember, filter now is a shortened version of the program name

        while (programidx < Object.keys(courses).length && filter != (Object.keys(courses)[programidx]).replace(".", " ").split(" ").map(word => word[0].toUpperCase()).join("")) {
            programidx++;
        }
        // var tableName = courses[programidx][1];
        // var reqs = courses[programidx][2];
        // console.log(tableId, tableName, reqs);
        var tableName = Object.keys(courses)[programidx];
        var reqs = courses[Object.keys(courses)[programidx]].rowName;
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

// The following line of code 
// updateFirstCol.bind(newInput, i, j)

function updateFirstCol(i, j, table, firstCol) {

    console.log(this);
    console.log(i);
    console.log(j);
    console.log(table);
    console.log(firstCol);

    // Get value of the input - not utilized yet
    var inputValue = this.value;


    // Handle input change if necessary
    console.log(`Input changed for ${firstCol[i]} in Semester ${j}`);
    // Get rows 
    var rows = table.rows;
    var relevantRow = rows[i+1];

    var firstCell = relevantRow.cells[0];
    var relevantRowInputs = relevantRow.getElementsByTagName("input");
    var rowLabel = firstCol[i].toLowerCase();
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

// function retrieveAcalogPrograms() {

//     $( function() {        
//         fetch('acalog_progrrams.json')
//         .then(response => response.json())
//         .then(programsDict => {
//             // loop over the programs in ProgramsDict
//             // each program will store the name, its groupings, and the courses that fullfill those groupings
//             // # this will be used to create a table when called
//                 // the program name will be the table header
//                 // the table rows will be the "requirements" and "electives" - that is, the keys in the program object 
//             // "Type","Program","Name","Reqs"
//             for (let programName in programsDict) {
//                 let program = programsDict[programName];
//                 if (program.split(",")[-1] == "B.A." || program.split(",")[-1] == "B.S." || program.split(",")[-1] == "B.M.") {
//                     let programType = "major";
//                 }
//                 else {
//                     let programType = "minor";
//                 }
//                 // for (let requirement in program) {
//                 //     if (requirement.startsWith("choose")) {
//                 //         num_rows = parseInt(requirement.split("_")[1]);
//                 //         row_name = requirement.split("_")[-1];
//                 //         options = program[requirement];

//                 //     }
//                 //     else if ("required" in requirement) {
//                 //         // this is a required course
//                 //         // row names consist of the course code itself (validated by course code and course name)
//                 //         let requiredCourses = program[requirement];
//                 //    }

//                 //}

//             }

//         });
//     })
// }
