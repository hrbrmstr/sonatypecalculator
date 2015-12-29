//---------------------------------------------------------
//  formatters for numeric display

var comma = d3.format("0,000");
var currency = d3.format("$0,000");
var formatPercent = d3.format("p");
var percent = function(x) { return formatPercent(Math.round(x)); };
var formatNumber = d3.format(",.0f");
var format = function(d) { return formatNumber(d) + " TWh"; };

//---------------------------------------------------------
// enables moving of selected elements to the "front" of the display stack

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

//---------------------------------------------------------
// simplifies cleaning values from fields

jQuery.fn.extend({
  cleanval: function() {
    return(this.val().replace(/[ %\$,]/, ""));
  },
});

//---------------------------------------------------------
// colors we use

var RED    = "#e31a1c", GREEN     = "#33a02c", BLACK        = "black" , 
    YELLOW = "#ffed6f", PURPLE    = "#762a83", LIGHT_PURPLE = "#cab2d6",
    WHITE  = "#ffffff", BROWN     = "#b15928", LIC_RED      = RED,
    ORANGE = "#ff7f00", FILL_LEFT = "#a6cee3" ;

//---------------------------------------------------------
// additional tools to help make random values

function range(lowEnd, highEnd){
  var arr = [],
  c = highEnd - lowEnd + 1;
  while ( c-- ) { arr[c] = highEnd-- ; }
  return arr;
}

Math.seed = function(s, m) {
  if (arguments.length == 1) m = 10000;
  return function() {
    s = Math.sin(s) * m;
    return s - Math.floor(s);
  };
};

Array.prototype.shuffle = function (m) {
  if (arguments.length === 0) m = 10000 ;
  var rnd = Math.seed(this.length, m);
  var k, t, len = this.length;
  if (len < 2) { return this; }
  while (len) {
    k = Math.floor(rnd() * len--);
    t = this[k];
    while (k < len) { this[k] = this[++k]; }
    this[k] = t;
  }
  return this;
};

//---------------------------------------------------------
// chart globals

var margin = {top: 1, right: 1, bottom: 6, left: 1},
    width = 500 - margin.left - margin.right,
    height = 630 - margin.top - margin.bottom,
    color = d3.scale.category20();

var oldrl = -1 ;
var oldfs = -1 ;
var oldkv = -1 ;
var olddb = -1 ;

var eyeon = false;
var fireon = false;

var nsupp = 0 ;
var nvers = 1 ;
var napps = 0 ;
var repovulns = 0 ;
var repopct = 0 ;
var ncomps = 1 ;

var w = 500, h = 500, r = 400,
    x = d3.scale.linear().range([0, r]),
    x1 = d3.scale.linear().range([0, r]),
    y = d3.scale.linear().range([0, r]),
    y1 = d3.scale.linear().range([0, r]),
    noderight, nodeleft,
    rootright, rootleft;

var visleft, visright ;
var vis2 = d3.selectAll("#vis2");
var vis4 = d3.selectAll("#vis4");

var old_repopct = -1 ;
var old_nsupp = -1;
var old_nvers = -1 ;
var old_perapp = -1 ;

var old_napps = -1;
var old_pct_vuln = -1;
var old_ncomps = -1;
var old_lic = -1;
var l_old_lic = -1 ;

//---------------------------------------------------------
// pop-up dialog when mouse clicks on one of three regions

$( "#impact_dialog").dialog({
  modal: true,  
  width:600,  
  height:500,
  autoOpen: false,

  show: {
    effect: "blind",
    duration: 500
  },
  hide: {
    effect: "explode",
    duration: 500
  },
    create: function() {
      $(".ui-dialog").find(".ui-dialog-titlebar").css({
        'background-image': 'none',
        'background-color': 'white',
        'border': 'none'
      });
    }
});

//---------------------------------------------------------
// click/change handlers

function do_comp_panel_click() {
  $('#leftnavmenu').offcanvas('hide'); 
  $("#impact_dialog").html($("#comp_panel").html()).css("font-size", "32pt").css("line-height", "36pt");
  $("#impact_dialog").dialog("open");
}

function do_impact_panel_click() {
  $('#rightnavmenu').offcanvas('hide'); 
  $("#impact_dialog").html($("#impact_panel").html()).css("font-size", "18pt").css("line-height", "20pt");
  $("#impact_dialog").dialog("open");
}

