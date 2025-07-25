// Looks into acalog_programs.json file 
// loops over programs 

let majors = {};
let minors = {};
let courseOptions = {};
let GER_COURSES = null;
let GERS = null;

// -----------------Asynchronous Functions-----------------

// This function constructs majors/minors objects from acalog_programs.json.
async function assignCourses(path) {
    // must wait to ensure that data is properly loaded into global var MAJORS
    const data = JSON.parse(await fetch(path).then(response => response.text()));

    // loop through the data and assign majors and minors
    for (let programTitle in data) {
        let program = {programInfo: {"code" : "", "reqs": []}};
        courseOptions[programTitle] = {};
        
        // program.programTitle.reqs = [];
        for (let pattern in data[programTitle]) {
            var row_store = 1;
            if (pattern === "key") {
                let key = data[programTitle][pattern];
                // this is the key for the program, we can use it to identify the program
                // e.g. "CSBS" for Computer Science, B.S.
                // we can also use it to identify the type of program (major or minor)
                program.programInfo.code = key;
                continue; // skip to next pattern
            }
            else if (pattern.startsWith("required")) {
                // this is a required course pattern: each course will be a row, 
                let numRows = data[programTitle][pattern].length;
                let options = data[programTitle][pattern].sort();
                // create row names
                let reqs = [];
                for (let i = 0; i < numRows; i++) {
                    // the course code is the first part of the string
                    reqs.push(options[i].split(" ")[0]);
                }
                reqs = reqs.join(":");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);
            }
            else if (pattern.startsWith("choose")) {
                // this is a choice pattern
                // the number in the pattern indicates how many rows to create
                let numRows = parseInt(pattern.split("_")[1]);
                // options will be used for autocomplete down the line
                let options = data[programTitle][pattern];
                let rowLabel = pattern.split("_")[2];
                let reqs = [];
                if (numRows > 1) {
                    for (let i = 1; i < numRows+1; i++) {
                        reqs.push(rowLabel + " " + i);
                        courseOptions[programTitle][rowLabel + " " + i] = options;
                    }
                }
                else {
                    reqs.push(rowLabel);
                    courseOptions[programTitle][rowLabel] = options;
                }
                reqs = reqs.join(":");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);


                // let rowLabel = pattern.split("_")[-1];
            }
            else if (pattern.startsWith("condchoose")) {
                // this is a conditional choice pattern
                // i.e. there is least, most, or range condition in the pattern
                let numRows = parseInt(pattern.split("_")[1]);
                let reqs = [];
                let options_store = []
    
                for (let x = 0; x < Object.keys(data[programTitle][pattern]).length; x++) {
                    var key = Object.keys(data[programTitle][pattern])[x];
                    var options = data[programTitle][pattern][key].sort();
                    if (options_store.indexOf(options) == -1) {
                        options_store.push(options);
                    }

                    if (key.startsWith("least") || key.startsWith("range")) {
                        // this is a least or range pattern - make that number of rows with that given pattern's name
                        let rowLabel = key.split("_")[2] + pattern.split("_")[2];
                        let condRowNum = parseInt(key.split("_")[1]);
                        for (let i = 1; i < condRowNum+1; i++) {
                            reqs.push(rowLabel + " " + row_store);
                            courseOptions[programTitle][rowLabel + " " + row_store] = options;
                            row_store++;
                        }
                    }
                }
                options_store = options_store.flat();
                // remove duplicates from options_store
                total_options = [...new Set(options_store)].sort();

                // row_store += Object.keys(data[programTitle][pattern]).length;
                let rowLabel = pattern.split("_")[2];
                for (let i = row_store; i < numRows+1; i++) {
                    // this is a regular choice pattern, so we can just add the row name
                    reqs.push(rowLabel + " " + i);
                    courseOptions[programTitle][rowLabel + " " + i] = total_options;
                }
                reqs = reqs.join(":");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);
            }
            else if (pattern.startsWith("structchoose")) {
                // this is a choice pattern
                // the number in the pattern indicates how many rows to create
                let numRows = parseInt(pattern.split("_")[1]);
                // options will be used for autocomplete down the line
                let course_lst = data[programTitle][pattern];
                var options = [];
                for (let x = 0; x < course_lst.length; x++) {
                    if (Array.isArray(course_lst[x])) {
                        for (let y = 0; y < course_lst[x].length; y++) {
                            var course = (course_lst[x][y]).toString();
                            options.push(course+"&and");
                        }
                        options[options.length - 1] = options[options.length - 1].slice(0, -4);
                    }
                    else {
                        var course = (course_lst[x]).toString();
                        options.push(course);
                    }
                    options.push("&or")
                }
                console.log(options[options.length-2]);
                console.log("options: ", options);
                let rowLabel = pattern.split("_")[2];
                let reqs = [];
                if (numRows > 1) {
                    for (let i = 1; i < numRows+1; i++) {
                        reqs.push(rowLabel + " " + i);
                        courseOptions[programTitle][rowLabel + " " + i] = options;
                    }
                }
                else {
                    reqs.push(rowLabel);
                    courseOptions[programTitle][rowLabel] = options;
                }
                reqs = reqs.join(":");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);


                // let rowLabel = pattern.split("_")[-1];
            }
            else if (pattern.startsWith("credit")) {
                // this is a credit pattern
                let numRows = Math.ceil(parseInt(pattern.split("_")[1]) / 4); 
                // if there are two credits, you still need to take 1 course - how to handle this?
                let course_dict = Object.values(data[programTitle][pattern]);
                var options = [];
                course_dict.forEach((course) => {
                    options.push(Object.keys(course).toString());
                });
                options = options.sort();
                // var options = [];
                // for (let x = 0; x < course_dict.length; x++) {
                //     var course = Object.keys(course_dict[x]).toString();
                //     console.log("course", course);
                //     options.push(course);
                //     // do something with course
                // }
                // var courses = Object.keys(options).sort();
                // var credits = Object.values(options).sort();
                // console.log("credit", options);
                // rowLabel is the pattern name
                let rowLabel = pattern.split("_")[2];
                let reqs = [];
                if (numRows > 1) {
                    for (let i = 1; i < numRows+1; i++) {
                        reqs.push(rowLabel + " " + i);
                        courseOptions[programTitle][rowLabel + " " + i] = options;
                    }
                }
                else {
                    reqs.push(rowLabel);
                    courseOptions[programTitle][rowLabel] = options;
                }
                reqs = reqs.join(":");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);
            }
            else if (pattern.startsWith("condcredit")) {
                // this is a conditional credit pattern
                let numRows = Math.ceil(parseInt(pattern.split("_")[1]) / 4);
                let reqs = [];
                let options_store = [];
                for (let x = 0; x < Object.keys(data[programTitle][pattern]).length; x++) {
                    var key = Object.keys(data[programTitle][pattern])[x];
                    let course_dict = Object.values(data[programTitle][pattern])[x];
                    let options = [];
                    course_dict.forEach((course) => {
                        options.push(Object.keys(course).toString());
                    });
                    options = options.sort();

                    if (options_store.indexOf(options) == -1) {
                        options_store.push(options);
                    }
                    // console.log("options: ",options)
                    // console.log("program: ", programTitle);
                    // console.log("Courses: ", course_dict);
                    // console.log("X: ", x, "Key: ", key);

                    if (key.startsWith("least") || key.startsWith("range")) {
                        // this is a least or range pattern - make that number of rows with that given pattern's name
                        let rowLabel = key.split("_")[2] + pattern.split("_")[2];
                        let condRowNum = Math.ceil(parseInt(key.split("_")[1])/4);
                        for (let i = 1; i < condRowNum+1; i++) {
                            reqs.push(rowLabel + " " + row_store);
                            courseOptions[programTitle][rowLabel + " " + row_store] = options;
                            row_store++;
                        }
                    }
                }
                options_store = options_store.flat();
                // remove duplicates from options_store
                total_options = [...new Set(options_store)].sort();


                let rowLabel = pattern.split("_")[2];
                for (let i = row_store; i < numRows+1; i++) {
                    reqs.push(rowLabel + " " + i);
                    courseOptions[programTitle][rowLabel + " " + i] = total_options;
                }
                reqs = reqs.join(":");
                // reqs = reqs.slice(0, -2); // remove trailing comma
                program.programInfo.reqs.push(reqs);
            }
        }
        program.programInfo.reqs = program.programInfo.reqs.join(":");
        if (programTitle.endsWith("Minor")) {
            minors[programTitle] = {};

            minors[programTitle].key = program.programInfo.code;
            minors[programTitle].firstCol = program.programInfo.reqs;
        }
        else {
            majors[programTitle] = {};

            majors[programTitle].key = program.programInfo.code;
            majors[programTitle].firstCol = program.programInfo.reqs;
        }
    }

    console.log("Course Options: ",courseOptions);
}

