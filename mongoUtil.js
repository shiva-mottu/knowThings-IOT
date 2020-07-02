const MongoClient = require( 'mongodb' ).MongoClient;
const url = "mongodb://localhost:27017";

const dbName = "IOTDb";
const collectionName = "SensorsReadings";

var _db;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( url,  { useNewUrlParser: true,useUnifiedTopology: true }, function( err, client ) {
      _db  = client.db(dbName);
      return callback( err );
    } );
  },

  createCollection : function( callback ) {
    _db.createCollection(collectionName, function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
      });
   },

  getDb: function() {
    return _db;
  }
};