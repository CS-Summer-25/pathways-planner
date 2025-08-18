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
    // var tableLst = [];
    compressed += `Table,Course,Semester\n`;

    tables.forEach(table => {
        var tableGroup = table.id.split("-")[0];
        if (tableGroup != "GERS") {
            var selectId = `${tableGroup}Select`;
            var selectValue = document.getElementById(selectId).value;
            
            tableGroup = `${selectValue}`; // Add program to compressed string
        }
        
        var numRows = table.rows.length;
        var yearRow = table.rows[0].cells;
        var semesterRow = table.rows[1].cells;
        for (let i = 2; i < numRows; i++) { // Start from 2 to skip header rows
            var relevantRow = table.rows[i];
            var inputs = relevantRow.getElementsByTagName("input");
            // var rowLabel = relevantRow.cells[0].innerHTML;
            for (let j = 0; j < inputs.length; j++) {
                var headerIdx = j + 1;
                var year = yearRow[Math.ceil((headerIdx/2))].innerHTML; // Get the year from the first row
                var semester = semesterRow[headerIdx].innerHTML;
                var rowLabel = relevantRow.cells[0].innerHTML;
                
                if (inputs[j].type == "checkbox") {
                    
                    if (inputs[j].checked) 
                        compressed += `"${tableGroup}","${rowLabel}",${year}-${semester}\n`;

                }
                else{ 

                    if (inputs[j].value !== "") {
                        if (rowLabel == "CLPs") 
                            compressed += `"${tableGroup}","CLPs: ${inputs[j].value}",${year}-${semester}\n`;
                        else {
                            if (!isValidCourse(inputs[j].value, rowLabel, tableGroup)) {
                                alert(`Invalid course: ${inputs[j].value} in row: ${rowLabel}. This course isn't able to be imported.`);
                                console.warn(`Invalid course: ${inputs[j].value} in row: ${rowLabel}. Skipping...`);
                            }
                            compressed += `"${tableGroup}","${inputs[j].value}",${year}-${semester}\n`;
                        }
                        
                    }
                }
            }
        }
    });
    compressed = compressed.slice(0, -1); // Remove the last semicolon
    console.log(compressed);
    // console.log(tableLst);

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
            // console.log("Updating semester label.");
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
    var headerSize = document.getElementById(tableGroup + "-tableheaders").rows.length;
    // TO DO: this is to be used when there exists custom rows 
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

                inputs[inputIndex].checked = true;
                
                inputs[inputIndex].setAttribute("checked", true);
            }
            else {
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
    var menus = document.querySelectorAll(".ui-menu-item-wrapper");
    var len = menus.length;
    for (let i = 0; i < len; i++) {
        menus[i].click(); // This will close the menu items
    }
    console.log(`Closed all autocomplete menu items: ${len} items.`);
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
        console.log("Importing plan...");
        processImportedPlan(contents);
        console.log("Plan imported successfully.");
    };
    reader.readAsText(file); // Read the file as text
}

function processImportedPlan(contents) {
    var lines = contents.split("\n");
    var major = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim()
        if (line) {
            // Process each line of the imported plan
            console.debug("Processing line:", line);
            processLine(line, major);
            console.debug("\n\n");
        }
    }
    updateSemesterLabel();
    document.getElementById("importFile").value = ""; // Clear the file input
    closePopup("importPopup");
    setTimeout(() => {
        closeMenuItems();
        document.documentElement.scrollTop = 0; // Scroll to top
    }, 500);
}

