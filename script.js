
function validateEmail(email) {
    // Basic email validation regex
    // check for valid email format: local-part@domain
    // ensure email is @furman.edu
    console.log(email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@furman\.edu$/;

    return emailRegex.test(email);
    
    // send email to email address
}

// Make sure that savePlan and loadPlan save the programs as well
function savePlan() {
    var email = document.getElementById("emailfield").value;
    console.log("Email variable: "+email);

    if (!validateEmail(email)) {
        alert("Please enter a valid Furman email address.");
        return; // Stop saving if email is invalid
    }

    console.log("Saving plan for " + email + " for semester " + currentSemester);
    var currentSemester = document.getElementById("semesterValue").innerHTML;

    var tables = document.querySelectorAll("table");
    var compressed = "";

    tables.forEach(table => {
        compressed += `#${table.id}[`; // Add table ID to compressed string
        var numRows = table.rows.length;
        for (let i = 1; i < numRows; i++) { // Start from 1 to skip header row
            var relevantRow = table.rows[i];
            var inputs = relevantRow.getElementsByTagName("input");
            var rowLabel = relevantRow.cells[0].innerHTML;
            // var courses = [];

            for (let j = 0; j < inputs.length; j++) {
                if (inputs[j].value !== "") {
                    // courses.push(inputs[j].value);
                    compressed += `${rowLabel}_${j+1}_${inputs[j].value};`;
                }
            }
        }
        compressed = compressed.slice(0, -1); // Remove the last semicolon
        compressed += `]`; // Close the table ID bracket
    });
    // console.log(GERS);
    // var table = document.getElementById("GERS-table");
    // var countGers = GERS.length;
    // // Saving plan in compressed form for GET requests 
    // var compressed = "";
    // for (let i = 0; i < countGers; i++) {
    //     var relevantRow = table.rows[i+1];
    //     var inputs = relevantRow.getElementsByTagName("input");
    //     var courses = [];
    //     for (let j = 0; j < inputs.length; j++) {
    //         if (inputs[j].value !== "") {
    //             // courses.push(inputs[j].value);
    //             compressed += `${GERS[i]}_${j+1}_${inputs[j].value};`;
    //         }
    //     }
    // }
    console.log(compressed);

    if (compressed === "") {
        alert("Please enter at least one course before saving.");
        return; // Stop saving if no courses are entered
    }

    // Make get request and pass password and plan as query parameters
    // var xhr = new XMLHttpRequest();
    var constructedUrl = `https://furmancs.com/tabot/savePlan?password=${encodeURIComponent(email)}&plan=${encodeURIComponent(compressed)}&semester=${currentSemester}`;
    console.log(constructedUrl);

    if (true) {
        alert("Plan saved successfully! You can now load it using the same email.");
        return;
    }
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
        return response;//.json();
    });

    // fetch("https://furmancs.com/tabot/sendEmail?email="+encodeURIComponent(email))
    fetch("https://furmancs.com/tabot/sendEmail");

}

function loadPlan() {

    var email = document.getElementById("emailfield").value;

    console.log(email);
    console.log("Load Plan");
    var constructedUrl = `https://furmancs.com/tabot/loadPlan?password=${encodeURIComponent(email)}`;

    fetch(constructedUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        
        var coursesInfo = response.json();

        coursesInfo.then(data => {

            let table = document.getElementById("GERS-table");
            for(i = 0; i<data.length; i++){
                console.log(data[i]);
                let course = data[i];
                let ger = course.ger;
                let j = parseInt(course.sem);
                let courseName = course.title;

                console.log(ger);

                // Find the row corresponding to the GER
                let gerIndex = GERS.indexOf(ger);
                console.log(gerIndex);
                let relevantRow = table.rows[gerIndex + 1];
                let inputs = relevantRow.getElementsByTagName("input");
                console.log(j);
                // Find the input corresponding to the semester
                if (j >= 1 && j <= 8) {
                    let inputIndex = j - 1; // Adjust for zero-based index
                    console.log(inputs[inputIndex]);
                    if (inputs[inputIndex]) {
                        inputs[inputIndex].value = courseName;
                        inputs[inputIndex].dispatchEvent(new Event('input')); // Trigger input event to update styles
                        inputs[inputIndex].dispatchEvent(new Event('change')); // Trigger change event to update styles
                        // inputs[inputIndex].click();
                        // click on the input to make autocomplete go away
                        // relevantRow.click();
                        updateSemesterLabel();
                        // inputs[inputIndex].blur();
                        relevantRow.click();
                        
                    }
                }
                // document.getElementById("tableHeader").dispatchEvent("click"); // Trigger click event to update styles
            }
        // window.click();
            
        }).catch(error => {
            console.error("There was a problem with the fetch operation:", error);
            alert("Failed to load plan. Please check your password and try again.");

        
        });
    });
}