function do_impact_click() {
  $("#impact_dialog").html($("#impact_text").html().replace(/;/g, "<br/>").replace(", requiring", "<br/><br/>Requiring").replace(" == ", "<br/><br/>Cost: "));
  $("#impact_dialog").dialog("open");
}

function do_sv_click() {
  $("#impact_dialog").html($("#supp_text").html().replace(/;/g, "<br/>").replace("in use.", "<br/>in use").replace("versions", "versions<br/><br/>").replace("undesirable", "undesirable<br/><br/>"));
  $("#impact_dialog").dialog("open");
}

function do_ni_click() {
  $("#impact_dialog").html($("#notinclude").html());
  $("#impact_dialog").dialog("open");
}

function do_aa_click() {
  $("#impact_dialog").html($("#app_text").html().replace(/;/g, "<br/>").replace("in use", "<br/>in use<br/><br/>").replace("undesirable", "undesirable<br/><br/>"));
  $("#impact_dialog").dialog("open");
}

$("#traceable").slider({
  orientation: "vertical",
  range: "min",
  min: 0,
  max: 100,
  value: 100,
  slide: function( event, ui ) { }
});

$("#calcmeleft").on('click', function() { 
  $('#leftnavmenu').offcanvas('show');
  update_panel_calc();
});

$("#calcmeright").on('click', function() { 
  $('#rightnavmenu').offcanvas('show');
  update_panel_calc();
});

$("#application_panel").on('change paste', function() { update_panel_calc() });
$("#suppliers_panel").on(  'change', function() { update_panel_calc() });
$("#versions_panel").on(   'change', function() { update_panel_calc() });
$("#repovulns_panel").on(  'change', function() { update_panel_calc() });
$("#repolic_panel").on(    'change', function() { update_panel_calc() });
$("#distributed_panel").on('change', function() { update_panel_calc() });

$("#perapp_panel").on(     'change', function() { update_panel_calc() });
$("#knownvuln_panel").on(  'change', function() { update_panel_calc() });
$("#knownlic_panel").on(   'change', function() { update_panel_calc() });
$("#goingtofix_panel").on( 'change', function() { update_panel_calc() });
$("#costperhour_panel").on('change', function() { update_panel_calc() });
$("#costperlic_panel").on( 'change', function() { update_panel_calc() });
$("#manhours_panel").on(   'change', function() { update_panel_calc() });

$("#suppliers").on(  'change paste', function() { update_sv() });
$("#versions").on(  ' change paste', function() { update_sv() });
$("#repovulns").on( ' change paste', function() { update_sv() });

$("#application").on('change paste', function() { olddb = -1 ;   update_aa() });
$("#perapp").on(     'change paste', function() { olddb = -1 ;   update_aa() });
$("#knownvuln").on(  'change paste', function() { reset_icons(); update_aa() });
$("#knownlic").on(   'change paste', function() { reset_icons(); update_aa() });

$("#goingtofix").on( 'change paste', function() { update_calcs() });
$("#costperhour").on('change paste', function() { update_calcs() });
$("#manhours").on(   'change paste', function() { update_calcs() });

$("#eye").hover( function() { eye("in") ;  }, function() { eye("out") ;  });
$("#eye").click( function() { eye("click") ;  });

$("input[name='suppliers']"  ).TouchSpin({ verticalbuttons: true, max: 1000, mousewheel: false });
$("input[name='versions']"   ).TouchSpin({ verticalbuttons: true, max: 30,   mousewheel: false });
$("input[name='application']").TouchSpin({ verticalbuttons: true, max: 1000, mousewheel: false });
$("input[name='perapp']"     ).TouchSpin({ verticalbuttons: true, max: 200,  mousewheel: false });
$("input[name='manhours']"   ).TouchSpin({ verticalbuttons: true, max: 100,  mousewheel: false });
$("input[name='knownvuln']"  ).TouchSpin({ verticalbuttons: true, max: 100,  mousewheel: false });

$("input[name='repovulns']").TouchSpin({
  verticalbuttons: true,
  min: 0,
  mousewheel: false,
  max: 100,
  step: 1,
  decimals: 0,
  boostat: 5,
  maxboostedstep: 10
});

$("input[name='knownlic']").TouchSpin({
  verticalbuttons: true,
  min: 0,
  max: 100,
  step: 1,
  mousewheel: false,
  decimals: 0,
  boostat: 5,
  maxboostedstep: 10
});

