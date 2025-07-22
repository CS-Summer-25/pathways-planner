
import pandas as pd 

plan = "GERS@IEJ_2_ANT 254 - The Power and Politics of Black Foodways~UQ_3_REL 228 - History of God;mainMajor/Accounting, B.A.@ACC-340_2_1~Upper Level Elective_3_kejbf;minor/Data Analytics Minor@Elective 1_3_CSC-372"

semester = 1
email = "abc@def.com"

final_df = []
for program_str in plan.split(";"):
    if program_str == "":
        continue
    table_name, rows_str = program_str.split("@")
    rows = rows_str.split('~')
    # rows.split('~')
    # table_name = program_str.split("@")[0]
    for row in rows:

        rowLabel, course_semester, course = row.split("_")

        # cell_df = pd.DataFrame(table_name + , index=["table", "credit", "col", "val"])
        course_series = pd.Series([table_name, rowLabel, course_semester, course], index=["table", "credit", "col", "val"])
        # final_df = pd.concat([final_df, cell_df.T], ignore_index=True)
        final_df.append(course_series)

final_df = pd.DataFrame(final_df)

final_df["semester"] = semester
final_df.to_csv(f"{email}.csv", index=False)

print(f"<h2>Plan saved for {email} for semester {semester}</h2>")