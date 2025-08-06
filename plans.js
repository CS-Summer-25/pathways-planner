// This file concerns only the "Save Plan" and "Load Plan" button functionality.

// This function displays the authentication popup for saving or loading plans.
// Mode = "save" or "load"
async function showPopup(mode) {
    // show popup
    var popups = document.querySelectorAll(".popup");
    if (popups) {
        popups.forEach(function(popup) {
            popup.style.display = "none";
        });
    }
    // wait for a short period to ensure other popups are closed first (to easily distinguish between new and old popups)
    await new Promise(resolve => setTimeout(resolve, 100));
    var popup = document.getElementById(mode+"Popup");
    popup.style.display = "block";
}

// This function validates the email address to ensure it is a Furman email address (practically, ends in @furman.edu).
function validateEmail(email) {
    // ensure email is @furman.edu
    const emailRegex = /^[a-zA-Z0-9._%+-]+@furman\.edu$/;

    return emailRegex.test(email);
}

// This function sends a email with the 2FA code needed to save/load plans.
function sendCode(emailField){
    var email = document.getElementById(emailField).value;

    if (!validateEmail(email)) {
        alert("Please enter a valid Furman email address.");
        return; // Stop sending code if email is invalid
    }

    var constructedUrl = `https://furmancs.com/tabot/sendEmail?email=${encodeURIComponent(email)}`;

    fetch(constructedUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        result = response.json(); // Assuming the server responds with JSON
        email = result['email']
        code = result['code']

        var codeSent = document.getElementById("codeSentMsg");
        codeSent.style.display = "block";

        alert("Code sent successfully! Please check your email.");
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
        alert("Failed to send code. Please try again.");
    });
}

