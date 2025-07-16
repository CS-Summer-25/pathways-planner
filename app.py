# This is to be imported into the server when its available.
# requests and @app are assumed to be imported from flask, i think?
from glob import glob
from flask import jsonify
import smtplib
from email.mime.text import MIMEText

@app.route('/tabot/sendEmail')
# i guess the path would be /tabot/sendEmail, with a parameter argument for the email?
def sendEmail():
    subject = "Email Subject"
    body = "This is the body of the text message"
    


    def send_email(subject, body, sender, recipients, password):
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = ', '.join(recipients)
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
          smtp_server.login(sender, password)
          smtp_server.sendmail(sender, recipients, msg.as_string())
        print("Message sent!")


    send_email(subject, body, sender, recipients, password)

@app.route('/tabot/savePlan')
def savePlan():
    # Get params
    plan = request.args.get('plan')
    password = request.args.get('password')
    semester = request.args.get('semester')

    courses = plan.split(";")
    f = open(password+"_"+semester+".csv", "w")
    for course in courses: 
        if course == "":
            continue
        ger, sem, title = course.split('_')
        f.write(ger+","+sem+","+title+"\n")
    f.close()
    return "<h2>"+plan+"</h2><h3>"+password+"</h3>"

@app.route('/tabot/loadPlan')
def loadPlan():
    # Get params
    password = request.args.get('password')

    # from glob import glob
    # from flask import jsonify
    csv_files = glob('*.csv')
    relevant_file = [f for f in csv_files if f.startswith(password+"_")][0]

    f = open(relevant_file)
    courses = f.readlines()
    f.close()

    # convert courses to json
    courses_json = []
    for course in courses:
        if course.strip() == "":
            continue
        ger, sem, title = course.strip().split(',')
        courses_json.append({
            'ger': ger,
            'sem': sem,
            'title': title
        })

    return jsonify(courses_json)