$("input[name='goingtofix']").TouchSpin({
  verticalbuttons: true,
  min: 0,
  max: 100,
  step: 1,
  decimals: 0,
  mousewheel: false,
  boostat: 5,
  maxboostedstep: 10
});

$("input[name='costperhour']").TouchSpin({
  verticalbuttons: true,
  min: 0,
  max: 500,
  step: 1,
  decimals: 0,
  mousewheel: false,
  boostat: 5,
  postfix: '$',
  maxboostedstep: 10
});

//---------------------------------------------------------
// left circle functions

function update_left() {

  x.range([0, r]);
  y.range([0, r]);

  var pack = d3.layout.pack()
      .size([r, r])
      .value(function(d) { return d.size; })

  if ((old_napps != napps) |
      (l_old_lic != (+$("#knownlic").val())) |
      (old_nsupp != (+$("#suppliers").val())) |
      (old_nvers != (+$("#versions").val())) |
      (old_perapp != (+$("#perapp").val()))){ 

    old_napps = napps ;
    old_nsupp = nsupp ;
    l_old_lic = (+$("#knownlic").val()) ;
    old_perapp = (+$("#perapp").val()) ;
    old_repopct = (+$("#repovulns").val()) ;

    var pct_repovuln = (+$("#repovulns").val()) / 100;

    var n = Math.round(pct_repovuln * nvers) ;

    var supp_rng = range(0, Math.floor(nsupp));
    supp_rng = supp_rng.shuffle(20000);
    var supp_items = supp_rng.slice(0, (+$("#perapp").val()));

    var lpct = Math.floor((l_old_lic/100) * nsupp);
    var lic_items = supp_items.slice(0, lpct);

    rootleft = { "name" : "O",
                 "fill" : FILL_LEFT,
                 "ctop" : "", 
                 "children" : [ ] } ;

    for (var i=0; i<nsupp; i++) {

      var kids = [] ;
      var alpha = 1;

      // only if zoomed in
      if ((supp_items.indexOf(i) == -1) && (noderight != rootright)) {
        alpha = 0.01 ;
      }

      // Left side red/green fills

      for (var j=0; j<nvers; j++) {
        kids.push({ "name" : "s",
                    "fill" : (j < n) ? RED : GREEN,
                    "opac" : alpha,
                    "sw"   : 0.25,
                    "ctop" : "",
                    "sc"   : "white",
                    "size" : 1 });
      }

      rootleft.children.push({  "name" : "s",
                                "fill"     : "steelblue",
                                "opac"     : alpha,
                                "ctop"     : (lic_items.indexOf(i) == -1) ? "" : " ctop",
                                "sw"       : (lic_items.indexOf(i) == -1) ? 0.25 : 1.75,
                                "sc"       : (lic_items.indexOf(i) == -1) ? WHITE : PURPLE,
                                "children" : kids });

    }

  }

  nodeleft = rootleft;

  var nodes = pack.nodes(rootleft);

  vis2 = d3.selectAll("#vis2");
  vis2.selectAll("svg").remove();

  if (nsupp === 0) { return; };

  visleft = vis2.insert("svg:svg")
      .attr("width", $("#vis2").width())
      .attr("height", $("#vis2").height())
    .append("svg:g")
      .attr("transform", "translate(" + (($("#vis2").width() - r) / 2) + "," + (($("#vis2").height()- r) / 2) + ")");

  visleft.selectAll("circle")
      .data(nodes)
    .enter().append("svg:circle")
      .attr("id",           function(d, i) { return(i); })
      .attr("class",        function(d) { return d.children ? "parent" + d.ctop : "child" + d.ctop ; })
      .attr("cx",           function(d) { return ~~d.x; })
      .attr("cy",           function(d) { return ~~d.y; })
      .attr("r",            function(d) { return d.r; })
      .style("stroke",      function(d) { return d.sc; })
      .attr("stroke-width", function(d) { return d.sw; })
      .style("fill",        function(d) { return d.fill; })
      .on("click",          function(d) { return zoomleft(nodeleft == d ? rootleft : d); });

  var q = visleft.transition().duration(100);
      q.selectAll("circle")
       .attr("fill-opacity", function(d) { return d.opac; })
       .attr("stroke-opacity", function(d) { return d.opac; });

  d3.selectAll(".ctop").moveToFront() ;

  d3.select("#vis2").on("click", function() { zoomleft(rootleft); });

}