function checkIfValidLine(line) {
    var parts = line.split(",");
    // Only split by commas not contained within quotes
    parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Remove quotes from the parts
    parts = parts.map(part => part.replace(/"/g, '').trim());
    
    console.debug(parts);
    if (parts.length !== 3) {
        console.warn("Invalid line format:", line);
        return; // Skip invalid lines
    }
    return parts;
}

function parseLine(parts, major){

    var program = parts[0].replace(/"/g, '').trim();
    var isMajor = Object.keys(majors).includes(program);

    if (isMajor && major.length === 0) {
        major.push(program); // Only set the major once
    }
    var isMinor = Object.keys(minors).includes(program);
    var isGER = program === "GERS";
    var isDoubleMajor = !isGER && !isMinor && major.length > 0 && major[0] !== program && isMajor;
    var course = parts[1].replace(/"/g, '').trim();
    var semester = parts[2].trim();

    var yearSemester = semester.split("-");
    if (yearSemester.length !== 2) {
        console.warn("Invalid semester format:", semester);
        return; // Skip invalid semesters
    }
    var yearStr = yearSemester[0];
    var year = ["Freshman", "Sophomore", "Junior", "Senior", "Other"].indexOf(yearStr);
    if (year === -1) {
        console.warn("Invalid year:", yearStr);
        return; // Skip invalid years
    }
    var sem = yearSemester[1];
    // var semesterColIdx = (parseInt(year)) * 2 + (sem === "Fall" ? 0 : 1);
    var semesterColIdx = 1 + (year * 2) + (sem === "Fall" ? 0 : 1);
    // 1 + (['freshman', 'sophomore', 'junior', 'senior'].indexOf(time)*2 + (term === "spring" ? 1 : 0));
    console.debug("Parsed year:", year, "Semester:", sem, " : " + semesterColIdx);

    return [isMinor, isGER, isMajor, isDoubleMajor, program, course, semesterColIdx, major];
}

function getOrCreateTable(tableGroup, tableType) {
    console.debug(tableType, tableGroup)
    var [isMinor, isMajor, isDoubleMajor] = tableType;
    var table = document.getElementById(tableGroup + "-table");
    if (!table) {
        var programId;
        if (isDoubleMajor)  programId = "doubleMajor";
        else if (isMinor)   programId = "minor";
        else if (isMajor)   programId = "mainMajor";

        else{
            console.warn("Table not found for group:", tableGroup);
            return; // Skip if table not found
        }

        var selectBox = document.getElementById(programId + "Select");
        if (selectBox.value == "") {
            document.getElementById(programId + "Select").value = tableGroup; // Set the appropriate select to the program
            grabCourses(programId + "Select");
        }
        else console.debug("Select box already has a value:", selectBox.value, "Attempted to set:", tableGroup);
        table = document.getElementById(programId + "-table");
    }

    return table;
}

async function processLine(line, major){

    var parts = checkIfValidLine(line);
    if (!parts) return; // Skip invalid lines

    console.debug("Processing parts:", parseLine(parts, major));

    var parsed = parseLine(parts, major);
    if (!parsed) return; // Skip if parsing failed
    else {
        var [isMinor, isGER, isMajor, isDoubleMajor, tableGroup, course, semesterColIdx, major] = parsed;
        var programType = [isMinor, isMajor, isDoubleMajor];
    }


    var table = getOrCreateTable(tableGroup, programType);
    if (!table) {
        console.warn("Table not found for group:", tableGroup);
        return; // Skip if table not found
    }

    var firstCol = Array.from(table.querySelectorAll(".firstCol")).map(cell => cell.innerHTML);
    var firstClass = firstCol.map(cell => cell.toLowerCase().replaceAll(" ", ""));

    if (course.indexOf("CLPs:") === 0) {
        // Special handling for CLPs
        var clpValue = course.split("CLPs:")[1].trim();
        const clpRowIdx = firstCol.indexOf("CLPs");

        await fillInputByIndices(table, clpRowIdx, semesterColIdx, clpValue);
        return; // Move to the next line after handling CLPs
    }

    var relevantLabels;
    if (isGER)  relevantLabels = INVERTED_GER_COURSES[course];
    else{
        // This will capture both cases whether the course is just a prefix or if its the full course title
        var relevantCourse = Object.keys(INVERTED_courseOptions).find(c => c.startsWith(course));
        var info = INVERTED_courseOptions[relevantCourse];
        if (!info) {
            console.warn("Course not found in INVERTED_courseOptions:", course);
            return; // Skip if course not found
        }
        info = info.filter(item => item["programTitle"] == tableGroup);
        console.debug("Info: ", info);
        if (info.length > 1) {
            console.warn("Multiple entries found for course in INVERTED_courseOptions:", course, info);
        }

        // Replace "required" with the actual course (if only a course code is given)
        relevantLabels = (info.map(item => item["rowLabel"])).map(label => label == "required" ? course : label); 
    }

    if (relevantLabels == undefined || relevantLabels.length == 0) {
        console.warn(`No relevant credits found for course: "${course.trim()}". This course may not exist. \nSkipping...`);
        return;
    }

    console.debug("Relevant Labels: ", relevantLabels, "Course: ", course);
    for (let label of relevantLabels) {
        var rowClass = label.toLowerCase().replaceAll(" ", "");
        console.debug("All Labels: ", relevantLabels, "current label: " + rowClass);

        // console.error("Row Class: " + rowClass, firstCol);
        
        var rowIdx = firstClass.indexOf(rowClass);
        console.debug("Specific Cell: ", table.id.split("-")[0], `[${rowIdx}, ${semesterColIdx}]: ${course}`);
        var inputCell = await fillInputByIndices(table, rowIdx, semesterColIdx, course);
        console.debug("Input filled: ", inputCell);
        console.debug(course, "Is Program Type: ", programType.some(t => t));
        if (inputCell != false && programType.some(t => t)) {
            break; // Break after filling the first valid input
        }
    }
}

async function fillInputByIndices(table, rowIdx, semesterIdx, course) {
    var headerSize = document.getElementById(table.id.split("-")[0] + "-tableheaders").rows.length;
    var relevantRow = table.rows[parseInt(rowIdx) + headerSize];
    console.log("Relevant Row: ", relevantRow, "Row Index: ", rowIdx, "Semester Index: ", semesterIdx, "Course: ", course);
    if (!relevantRow) {
        console.warn("Row not found:", rowIdx);
        return;
    }
    var input = relevantRow.cells[semesterIdx].querySelector("input");

    if (input.disabled == false) {
        if (input.type == "checkbox" && input.checked == false) {
            input.checked = true;
            console.debug(`Input "${table.id.split("-")[0]}_${rowIdx}-${semesterIdx}" set to:`, input.checked);
        }
        else if (input.value == "") {
            input.value = course;
            // console.debug(`Input "${table.id.split("-")[0]}_${rowIdx}-${semesterIdx}" set to:`, input.value);
        }
        else {
            console.warn(`Input "${table.id.split("-")[0]}_${rowIdx}-${semesterIdx}" already has a value:`, input.value);
            return false; // Skip if input already has a value
        }

        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
        // console.debug(`Input "${table.id.split("-")[0]}_${rowIdx}-${semesterIdx}" set to:`, input.value);
        return input;
    }
    else {
        console.warn(`Input "${table.id.split("-")[0]}_${rowIdx}-${semesterIdx}" is disabled. Cannot set value:`, course);
        return false;
    }
}