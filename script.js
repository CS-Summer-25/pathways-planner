
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

            // parse json
            // plan = JSON.parse(data);
            console.log(plan);
            
            // for(i = 0; i<data.length; i++){
            //     console.log(data[i]);
            //     let course = data[i];
            //     let credit = course.ger;
            //     let j = parseInt(course.sem);
            //     let courseName = course.title;

            //     console.log(ger);

            //     // Find the row corresponding to the GER
            //     let gerIndex = GERS.indexOf(ger);
            //     console.log(gerIndex);
            //     let relevantRow = table.rows[gerIndex + 1];
            //     let inputs = relevantRow.getElementsByTagName("input");
            //     console.log(j);
            //     // Find the input corresponding to the semester
            //     if (j >= 1 && j <= 8) {
            //         let inputIndex = j - 1; // Adjust for zero-based index
            //         console.log(inputs[inputIndex]);
            //         if (inputs[inputIndex]) {
            //             inputs[inputIndex].value = courseName;
            //             inputs[inputIndex].dispatchEvent(new Event('input')); // Trigger input event to update styles
            //             inputs[inputIndex].dispatchEvent(new Event('change')); // Trigger change event to update styles
            //             // inputs[inputIndex].click();
            //             // click on the input to make autocomplete go away
            //             // relevantRow.click();
            //             updateSemesterLabel();
            //             // inputs[inputIndex].blur();
            //             relevantRow.click();
                        
            //         }
            //     }
            //     // document.getElementById("tableHeader").dispatchEvent("click"); // Trigger click event to update styles
            // }
        // window.click();
            
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