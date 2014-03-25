Course-Calendar
===============

> Service that serves iCal files from user's selected courses.

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
node utils/coursesCSV2JSON.js -i data/Timetable\ extract\ for\ Mobile\ Apps-v2.csv -o data/output.json --pretty
```

#### Importing from JSON output file

```bash
 mongoimport --db smu -c courses --jsonArray < data/output.json
 ```

 > Note: Be sure to clear your collection `courses` in database `smu` before importing, as this will insert duplicates.