function zoomleft(d, i) {

  var k = r / d.r / 2;
  x1.domain([(d.x - d.r), (d.x + d.r)]);
  y1.domain([(d.y - d.r), (d.y + d.r)]);

  var t = visleft.transition()
      .duration((d == rootleft & nsupp > 500) ? 50 : 750);

  t.selectAll("circle")
      .attr("cx", function(d) { return ~~x1(d.x); })
      .attr("cy", function(d) { return ~~y1(d.y); })
      .attr("r",  function(d) { return (k * d.r); });

  nodeleft = d;
  d3.event.stopPropagation();

}

var total_bad = 0 ;
var double_bad = 0 ;

//---------------------------------------------------------
// right circle functions

function update_right() {

  x1.range([0, r]);
  y1.range([0, r]);

  var pct_vuln = (+$("#knownvuln").val()) / 100;
  var pct_lic = (+$("#knownlic").val()) / 100;

  var pack = d3.layout.pack()
      .size([r, r])
      .value(function(d) { return d.size; })

  if ((old_napps != napps) |
      (old_lic != (+$("#knownlic").val())) |
      (old_pct_vuln != (+$("#knownvuln").val())) |
      (old_ncomps != ncomps)) {

    old_ncomps = ncomps ;
    old_napps = napps ;
    old_pct_vuln = (+$("#knownvuln").val()) ;
    old_lic = (+$("#knownlic").val()) ;

    rootright = { "name" : "O",
                  "fill" : BLACK,
                  "ctop" : "",
                  "children" : [ ] } ;

    total_bad = 0 ;
    double_bad = 0 ;

    for (var i=0; i<napps; i++) {

      var kids = [] ;

      // randomize vuln & license colored circles

      var vuln_rng = range(0, Math.floor(ncomps));
      vuln_rng = vuln_rng.shuffle(30000);
      var vuln_items = vuln_rng.slice(0, Math.floor(pct_vuln * vuln_rng.length * 0.7));

      // 37% of the vulns are critical, so they get colored differently
      // the rest get divided equally between med & low vuln criticality
      var vred = Math.floor(0.37 * vuln_items.length);
      var vrest = vuln_items.length - vred;

      var lic_rng = range(0, Math.floor(ncomps));
      lic_rng = lic_rng.shuffle(10000);
      var lic_items = lic_rng.slice(0, Math.floor(pct_lic * lic_rng.length));

      var fillcol, strokecol, strokewidth, ctop;
      var vcount = 0 ;

      Math.seedrandom('hello.');

      for (var j=0; j<ncomps; j++) {

        var mark_it = 0;

        fillcol = GREEN;
        strokecol = WHITE;
        strokewidth = 0.25;
        ctop = "" ;

        // if the component has a problematic license

        if (lic_items.indexOf(j) != -1) { 
          strokecol = PURPLE ;
          strokewidth = napps < 50 ? 1.75 : 1;
          ctop = " ctop" ;
          mark_it++;
        }

        // if the component is vulnerable

        if (vuln_items.indexOf(j) != -1) {
          mark_it++;
          vcount += 1;
          if (vcount <= vred) {
            fillcol = LIC_RED ;
          } else {
            fillcol = Math.random() < 0.5 ? ORANGE : YELLOW ;
            if ((fillcol == YELLOW) & (strokecol != PURPLE)) {
              strokecol = "#bdbdbd";
              strokewidth = 1;
            }
          }
        }

        kids.push({ "name"   : "C",
                    "stroke" : strokecol,
                    "sw"     : strokewidth,
                    "fill"   : fillcol,
                    "ctop"   : ctop,
                    "size"   : 1 });

        total_bad += (mark_it > 0) ? 1 : 0 ;
        double_bad += (mark_it > 1) ? 1 : 0 ;

      };

      rootright.children.push({  "name"     : "A",
                                 "stroke"   : strokecol,
                                 "sw"       : strokewidth,
                                 "fill"     : LIGHT_PURPLE,
                                 "ctop"     : ctop,
                                 "children" : kids });

    };

  }

  noderight = rootright;

  var nodes = pack.nodes(rootright);

  vis4 = d3.selectAll("#vis4");
  vis4.selectAll("svg").remove();

  if (napps == 0) { return; }

  visright = vis4.insert("svg:svg")
      .attr("width", $("#vis2").width())
      .attr("height", $("#vis2").height())
    .append("svg:g")
      .attr("transform", "translate(" + (($("#vis2").width() - r) / 2) + "," + (($("#vis2").height() - r) / 2) + ")");

  visright.selectAll("circle")
      .data(nodes)
    .enter().append("svg:circle")
      .attr("class",         function(d) { return d.children ? "parent2" + d.ctop : "child2" + d.ctop; })
      .attr("cx",            function(d) { return ~~d.x; })
      .attr("cy",            function(d) { return ~~d.y; })
      .attr("r",             function(d) { return d.r; })
      .style("stroke",       function(d) { return d.stroke; })
      .style("stroke-width", function(d) { return d.sw; })
      .style("fill",         function(d) { return d.fill; })
      .on("click", function(d) { return zoomright(noderight == d ? rootright : d); });

  d3.selectAll(".ctop").moveToFront() ;

  d3.select("#vis4").on("click", function() { zoomright(rootright); });

}

