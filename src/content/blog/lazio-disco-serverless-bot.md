---
title: Serverless Scraper with AWS SAM & DynamoDB
description: Build a serverless web-scraping stack on AWS using SAM, Lambda, and DynamoDB
date: 2025-07-06
duration: 7min
tags: [AWS, serverless, web-scraping, lambda, DynamoDB, EventBridge]
---
![Lazio-Serverless Diagram](https://github.com/user-attachments/assets/a34e77c0-17e4-445b-9ea1-281b02c33b82)
> Lazio Serverless Architecture Diagram

## Table of Contents
1. [Context](#context)
2. [Architecture Overview](#architecture-overview)
3. [Project Setup with AWS SAM](#install-and-initialize-aws-sam)
4. [Defining Resources in template.yaml](#define-resources-in-templateyaml)
5. [Scraping Python Code](#the-scraping-python-code-lazioapppy)
6. [Build, Deploy, and Test](#build-deploy-and-test)
7. [References](#references)

### **Context**

Before this project, I manually checked the [Lazio Disco](https://laziodisco.it/) website (which lists scholarships for students in Rome) for updates, a tedious process. I first automated it with a scraper on an EC2 instance, logging updates and sending Telegram notifications. Later, I rebuilt it using AWS SAM: now, the scraper runs as a Lambda function, stores results in DynamoDB, and is triggered automatically by EventBridge. This serverless setup is much more efficient and easier to maintain.

---

### Architecture Overview

- `Trigger`: An AWS EventBridge (formerly CloudWatch Events) rule acts as a scheduler, triggering the workflow every 30 minutes. This eliminates the need for manual intervention or a constantly running server.

- `Compute`:
The Lambda function **LazioBotFunction** is responsible for:
    - **Fetching Credentials**: Securely retrieving login credentials from AWS Secrets Manager.
    - **Web Scraping**: Logging into the LazioDisco website and fetching the target message page using Python’s requests and BeautifulSoup libraries.
    - **Change Detection**: Parsing the HTML content to detect new or updated messages.
    - **Logging**: Recording the outcome of each run (update found, no update, or error) for monitoring and auditing.

- `Storage`: Store output in DynamoDB.

- `Notification`: Send the notifications to the users using [Telegram api](https://core.telegram.org/)

---

### Install and Initialize AWS SAM

AWS [SAM](https://github.com/aws/serverless-application-model) (Serverless Application Model) is an open-source framework that makes it easy to define, build, and deploy serverless applications on AWS using simple YAML templates. It streamlines local development, testing, and deployment of resources like Lambda and DynamoDB.

We use SAM here to quickly set up and manage all the serverless components for our scraper in a repeatable, efficient way.

```bash
sam init --runtime python3.9 --name serverless-scraper
cd serverless-scraper
```

---

### Define Resources in `template.yaml`

- Lambda function `LazioBotFunction`
  -  IAM roles granting Lambda read/write access
  - Events: schedule or API Gateway trigger
  - Log table name as env

- DynamoDB table  `LazioDiscoLogs`

Example snippet:

```yaml
# ...
Globals:
  Function:
    Timeout: 10
    MemorySize: 128

Resources:
  LazioBotFunction:
    Type: AWS::Serverless::Function
    Properties:
      # ...
      Events:
        HelloWorld:
          Type: ScheduleV2
          Properties:
            ScheduleExpression: rate(30 minutes)
    Policies:
    # ...
    Environment:
      Variables:
        LOG_TABLE_NAME: !Ref LazioDiscoLogs

  # properties for the table
  LazioDiscoLogs:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: LazioDiscoLogs
      # ...
```

See the complete [template.yaml](https://github.com/gambhirsharma/lazio-disco-bot/blob/main/lazio-serverless/template.yaml)

---

#### The Scraping Python Code `lazio/app.py`

Now, let’s look at the core Python code running in our Lambda function. It logs into the Lazio Disco site, checks for updates, and sends notifications if anything changes.

**Secure Credential Handling**

Since the site requires login, we use AWS Secrets Manager to securely fetch credentials instead of hardcoding them. The get_secret() function handles this process.

```python
def get_secret():
    secret_name = "Lazio_disco_bot"
    region_name = "eu-south-1"
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        raise e

    secret = get_secret_value_response['SecretString']
    return secret

secret = json.loads(get_secret())
```

`boto3` Integration: We use the boto3 library, the AWS SDK for Python, to interact with AWS services.

`secretsmanager Client`: A client is created for the secretsmanager service in our specified region_name.

> Never hardcode secrets in your code.

**Logging and Notifications**

```python
def send_message(mess):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage?chat_id={chat_id}&text={mess}"
    r = requests.get(url)
    # print(r.json())

def save_log(status, timestamp):

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('LazioDiscoLogs')

    if not timestamp:
        timestamp = datetime.utcnow().isoformat()

    try:
        table.put_item(
            Item={
                'LogId': f"log-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                'Status': status,
                'Timestamp': timestamp
            }
        )
        print("Log saved successfully.")
    except Exception as e:
        print(f"Error saving log: {e}")
```

To keep track of our scraper's activity and notify us of any changes, we have two helper functions:

- `send_message(mess):` This function uses the Telegram Bot API to send messages directly to a specified chat. If an update is detected or an error occurs, this function will send a notification.
- `save_log(status, timestamp)`: This is crucial for monitoring. It interacts with our DynamoDB table (LazioDiscoLogs) to store a record of each run. It logs the Status (e.g., 'New Update!!', 'No Update', 'Error') and the Timestamp of when the event occurred. This provides a persistent history of our scraper's operations.

**The Core Logic `lambda_handler`**

The lambda_handler function is the entry point for our AWS Lambda. When EventBridge triggers our Lambda, this function executes the scraping logic.

```python
def lambda_handler(event, context):
    with requests.session() as s:
        try:
            # 1. Login to the website
            s.post(login_url, data=payload)

            # 2. Access the target message page
            m = s.get(message_url)
            message_page = BeautifulSoup(m.content, 'html.parser')

            # 3. Extract and compare content
            card_titles = message_page.find_all("h5", class_="card-title", recursive=True)
            card_texts = message_page.find_all("p", class_="card-text")

            # Iterate through all detected cards to check for new information
            for title, text in zip(card_titles, card_texts):
                card_title_text = title.get_text(strip=True)
                card_text_content = text.get_text(strip=True)

                # Check if the content deviates from known "fixed" content
                if card_title_text != fixed_card_title or fixed_card_text not in card_text_content:
                    print("Update detected!")
                    status_message = 'New Update!!'
                    save_log(status_message, None)
                    send_message("Check website there is some update!!")
                    return {
                        'statusCode': 200,
                        'body': status_message,
                    }
            else:
                # If loop completes without finding an update
                print("No update detected.")
                status_message = 'No Update'
                save_log(status_message, None)
                return {
                    'statusCode': 200,
                    'body': status_message
                }

        except Exception as e:
            # Handle any unexpected errors during the scraping process
            print(f"An error occurred: {e}")
            send_message("Error in bot")
            save_log("Error", None)
            return {
                'statusCode': 500,
                'body': 'An error occurred during scraping.'
            }
```

See the complete [lazio/app.py](https://github.com/gambhirsharma/lazio-disco-bot/blob/main/lazio-serverless/lazio/app.py)

---

####  Build, Deploy, and Test

**Install the Prerequisites**
- **AWS CLI**: For configuring your AWS credentials.
- **AWS SAM CLI**: For building and managing your serverless app.
- **Docker** (optional, but recommended): For local testing that closely matches the AWS Lambda environment.

```bash
# validate you template.yaml
sam validate --lint

# build your sam project
sam build
```

To test the function is working correctly you can use invoke the serverless function locally by `sam local invoke` command

```bash
aws lambda invoke --endpoint-url http://127.0.0.1:3001 --function-name LazioBotFunction out.json
```

Before deploying your code to AWS, make sure you have the AWS CLI installed and configure your user with the appropriate IAM roles.
While you can use a .env file to store credentials for local development, always use aws configure to set up your AWS credentials securely for deployment.
The best way to do this is using `.env` to store the credentials and then source them according to the use case.

- You need to `sam build` for every change you make in the code.
- check if `template.yaml` is correct by using `sam validate --lint`
- `sam local` to test everything locally
- `sam local invoke` to test a single function locally
- `sam local start-lambda` to deploy the code to AWS

- Use this command to invoke the function when it's running locally using `sam local start-lambda`:
```bash
aws lambda invoke --endpoint-url http://127.0.0.1:3001 --function-name LazioBotFunction out.json
```

And, now you have tested you code locally and satisfied by the outputs then you can deploy it to AWS infra using

```bash
# --guided if it's your first time, this will prompt you for stack name, region, and other settings.
sam deploy --guided

sam deploy
```

#### References

- Project code at [gambhirsharma/lazio-disco-bot](https://github.com/gambhirsharma/lazio-disco-bot)

- AWS SAM  [docs](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

- AWS SAM does not support the .env convention. Read this [blog](https://blowstack.com/blog/how-to-use-environmental-variables-in-aws-sam) for more info

Thanks for reading, Ciao Ciao
