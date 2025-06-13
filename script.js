
GERS = ["CLPs", "FYW", "WR", "Pathways", "NE", "IEJ", "WC", "HA", "TA", "VP", "UQ", "FL", "MB", "MR", "NW1", "NW2", "HB1", "HB2"];
MAJORS = [
            ["CSBS", ['CSC-105', 'CSC-121', 'CSC-122', 'CSC-223', 'CSC-231', 'CSC-261', 'CSC-461', 'MTH-150', 'CSC-300+ A or B', 'CSC-300+ A', 'CSC-300+ A', 'LLE', 'CAP', 'CE1', 'CE2', 'PP1', 'PP2', 'NEE1', 'NEE2']],
            ["CSBA", ['CSC-105', 'CSC-121', 'CSC-122', 'CSC-223', 'CSC-231', 'CSC-261', 'CSC-461', 'MTH-120 or 150', 'CSC-300+ A or B', 'CSC-300+ B', 'CSC-300+ B', 'LLE', 'CAP', 'CE1', 'CE2', 'PP1', 'PP2', 'NEE1', 'NEE2']],
            ["ITBS", ['CSC-105', 'CSC-121', 'CSC-122', 'CAP', 'CSC-300+', 'CSC-200+', '300+ cog', '200+ cog', '200+ cog', 'CE1', 'CE2', 'PP1', 'PP2', 'NEE1', 'NEE2']]
         ];
// This code currently doesn't work, as it isn't allowed under CORS policy 
// const csvUrl = 'majors.csv'; // URL to the CSV file
// fetch(csvUrl)
//     .then(response => response.text())
//     .then(csvText => {
//         const results = Papa.parse(csvText, {
//             header: true,
//             skipEmptyLines: true,
//             comments: '#'
//         });
//         console.log(results.data);
//     });
// var allMajors = results.data;

// -----------------------------------------------------------

// Q: Potentialy add function to automatically create input rows for each req - seemingly repetitive code in populateTable() and filterCourses()
// function addInputRow(colVal) {
// }


function populateTable(){
    var table = document.getElementById("courses");
    var countGers = GERS.length;

    // Create header row
    var headerRow = table.insertRow(0);
    headerRow.setAttribute("id", "headerRow");
    for (let i = 0; i < 9; i++){
        if (i === 0)
            headerRow.insertCell(i).innerHTML = `<th>GERs</th>`;
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
                        
                        // Disable all other inputs in row except input semester
                        if (GERS[i] != "CLPs" && GERS[i] != "Pathways") {
                            for (let k = 0; k < relevantRowInputs.length; k++) {
                                // Pathways and CLPS are special cases, 
                                    // Pathways is only taken in the first 4, CLPS are for every semester
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

// Seems to be a problem with function, when changing majors, adds unnecessary rows
function filterCourses() {
    var table = document.getElementById("courses");
    var filter = document.getElementById("courseSelect").value;
    // Add something to work with double majors, minors, may need to adjust entire function
    // var filter1 = document.getElementById("courseSelect1").value;
    // var filter2 = document.getElementById("courseSelect2").value;
    // var filter3 = document.getElementById("minorSelect").value;
    
   
        // Attempt at removing all req (not GER) rows. Temp: replace with better code (seems to one previous row every time ran)
        // Maybe requests Shawn's / Greyson's forks for this?
        var oldRows = document.querySelectorAll("#majorsRow");
        oldRows.forEach(function(row) {
            row.parentNode.removeChild(row);
        }); 
    
    if (filter != "None") {
        // find select major, replace with .csv file when implemented
        var selectedMajor = MAJORS.find(function(major) {
            return major[0] === filter;
        });
        console.log(selectedMajor);
        var reqs = selectedMajor[1];
        console.log(reqs);

        for (let i = 0; i < reqs.length; i++){
            var newRow = table.insertRow(-1);
            for (let j = 0; j < 9; j++){
                var cell = newRow.insertCell(j);
                // code repasted from populateTable(), maybe redundant?
                cell.setAttribute("id", "majorsRow");
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