function zoomright(d, i) {

  var k = r / d.r / 2;
  x.domain([(d.x - d.r), (d.x + d.r)]);
  y.domain([(d.y - d.r), (d.y + d.r)]);

  var t = visright.transition()
      .duration(d3.event.altKey ? 7500 : 750);

  t.selectAll("circle")
      .attr("cx", function(d) { return ~~x(d.x);  })
      .attr("cy", function(d) { return ~~y(d.y);  })
      .attr("r",  function(d) { return (k * d.r); });

  noderight = d;
  d3.event.stopPropagation();
  update_left();
  d3.event.stopPropagation();
}

//---------------------------------------------------------

function update_sv() {

  var suppliers    = +$("#suppliers").cleanval();
  var versions     = +$("#versions").cleanval();
  var repopct      = +$("#repovulns").cleanval();
  var application  = +$("#application").cleanval();
  var perapp       = +$("#perapp").cleanval();
  var knownvuln    = +$("#knownvuln").cleanval();
  var knownlic     = +$("#knownlic").cleanval();

  versions = (versions == 0) ? 1 : versions ;

  nsupp = suppliers ;
  nvers = versions ;
  nrepopct = repopct ;

  var stxt = "" ;
  var atxt = "" ;

  var pap = parseInt($("#perapp").val());
  if (isNaN(pap)) pap = 0;

  if ((suppliers * versions) != 0) {
    stxt = stxt + "<div style='text-align:center'>" +
                  "<b>" + comma(Math.floor(suppliers*versions))             + "</b> versions; " +
                  "<b>" + comma(Math.floor(repopct*suppliers*versions/100)) + "</b> undesirable; "    +
                  "<b>" + comma(pap)                                        + "</b> components in use." + 
                  "</div>";
  }

  if ((application * perapp) != 0) {
    atxt = atxt + "<div style='text-align:center'>" +
                  "<b>" + comma(Math.floor(application*perapp))               + "</b> total components in use; "  +
                  "<b>" + comma(total_bad) + "</b> undesirable; including " +
                  "<b>" + comma(Math.floor(knownlic*application*perapp/100)) + "</b> with restrictive licenses" +
                  "</div>"
  }

  if (stxt === "") {
    $("#supp_text").hide();
    $("#app_text").hide();
  } else {
    $("#supp_text").show().html(stxt);
    $("#app_text").show().html(atxt);
  }

  update_calcs();
  update_left();

}

//---------------------------------------------------------

function update_calcs() {

  // double bad gets factored in by subtracting it from total vulns 

  var suppliers    = +$("#suppliers").cleanval();
  var versions     = +$("#versions").cleanval();

  var application  = +$("#application").cleanval();
  var perapp       = +$("#perapp").cleanval();
  var knownvuln    = +$("#knownvuln").cleanval();
  var knownlic     = +$("#knownlic").cleanval();
  var goingtofix   = +$("#goingtofix").val();
  var costperhour  = +$("#costperhour").val();
  var manhours     = +$("#manhours").val();
  var tb = total_bad ;

  versions = (versions === 0) ? 1 : versions ;

  if ( (costperhour === 0) ||
       (manhours === 0)    ||
       (application === 0) ||
       ((knownvuln === 0) && (knownlic === 0))) {

    $("#impact_text").hide();
    $("#notinclude").hide();

  } else {

    var tot_vuln = Math.floor(knownvuln * application * perapp / 100);

    if (eyeon) tot_vuln -= olddb ;
    if (eyeon && tot_vuln < 1) tot_vuln = 1 ;
    if (eyeon) tb -= olddb ;
    if (eyeon && tb < 1) tb = 1 ;

    var pct_remd = Math.ceil((goingtofix / 100) * tb);
    var remd_hrs = Math.floor(manhours * pct_remd);
    var remd_cst = remd_hrs * costperhour ;

    $("#notinclude").show();
    $("#impact_text").show().html("<b>" + comma(pct_remd) + "</b> components remediated out of <b>" + 
                                          comma(tb) + "</b>, requiring " +
                                  "<b>" + comma(remd_hrs) + "</b> hrs of effort to fix == " +
                                  "<b>" + currency(remd_cst) + "</b>USD");
  };

}

