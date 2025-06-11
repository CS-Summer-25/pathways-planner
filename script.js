

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
                newRow.insertCell(j).innerHTML = `<td>GER ${i + 1} ${j + 1}</td>`;
            }
        }
    }
}