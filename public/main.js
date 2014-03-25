// Wait for DOM to finish loading.
$(document).ready(function() {
    // Ready!
    console.log('READY!');

    // Update on tab change
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var $target = $(e.target);
        var $svg = $($target.attr('href')+' svg');
        var chart = $svg.data('chart');
        //console.log(e, $target, $svg, chart);
        chart.update();
    });


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
