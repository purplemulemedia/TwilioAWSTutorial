
'use strict';
console.log('Loading function');
var twilio = require('twilio');

exports.handler = (event, context, callback) => {
  var accountSid = process.env.ACCOUNT_SID; // Your Account SID from www.twilio.com/console
  var authToken = process.env.ACCOUNT_TOKEN; // Your Account SID from www.twilio.com/console
  var client = new twilio(accountSid, authToken);
    console.log('Received event:', JSON.stringify(event, null, 2));
    const message = event.Records[0].Sns.Message;
    var mytxt = JSON.parse(message);
    client.messages.create({
        body: mytxt.body,
        to: mytxt.to,  // Text this number
        from: mytxt.from, // From a valid Twilio number
        mediaUrl: mytxt.media
    })
    .then((message) => console.log(message.sid));


  callback(null, message);
};
