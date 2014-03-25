// Wait for DOM to finish loading.
$(document).ready(function() {
    // Ready!
    console.log('READY!');

    var aggregate = function(collection, pipeline, options, callback) {
        $.get(
            "/api/v1/"+collection+"/aggregate",
            {
                "pipeline": JSON.stringify(pipeline || []),
                "options": JSON.stringify(options || {})
            }
        ).done(function(results) {
            return callback && callback(results);
        });
    };

    // Update on tab change
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var $target = $(e.target);
        var $svg = $($target.attr('href')+' svg');
        var chart = $svg.data('chart');
        //console.log(e, $target, $svg, chart);
        chart.update();
    });

    //
    Handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context);
    });
    Handlebars.registerHelper('json-pretty', function(context) {
        return JSON.stringify(context, undefined, 4);
    });
    
    var render = function(templateSelector, outputSelector, context) {
        var $template = $(templateSelector);
        var source   = $template.html();
        var template = Handlebars.compile(source);
        
        //var context = {title: "My New Post", body: "This is my first post!"}
        var html    = template(context);
        $(outputSelector).html(html);

    };

    var $search = $('#course-search');
    var $searchContainer = $('.search-container');

    function processSearch() {
        var search = $search.val();
        //console.log(search);
        var old = parseInt( $searchContainer.attr('data-pending') );
        $searchContainer.attr('data-pending', ++old);

        aggregate(
            "courses",
            [
                
                {
                    "$project": {
                        // Include
                        "title": 1,
                        "subject": 1,
                        "course": 1,
                        "faculty": 1,
                        "start date": 1,
                        "end date": 1,
                        "days": 1,
                        
                        // Additional
                        "fullCourse": {
                            "$concat": [
                                "$subject",
                                " ",
                                {
                                    "$substr": [ "$course.id", 0, 4 ]
                                },
                                ".",
                                "$course.lab"
                            ]
                        }

                    }
                },
                
                {
                    "$match": {
                         "$or": [
                            {
                                "title": {
                                    "$regex": ".*"+search+".*",
                                    "$options": '-i'
                                }
                            },
                            {
                                "subject": {
                                    "$regex": "^"+search+".*",
                                    "$options": '-i'
                                }
                            },
                            {
                                "course.id": {
                                    "$regex": "^"+search+".*",
                                    "$options": '-i'
                                }
                            },
                            {
                                "faculty": {
                                    "$regex": ".*"+search+".*",
                                    "$options": '-i'
                                }
                            },
                            {
                                "fullCourse": {
                                    "$regex": "^"+search+".*",
                                    "$options": '-i'
                                }
                            }
                            
                        ]
                    }
                },
                { "$limit": 10 },
                { "$sort": { "actual": -1, "max seating": -1 }}
                
            ],
            {},
            function(data) {
                render("#entry-template", "#output", data);
                var old = parseInt( $searchContainer.attr('data-pending') );
                if (--old <= 0) {
                    $searchContainer.attr('data-pending', 0);
                }
                else {
                    $searchContainer.attr('data-pending', --old);
                }
        });
    };

    var changeTimer;
    //$search.change(function() {
    $search.on('keydown', function() {
        clearTimeout(changeTimer);
        changeTimer = setTimeout(processSearch, 1000);
    });
    processSearch();


    var graphDiscreteBarChart = function(selector, title, collection, pipeline, options) {

        // Aggretation Framework query
        aggregate(collection, 
            pipeline,
            options,
            function(results) {
                var data = [{
                    key: title,
                    values: results
                }];
                console.log(data);

                // Discrete Bar Graph
                nv.addGraph(function() {
                  var chart = nv.models.discreteBarChart()
                      .x(function(d) { return d.label })    //Specify the data accessors.
                      .y(function(d) { return d.value })
                      .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                      .tooltips(true)        //Don't show tooltips
                      .showValues(true)       //...instead, show the bar value right on top of each bar.
                      .transitionDuration(350)
                      ;

                  d3.select(selector)
                      .datum(data)
                      .call(chart);

                  nv.utils.windowResize(chart.update);

                    $(selector).data('chart', chart);

                  return chart;
                });
        });

    };


    var graphPieChart = function(selector, title, collection, pipeline, options) {

        // Aggretation Framework query
        aggregate(collection, 
            pipeline,
            options,
            function(results) {
                var data = results;
                /*
                var data = [{
                    key: title,
                    values: results
                }];
                */
                console.log(data);

                // Pie Chart Graph
                //Regular pie chart example
                nv.addGraph(function() {
                  var chart = nv.models.pieChart()
                      .x(function(d) { return d.label })
                      .y(function(d) { return d.value })
                      .showLabels(true);

                    d3.select(selector)
                        .datum(data)
                        .transition().duration(350)
                        .call(chart);

                    $(selector).data('chart', chart);

                  return chart;
                });

        });

    };

    // Graph it!
    graphPieChart(
        "#charts svg#stats1",
        "Stats",
        "courses",
        [
            {
                "$project": {
                    "_id": "$subject",
                    /*
                    {
                        "$concat": [
                            "$subject",
                            " ",
                            {
                                "$substr": [
                                    "$course.id",
                                    0, 
                                    4
                                ]
                            }
                        ]
                    },
                    */
                    "value": "$actual"
                }
            },
            { 
                "$group": {
                    "_id": "$_id",
                    "count": {
                        "$sum": "$value"
                    }
                } 
            },
            { 
                "$project": {
                    "_id": 0,
                    "label": "$_id",
                    "value": "$count"
                }
            },
            {
                "$limit": 100
            },
            {
                "$sort": {
                    "value": 1
                }
            }
        ],
        {}
    );

    name = "pawan";
    graphDiscreteBarChart(
        "#charts svg#stats2",
        "Stats",
        "courses",
        [
            {
                "$project": {
                    "_id": "$faculty",
                    "value": "$actual"
                }
            },
            {
                "$match": {
                    "_id": {
                        "$regex": ".*"+name+".*",
                        "$options": '-i'
                    }
                }
            },
            { 
                "$group": {
                    "_id": "$_id",
                    "count": {
                        "$sum": "$value"
                    }
                } 
            },
            { 
                "$project": {
                    "_id": 0,
                    "label": "$_id",
                    "value": "$count"
                }
            },
            {
                "$limit": 100
            },
            {
                "$sort": {
                    "value": 1
                }
            }
        ],
        {}
    );

    graphDiscreteBarChart(
        "#charts svg#stats3",
        "Stats",
        "courses",
        [
            {
                "$project": {
                    "_id": "$subject",
                    "faculty": "$faculty",
                    "value": "$actual"
                }
            },
            {
                "$match": {
                    "_id": "CSCI"
                }
            },
            { 
                "$group": {
                    "_id": "$faculty",
                    "count": {
                        "$sum": "$value"
                    }
                } 
            },
            { 
                "$project": {
                    "_id": 0,
                    "label": "$_id",
                    "value": "$count"
                }
            },
            {
                "$limit": 100
            },
            {
                "$sort": {
                    "value": 1
                }
            }
        ],
        {}
    );


    graphDiscreteBarChart(
        "#charts svg#stats4",
        "Stats",
        "courses",
        [
            {
                "$project": {
                    "_id": "$subject",
                    "faculty": "$faculty",
                    "value": "$actual"
                }
            },
            { 
                "$group": {
                    "_id": "$faculty",
                    "count": {
                        "$sum": "$value"
                    }
                } 
            },
            { 
                "$project": {
                    "_id": 0,
                    "label": "$_id",
                    "value": "$count"
                }
            },
            {
                "$limit": 10
            },
            {
                "$sort": {
                    "value": 1
                }
            }
        ],
        {}
    );

});