// This function runs important functions on page load. Runs assignCourses(), setGERSAutocomplete(), and selectAutocomplete()
async function initialize() {

    // get current date 
    var currentDate = new Date();
    console.log("Current Date: ", currentDate.toLocaleDateString());
    var currentSemester = currentDate.getMonth() < 6 ? "Spring" : "Fall"; // 1 for Spring, 2 for Fall
    console.log("Current Semester: ", currentSemester);

    // assign majors, minors, GERS from respective files
    await assignCourses("acalog_programs.json");
    // sort the majors and minors by their keys
    majors = Object.fromEntries(Object.entries(majors).sort());
    minors = Object.fromEntries(Object.entries(minors).sort());
    console.log("MAJORS/MINORS Initialized: ");
    console.log(majors, minors);
    console.log("Starting GER Population");
    
    setGERSAutocomplete();
    selectAutocomplete();
    console.log("Initialization complete!")
}

// --------------------------------------------------------

// This function is used to set the autocomplete selection of majors. Runs grabCourses() on all select program inputs on page. 
function selectAutocomplete(){
    var programInputs = document.getElementsByClassName("programInput");

    for (let i = 0; i < programInputs.length; i++) {
        const programInput = programInputs[i];

        var courses = programInput.id == "minorSelect" ? minors : majors;

        $(programInput).autocomplete({
            autoFocus: true,
            source: Object.keys(courses),
            select: function(event, ui) {
                event.target.value = ui.item.label;
                grabCourses(event.target.id);
            }
        });
    }
}

