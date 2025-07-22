
# TODO: 

* ISSUE: 

    Option 1 (Checkboxes don't load from plan):
    - Comment out Lines 154-156 AND Uncomment Line 153
    - Lines 245-248 remove

    Option 2 (Checkboxes work but menus don't hide):
    - Uncomment Lines 154-156 AND Comment out Line 153    
        

* [ ] Add a form/popup/webpage to automatically add courses from a schedule to their respective tables
    * [ ] This will also require the use of some function to check if a course has been repeated in a given table

* [X] Convert input boxes to checkboxes, when relevant: for XXX-XXX first col values 

* [ ] Save/Load plan with multiple tables 

* [ ] Change + button to image 

* [X] On loadPlan, options dropdown is visible

* [ ] Weird misalignment of input fields in GER and maybe other tables? 

* [ ] Toggling tables reduces width 

* [ ] Toggling panel reduces width 

* [ ] Add a button for new rows to all? tables (What would the design be? Form?)

* [ ] Change general CSS styling (hard on the eyes)
    * [ ] Preferably, Page styling based on system preferences (dark/light mode)

* [ ] Change save/Load plan to have magic link functionality

* [ ] Add tick marks on semester slider for visual appeal/convenience

* [ ] Scroll to top button

----

Come back to reorganize: 

`updateTable(relevantRow, j) previously called updateFirstCol 

    Cases: 

    allEmpty (ROW) <-- colors first col red and enables some cells 

    inputValue not empty (CELL) 

        isValid (CELL) <- colors green, disables other cells of the row, colors firstcol
        invalid (CELL) 
 
        CPS or Pathways or HB  (ROW)
        Else (Normal case) (ROW)

    inputValue empty`

1. colorCell
2. disableEnableOtherCells
3. colorFirstCol 