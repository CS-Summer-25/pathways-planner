# This is to be imported into the server when its available.
# @app are assumed to be imported from flask, i think?
from glob import glob
from flask import jsonify
import smtplib
from email.mime.text import MIMEText
import pandas as pd
# presumably where request comes from
from requests import request

@app.route('/tabot/savePlan')
def savePlan():
    # Get params
    plan = request.args.get('plan')
    email = request.args.get('email')
    semester = request.args.get('semester')

    final_df = pd.DataFrame()
    for program_str in plan.split(";"):
        table_name = [program_str.split(",")[0]]
        for cell_str in program_str.split(",")[1:]:

            cell_df = pd.DataFrame(table_name + cell_str.split("_"), index=["table", "credit", "col", "val"])
            final_df = pd.concat([final_df, cell_df.T], ignore_index=True)

    final_df["semester"] = semester
    final_df.to_csv(f"{email}.csv", index=False)

    return f"<h2>Plan saved for {email} for semester {semester}</h2>"

    # Stucture:
    # csv_data = {
        # "semester": semester,
        # GERS credit colIdx val
        # GERS credit colIdx val
        # ...
        # mainMajor-ProgCode credit colIdx val
    
    
    # find code using email in sessionCodes.csv file
    sessionCodes = glob('sessionCodes.csv')
    # covert to df
    if len(sessionCodes) > 0:
        sessionCodes_df = pd.read_csv(sessionCodes[0])
        # if email in df['email'].values:
            # check if the code exists
        code = sessionCodes_df[sessionCodes_df['email'] == email]['code'].values[0]

    # save the df to a csv file with the name email_code_semester.csv
    # df.to_csv(f"{email}_{code}_{semester}.csv", index=False)
    # if the .csv already exists, overwrite it
    plan = pd.Series(csv_data, index=csv_data.keys())
    plan.name = f"{email}_{code}_{semester}"
    # if len(glob(f"{email}.csv")) > 0:
    #     plan_df.to_csv(f"{email}.csv", index=False)
    # else:
    plan.to_csv(f"{code}.csv")
    
    return f"<h2>Plan saved with code: {code}</h2>"

@app.route('/tabot/loadPlan')
def loadPlan():
    # Get params
    passcode = request.args.get('passcode')
    email = request.args.get('email')

    codes_df = pd.read_csv('sessionCodes.csv', names=["email", "code"], dtype={'email': str, 'code': str})
    codes_df.set_index('email', inplace=True)
    if codes_df.loc[email, 'code'] != passcode: 
        return jsonify({'error': 'Invalid passcode or email.'})

    # from glob import glob
    # from flask import jsonify

    csv_files = sorted(glob(f"*{email}*.csv"))[::-1]
    if not csv_files:
        return jsonify({'error': 'No plans found for the given email.'})
    
    relevant_file = csv_files[0]

    plan_df = pd.read_csv(relevant_file)
    # MAKE SURE THAT THERE IS A SEMESTER VALUE IN THE SERVER - USE TO ADJUST SLIDER TO CORRECT SEMESTER
    plan_df.columns = ['table', 'credit', 'col', 'val', "semester"]
    json_data = plan_df.to_dict(orient='records')

    return jsonify(json_data)

def generate_random_code(num_digits=5, email=None):
    import random
    import string
    
    # generate a random 5 digit code, alphanumeric
    code = ''.join(random.choices(string.ascii_letters + string.digits, k=num_digits))

    # check if the code already exists in the database
    fnames = glob('sessionCodes.csv')

    if len(fnames) == 0:
        # if no existing codes, return the code
        df = pd.DataFrame({'email': [email], 'code': [code]})
        df.to_csv('sessionCodes.csv', index=False)
    else:  
        fname = fnames[0]  
        # convert .csv to df for easy manipulation
        df = pd.read_csv(fname, dtype={'email': str, 'code': str})
        df.set_index('email', inplace=True)
        # get the 'code' column
        existing_codes = df['code'].tolist()

        is_code_unique = existing_codes.count(code) == 0

        while not is_code_unique:
            # code = str(random.randint(10000, 99999))
            code = ''.join(random.choices(string.ascii_letters + string.digits, k=num_digits))
            is_code_unique = existing_codes.count(code) == 0

        df.loc[email] = code # append the new code and email to the df
        df.to_csv(fname)

    # return the unique code
    return code

@app.route('/tabot/sendEmail')
# i guess the path would be /tabot/sendEmail, with a parameter argument for the email?
def sendEmail():
    email = request.args.get("email")
    access_code = generate_random_code(5, email)
    subject = "Pathways Planner | 2FA Code"
    sender = "furmancompsci@gmail.com"
    body = "Here is the code to access your saved plan: {} \n\n".format(access_code) + \
           "Please save this code in a safe place, as it is required to load your plan later.\n\n" + \
           "If you did not request this code, please ignore this email. \n\n" + \
           "Thank you for using the Pathways Planner!\n\n"
              
    recipients = [email]
    # make sure to encrypt this later
    password = "enter_valid_password_here"  # replace with your actual email password
    
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = ', '.join(recipients)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
        smtp_server.login(sender, password)
        smtp_server.sendmail(sender, recipients, msg.as_string())

    return jsonify({'email': email, 'code': access_code, 'message': 'Email sent successfully!'})