// This function sets up the autocomplete for GERS. Runs createTable("GERS", "GERS", GERS) and isValidCourse()
function setGERSAutocomplete() {
    $( function() {        
        fetch('gers.json')
        .then(response => response.json())
        .then(gers => {
            GERS = Object.keys(gers);
            if (!document.getElementById("GERS-table")) {
                createTable("GERS", "GERS", GERS);
            }
            // convert all keys to lowercase
            GER_COURSES = Object.fromEntries(Object.entries(gers).map(([key, value]) => [key.toLowerCase(), value]));
            // Loop over gers dictionary to set up autocomplete for all GER fields
            for (let gerKey in GER_COURSES) {
                if (GER_COURSES.hasOwnProperty(gerKey)) {
                    const gerElements = document.getElementsByClassName(gerKey);
                    for (let i = 0; i < gerElements.length; i++) {
                        const gerElement = gerElements[i];
                        $(gerElement).autocomplete({
                            autoFocus: true,
                            source: GER_COURSES[gerKey],
                            select: function(event, ui) {
                                inputValue = ui.item.label;
                                rowLabel = event.target.classList[1];

                                if (Object.keys(event.target.classList).indexOf("clps") == -1) {
                                    if (!isValidCourse(inputValue, rowLabel)){
                                        event.target.setAttribute("style", setColorOnSystemSettings("red"));
                                    }
                                    else {
                                        event.target.setAttribute("style", setColorOnSystemSettings("light_green"));
                                    }
                                }
                            }
                        });
                    }
                }
            }
        });

      } 
    );
}

function setProgramAutocomplete(inputCell, programTitle, rowLabel) {
    $(inputCell).autocomplete({
        autoFocus: true,
        source: courseOptions[programTitle][rowLabel],
        select: function(event, ui) {
            inputValue = ui.item.label;
            // var rowLabeler = event.target.classList[1];
            console.log("Cause of Call: ", event.target);
            // rowLabel = event.target

            console.log(inputValue, rowLabel, programTitle);
            console.log(isValidCourse(inputValue, rowLabel, programTitle))

            if (!isValidCourse(inputValue, rowLabel, programTitle)){
                event.target.setAttribute("style", setColorOnSystemSettings("red"));
            }
            else {
                event.target.setAttribute("style", setColorOnSystemSettings("light_green"));
            }
        }
    });
}
// This function toggles the visibility of controlPanel, basically only the semester slider and save/load/add semester buttons.
function togglePanel(){
    var panel = document.getElementById("controlPanel");
    // var toggleButton = document.getElementById("togglePanel");
    if (panel.style.display === "none") {
        panel.style.display = "flex";
        // toggleButton.innerHTML = "&and;";
    } else {
        panel.style.display = "none";
        // toggleButton.innerHTML = "&or;";
    }
}

// This function toggles use the entire table and associated buttons, leaving only the toggle button and label visible.
function toggleTable(tableId) {
    var table = document.getElementById(tableId.concat("-table"));
    var rowBtn = document.getElementById(tableId.concat(" RowBtn"));
    var toggleBtn = document.getElementById(tableId.concat("-toggle"));
    if (table.style.display === "none") {
        table.style.display = "table";
        rowBtn.setAttribute("style", "display: block;width: 30px; height: 30px; margin: 5px;");
        // change background image 
        toggleBtn.setAttribute("style", "background:url('imgs/down.png') no-repeat; background-size: contain;");
    } else {
        table.style.display = "none";
        rowBtn.setAttribute("style", "display: none;");
        // toggleBtn.innerHTML = `<span>&or;</span>`;
        toggleBtn.setAttribute("style", "background:url('imgs/up.png') no-repeat; background-size: contain;");
    }
}

// This function grabs the associated courses for a given program. Runs createTable() and removeTable().
function grabCourses(selectId) {
    var courses;
    var tableId = "";

    tableId = selectId.replace("Select", "");
    if (selectId == "mainMajorSelect" || selectId == "doubleMajorSelect") {
        courses = majors;
    }
    else {
        courses = minors;
    }

    var filter = document.getElementById(selectId).value; 

    removeTable(tableId);
    
    if (filter in courses && filter != "") {
        var acronym = courses[filter].key;

        var programidx = Object.entries(courses).findIndex(([key, value]) => value.key == acronym);

        var tableName = Object.keys(courses)[programidx];
        
        // var reqs = courses[Object.keys(courses)[programidx]].slice(1)[0].split(":");
        var rowLabels = courses[Object.keys(courses)[programidx]].firstCol.split(":");
        createTable(tableName, tableId, rowLabels)
    }
}

// --------------------------------------------------------

