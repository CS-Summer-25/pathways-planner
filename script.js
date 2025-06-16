// GERS = ["CLPs", "FYW", "WR", "Pathways", "NE", "IEJ", "WC", "HA", "TA", "VP", "UQ", "FL", "MB", "MR", "NW1", "NW2", "HB1", "HB2"];
GERS = ["CLPs", "FYW", "WR", "Pathways", "NE", "IEJ", "WC", "HA", "TA", "VP", "UQ", "FL", "MB", "MR", "NW", "HB"];
// make sure to have NW and HB be given two slots

let MAJORS = [];
let MINORS = [];

async function assignCOURSES(type) {
    // must wait to ensure that data is properly loaded into global var MAJORS
    const data = await d3.csv("programs.csv")
    for (i = 0; i < data.length; i++) {
        if (!data[i]["Program"].startsWith("#")) {
            var type = data[i]["Type"];
            var program = data[i]["Program"];
            var name = data[i]["Name"];
            // this was more painful than I initially anticipated
            var vals = data[i]["Reqs"].split(',');
            // console.log(vals)
        if (type == "M") {
            MAJORS.push([program, name, vals])
        }
        else if (type == "m") {
            MINORS.push([program, name, vals])
        }
        }
    }
}

async function initialize() {
    // Recall, waiting so MAJORS assigned properly
        // Note: MAJORS/MINORS'may' not display properly if used outside of any function
    await assignCOURSES("programs.csv");
    console.log("Starting Table Population");
    populateTable();    
    console.log("MAJORS/MINORS Initialized: ");
    console.log(MAJORS, MINORS);
    constructCourses();
    console.log("Initialization complete!")
}

// We should assign majors list based on what majors.csv has in the list
function constructCourses() {
    var progId = ["courseSelect", "courseSelect2", "minorSelect"];

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
            selectLoc.appendChild(courseOption)
        }
    }
}

// -----------------------------------------------------------
// Q: Potentialy add function to automatically create input rows for each req - seemingly repetitive code in populateTable() and filterCourses()
// function addInputRow(colVal) {
// }

