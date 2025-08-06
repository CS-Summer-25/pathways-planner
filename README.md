
# TODO: 

* [ ] Server crashes periodically. Investigate. 

* [ ] One step tutorials (intro.js) interlaced with guide ???

* [ ] Clear out old major/minor tables BEFORE loading plan 

* ISSUE: 

    Option 1 (Checkboxes don't load from plan):
    - Comment out Lines 154-156 AND Uncomment Line 153
    - Lines 245-248 remove

    Option 2 (Checkboxes work but menus don't hide):
    - Uncomment Lines 154-156 AND Comment out Line 153  

    Option 3 (both checkboxes work and menus still hide)  
    - .finally(() => {}) seems to work to remove the menus
    - changed close menus to be a function operating on entire document instead of table - still requires timeout
        

* [ ] Add a form/popup/webpage to automatically add courses from a schedule to their respective tables
    * [ ] This will also require the use of some function to check if a course has been repeated in a given table

* [X] Weird misalignment of input fields in GER and maybe other tables? 

* [X] Add a button for new rows to all? tables (What would the design be? Form?)

* [X] Change general CSS styling (hard on the eyes)
    * [X] Preferably, Page styling based on system preferences (dark/light mode)

* [ ] Add tick marks on semester slider for visual appeal/convenience

* [ ] Scroll to top button

* [ ] Make the RowLabel of custom rows / ColLabel of custom columns editable by user

* [ ] Fix issue where an image's title appears of the hover text 

* [ ] Add "Report Bug/Github Link" functionality

* [ ] Export/Import Functionality

* [ ] Tour functionality
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