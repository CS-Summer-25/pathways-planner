
function validateEmail(email) {
    // ensure email is @furman.edu
    console.log(email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@furman\.edu$/;

    return emailRegex.test(email);
    
    // send email to email address
}

function savePlan() {
    var email = document.getElementById("emailfield").value;
    console.log("Email variable: "+email);

    if (!validateEmail(email)) {
        alert("Please enter a valid Furman email address.");
        return; // Stop saving if email is invalid
    }

    var currentSemester = parseInt(document.getElementById("semesterValue").innerHTML);
    console.log("Saving plan for " + email + " for semester " + currentSemester);

    var tables = document.querySelectorAll("table");
    var compressed = "";

    tables.forEach(table => {
        var tableGroup = table.id.split("-")[0];
        compressed += `${tableGroup}`; // Add table ID to compressed string
        if (tableGroup != "GERS") {
            compressed += `-${document.getElementById(`${tableGroup}Select`).value}`; // Add filter to compressed string
        }
        compressed += `,`; // end of table tag
        var numRows = table.rows.length;
        for (let i = 1; i < numRows; i++) { // Start from 1 to skip header row
            var relevantRow = table.rows[i];
            var inputs = relevantRow.getElementsByTagName("input");
            var rowLabel = relevantRow.cells[0].innerHTML;
            // var courses = [];

            for (let j = 0; j < inputs.length; j++) {
                if (inputs[j].value !== "") {
                    // courses.push(inputs[j].value);
                    compressed += `${rowLabel}_${j+1}_${inputs[j].value},`;
                }
            }
        }
        compressed = compressed.slice(0, -1); // Remove the last comma
        compressed += `;`; 
    });
    compressed = compressed.slice(0, -1); // Remove the last semicolon
    console.log(compressed);

    if (compressed === "") {
        alert("Please enter at least one course before saving.");
        return; // Stop saving if no courses are entered
    }

    // Make get request and pass password and plan as query parameters
    // var xhr = new XMLHttpRequest();
    var constructedUrl = `https://furmancs.com/tabot/savePlan?email=${encodeURIComponent(email)}&plan=${encodeURIComponent(compressed)}&semester=${currentSemester}`;
    console.log(constructedUrl);

    if (true) {
        alert("Plan saved successfully! You can now load it using the same email.");
        return;
    }

    // should the email be sent first?
    fetch("https://furmancs.com/tabot/sendEmail").then(emailResponse => {

        if (!emailResponse.ok) {
            throw new Error("Network response was not ok");
        }
        fetch(constructedUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response;//.json();
        });
    })

    // fetch("https://furmancs.com/tabot/sendEmail?email="+encodeURIComponent(email))

}

function authenticate() {
    // show popup
    var popup = document.getElementById("popup");
    popup.style.display = "block";
}

function loadPlan() {

    var passcode = document.getElementById("passcode").value;
    var email = document.getElementById("emailfield").value;

    console.log(passcode);
    console.log("Load Plan");
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

            console.log(data);

            // loop over data, fill the table with courses
            var table = document.getElementById("GERS-table");
            // var firstColumn = Array.from(table.rows[0].cells).map(cell => cell.innerHTML); // Get the first column headers
            var firstColumn = Array.from(table.rows).map(row => row.cells[0].innerHTML); // Get the first column headers
            console.log(firstColumn);
            // clear the table first
            table.querySelectorAll("input").forEach(input => {
                input.value = "";
            });

            for (let i = 0; i < data.length; i++) {
                console.log(data[i]);
                // let tableGroup = data[i].table
                // if (":" in tableGroup) {
                //    tableGroup, program = tableGroup.split(":"); 
                //    tableId = tableGroup + "-table";
                //    document.getElementById(tableGroup + "-select").value = program;
                // }
                let credit = data[i].label;
                let j = parseInt(data[i].col);
                let value = data[i].val;
                // if value is a number, parse as such
                if (!isNaN(value)) {
                    value = parseFloat(value);
                }
                // find the row corresponding to credit
                
                let relevantRowIdx = firstColumn.indexOf(credit);
                if (relevantRowIdx !== -1) {
                    let relevantRow = table.rows[relevantRowIdx];
                    let inputs = relevantRow.getElementsByTagName("input");
                    console.log(j);
                    // Find the input corresponding to the semester
                    let inputIndex = j - 1; // Adjust for zero-based index
                    if (inputs[inputIndex]) {
                        inputs[inputIndex].value = value;
                        inputs[inputIndex].dispatchEvent(new Event('input'));
                        inputs[inputIndex].dispatchEvent(new Event('change')); // Trigger change event to update styles
                        // inputs[inputIndex].click();
                        // click on the input to make autocomplete go away
                        // relevantRow.click();
                        updateSemesterLabel();
                        
                        // hopefully we can find a way to stop the autocomplete menus from showing up
                        // get the jquery autocomplete menu and hide it
                        // var menu = $(inputs[inputIndex]).autocomplete("widget");
                        // console.log(menu);
                        // // menu("close"); // Close the autocomplete menu
                        // menu[0].setAttribute("style", "display: none;"); // Hide the autocomplete menu
                        // destroy menu[0]s children

                        // menu.setAttribute("style", "display: none;"); // Hide the autocomplete menu
                        // menu[0].autocomplete("close");
                        // inputs[inputIndex].menu

                    }
                }
            }
        var menus = document.querySelectorAll(".ui-menu");
        menus.forEach(menu => {
            menu.style.display = "none"; // Hide all autocomplete menus
        });
        var popup = document.getElementById("popup");
        popup.setAttribute("style", "display: none;"); // Close the popup after loading the plan
            
        }).catch(error => {
            console.error("There was a problem with the fetch operation:", error);
            alert("Failed to load plan. Please check your password and try again.");

        
        });
    });
}

function closePopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none";
}

function sendCode(){
    var email = document.getElementById("emailfield").value;
    console.log("Email variable: "+email);

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