// Add HB and NW validation
function populateTable(){
    var table = document.getElementById("courses");
    var countGers = GERS.length;

    // Create header row
    var headerRow = table.insertRow(0);
    headerRow.setAttribute("id", "headerRow");
    for (let i = 0; i < 9; i++){
        if (i === 0)
            headerRow.insertCell(i).innerHTML = `<th>Requirements</th>`;
        else
            headerRow.insertCell(i).innerHTML = `<th>Semester ${i}</th>`;
    }

    // Populate table with GER column vals, input fields
    for (let i = 0; i < countGers; i++){
        var newRow = table.insertRow(-1);
        for (let j = 0; j < 9; j++){
            if(j === 0){
                cell = newRow.insertCell(j)
                cell.setAttribute("class", "firstCol");
                
                cell.innerHTML = `<td>${GERS[i]}</td>`;
                // Since pathways and CLPS are special cases, let's make this simpler
                // cell.setAttribute("GERtype", "normal");
                // if (GERS[i] === "CLPs" || GERS[i] === "Pathways") {
                //     cell.setAttribute("GERtype", "special");
                // }
            }
            else{
                var cell = newRow.insertCell(j);
                var newInput = document.createElement("input");

                newInput.setAttribute("class", "courseTitle");
                newInput.setAttribute("GER", GERS[i]);
                // Since pathways and CLPS are special cases, let's make this simpler
                // newInput.setAttribute("GERtype", "normal");
                // if (GERS[i] === "CLPs" || GERS[i] === "Pathways") {
                //     newInput.setAttribute("GERtype", "special");
                // }
                
                // if row is CLPs, set to number inputs, string otherwise
                if (newInput.getAttribute("GER") === "CLPs") {
                    newInput.setAttribute("type", "number");
                    newInput.setAttribute("min", "0");
                }
                // Pathways is constant, so set to text with values in first 4 accordingly,  last 4 disabled
                else if (GERS[i] === "Pathways") {                    
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
                else if (GERS[i] === "FYW" && j > 2) {
                    newInput.setAttribute("disabled", "true");
                }
                else {
                    newInput.setAttribute("type", "text");
                }
                

                // Add event listener to handle input changes
                newInput.addEventListener("input", function() {

                    // Get value of the input
                    var inputValue = this.value;


                    // Handle input change if necessary
                    console.log(`Input changed for ${GERS[i]} in Semester ${j}`);
                    var table = document.getElementById("courses");
                    // Get rows 
                    var rows = table.rows;
                    var relevantRow = rows[i+1];

                    var firstCell = relevantRow.cells[0];
                    var relevantRowInputs = relevantRow.getElementsByTagName("input");
                    
                    // if val is empty, reset background to red and enable all input slots in row
                    if(this.value == "") {
                        // If input is empty, reset the background color
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
                        if (GERS[i] == "CLPs") {
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
                        else if (GERS[i] == "Pathways") {
                            if (currentSemester > 4 &&
                            relevantRowInputs[0].value.toLowerCase().replace("-", "") == "pth101" &&
                            relevantRowInputs[1].value.toLowerCase().replace("-", "") == "pth102" &&
                            relevantRowInputs[2].value.toLowerCase().replace("-", "") == "pth201" &&
                            relevantRowInputs[3].value.toLowerCase().replace("-", "") == "pth210") {
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
                            

                        // }
                        // Disable all other inputs in row except input semester
                         if (GERS[i] != "CLPs" && GERS[i] != "Pathways") {
                            for (let k = 0; k < relevantRowInputs.length; k++) {
                                if (k+1!=j) {
                                    relevantRowInputs[k].disabled = true;
                                }
                            }
                        }
                        // Seemingly redundant code, see when cells are created earlier in code
                        // else if (GERS[i] == "Pathways") {
                        //     for (let k = 0; k < relevantRowInputs.length; k++) {
                        //         if (k!=0 && k!=1 & k!=2 && k!=3) {
                        //             relevantRowInputs[k].disabled = true;
                        //         }
                        //     }
                        // }
                    }
                });

                cell.appendChild(newInput);
            }
        }
    }
}

// Should we add an option for a "Year 5" selection? May be a headache
// function addYear5Col() {
//}

function filterCourses(id) {
    //Please hope to god this decides to work
    var courses;
    var coursesAtt = "";
    if (id == "courseSelect" || id == "courseSelect2") {
        courses = MAJORS
        coursesAtt = "majors".concat(id)
    }
    else {
        courses = MINORS
        coursesAtt = "minors".concat(id)
    }
    console.log(`filterCourses(${id}) running. ${coursesAtt}: `);
    console.log(courses);
    var table = document.getElementById("courses");
    var filter = document.getElementById(id).value;
        
    // Attempt at removing all req (not GER) rows. Temp: potentially replace with more readable code 
    var oldRows = document.querySelectorAll(`#${coursesAtt}`);
    oldRows.forEach(function(row) {
        row.parentNode.removeChild(row);
    }); 
    
    if (filter != "None") {
        // find selected program, csv file compliant
        console.log(`Selected: ${filter}`);
        var i = 0;
        while (i < courses.length && filter != courses[i][0]) {
            i++;
            console.log(courses[i][0]);
        }
        var reqs = courses[i][2];
        console.log(reqs);

        for (let i = 0; i < reqs.length; i++){
            var newRow = table.insertRow(-1);
            // ensures that row gets deleted when new major chosen
            newRow.setAttribute("id", coursesAtt);
            for (let j = 0; j < 9; j++){
                var cell = newRow.insertCell(j);
                // code repasted from populateTable(), maybe redundant?
                cell.setAttribute("id", coursesAtt);
                if(j === 0){
                    //cell = newRow.insertCell(j)
                    cell.setAttribute("class", "firstCol");
                    cell.innerHTML = `<td>${reqs[i]}</td>`;
                }
                else{
                    var newInput = document.createElement("input");
                    newInput.setAttribute("class", "courseTitle");
                    newInput.setAttribute("type", "text");
                    newInput.setAttribute("reqs", reqs[i]);

                    // Add event listener to handle input changes
                    newInput.addEventListener("input", function() {

                        // Get value of the input
                        var inputValue = this.value;


                        // Handle input change if necessary
                        console.log(`Input changed for ${reqs[i]} in Semester ${j}`);
                        var table = document.getElementById("courses");
                        // Get rows 
                        var rows = table.rows;
                        // need to add GER length so it picks correct row (Majors added after GERs)
                        var relevantRow = rows[i+1+GERS.length];

                        var firstCell = relevantRow.cells[0];
                        var relevantRowInputs = relevantRow.getElementsByTagName("input");
                        if(this.value == ""){
                            // If input is empty, reset the background color
                            firstCell.setAttribute("style", "background-color: #ff0000;");
                            for (let k = 0; k < relevantRowInputs.length; k++) {
                                relevantRowInputs[k].disabled = false;
                            }
                        }
                        else{
                            var currentSemester = document.getElementById("semesterLabel");
                            currentSemester = parseInt(currentSemester.innerHTML);
                            console.log(currentSemester, j);
                            if (currentSemester > j){
                                // Get first cell of the relevant row
                                firstCell.setAttribute("style", "background-color: green;");
                            }
                            else if (currentSemester == j){ 
                                firstCell.setAttribute("style", "background-color: yellow;");
                            }
                            else{
                                firstCell.setAttribute("style", "background-color: #0000ff;");
                            }

                            
                            for (let k = 0; k < relevantRowInputs.length; k++) {
                                if (k+1!=j){
                                    relevantRowInputs[k].disabled = true;
                                }
                            }
                        }

                    });

                    cell.appendChild(newInput);
                }
            }
        }
     }
}
         
function updateSemesterLabel() {
    // Should we add something about updating the table when this function is called? Otherwise, data must be re-entered to refresh table
    var semesterLabel = document.getElementById("semesterLabel");
    var slider = document.getElementById("semesterSlider");
    semesterLabel.innerHTML = `${slider.value}`;
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