function exportPlan() {

    var tables = document.querySelectorAll(".programTable");
    var compressed = "";
    var tableLst = [];
    compressed += `Table,Course,Semester\n`;

    tables.forEach(table => {
        var tableGroup = table.id.split("-")[0];
        // compressed += `${tableGroup}\n`; // Add table ID to compressed string
        if (tableGroup != "GERS") {
            var selectId = `${tableGroup}Select`;
            var selectValue = document.getElementById(selectId).value;
            // compressed += `:/${selectValue}`; // Add program to compressed string
            // compressed += `/${document.getElementById(`${tableGroup}Select`).value}`; // Add filter to compressed string
            // tableGroup = `${tableGroup}: ${selectValue}`; // Add program to compressed string
            tableGroup = `${selectValue}`; // Add program to compressed string
        }
        // compressed += `\n`; // end of table tag
        var numRows = table.rows.length;
        var yearRow = table.rows[0].cells;
        var semesterRow = table.rows[1].cells;
        for (let i = 2; i < numRows; i++) { // Start from 2 to skip header rows
            var relevantRow = table.rows[i];
            var inputs = relevantRow.getElementsByTagName("input");
            // var rowLabel = relevantRow.cells[0].innerHTML;
            // var courses = [];
            for (let j = 0; j < inputs.length; j++) {
                var headerIdx = j + 1;
                var year = yearRow[Math.ceil((headerIdx/2))].innerHTML; // Get the year from the first row
                var semester = semesterRow[headerIdx].innerHTML;
                var rowLabel = relevantRow.cells[0].innerHTML;
                // console.log(year, semester);
                // console.log(yearRow[Math.ceil((j+1)/2)].innerHTML, semesterRow[j+1].innerHTML);
                // console.log(inputs[j]);
                if (inputs[j].type == "checkbox") {
                    if (inputs[j].checked) {
                        // compressed += `${rowLabel},${j+1},1\n`;
                        compressed += `"${tableGroup}","${rowLabel}",${year}-${semester}\n`;
                    }
                }
                else{ 
                    if (inputs[j].value !== "") {
                        if (rowLabel == "CLPs") {
                            compressed += `"${tableGroup}","CLPs: ${inputs[j].value}",${year}-${semester}\n`;
                        }
                        else{
                            // courses.push(inputs[j].value);
                            // compressed += `${rowLabel},${j+1},${inputs[j].value}\n`;
                            compressed += `"${tableGroup}","${inputs[j].value}",${year}-${semester}\n`;
                        }
                    }
                }
            }
        }
        // compressed = compressed.slice(0, -1); // Remove the last comma
        // compressed += `\n`; 
    });
    compressed = compressed.slice(0, -1); // Remove the last semicolon
    console.log(compressed);
    console.log(tableLst);
    // compressed = [tableLst, compressed].join("\n\n"); // Add table names at the top

    // use this to test the compressed string without downloading file
    // if (true) 
    //     console.log(compressed);
    //     return compressed;
    // Download the compressed string as a file
    var blob = new Blob([compressed], { type: "text/plain" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plan.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Plan exported successfully!");
    console.log("Plan exported successfully.");
    closePopup("exportPopup");

}

// This function stores the current plan in a string using the provided email and 2FA code: to be sent to the server for processing.
// Runs validateEmail() and closePopup("savePopup")
function savePlan() {

    var email = document.getElementById("saveEmail").value;

    // Check if email is valid
    if (!validateEmail(email)) {
        alert("Please enter a valid Furman email address.");
        return; // Stop saving if email is invalid
    }

    var currentSemester = parseInt(document.getElementById("semesterValue").innerHTML);

    var tables = document.querySelectorAll(".programTable");

    // Check that there is something to save to server
    var isEmpty = Array.from(tables).every(table => {
        return Array.from(table.rows).every(row => {
            var inputs = row.getElementsByTagName("input");

            return Array.from(inputs).every(input => {
                return input.type == "checkbox" ? !input.checked : input.value === "";
            });
        });
    });

    if (isEmpty) {
        alert("Please enter at least one course before saving.");
        return; // Stop saving if no courses are entered
    }

    var compressed = "";

    tables.forEach(table => {
        var tableGroup = table.id.split("-")[0];
        compressed += `${tableGroup}`; // Add table ID to compressed string
        if (tableGroup != "GERS") {
            var selectId = `${tableGroup}Select`;
            var selectValue = document.getElementById(selectId).value;
            compressed += `/${selectValue}`; // Add program to compressed string
            // compressed += `/${document.getElementById(`${tableGroup}Select`).value}`; // Add filter to compressed string
        }
        compressed += `@`; // end of table tag
        var numRows = table.rows.length;
        for (let i = 1; i < numRows; i++) { // Start from 1 to skip header row
            var relevantRow = table.rows[i];
            var inputs = relevantRow.getElementsByTagName("input");
            var rowLabel = relevantRow.cells[0].innerHTML;
            // var courses = [];

            for (let j = 0; j < inputs.length; j++) {
                if (inputs[j].type == "checkbox") {
                    if (inputs[j].checked) {
                        compressed += `${rowLabel}_${j+1}_1~`;
                    }
                }
                else{ 
                    if (inputs[j].value !== "") {
                        // courses.push(inputs[j].value);
                        compressed += `${rowLabel}_${j+1}_${inputs[j].value}~`;
                    }
                }
            }
        }
        compressed = compressed.slice(0, -1); // Remove the last comma
        compressed += `;`; 
    });
    compressed = compressed.slice(0, -1); // Remove the last semicolon

    // // Download the compressed string as a file
    // var blob = new Blob([compressed], { type: "text/plain" });
    // var link = document.createElement("a");
    // link.href = URL.createObjectURL(blob);
    // link.download = "plan.txt";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);

    var sentCode = document.getElementById("codeSentMsg");
    sentCode.style.display = "none"; // Hide the code sent message
    

    closePopup("savePopup");

    // Make get request and pass password and plan as query parameters
    var constructedUrl = `https://furmancs.com/tabot/savePlan?email=${encodeURIComponent(email)}&plan=${encodeURIComponent(compressed)}&semester=${currentSemester}`;
    
    fetch(constructedUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response;;

    }).catch(error => {
        console.error("There was a problem with the fetch operation:", error);
        alert("Failed to save plan. Please try again.");
        
    }).finally(() => {
        alert("Plan saved successfully! You can now load it using the same email.");
        console.log("Plan saved successfully.");
    });
}

// This function loads a plan from the server using the provided email and 2FA code.
// Runs grabCourses() to load appropriate tables, loadTable(), closePopup("loadPopup"), closeMenuItems(), and updateSemesterLabel().
function loadPlan() {

    var passcode = document.getElementById("loadPasscode").value;
    var email = document.getElementById("loadEmail").value;

    // Check if email is valid
    if (!validateEmail(email)) {
        alert("Please enter a valid Furman email address.");
        return; // Stop loading if email is invalid
    }

    var constructedUrl = `https://furmancs.com/tabot/loadPlan?email=${encodeURIComponent(email)}&passcode=${encodeURIComponent(passcode)}`;

    fetch(constructedUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        var coursesInfo = response.json();
        if('error' in coursesInfo){
            alert(coursesInfo['error']);
            return;
        }

        coursesInfo.then(data => {

            // loop over data, fill the table with courses
            var tables = document.querySelectorAll(".programTable");

            tables.forEach(table => {
                var tableId = table.id.split("-")[0];
                table.querySelectorAll("input").forEach(input => {
                    input.value = "";
                });
                var select = document.querySelector(tableId + "Select");
                if (select) {
                    select.value = ""; // Reset the select to ""
                }
            });

            // clear the table first

            for (let i = 0; i < data.length; i++) {
                cell_dict = data[i];
                let tableGroup = cell_dict.table
                if (tableGroup.indexOf("/") != -1) {
                    program = tableGroup.split("/")[1];
                    tableGroup = tableGroup.split("/")[0]; 
                   
                   var programSelect = document.getElementById(tableGroup + "Select")

                   programSelect.value = program;
                   console.log("Program Select: " + programSelect.value);
                   grabCourses(tableGroup + "Select");
                }
                setTimeout(() => {
                    // console.log("Loading table: " + tableGroup);
                    loadTable(tableGroup, data, i);
                }, 1000);                
            }         

        }).catch(error => {
            console.error("There was a problem with the fetch operation:", error);
            alert("Failed to load plan. Please check your password and try again.");
        
        }).finally(() => {
            closePopup("loadPopup");

            setTimeout(() => {
                closeMenuItems();

                // keep the scroll position at the top
                document.documentElement.scrollTop = 0;
            }, 2000);
            console.log("Updating semester label.");
            // updateSemesterLabel();
        });
    });
    console.log("Plan loaded successfully.");
}

