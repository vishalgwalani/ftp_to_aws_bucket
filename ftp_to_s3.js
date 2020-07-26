var anyfile = require(__dirname + '/..')();
var fs = require('fs')
var Client = require('ftp');
const async = require("async");
var config = {
    host: '', // your ftp host
    port: '', //ftp port number
    user: '', //username
    password: '' // password
};
const mainfromFilePath = ""; // your source location from ftp
const maintoFilePath = ""; // your destination location of s3 bucket

var c = new Client();
//timeout, auth, ...
c.on('error', function(err) {
    return callback(err, false);
});
c.on('ready', function() {
    // I have collected names of all the file inside folder in a txt file
    // because i only wanted to copy files which I don't have in my s3 bucket
    var presentInFtpAndNotInS3 = JSON.parse(fs.readFileSync('filesnotins3.txt'))    
    async.mapLimit(presentInFtpAndNotInS3, 1, function(file, callback) {        
        if (file == '.' || file == '..') { // ftp folder also lists . and .. as file
            return callback(null, false);
        } else {
            try {
                fromFile = mainfromFilePath + '/' + file;
                console.log('copy from ', fromFile)
                toFile = maintoFilePath + '/' + file;
                console.log('copy to ', toFile)
                anyfile.from(fromFile).to(toFile, function(err, res) {
                    console.log('res', res);
                    return callback(null, res);
                });
            } catch (err) {
                console.log('error', err);
                return callback(null, false);
            }
        }
    }, function(err, results) {
        console.log('results', results)
        c.end();
        process.exit();
    });
    });
c.connect(config);