from glob import glob 
import pandas as pd 
# from flask import Flask, request, jsonify

passcode = "GK5bu"
email = "zoelwi4@furman.edu"

def test(passcode, email):

    codes_df = pd.read_csv('sessionCodes.csv', dtype={'email': str, 'code': str})
    codes_df.set_index('email', inplace=True)
    if codes_df.loc[email, 'code'] != passcode: 
        return {'error': 'Invalid passcode or email.'}

    # from glob import glob
    # from flask import jsonify

    csv_files = sorted(glob(f"*{email}*.csv"))[::-1]
    if not csv_files:
        return {'error': 'No plans found for the given email.'}

    relevant_file = csv_files[0]
    print(relevant_file)
    plan_df = pd.read_csv(relevant_file)
    print(plan_df)
    # plan_df.columns = ['label', 'col', 'val']
    plan_df.columns = ['table', 'credit', 'col', 'val', "semester"]
    json_data = plan_df.to_dict(orient='records')

    return json_data

test(passcode, email)