// This function creates a table with a given name and ID. It then constructs the table header, and then the body using the firstCol array.
// Runs createTableLabel(), createAddRowBtn(), createTableToggle(). Runs addInputRow() for each rowLabel in firstCol.
function createTable(tableName, tableId, firstCol) {
    var tableDiv = document.getElementById(tableId.concat("-wrapper"));
    tableDiv.setAttribute("style", "border: rgb(196, 83, 196) solid 1px; border-radius: 5px;");

    var semesterMax = parseInt(document.getElementById("semesterSlider").max)+1;

    var name = createTableLabel(tableId, tableName);

    var table = document.createElement("table");
    // DON'T CHANGE - NEED THIS TO ACCESS TABLE IN JS
    table.setAttribute("id", tableId.concat("-table"));
    table.classList.add("programTable");
    
    tableDiv.appendChild(name);
    tableDiv.appendChild(table);

    // Add header row 
    var tableHeader = document.createElement("thead");
    tableHeader.setAttribute("id", tableId.concat("-tableheaders"));
    tableHeader.classList.add("headerRows");

    table.appendChild(tableHeader);
    // Create year row
    var yearRow = tableHeader.insertRow(0);
    // yearRow = document.createElement("th");
    yearRow.setAttribute("id", "yearRow");
    yearRow.classList.add(tableId);

    year_vals = ['Year', 'Freshman', 'Sophomore', 'Junior', 'Senior'];

    for (let i = 0; i < year_vals.length; i++) {
        var cell = document.createElement("th");

        cell.setAttribute("colspan", i == 0 ? 1 : 2);
        cell.innerHTML = year_vals[i];

        yearRow.appendChild(cell);
    }
    
    // Create semester row (first value labels the firstCol credits, not related to semester)
    var semesterRow = tableHeader.insertRow(1);
    semesterRow.setAttribute("id", "headerRow");
    semesterRow.classList.add(tableId);

    document.createElement("td");
    for (let i = 0; i < semesterMax; i++) {
        var cell = document.createElement("th");
        if (i == 0) {
            cell.innerHTML = `<th>Credits</th>`;
            cell.setAttribute("style", "font-weight: normal;");
        }
        else {
            cell.innerHTML = i % 2 == 0 ? `<th>Spring</th>` : `<th>Fall</th>`;
        }
        semesterRow.appendChild(cell);
    }

    var tbody = document.createElement("tbody");
    tbody.setAttribute("id", tableId.concat("-tablebody"));
    table.appendChild(tbody);
    // Add input rows based on data
    addInputRow(tableId, firstCol);

    // reset width of table to fit website
    // table.setAttribute("style", "width: inherit;");
    // tableDiv.setAttribute("style", "width: 100%;")
    table.setAttribute("style", "width: 100%; table-layout: fixed;");

    createAddRowBtn(tableId, tableDiv);

    createTableToggle(tableId, name);
}


// This function creates a new 'input' row for each row Label in the firstCol var. Binds updateTable() to each input. Runs isSpecificCourse() and updateSemesterLabel().
function addInputRow(tableId, firstCol) {
    // firstCol is a list of elements to become the first column of the table - can be of length 1 (just make a list of [element])
    var table = document.getElementById(tableId.concat("-tablebody"));
    var tableLength = parseInt(document.getElementById("semesterSlider").max);
    
    // get h2 with class= "programTitle"
    var programTitle = document.getElementById(tableId+"-wrapper").getElementsByTagName('h2')[0].innerHTML.trim();
    // console.log("Program Title: ", programTitle);

    // Populate table with GER column vals, input fields
    var tableHeight = table.rows.length;
    for (let i = 0; i < firstCol.length; i++){
        var tableIdx = i + tableHeight
        var newRow = table.insertRow(-1);
        // if (firstCol[i] == "custom") {
        var rowClass = firstCol[i].toLowerCase().replaceAll(" ", "");
        if (firstCol[i] == "custom") {
            rowClass += String(tableIdx);
        }
        for (let j = 0; j < tableLength+1; j++) {
            if(j === 0){
                cell = newRow.insertCell(j);
                cell.setAttribute("class", "firstCol");

                if (rowClass.startsWith("custom")) {
                    cell.innerHTML = `<td>Custom ${tableIdx}</td>`;
                }
                else {
                    cell.innerHTML = `<td>${firstCol[i]}</td>`;
                }
                cell.classList.add(rowClass);
                cell.setAttribute("id", tableId+"_"+tableIdx+"-"+j);
            }
            else{
                var cell = newRow.insertCell(j);
                cell.classList.add("courseInput");
                var newInput = document.createElement("input");

                newInput.setAttribute("id", tableId+"_"+tableIdx+"-"+j);
                newInput.setAttribute("class", "courseInput");
                newInput.classList.add(rowClass);

                // if row is CLPs, set to number inputs, string otherwise
                if (rowClass == "clps") {
                    newInput.setAttribute("type", "number");
                    newInput.setAttribute("min", "0");
                }
                else if (rowClass === "fyw" && j > 2) {
                    newInput.setAttribute("disabled", "true");
                }
                else if (isSpecificCourse(rowClass)) {

                    newInput.setAttribute("type", "checkbox");
                    
                }
                else{
                    // console.log(majors);
                    // console.log(minors);
                    newInput.setAttribute("type", "text");
                    if (tableId != "GERS") {
                        setProgramAutocomplete(newInput, programTitle, firstCol[i]);
                    }
                }
                // Add event listener to handle input changes
                // we simply have no validation for custom rows - maybe a future feature
                // if (!rowLabel.startsWith("custom")) {
                newInput.addEventListener("change", updateTable.bind(newInput, table.rows[tableIdx], j));
                // }
                cell.appendChild(newInput);
            }
        }        
    }
    updateSemesterLabel();
}

// This function checks if a rowLabel follows the format ABC-123, where ABC is 3 letters and 123 is 3 digits. Mainly used to construct checkboxes for "required" course labels.
function isSpecificCourse(rowLabel) {
    // regex for strings of format ABC-123
    var regex = /^[a-zA-Z]{3}-\d{3}$/;
    return regex.exec(rowLabel);
}

