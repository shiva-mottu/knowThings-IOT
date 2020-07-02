var express = require('express');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
const hostname = '127.0.0.1';
const port = 3000; //Port No
var app = express();

var mongoUtil = require( './mongoUtil');
mongoUtil.connectToServer( function( err, client ) {
    if (err) console.log(err);
});
const collectionName = "SensorsReadings";

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.get('/services/readings', function (req, res) {
    var sensorId = req.query.sensorId;
    var since = Number(req.query.since);
    var until = Number(req.query.until);
   
    var query = { sensorId: sensorId, "time" : { "$gte" : since, "$lte" : until } }
    var db = mongoUtil.getDb();
    db.collection(collectionName).find(query).toArray(function(err, result) {
        if (err) throw err;
        res.send(result)
    });

})


app.put('/services/data', function (req, res) {
      var readings = req.body
      if(readings.sensorId == "" || readings.time == ""){
        res.status(400)
        res.send("Check the object once! inproper data...");
      }else{
        var db = mongoUtil.getDb();
        db.collection(collectionName).findOne({sensorId : readings.sensorId, time : readings.time}, function(err, result) {
            if (err) throw err;
            if(result == null){
                db.collection(collectionName).insertOne(readings, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");

                    if(readings.value > 20){
                        sendEmail(readings);
                    }
                });
                res.status(204);
                res.send("'Successfully data stored into db'");
            }else{
                res.status(409)
                res.send("Duplicate Data exist! check once..");
            }
        });
      }
      
})

function sendEmail(readings){
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});

var mailOptions = {
  from: 'youremail@gmail.com',
  to: 'myfriend@yahoo.com',
  subject: 'High Alert',
  text: 'High Alert! check Sensor once '+"Sensor id: "+readings.sensorId+" sensor reading : "+readings.value
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}

app.listen(port, () => console.log(`Server running at http://${hostname}:${port}/`))