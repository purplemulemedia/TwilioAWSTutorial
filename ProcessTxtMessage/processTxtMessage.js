'use strict';

var AWS = require('aws-sdk');
let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();
var sns = new AWS.SNS();
var tableName = process.env.TWILIO_APP_TABLENAME;
var SNSsendMessageQueue = process.env.TO_TWILIO_SNS;
var messageToSend = ", when you get sad, you run straight ahead and you keep running forward, no matter what. There are people in your life who are gonna try to hold you back, slow you down, but you don't let them. Don't you stop running and don't you ever look behind you. There's nothing for you behind you. All that exists is what's ahead.";

console.log('Loading function');

exports.handler = (event, context, callback) => {
   
    var toTheSNS = function (snsQueue, object) {
        sns.publish({
            Message: JSON.stringify(object),
            TopicArn: snsQueue
        }, function (err, data) {
            if (err) {
                console.log(err.stack);
            } else {
            }
        });

    };

//clears empty values because Dynamo does not like them on save :/
 var removeEmptyStringElements = function (obj) {
      for (var prop in obj) {
        if (typeof obj[prop] === 'object') {
          removeEmptyStringElements(obj[prop]);
        } else if(obj[prop] === '') {
          delete obj[prop];
        }
      }
      return obj;
    }


    var userCallback = function (err, data) {
        if (Object.keys(data).length === 0) {
            mytxt.data.messageType = "signup";
            var cleanInsert = removeEmptyStringElements(mytxt.data);
            saveUser(cleanInsert
            , function (err, data) {
                if (err) {
                    console.log(err);
                } 
                else {
                    var sendme = {};
                    sendme.from = mytxt.data.To;
                    sendme.to = mytxt.data.From;
                    sendme.body = "Welcome! Please reply with your name";
                    toTheSNS(SNSsendMessageQueue, sendme);
                }
            });
        } else {
            var previousStatus = data.Item.messageType
            if (previousStatus === 'signup') {
                mytxt.data.messageType = "savingname";
                mytxt.data.Name = mytxt.data.Body;
                var cleanInsert = removeEmptyStringElements(mytxt.data);
            saveUser(cleanInsert, function (err, data) {
                    if (err) {
                        console.error(err.stack);
                    } 
                    else {
                        var sendme = {};
                        sendme.from = mytxt.data.To;
                        sendme.to = mytxt.data.From;
                        sendme.body =  mytxt.data.Name + messageToSend;
                        toTheSNS(SNSsendMessageQueue, sendme);
                    }
                });
            } else {
                var sendme = {};
                sendme.from = data.Item.To;
                sendme.to = data.Item.From;
                sendme.body =  data.Item.Name + messageToSend;
                toTheSNS(SNSsendMessageQueue, sendme);
            }
        }
    };
    //saves user to the table
    var saveUser = function (item, thiscall) {
        var payload = {};
        payload.TableName = tableName;

        payload.Item = item;
        dynamo.putItem(payload, thiscall);
    }
    // gets user from the table using phone as the key
    var getUser = function (userphone) {
        var payload = {};
        payload.TableName = tableName;
        payload.Key = {
            From: userphone
        };
        dynamo.getItem(payload, userCallback);
    }
    const message = event.Records[0].Sns.Message;
    var mytxt = JSON.parse(message);
    var phone = mytxt.data.From;
    var phoneTo = mytxt.data.To;
    var theMessage = mytxt.data.Body;
    getUser(phone);
};