// This function updates the styling of the table according to user input. Affects both the input fields and the row labels.
// Runs setCourseInputColor(), isValidCourse(), setFirstColColor(), and updateTableColorsOnSlider().
function updateTable(relevantRow, j) {
    var isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var inputValue = this.value;

    // Handle input change if necessary

    var currentSemester   = parseInt(document.getElementById("semesterValue").innerHTML);
    var firstCell         = relevantRow.cells[0];
    var rowLabel          = firstCell.innerHTML  
    var relevantRowInputs = relevantRow.getElementsByTagName("input");
    var rowClass          = firstCell.classList[1];
    // console.log("relevantRow: ", rowLabel, j, rowClass);
    var allEmpty          = relevantRowInputs[2].type == "checkbox" ? 
                                Array.from(relevantRowInputs).every(input => input.checked == false) :
                                Array.from(relevantRowInputs).every(input => input.value === "");

    // if all inputs are empty, set first cell to red, reenable any relevant inputs
    if (allEmpty) {
        firstCell.setAttribute("style", setColorOnSystemSettings("red")); //red, because all empty
        for (let k = 0; k < relevantRowInputs.length; k++) {

            relevantRowInputs[k].disabled = (rowClass === "fyw" && k >= 2);
            setCourseInputColor(relevantRowInputs[k], k+1, currentSemester);
        }
        return;
    }  
    if (inputValue != "") {
        // check if it is a valid GER course (if its a clp, it has to be a valid credit if not empty)
        // If valid, set background of input cell to lightgreen
        var tableId = relevantRowInputs[j-1].getAttribute("id").split('_')[0];
        var programTitle = document.getElementById(tableId+"-wrapper").getElementsByTagName('h2')[0].textContent.trim();


        if (isValidCourse(inputValue, firstCell.innerHTML, programTitle)) {

            relevantRowInputs[j-1].setAttribute("style", setColorOnSystemSettings("light_green"));
        }
        // invalid course
        else {
            relevantRowInputs[j-1].setAttribute("style", setColorOnSystemSettings("crimson"));
            // pink indicates something is wrong with the input, but it's not empty
            firstCell.setAttribute("style", setColorOnSystemSettings("pink"));
            if (rowClass != "clps" && rowClass != "fyw") {
                // re-enable all inputs in the row
                for (let k = 0; k < relevantRowInputs.length; k++) {
                    relevantRowInputs[k].disabled = false;
                    if (relevantRowInputs[k].value == "") {
                        setCourseInputColor(relevantRowInputs[k], k+1, currentSemester);
                    }
                }
            }
        }
        // now begin handling first cell background color
        // if semester is current, set first cell to yellow
        // Pathways, CLPs, and HB are special cases - they need/can have multiple inputs
        if (rowClass == "clps" || rowClass == "pathways" || rowClass == "hb") {
            // CLPs - if the sum of all inputs up to the current semester >= 32, set to green, otherwise, set to yellow (if all empty, set to red)
            if (rowClass == "clps") {
                var total = 0;
                for (let k = 0; k < relevantRowInputs.length; k++) {
                    if (!isNaN(parseInt(relevantRowInputs[k].value))) {
                        total += parseInt(relevantRowInputs[k].value);
                    }
                }

                if (total >= 32) {
                    firstCell.setAttribute("style", setColorOnSystemSettings("green"));
                } else if (allEmpty) {
                    firstCell.setAttribute("style", setColorOnSystemSettings("red"));
                } else {
                    firstCell.setAttribute("style", setColorOnSystemSettings("orange"));
                }
            }
                // pathways - if all 4 semesters are filled with the right courses, set to green, otherwise, set to yellow
            if (rowClass == "pathways" || rowClass == "hb") {
                if (rowClass == "pathways") {
                    // construct an array from the input values of relevantRowInputs
                    var pathwaysInputs = Array.from(relevantRowInputs).map(input => input.value.toLowerCase().split(" ")[0].trim());
                    if (pathwaysInputs.includes("pth-101") && pathwaysInputs.includes("pth-102") && pathwaysInputs.includes("pth-201") && pathwaysInputs.includes("pth-202")) {
                        firstCell.setAttribute("style", setFirstColColor(currentSemester, pathwaysInputs.indexOf("pth-202")));

                        // disable all other inputs in row except inputs
                        var disabledArr = Array.from(relevantRowInputs).map(input => input.value);
                        for (let k = 0; k < disabledArr.length; k++) {
                            if (disabledArr[k] == "") {
                                relevantRowInputs[k].disabled = true;
                                setCourseInputColor(relevantRowInputs[k], k+1, currentSemester);
                                
                            }
                        }
                    }
                }
                // hb is a special case - must have more than 1 input (2 HB credits required)
                if (rowClass == "hb") {
                    var hbInputs = Array.from(relevantRowInputs).map(input => input.value)
                    for (let val = 0; val < hbInputs.length; val++) {
                        // if the input is empty, remove it from the array
                        if (hbInputs[val] == "") {
                            hbInputs.splice(val, 1);
                            val--;
                        }
                        else if (!isValidCourse(hbInputs[val], rowClass)) {
                            hbInputs.splice(val, 1);
                            val--;
                        }
                    }
                    var disabledArr = Array.from(relevantRowInputs).map(input => input.value);
                    if (hbInputs.length >= 2) {
                        firstCell.setAttribute("style", setColorOnSystemSettings("green"));
                        // disable all other rows
                        // var disabledArr = Array.from(relevantRowInputs).map(input => input.value);
                        for (let k = 0; k < disabledArr.length; k++) {
                            if (disabledArr[k] == "" || !isValidCourse(disabledArr[k], rowClass)) {
                                relevantRowInputs[k].value = "";
                                relevantRowInputs[k].disabled = true;
                                setCourseInputColor(relevantRowInputs[k], k+1, currentSemester);
                            }
                        }
                    }
                    else {
                        if (hbInputs.length > 0) {
                            firstCell.setAttribute("style", setColorOnSystemSettings("orange"));
                        }
                        else {
                            firstCell.setAttribute("style", setColorOnSystemSettings("red"));
                        }
                        // re-enable all inputs in the row
                        for (let k = 0; k < relevantRowInputs.length; k++) {
                            relevantRowInputs[k].disabled = false;
                            if (disabledArr[k] == "" || !isValidCourse(disabledArr[k], rowClass)) {
                                setCourseInputColor(relevantRowInputs[k], k+1, currentSemester);
                            }
                        }
                    }
                }
                
            }
        }
        // if it's not a special case - it only needs 1 input to be fulfilled
        else {
            var tableId = relevantRowInputs[j-1].getAttribute("id").split('_')[0];
            var programTitle = document.getElementById(tableId+"-wrapper").getElementsByTagName('h2')[0].textContent.trim();
            
            if (isValidCourse(inputValue, rowLabel, programTitle)) {
                firstCell.setAttribute("style", setFirstColColor(j, currentSemester));
            // disable all other inputs in row except input semester
            for (let k = 0; k < relevantRowInputs.length; k++) {
                if (k+1 != j) {
                    relevantRowInputs[k].value = "";
                    relevantRowInputs[k].disabled = true;
                    setCourseInputColor(relevantRowInputs[k], k+1, currentSemester);
                }
            }
        }
        }
    }
    // if the input field is empty
    else {
        // if input is current semester, set to purple, otherwise set to enabled/disabled color
        relevantRowInputs[j-1].setAttribute("style", setCourseInputColor(relevantRowInputs[j-1], j, currentSemester));
        // reset first cell to red if all inputs in row are empty
        if (Array.from(relevantRowInputs).every(input => input.value === "")) {
            firstCell.setAttribute("style", setColorOnSystemSettings("red"));
        }

    }
    updateTableColorsOnSlider(currentSemester);
}

