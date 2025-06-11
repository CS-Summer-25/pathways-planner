

GERS = ["CLPs", "FYW", "WR", "Pathways", "NE", "IEJ", "WC", "HA", "TA", "VP", "UQ", "FL", "MB", "MR", "NW1", "NW2", "HB1", "HB2"];

function populateTable(){
    var table = document.getElementById("courses");
    var countGers = GERS.length;

    var headerRow = table.insertRow(0);
    headerRow.setAttribute("id", "headerRow");
    for (let i = 0; i < 9; i++){
        if (i === 0)
            headerRow.insertCell(i).innerHTML = `<th>GERs</th>`;
        else
            headerRow.insertCell(i).innerHTML = `<th>Semester ${i}</th>`;
    }


    for (let i = 0; i < countGers; i++){
        var newRow = table.insertRow(-1);
        for (let j = 0; j < 9; j++){
            if(j === 0){
                cell = newRow.insertCell(j)
                cell.setAttribute("class", "firstCol");
                cell.innerHTML = `<td>${GERS[i]}</td>`;
            }
            else{
                var cell = newRow.insertCell(j);
                var newInput = document.createElement("input");
                newInput.setAttribute("class", "courseTitle");
                newInput.setAttribute("type", "text");
                newInput.setAttribute("GER", GERS[i]);

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

function updateSemesterLabel() {
    var semesterLabel = document.getElementById("semesterLabel");
    var slider = document.getElementById("semesterSlider");
    semesterLabel.innerHTML = `${slider.value}`;
}

function savePlan(){

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


function loadPlan(){

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