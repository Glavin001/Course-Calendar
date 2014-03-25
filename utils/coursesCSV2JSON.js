#!/usr/bin/env node

var fs = require('fs');
var csv = require('csv');
var path = require('path');
var program = require('commander');
var pkg = require('../package.json');


program
  .version(pkg.version)
  .option('-i, --input [csvFilePath]', 'Use this input CSV file.')
  .option('-o, --output [jsonFilePath]', 'Use this output JSON file.')
  .option('--pretty', 'Output should be pretty.')
  .parse(process.argv);

if (!(program.input && program.output))
{
    console.error('Error: CLI requires both input and output file paths.');
    process.exit();
    return;
}

//console.log(program.input, program.output);

//
var valueForField = function(key, val) {
    /*
    {
        "term": "201410",
        "CRN": "10003",
        "subject": "ACCT",
        "course": "2241.1A",
        "title": "Introductory Financial Acct",
        "cross listed": "",
        "linked(labs)": "",
        "credit value": "3.00",
        "actual": "57 ",
        "max seating": "60 ",
        "start date": " 4-Sep-2013",
        "end date": " 17-Dec-13",
        "start time": "1130",
        "end time": "1245",
        "days": "TR",
        "building": "LA",
        "room": "173",
        "faculty": "James Power"
    },
    */
    if (key === "term") {
        return parseInt(val);
    }
    else if (key === "CRN") {
        return parseInt(val);
    }
    else if (key === "course") {
        var d = {};
        var s = val.split('.');
        d['id'] = parseInt(s[0]);
        d['lab'] = s[1];
        return d;
    }
    else if (key === "credit value") {
        return parseFloat(val);
    }
    else if (key === "actual") {
        return parseInt(val);
    }
    else if (key === "max seating") {
        return parseInt(val);
    }
    else if (key === "start date") {
        return { "$date": new Date(val).getTime() };
    }
    else if (key === "end date") {
        return { "$date": new Date(val).getTime() };
    }
    else if (key === "start time") {
        var n = parseInt(val);
        var hours = parseInt(n/100);
        var minutes = n - hours*100;
        return {
            "hour": hours,
            "minute": minutes
        };
    }
    else if (key === "end time") {
        var n = parseInt(val);
        var hours = parseInt(n/100);
        var minutes = n - hours*100;
        return {
            "hour": hours,
            "minute": minutes
        };
    }
    else if (key === "days") {
        var s = val.split('');
        var dayFromDayStr = function(str) {
            //console.log(str);
            var day = "";
            if (str === 'M') // Monday
                day = "MO";
            if (str === 'T') // Tuesday
                day = "TU";
            if (str === 'W') // Wed
                day = "WE";
            if (str === 'R') // Thursday
                day = "TH";
            if (str === 'F') // Friday
                day = "FR";
            if (str === 'S') // Saturday
                day = "SA"
            if (str === 'SU') // Sunday
                day = "SU";
            return day;
        };
        return s.map(dayFromDayStr);
    }
    else if (key === "room") {
        return parseInt(val);
    }
    return val;
}

// Process CSV
csv()
.from.path(path.resolve(program.input), { delimiter: ',', escape: '"' })
.on('error', function(error){
  console.log(error.message);
})
.to.array(function(rows) {
    // Process Data
    var header = rows.shift();
    var data = [];
    // 
    for (var i=0, len=rows.length; i<len; i++) {
        var row = rows[i];
        var d = {};
        // 
        for (var j=0, jLen=header.length; j<jLen; j++) {
            var key = header[j];
            var nKey = key.split(' ').join('_');
            d[nKey] = valueForField(key, row[j]);
        }
        data.push(d);
    }
    // Save
    var str = "";
    if (program.pretty) {
        str = JSON.stringify(data, undefined, 4);
    } else {
        str = JSON.stringify(data);
    }
    fs.writeFile(path.resolve(program.output), str, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    });
});