// This function updates the styling of all tables based on the semester slider's current value.
// Runs isValidCourse(), setFirstColColor(), and setCourseInputColor().
function updateTableColorsOnSlider(semester) {
    // Get all tables GER and Major 
    var tables = document.querySelectorAll(".programTable");
    // Loop through each table
    tables.forEach(function(table) {
        // Get all rows in the table
        var rows = table.rows;
        // Loop through each row, except the header rows
        for (let i = 2; i < rows.length; i++) {
            var relevantRow = rows[i];
            var firstCell = relevantRow.cells[0];
            var relevantRowInputs = relevantRow.getElementsByTagName("input");
            // if (Array.from(firstCell.classList).some(cls => cls.match(/custom/))) {
            //     break;
            // }

            // Set all inputs to enabled

            var programTitle = document.getElementById(table.id.replace("-table", "-wrapper")).getElementsByTagName('h2')[0].textContent.trim();

            var rowLabel = firstCell.innerHTML
            var rowClass = firstCell.classList[1];
            for (let j = 0; j < relevantRowInputs.length; j++) {
                var currentInput = relevantRowInputs[j];
                var userInput = currentInput.type == "checkbox" ? currentInput.checked : currentInput.value;
                if(userInput != "" && (rowClass != "clps") && isValidCourse(userInput, rowLabel, programTitle)) {
                    firstCell.setAttribute("style", setFirstColColor(j, semester-1));
                }
                else if (userInput != "" && (rowClass != "clps") && !isValidCourse(userInput, rowLabel, programTitle)) {
                    relevantRowInputs[j].setAttribute("style", setColorOnSystemSettings("crimson"));
                    firstCell.setAttribute("style", setColorOnSystemSettings("pink"));
                }
                if (userInput == "") {
                    setCourseInputColor(relevantRowInputs[j], j+1, semester);
                }
            }
        }
    });
}

// This function checks the current semester range value and updates the semester label accordingly. Often used in place of updateTableColorsOnSlider() calls since it runs that function automatically.
// Runs updateTableColorsOnSlider() to style the table whenever this function is called - which is on slider change.
function updateSemesterLabel() {
    var semesterValue = document.getElementById("semesterValue");
    var slider = document.getElementById("semesterSlider");
    
    semesterValue.innerHTML = `${slider.value}`;
    updateTableColorsOnSlider(slider.value);

}

// This function modifies the styling of the current RowLabel/firstCell based on the relation between the inputCell's semester and the current semester.
// #FFC000 is the color for the current semester, green for finished semesters, and blue for future semesters.
function setFirstColColor(j, semester) {
    // grab whether dark or light mode is enabled
    if (j == semester) {
        return setColorOnSystemSettings("orange");
    }
    else if (j < semester) {
        return setColorOnSystemSettings("green");
    }
    else {
        return setColorOnSystemSettings("blue");
    }
}
function setColorOnSystemSettings(color) {
    var isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (!isDarkMode) {
        var color_dict = {
            "pink"          : "background-color: #f9dede;",
            "green"         : "background-color: #4aa564;",
            "orange"       : "background-color: #fdb81e;",
            "blue"          : "background-color: #00a6d2;",
            "crimson"   : "background-color: #e59393;",
            "red"           : "background-color: #a80101ff;",
            "light_green"   : "background-color: #94bfa2;"
            }
        }
    else {
        var color_dict = {
            "pink"          : "background-color: #db7093;",
            "green"         : "background-color: green;",
            "orange"       : "background-color: #e26310;",
            "blue"          : "background-color: blue;",
            "crimson"   : "background-color: crimson;",
            "red"           : "background-color: rgb(199, 2, 2);",
            "light_green"   : "background-color: lightgreen;"
            }
        }
    return color_dict[color]
}

