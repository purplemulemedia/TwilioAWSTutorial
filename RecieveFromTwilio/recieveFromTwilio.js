'use strict';

console.log('Loading function');

var AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  
     var sns = new AWS.SNS();
    sns.publish({
              Message: JSON.stringify(event),
              TopicArn: process.env.FROM_TWILIO_SNS
          }, function(err, data) {
          if (err) {
            console.log(err.stack);
            context.done('error', "ERROR Put SNS");  // ERROR with message
         }
         else {
             console.log(event);
             context.done(null,'Complete');
         }
    });

  };