// This function fills the table with courses based on the data provided.
// Runs updateSemesterLabel(), and dispatches input and change events to update the UI.
function loadTable(tableGroup, data, i) {

    cell_dict = data[i];
    var cellTable = document.getElementById(tableGroup + "-table");
    var firstCol = Array.from(cellTable.querySelectorAll(".firstCol")).map(cell => cell.innerHTML); // Get the first column headers
    // var firstCol= firstColDict[cellTable.id];
    var headerSize = document.getElementById(tableGroup + "-tableheaders").rows.length;
    // to be used to add custom rows if needed
    var rowSize = cellTable.rows.length - headerSize;


    let credit = cell_dict.credit;
    let j = parseInt(cell_dict.col);
    let value = cell_dict.val;
    if (i == 0) {
        currentSemester = parseInt(cell_dict.semester);
        // update slider
        var semesterSlider = document.getElementById("semesterSlider");
        semesterSlider.value = currentSemester;
    }
    if (i > 0 && currentSemester != parseInt(cell_dict.semester)) {
        console.warn("Multiple semesters found in the loaded plan. Only the first semester will be used.");
    }
    // if value is a number, parse as such
    if (!isNaN(value)) {
        value = parseInt(value);
    }
    // find the row corresponding to credit

    let relevantRowIdx = firstCol.indexOf(credit);
    // make sure that if the rowLabel is not found, create a new row with that given label, use addRowBtn if needed


    // console.log(relevantRowIdx);
    if (relevantRowIdx != -1) {
        let relevantRow = cellTable.rows[relevantRowIdx+headerSize];
        let inputs = relevantRow.getElementsByTagName("input");
        // console.log(j);
        // Find the input corresponding to the semester
        let inputIndex = j-1; // Adjust for zero-based index
        if (inputs[inputIndex]) {
            console.log("Current Table: " + tableGroup);
            // inputs[inputIndex].type == "checkbox" ? inputs[inputIndex].checked = true : inputs[inputIndex].value = value;
            if (inputs[inputIndex].type == "checkbox") {
                // console.log("ABC "+inputs[inputIndex].type);
                // console.log(relevantRow);
                // console.log(inputs[inputIndex]);
                // console.log("Test 11");
                inputs[inputIndex].checked = true;
                
                inputs[inputIndex].setAttribute("checked", true);
                // inputs[inputIndex].dispatchEvent(new Event('change')); // Trigger change event for checkbox
            }
            else {
                // console.log("Test 12");
                inputs[inputIndex].value = value;
            }
            inputs[inputIndex].dispatchEvent(new Event('input'));
            inputs[inputIndex].dispatchEvent(new Event('change'));

        }
    }
    updateSemesterLabel(); 
}