// This function sets the background color of the input field based on the semester and whether the input is disabled or not.
// Purple(_transparent) represents the current semester, lightgrey for enabled inputs, darkgrey for disabled
function setCourseInputColor(input, j, semester) {

    var color_dict = {
        "purple"            : "background-color: rgb(196, 83, 196);",
        "lightgrey"         : "background-color: rgb(255, 255, 255, 0.75);",
        "darkgrey"          : "background-color: rgb(255, 255, 255, 0.25);",
        "purple_transparent": "background-color: rgb(196, 83, 196, 0.25);"
    };
    
    if (j == semester && input.disabled == false) 
        color = color_dict["purple"];
    else if (input.disabled == false)
        color = color_dict["lightgrey"];
    else if (j == semester && input.disabled == true)
        color = color_dict["purple_transparent"];
    else
        color = color_dict["darkgrey"];

    input.setAttribute("style", color);
}

// This function checks if the input value is a valid course for the given rowLabel.
// Runs isSpecificCourse() to check if rowLabel is a checkbox type. If so, return if the checkbox is checked.
function isValidCourse(inputValue, rowLabel, programTitle) {
    if ((programTitle) && (programTitle != 'GERS') && !isSpecificCourse(rowLabel)) {
        // console.log("Program Title: ", programTitle);
        // console.log("Row Label: ", rowLabel);
        // console.log(courseOptions[programTitle]);
        return courseOptions[programTitle][rowLabel].indexOf(inputValue) >= 0;
    }
    rowLabel = rowLabel.toLowerCase().replaceAll(" ", "");
    if (Object.keys(GER_COURSES).indexOf(rowLabel) >= 0 && rowLabel != "clps") {
        return GER_COURSES[rowLabel].indexOf(inputValue) >= 0;
    }
    else if (rowLabel == "clps") {
        return parseInt(inputValue) >= 0;
    }
    else if(isSpecificCourse(rowLabel)) {
        // check if inputValue checkbox is checked
        return inputValue;

    }
    else {
        return false;
    }
}

// This function creates a <h2> for the table with the given tableId and tableName. Serves as the superheader of the table.
function createTableLabel(tableId, tableName) {
    // create a header for the table
    var name = document.createElement("h2");

    name.innerHTML = `${tableName}`;
    name.setAttribute("id", "tableName");
    name.classList.add(tableId);
    return name
}

// This function creates a button which, when clicked, runs customAddRow(). This button is appended to the bottom of the table.
function createAddRowBtn(tableId, tableDiv) {
    // add a custom - add row button below existing rows
    var addRowBtn = document.createElement("img");
    addRowBtn.setAttribute("src", "imgs/add.png");
    addRowBtn.setAttribute("id", tableId+" RowBtn");
    addRowBtn.setAttribute("class", "addRowBtns");
    addRowBtn.setAttribute("cursor", "pointer");
    addRowBtn.setAttribute("style", "width: 30px; height: 30px; margin: 5px;");
    // addRowBtn.
    // Add tooltip 
    addRowBtn.setAttribute("title", "Add a custom row");
    addRowBtn.onclick = function() {
        customAddRow(tableId);
    };
    // console.log(addRowBtn.getAttribute("style"));
    tableDiv.appendChild(addRowBtn);
}

// This function creates a toggle button for the table which, when clicked, runs toggleTable(). This button is inserted to the right of the table header.
function createTableToggle(tableId, name) {
    // add a toggle span to header
    var toggleBtn = document.createElement("input");
    toggleBtn.setAttribute("id", tableId.concat("-toggle"));
    toggleBtn.setAttribute("class", "toggleBtn");
    toggleBtn.setAttribute("type", "button");
    toggleBtn.setAttribute("title", "Toggle table visibility");
    toggleBtn.onclick = function() {
        toggleTable(tableId);
    };
    name.appendChild(toggleBtn);
}

// This function removes a given table using its ID (tail-to-head). It leaves only the select input intact, so that the user can select a different program.
function removeTable(tableId) {
    var oldGroup = document.getElementById(tableId.concat("-wrapper"));
    if (oldGroup) {
        for (let i = oldGroup.children.length - 1; i >= 0; i--) {
            if (oldGroup.children[i].id != "selects") {
                oldGroup.children[i].remove();
            }
        }
    }
}

// This function adds a new row to a given table. It also removes the old button and creates a new one to avoid clipping.
// Runs addInputRow() to add a new row with the "custom" label.
function customAddRow(tableId) {
    // remove the old button - plan to move below new row
    var table = document.getElementById(tableId.concat("-table"));
    var numCols = table.rows[1].cells.length; // Get number of columns from the header row
    addInputRow(tableId, ["custom"]);
}


