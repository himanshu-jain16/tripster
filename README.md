# aws-lex-lambda-slack-bot-example

Tripster SlackBot 
==================

Tripster is a chat bot that helps a group decide hangout destinations.
We 

Moviepedia Bot is a chat bot that helps you query information about a
movie of your choice. We will be using AWS Lambda. This bot has
been written in NodeJS and utilizes.

Steps to build the Tripster Bot 
---------------------------------

Step 1: Create the AWS Lambda function 
--------------------------------------

Instructions: 
-------------

Zip the entire repo that you downloaded. Note compress the files together not
the folder. Now, go to AWS Lambda console. Create a new lambda function.
Select "Blank Fuction" as a blueprint. in "Configure triggers" section
press next. Now configure your lambda function.

##### Configure Function: 

      1. Name your lambda function : tripster
      2. Add Description - A trip planning function that uses Google Places API
      3. Runtime - Node.js 6.10
      4. Code Entry - Upload the zip you downloaded
      5. Handler Section - index.findPlaces
      6. Select an existing role -  lambda_basic_execution
      4. Set time to 5 minutes


Step 2: Creating your Bot 
-------------------------


#### 1. Create Amazon Lex Bot 

Go to Amazon Lex console on create your Amazon lex bot page. Select
custom app and provide the following information, then choose Create.

###### Remember to use a unique name for your bot 

##### Provide The Following Information: 

      1. Bot Name: Tripster
      2. Choose an output voice - Joey
      3. Set Session Timeout - 5 mins
      4. Add AMazon lex basic role to your Bot app - AWSServiceRoleForLexBots

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/CreateBot.png)

Step 2: Creating your Bot Conversations 
---------------------------------------
The lex_bot_def file will defines all the details about the Lex bot including the intents and the slots.
Using that you can define the Lex bot.

Step 3: Configure Bot for Slack 
---------------------------------------