//---------------------------------------------------------

function update_panel_calc() {

  var suppliers    = +$("#suppliers_panel").cleanval();
  var versions     = +$("#versions_panel").cleanval();
  var repo_vulns   = +$("#repovulns_panel").cleanval();

  var application  = +$("#application_panel").cleanval();
  var perapp       = +$("#perapp_panel").cleanval();
  var knownvuln    = +$("#knownvuln_panel").cleanval();
  var knownlic     = +$("#knownlic_panel").cleanval();
  var goingtofix   = +$("#goingtofix_panel").val();
  var costperhour  = +$("#costperhour_panel").val();
  var costperlic   = +$("#costperlic_panel").val();
  var manhours     = +$("#manhours_panel").val();
  var distributed  = +$("#distributed_panel").val();

  versions = (versions === 0) ? 1 : versions ;

  var txt = "" ;

  var pap = parseInt($("#perapp").val());
  if (isNaN(pap)) pap = 0;

  if ((suppliers * versions) != 0) {
    txt = txt + "<b>" + comma(suppliers)                                           + "</b> Suppliers/FOSS Projects<br/><br/>" +
                "<b>" + comma(Math.floor(suppliers * versions))                    + "</b> versions (" +
                "<b>" + comma(Math.floor(repo_vulns * suppliers * versions / 100)) + "</b> undesirable)<br/><br/>";
    $("#comp_panel").html(txt);
  } else {
    $("#comp_panel").html("")
  }


  if ( (costperhour === 0) ||
       (manhours    === 0)    ||
       (application === 0) ||
       ((knownvuln  === 0) &&  (knownlic === 0))) {

    $("#impact_panel").html("");

  } else {

    var tot_vuln  = Math.floor(knownvuln * application * perapp / 100);
    var pct_remd  = Math.floor((goingtofix / 100) * tot_vuln);
    var remd_hrs  = Math.floor(manhours * pct_remd);
    var remd_cst  = remd_hrs * costperhour ;
    var lic_calc  = Math.floor(knownlic * application * perapp / 100);
    var lic_cost  = Math.floor(costperlic);
    var lic_waste = Math.floor((distributed/100) * perapp * application * (knownlic/100) * lic_cost);
    var waste     = lic_waste + remd_cst;

    $("#impact_panel").show().html("Total waste: <b>" + currency(waste) + "</b>USD<br/><br/>" +
                                   "Vulnerability remediaton cost: <b>" + currency(remd_cst) + "</b>USD<br/><br/>" +
                                   "<b>" + comma(pct_remd)    + "</b> total vulnerable components remediated out of <b>" + comma(tot_vuln) + "</b>, requiring " +
                                   "<b>" + comma(remd_hrs)    + "</b> hrs of unplanned/unscheduled work to fix.<br/><br/>" +
                                   "License remedation cost:<br/>" + distributed + "% of <b>" + currency(perapp * application * (knownlic/100) * lic_cost) + "</b>USD == <b>" + currency(lic_waste) + "</b>USD<br/><br/>" +
                                   "<b>" + comma(lic_calc)    + "</b> total components with restrictive licenses."
                                   );
  };

}

//---------------------------------------------------------

function update_aa() {

  var application  = +$("#application").cleanval();
  var perapp  = +$("#perapp").cleanval();

  perapp = (perapp == 0) ? 1 : perapp ;

  napps = application ;
  ncomps = perapp ;

  update_right();
  update_sv();

}

//---------------------------------------------------------

function do_resize() {

  var head = 200 ;
  var foot = 45;
  var dw = parseInt($( window ).width());
  var dh = parseInt($( window ).height()) - head - foot;
  var sz = dh;

  if (dh > dw) dh = dw;

  $("#mainrow").height(dh)
  $("#col1").height(dh)
  $("#col2").height(dh)
  $("#vis2").height(dh)
  $("#vis4").height(dh)

  w = parseInt($("#vis2").height());
  h = parseInt($("#vis2").width());

  r = (w > h) ? h : w ;
  r = r * 0.95

  update_left();
  update_right()

};

