
function validateEmail(email) {
    // ensure email is @furman.edu
    const emailRegex = /^[a-zA-Z0-9._%+-]+@furman\.edu$/;

    return emailRegex.test(email);
    
    // send email to email address
}

function savePlan() {
    // popup.style.display = "block";

    var email = document.getElementById("saveEmail").value;

    if (!validateEmail(email)) {
        alert("Please enter a valid Furman email address.");
        return; // Stop saving if email is invalid
    }

    var currentSemester = parseInt(document.getElementById("semesterValue").innerHTML);

    var tables = document.querySelectorAll("table");
    var isEmpty = Array.from(tables).every(table => {
        return Array.from(table.rows).every(row => {
            var inputs = row.getElementsByTagName("input");

            return Array.from(inputs).every(input => {
                return input.type == "checkbox" ? !input.checked : input.value === "";
            });
        });
    });
    // var allEmpty          = relevantRowInputs[2].type == "checkbox" ? 
    //                             Array.from(relevantRowInputs).every(input => input.checked == false) :
    //                             Array.from(relevantRowInputs).every(input => input.value === "");
    // console.log("isEmpty: ", isEmpty);
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

    closePopup("savePopup");

    // console.log("Compressed Plan: ", compressed);

    // Make get request and pass password and plan as query parameters
    var constructedUrl = `https://furmancs.com/tabot/savePlan?email=${encodeURIComponent(email)}&plan=${encodeURIComponent(compressed)}&semester=${currentSemester}`;

    // just for testing purposes, we will not actually save the plan
    // remove this line when deploying
    // if (true) {
    // alert("Plan saved successfully! You can now load it using the same email.");
    //     return;
    // }
    
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

function authenticate(mode) {
    // show popup
    var popup = document.getElementById(mode+"Popup");
    popup.style.display = "block";
}

async function loadPlan() {

    var passcode = document.getElementById("loadPasscode").value;
    var email = document.getElementById("loadEmail").value;

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
            var tables = document.querySelectorAll("table");

            tables.forEach(table => {
                table.querySelectorAll("input").forEach(input => {
                    input.value = "";
                });
            })
            
            // clear the table first

            for (let i = 0; i < data.length; i++) {
                cell_dict = data[i];
                let tableGroup = cell_dict.table
                if (tableGroup.indexOf("/") != -1) {
                    program = tableGroup.split("/")[1];
                    tableGroup = tableGroup.split("/")[0]; 
                   
                   var programSelect = document.getElementById(tableGroup + "Select")
                   programSelect.value = program;
                   grabCourses(tableGroup + "Select");
                }
                // loadTables(tableGroup, data, i);
                setTimeout(() => {
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
            }, 1500);

            updateSemesterLabel();
        });
    });
    console.log("Plan loaded successfully.");

}

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

function closeMenuItems() {
    // var menus = table.getElementsByClassName("ui-menu-item-wrapper");
    var menus = document.querySelectorAll(".ui-menu-item-wrapper");
    for (let i = 0; i < menus.length; i++) {
        menus[i].click(); // This will close the menu items
    }
}

function closePopup(popupId) {
    var popup = document.getElementById(popupId);
    popup.style.display = "none";
}

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

        // alert("Code sent successfully! Please check your email.");
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
        alert("Failed to send code. Please try again.");
    });
}