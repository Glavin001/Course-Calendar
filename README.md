Course-Calendar
===============

> Service that serves iCal files from user's selected courses.

-----

## Easy-Setup (and for Updating)

Copy and paste the below to install the app, load the database, and start the app:

```bash
# Install
npm install
bower install
# Database
node utils/coursesCSV2JSON.js -i data/courses.csv -o data/output.json
mongo smu --eval "db.dropDatabase()"
mongoimport --db smu -c courses --jsonArray < data/output.json
# Start app
node index.js
```

See below for explaination.

-----

## Installation

After cloning this repository:

```bash
npm install
bower install
```

### Import the course data

```bash
mongoimport --db smu -c courses data/coursesExport.json
```

If successful, the console will display:

> imported 2537 objects

## Usage

```bash
node index.js
```

## Utilities

### Course CSV to JSON

```bash
node utils/coursesCSV2JSON.js -i data/courses.csv -o data/output.json --pretty
```

#### Importing from JSON output file

```bash
mongoimport --db smu -c courses --jsonArray < data/output.json
```

 > Note: Be sure to clear your collection `courses` in database `smu` before importing, as this will insert duplicates.