// ACHTUNG: THIS IS BUGGY AND MAY NOT WORK AS INTENDED
// This function adds a new column to all tables, with the addition of an "Other" year header. Semester slider max is incremented by 1 to compensate for the new column.
// Runs setGERSAutocomplete() to reapply autocomplete to the new input fields, and updateSemesterLabel() to update the semester label.
function customAddColumn() {
    // adds a new column to all tables with incremented column number
    var tables = document.querySelectorAll(".programTable");
    var semesterSlider = document.getElementById("semesterSlider");
    semesterSlider.max++;
    // update tick marks
    // var tickMarks = document.getElementById("semesterList");
    // var width = semesterSlider.getBoundingClientRect();
    // var calc = (width - 12) / (semesterSlider.max - 1) + "px";
    // tickMarks.innerHTML = "";
    // for (let i = 0; i <= semesterSlider.max; i++) {
    //     var tick = document.createElement("option");
    //     tick.value = i;
    //     tick.innerHTML = "|";

    //     if (i == 0 || i == semesterSlider.max) {
    //         var w = (parseInt(calc) * 2 + 6) + "px";
    //         tick.setAttribute("style", `width: ${w};`);
    //         if (i == 0) {
    //             tick.setAttribute("style", "text-align: left;");
    //         }
    //         else {
    //             tick.setAttribute("style", "text-align: right;");
    //         }
    //     }
    //     else {
    //         var w = (calc) + "px";
    //         tick.setAttribute("style", `width: ${w};`);
    //         tick.setAttribute("style", "text-align: center;");
    //     }
    //     tickMarks.appendChild(tick);
    // }
    // tickMarks.setAttribute("style", `width: ${width}`);
    // semesterSlider.setAttribute("--list-length", semesterSlider.max);
    // tickMarks("--list-length", semesterSlider.max);

    tables.forEach(function(table) {
        var yearRow = table.rows[0];
        var semesterRow = table.rows[1];
        var tableId = table.id.replace("-table", "");
        var numCols = semesterRow.cells.length; // Get number of columns from the semester row
        
        // retrieve the text of the last cell in the year row
        
        if (yearRow.lastChild.innerHTML == "Senior") {
            var cell = document.createElement("th");
            cell.innerHTML = `<th>Other</th>`;
            yearRow.appendChild(cell);
        }
        else {
            yearRow.lastChild.setAttribute("colspan", `${yearRow.lastChild.colSpan + 1}`);
        }
        // semesterRow.insertCell(numCols).innerHTML = `<th>Semester ${numCols}</th>`;
        var cell = document.createElement("th");
        cell.innerHTML = `<th> Semester ${semesterSlider.max} </th>`;
        semesterRow.appendChild(cell);
        
        // Loop through each row and add a new input cell
        var j = numCols; 
        for (let i = 2; i < table.rows.length; i++) {
            var relevantRow = table.rows[i];
            var firstCell = relevantRow.cells[0];
            var rowLabel = firstCell.innerHTML;
            var rowClass = firstCell.classList[1];

            var newCell = table.rows[i].insertCell(-1);
            var newInput = document.createElement("input");
            newInput.setAttribute("id", tableId+"_"+i+"-"+numCols);
            newInput.setAttribute("class", "courseInput");
            newInput.classList.add(rowClass);

            // if row is CLPs, set to number inputs, string otherwise
            if (rowClass == "clps") {
                newInput.setAttribute("type", "number");
                newInput.setAttribute("min", "0");
            }
            else if (rowClass === "fyw" && j > 2) {
                newInput.setAttribute("disabled", "true");
            }
            else {
                newInput.setAttribute("type", "text");
            }
            // we simply have no validation for custom rows - maybe a future feature
            newInput.addEventListener("change", updateTable.bind(newInput, relevantRow, numCols));
            var bgcolor = firstCell.getAttribute("style") != null ? firstCell.getAttribute("style").trim() : "";

            // if there are disabled rows and the firstCell is colored blue/green/orange, disable the new input
            if (Array.from(relevantRow.getElementsByTagName("input")).some(cell => cell.disabled == true) &&
            (bgcolor == setColorOnSystemSettings("orange") || 
            bgcolor == setColorOnSystemSettings("green") || 
            bgcolor == setColorOnSystemSettings("blue"))) {
                newInput.disabled = true;
            }
            newCell.appendChild(newInput);
        }
        if (tableId == "GERS") {
            setGERSAutocomplete(); // Reapply autocomplete to the new input fields
        }
        else {
            var programTitle = document.getElementById(tableId+"-wrapper").getElementsByTagName('h2')[0].textContent.trim();
            setProgramAutocomplete(newInput, programTitle, rowLabel);
        }
        updateSemesterLabel();
        
    });
}

// These functions may come in handy when we are validating major/minor programs and their courses - can be used to prevent duplicate courses
function courseExistsAtAll(course) {
    var gers = courseExists(course, "GERS");
    var mainMajor = courseExists(course, "mainMajor");
    var doubleMajor = courseExists(course, "doubleMajor");
    var minor = courseExists(course, "minor");
    return gers || mainMajor || doubleMajor || minor;
}

function courseExists(course, tableId) {
    // check if course exists in the table with the given tableId
    var table = document.getElementById(tableId.concat("-table"));
        if (table) {
        for (let i = 2; i < table.rows.length; i++) {
            var relevantRow = table.rows[i];
            var relevantRowInputs = relevantRow.getElementsByTagName("input");
            if (!Array.from(relevantRowInputs).some(input => input.type == "checkbox")) {
                for (let j = 0; j < relevantRowInputs.length; j++) {
                    if (relevantRowInputs[j].value.toLowerCase() == course.toLowerCase()) {
                        console.log(`Course ${course} already exists in table ${tableId}`);
                        return true;
                    }
                }
            }
        }
    }
    console.log(`Course ${course} does not exist in table ${tableId}`);
    return false;
}
