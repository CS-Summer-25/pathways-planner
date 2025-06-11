

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