// This function closes all autocomplete menu items on the page.
function closeMenuItems() {
    // var menus = table.getElementsByClassName("ui-menu-item-wrapper");
    var menus = document.querySelectorAll(".ui-menu-item-wrapper");
    for (let i = 0; i < menus.length; i++) {
        menus[i].click(); // This will close the menu items
    }
}

// This function closes the popup with the given ID.
function closePopup(popupId) {
    var popup = document.getElementById(popupId);
    popup.style.display = "none";
}

function importPlan() {

    // Get the file from the input element
    var fileInput = document.getElementById("importFile");
    var file = fileInput.files[0];
    if (!file) {
        alert("Please select a file.");
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        // console.log(contents);
        processImportedPlan(contents); // 
    };
    reader.readAsText(file); // Read the file as text
}

function processImportedPlan(contents) {
    var lines = contents.split("\n");
    var major = "";
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim()
        if (line) {
            // Process each line of the imported plan
            console.log("Processing line:", line);
            processLine(line, major);
        }
    }
}

function checkIfValidLine(line) {
    var parts = line.split(",");
    // "Anthropology, B.A.","LNG-210 General Linguistics",Freshman-Fall
    // Ignore commas in quotes
    // Use a regular expression to split by commas not within quotes
    parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Remove quotes from the parts
    parts = parts.map(part => part.replace(/"/g, '').trim());
    
    console.log(parts);
    if (parts.length !== 3) {
        console.warn("Invalid line format:", line);
        return; // Skip invalid lines
    }
    return parts;
}

function parseLine(parts, major){

    var program = parts[0].replace(/"/g, '').trim();
    var isMajor = Object.keys(majors).includes(program);
    if (isMajor && major === "") {
        major = program; // Only set the major once
    }
    var isMinor = Object.keys(minors).includes(program);
    var isGER = program === "GERS";
    var isDoubleMajor = !isGER && !isMinor && major !== "" && major !== program && isMajor;
    var course = parts[1].replace(/"/g, '').trim();
    var semester = parts[2].trim();

    var yearSemester = semester.split("-");
    if (yearSemester.length !== 2) {
        console.warn("Invalid semester format:", semester);
        return; // Skip invalid semesters
    }
    var yearStr = yearSemester[0];
    var year = ["Freshman", "Sophomore", "Junior", "Senior"].indexOf(yearStr);
    if (year === -1) {
        console.warn("Invalid year:", yearStr);
        return; // Skip invalid years
    }
    var sem = yearSemester[1];
    var semesterColIdx = (parseInt(year) - 1) * 2 + (sem.toLowerCase() === "Fall" ? 0 : 1);

    return [isMinor, isGER, isMajor, isDoubleMajor, program, course, semesterColIdx, major];
}

function getOrCreateTable(tableGroup) {
        var table = document.getElementById(tableGroup + "-table");
    if (!table) {
        if (isDoubleMajor){
            document.getElementById("doubleMajorSelect").value = tableGroup; // Set the main major select to the double major
            grabCourses("doubleMajorSelect"); // Ensure the double major table is loaded
            table = document.getElementById("doubleMajor-table");
        }
        else if (isMinor) {
            document.getElementById("minorSelect").value = tableGroup; // Set the main minor select to the minor
            grabCourses("minorSelect"); // Ensure the minor table is loaded
            table = document.getElementById("minor-table");
        }
        else if (isMajor) {
            document.getElementById("mainMajorSelect").value = tableGroup; // Set the
            grabCourses("mainMajorSelect"); // Ensure the main major table is loaded
            table = document.getElementById("mainMajor-table");
        }
        else{
            console.warn("Table not found for group:", tableGroup);
            return; // Skip if table not found
        }
    }

    return table;
}

function processLine(line, major){

    var parts = checkIfValidLine(line);
    if (!parts) return; // Skip invalid lines

    if (isNaN(semesterNumber) || semesterNumber < 1) {
        console.warn("Invalid semester number:", semester);
        return; // Skip invalid semester numbers
    }

    var [isMinor, isGER, isMajor, isDoubleMajor, tableGroup, course, semesterColIdx, major] = parseLine(parts, major);

    // Set the semester slider to the maximum semester number found
    // var semesterSlider = document.getElementById("semesterSlider");
    // if (semesterNumber > parseInt(semesterSlider.max)) {
    //     semesterSlider.max = semesterNumber;
    // }
    // semesterSlider.value = semesterNumber;
    // console.log(tableGroup, isGER, isMajor, isMinor, isDoubleMajor);
    // Find the table and set the course

    var table = getOrCreateTable(tableGroup);
    if (!table) {
        console.warn("Table not found for group:", tableGroup);
        return; // Skip if table not found
    }

    var firstCol = Array.from(table.querySelectorAll(".firstCol")).map(cell => cell.innerHTML);

    if (course.indexOf("CLPs:") === 0) {
        // Special handling for CLPs
        var clpValue = course.split("CLPs:")[1].trim();
        var clpRowIdx = firstCol.indexOf("CLPs");
        if (clpRowIdx === -1) {
            console.warn("CLPs row not found in table:", tableGroup);
            return; // Skip if CLPs row not found
        }
        var headerSize = document.getElementById(tableGroup + "-tableheaders").rows.length;
        var clpRow = table.rows[clpRowIdx + headerSize];
        var clpInputs = clpRow.getElementsByTagName("input");
        var semesterColIdx = (parseInt(year) - 1) * 2 + (sem.toLowerCase() === "Fall" ? 1 : 2);
        if (semesterColIdx < 0 || semesterColIdx >= clpInputs.length) {
            console.warn("Semester column index out of range for CLPs:", course);
            return; // Skip if semester column index is out of range
        }
        var clpInput = clpInputs[semesterColIdx];
        clpInput.value = clpValue;
        clpInput.dispatchEvent(new Event('input'));
        clpInput.dispatchEvent(new Event('change'));
        updateSemesterLabel();  
        return; // Move to the next line after handling CLPs
    }
    var relevantLabels;
    if (isGER) relevantLabels = INVERTED_GER_COURSES[course];
    else{
        var result = [];
        var allCourses = Object.keys(INVERTED_courseOptions);
        for (let c of allCourses) {
            if (c.startsWith(course)) {
                labels = INVERTED_courseOptions[c]
                if (typeof(labels) === "string") {
                    result.push(labels);
                }
                else if (Array.isArray(labels)) {
                    labelsArr = labels;
                    for (let label of labelsArr) {
                        if (label["programTitle"] == tableGroup){
                            if (label["rowLabel"] != "required"){
                                result.push(label["rowLabel"]);
                            }
                            else{
                                result.push(course);
                            }
                        }
                    }
                }
                else {
                    console.warn("Unexpected type for labels:", typeof labels, labels);
                }
            }
        }
        relevantLabels = result;
    }

    console.log(relevantLabels);
    for (let label of relevantLabels) {

        console.log("label: " +label.toLowerCase().replace(" ", ""));
        var relevantRow = Array.from(document.getElementsByClassName(label.toLowerCase().replaceAll(" ", "")));
        console.log(relevantRow);
        var inputs = relevantRow.slice(1, relevantRow.length);
        var semesterColIdx = (parseInt(year) - 1) * 2 + (sem.toLowerCase() === "Fall" ? 1 : 2);
        console.log("Semester Column Index: " + semesterColIdx);
        if (semesterColIdx < 0 || semesterColIdx >= inputs.length) {
            console.warn("Semester column index out of range for course:", course);
            continue; // Skip if semester column index is out of range
        }
        var input = inputs[semesterColIdx];
        if (input.type === "checkbox") {
            console.log("Checkboxes");
            console.log(input);
            input.checked = true;
            input.setAttribute("checked", true);
            // input.dispatchEvent(new Event('change')); // Trigger change event for checkbox

            // input.click();
        }
        else {
            input.value = course;
        }
        // input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
        updateSemesterLabel();  
    }
}