//---------------------------------------------------------

function reset_icons() {
  oldrl = oldvk = oldfs = olddb = -1;
  d3.select("#eye").style("color", "black");
  d3.select("#fire").style("color", "black");
  d3.select("#kl").transition().style("background-color", WHITE).duration(0);
  d3.select("#kv").transition().style("background-color", WHITE).duration(0);
}

//---------------------------------------------------------

function eye(io) {
  if (io == "in") {
    d3.select("#kl").transition().style("background-color", "rgba(200, 200, 200, 0.3").duration(300);
  } else {
    d3.select("#kl").transition().style("background-color", WHITE).duration(0);
  }
  if (io == "click") {
    eyeon = !eyeon
    d3.select("#eye").style("color", eyeon?GREEN:BLACK);
    if (eyeon) {
      if (oldrl == -1) oldrl = $("#knownlic").val();
      if (oldfs == -1) oldfs = $("#suppliers").val();
      olddb = double_bad;
      $("#knownlic").val(0)
      $("#suppliers").val(oldfs - Math.floor(oldfs * oldrl/100))
      update_aa();
      update_sv();
      update_calcs();
    } else {
      if (oldrl == -1) oldrl = $("#knownlic").val();
      if (oldfs == -1) oldfs = $("#suppliers").val();
      $("#knownlic").val(oldrl);
      $("#suppliers").val(oldfs);
      update_aa();
      update_sv();
      update_calcs();
    }
  }
}

//---------------------------------------------------------

function fire(io) {
  if (io == "in") {
    d3.select("#kv").transition().style("background-color", "rgba(200, 200, 200, 0.3").duration(300);
  } else {
    d3.select("#kv").transition().style("background-color", WHITE).duration(0);
  }
  if (io == "click") {
    fireon = !fireon
    d3.select("#fire").style("color", fireon?GREEN:BLACK);
    if (fireon) {
      if (oldkv == -1) oldkv= $("#knownvuln").val();
      $("#knownvuln").val(0)
      update_aa();
      update_sv();
      update_calcs();
    } else {
      if (oldkv == -1) oldkv= $("#knownvuln").val();
      $("#knownvuln").val(oldkv);
      update_aa();
      update_sv();
      update_calcs();
    }
  }
}

//---------------------------------------------------------
// scenarios
// 
// To add more  just make a function and wire it up to "Scenarios" in index.html
// Follow the same settings as you see here for each one. The "medium_typical"
// scenario has the field names they map to in comments next to the settings
//

function medium_typical() {

  reset_icons();

  $("#suppliers").val(300);    // Suppliers/FOSS Projects
  $("#versions").val(27);      // Versions/component
  $("#repovulns").val(90);     // Known undesir. %
  $("#application").val(10);   // Number of Apps
  $("#perapp").val(106);       // Components per App
  $("#knownvuln").val(23);     // Vuln ratio % of parts
  $("#knownlic").val(8);       // Restrictive licenses %
  $("#goingtofix").val(10);    // % requiring attention
  $("#costperhour").val(100);  // Cost per hour
  $("#manhours").val(10);      // Unplanned work/fix (hrs)

  update_aa();
  update_sv();

}

function google() {

  reset_icons();

  $("#suppliers").val(1);
  $("#versions").val(2);
  $("#repovulns").val(0);
  $("#application").val(300);
  $("#perapp").val(20);
  $("#knownvuln").val(0);
  $("#knownlic").val(0);
  $("#goingtofix").val(100);
  $("#costperhour").val(35);
  $("#manhours").val(100);

  update_aa();
  update_sv();

}

function uniform() {

  reset_icons();

  $("#suppliers").val(200);
  $("#versions").val(20);
  $("#repovulns").val(90);
  $("#application").val(100);
  $("#perapp").val(50);
  $("#knownvuln").val(25);
  $("#knownlic").val(10);
  $("#goingtofix").val(10);
  $("#costperhour").val(100);
  $("#manhours").val(10);

  update_aa();
  update_sv();

}

//---------------------------------------------------------
// main app initializers

d3.select(window).on('resize', do_resize);

update_left(); 
update_right();

do_resize();

// fin
