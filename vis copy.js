
var full = 0.65;
var comma = d3.format("0,000");
var percent = d3.format(".1%");
var currency = d3.format("$0,000");

//---------------------------------------------------------

function range(lowEnd, highEnd){
    var arr = [],
    c = highEnd - lowEnd + 1;
    while ( c-- ) {
        arr[c] = highEnd--
    }
    return arr;
}


jQuery.fn.extend({
  cleanval: function() {
    return(this.val().replace(/[ %\$,]/, ""));
  },
});

//---------------------------------------------------------

make_suppliers = function(vis, supplier_count, width, height, box_width, box_height, box_hgutter, box_vgutter) {

  var sdat;
  var srows, scols;
  var sbox_width, sbox_height;

  if (supplier_count > 500) { supplier_count /= 10 };

  srows = 40;
  scols = Math.ceil(supplier_count / srows);

  sdat = [] ;

  var i = 0;
  for (var c=0; c<scols; c++) {
     for (var r=0; r<srows; r++) {
      sdat.push({
        row:r, 
        col:c, 
        fill: "#579244",
        filled:(i<supplier_count) ? full : 0 
      });
      i++;
     }
  }

  var spc_x = (supplier_count<500) ? 5 : (supplier_count < 1000) ? 2.5 : 0 ;
  var spc_y = (supplier_count<500) ? 5 : (supplier_count < 1000) ? 2.5 : 0 ;

  sbox_width = (box_width / scols) - spc_x;
  sbox_height = (height / srows) - spc_y ;

  base_x = 0; 

  suppliers = vis.selectAll(".suppliers")
     .data(sdat)
     .enter()
     .append("rect") 
     .attr("x", function(d) { return( base_x + (d.col * (sbox_width + spc_x))) })
     .attr("y", function(d) { return( d.row * (sbox_height + spc_y)) })
     .attr("height", sbox_height)
     .attr("width", sbox_width)
     .style("stroke", function(d) { return(d.fill) })
     .style("stroke-width", "1.5")
     .style("fill", function(d) { return(d.fill) })
     .attr("stroke-opacity", function(d) { return(d.filled==0?0:1) })
     .attr("fill-opacity", function(d) { return(d.filled) })
     .classed("suppliers", true);

}

//---------------------------------------------------------

make_versions = function(vis, supplier_count, version_count, pct_vuln, width, height, box_width, box_height, box_hgutter, box_vgutter) {

  var vdat;
  var vrows, vcols;
  var vbox_width, vbox_height;

  // calculate total parts across all suppliers

  if (supplier_count > 500) { 
    supplier_count /= 10;
    version_count /= 10;
  };

  all = range(0, Math.ceil(supplier_count * version_count));
  all_items = all.slice(0);
  vuln_versions = Math.ceil(pct_vuln * all.length) ;
  
  vrows = 40;
  vcols = Math.ceil(all.length / vrows);

  // compute the # of vulnerable ones

  new_items = [];

  for(var i = 0; i <vuln_versions; i++) {
      var idx = Math.floor(Math.random() * all_items.length);
      new_items.push(all_items[idx]);
      all_items.splice(idx, 1);
  }

  vdat = [] ;

  var i = 0;
  for (var c=0; c<vcols; c++) {
     for (var r=0; r<vrows; r++) {
      vdat.push({
        row:r, 
        col:c, 
        filled:(i<all.length) ? full : 0, 
        fill:(new_items.indexOf(i) == -1) ? "#579244" : "#64141F" 
      });
      i++;
     }
  }

  var spc_x = (supplier_count * version_count<850) ? 5 : (supplier_count * version_count < 1500) ? 2.5 : 0 ;
  var spc_y = (supplier_count * version_count<850) ? 5 : (supplier_count * version_count < 1500) ? 2.5 : 0 ;

  vbox_width = (box_width / vcols) - spc_x;
  vbox_height = (height / vrows) - spc_y ;

  base_x = box_width + (4*box_hgutter);

  versions = vis.selectAll(".versions")
     .data(vdat)
     .enter()
     .append("rect") 
     .attr("x", function(d) { return( base_x + (d.col * (vbox_width + spc_x))) })
     .attr("y", function(d) { return( d.row * (vbox_height + spc_y)) })
     .attr("height", vbox_height)
     .attr("width", vbox_width)
     .style("stroke", function(d) { return(d.fill) })
     .style("stroke-width", "1.5")
     .style("fill", function(d) { return(d.fill) })
     .attr("stroke-opacity", function(d) { return(d.filled==0?0:1) })
     .attr("fill-opacity", function(d) { return(d.filled) })
     .classed("versions", true);

}

//---------------------------------------------------------

make_debts = function(vis, supplier_count, version_count, pct_vuln, width, height, box_width, box_height, box_hgutter, box_vgutter) {

  var ddat;
  var drows, dcols;
  var dbox_width, dbox_height;

  if (supplier_count > 500) { 
    supplier_count /= 10;
    version_count /= 10;
    if ((supplier_count * version_count) > 800) {
      version_count /= 10;
    }
  };

  // calculate raw debt index
  debt_count = pct_vuln * supplier_count * version_count;

  drows = 40; 
  dcols = Math.ceil(debt_count / drows);

  ddat = [] ;

  var i = 0;
  for (var c=0; c<dcols; c++) {
     for (var r=0; r<drows; r++) {
      ddat.push({
        row:r, 
        col:c, 
        fill: "#64141F",
        filled:(i<debt_count) ? full : 0
      });
      i++;
     }
  }

  var dspc_x = (debt_count<=500) ? 5 : (debt_count < 1000) ? 2.5 : 0 ;
  var dspc_y = (debt_count<=500) ? 5 : (debt_count < 1000) ? 2.5 : 0 ;

  dbox_width = (box_width / dcols) - dspc_x;
  dbox_height = (height / drows) - dspc_y ;

  base_x = (2*box_width) + (8*box_hgutter);

  debts = vis.selectAll(".debts")
     .data(ddat)
     .enter()
     .append("rect") 
     .attr("x", function(d) { return( base_x + (d.col * (dbox_width + dspc_x))) })
     .attr("y", function(d) { return( d.row * (dbox_height + dspc_y)) })
     .attr("height", dbox_height)
     .attr("width", dbox_width)
     .style("stroke", function(d) { return(d.fill) })
     .style("stroke-width", "1.5")
     .attr("stroke-opacity", function(d) { return(d.filled==0?0:1) })
     .attr("fill-opacity", function(d) { return(d.filled) })
     .style("fill", "#64141F")
     .attr("fill-opacity", function(d) { return(d.filled) })
     .classed("debts", true);

}

// setup events to trigger on value changes

$("#suppliers").on('change paste',       function() { $("#suppliers").val(comma($("#suppliers").cleanval()));                   row1() });
$("#versions").on('change paste',        function() { $("#versions").val(comma($("#versions").cleanval()));                     row1() });
$("#vulnerabilities").on('change paste', function() { $("#vulnerabilities").val(percent($("#vulnerabilities").cleanval()/100)); row1() });
$("#licenses").on('change paste',        function() { $("#licenses").val(percent($("#licenses").cleanval()/100));               row1() });

function row1() {
  
  var suppliers       = +$("#suppliers").cleanval();
  var versions        = +$("#versions").cleanval();
  var vulnerabilities = +$("#vulnerabilities").cleanval();
  var licenses        = +$("#licenses").cleanval();
  
  $("#dev_calc_vuln").html( comma( Math.round((vulnerabilities/100) * (suppliers * versions))));
  $("#dev_calc_lic").html ( comma( Math.round((licenses/100)        * (suppliers))));

  update();

}

$("#numapps").on('change paste',   function() { $("#numapps").val  (comma($("#numapps").cleanval()));         row2() });
$("#perapp").on('change paste',    function() { $("#perapp").val   (comma($("#perapp").cleanval()));          row2() });
$("#knownvuln").on('change paste', function() { $("#knownvuln").val(percent($("#knownvuln").cleanval()/100)); row2() });
$("#knownlic").on('change paste',  function() { $("#knownlic").val (percent($("#knownlic").cleanval()/100));  row2() });

function row2() {
  
  var numapps   = +$("#numapps").cleanval();
  var perapp    = +$("#perapp").cleanval();
  var knownvuln = +$("#knownvuln").cleanval();
  var knownlic  = +$("#knownlic").cleanval();
  

  $("#app_calc_vuln").html( comma( Math.round( (knownvuln/100  ) * perapp  ) ));
  $("#app_calc_lic").html(  comma( Math.round( (knownlic/100) * perapp) ));

}

$("#remediated").on('change paste', function() { $("#remediated").val(percent($("#remediated").cleanval()/100)); row3() });
$("#unplanned").on('change paste',  function() { $("#unplanned").val (comma($("#unplanned").cleanval()));        row3() });
$("#perhour").on('change paste',    function() { $("#perhour").val   (currency($("#perhour").cleanval()));       row3() });

function row3() {
  
  var remediated      = +$("#remediated").cleanval();
  var unplanned       = +$("#unplanned").cleanval();
  var perhour         = +$("#perhour").cleanval();
  var numapps         = +$("#numapps").cleanval();
  var perapp          = +$("#perapp").cleanval();
  var knownvuln       = +$("#knownvuln").cleanval();
  var knownlic        = +$("#knownlic").cleanval();
  var suppliers       = +$("#suppliers").cleanval();
  var versions        = +$("#versions").cleanval();
  var vulnerabilities = +$("#vulnerabilities").cleanval();
  var licenses        = +$("#licenses").cleanval();

  $("#debt_calc_rem").html( currency( Math.round((knownvuln/100) * perapp * numapps * (1-(remediated/100)) * perhour * unplanned) ));
  $("#debt_calc_hrs").html(    comma( Math.round((knownvuln/100) * perapp * numapps * (1-(remediated/100)) * unplanned) ));

}

function scenario1() {

  $("#suppliers").val      (comma(7601));
  $("#versions").val       (comma(2.44));
  $("#vulnerabilities").val(percent(0.064));
  $("#licenses").val       (percent(0.05));
  $("#numapps").val        (comma(50));
  $("#perapp").val         (comma(106));
  $("#knownvuln").val      (percent(0.23));
  $("#knownlic").val       (percent(0.08));
  $("#remediated").val     (percent(0.15));
  $("#unplanned").val      (comma(100));
  $("#perhour").val        (currency(35));

  row1();
  row2();
  row3();

  $("#row2").slideDown(500, resize_container);
  $("#row3").slideDown(500, resize_container);
  $("#step").html("Step 3 of 3: Technical/Security Debt. <i>What does this cost?*</i>");
  $("#note").html("<sup>*</sup>*Based on Sonatype analysis of Application Health Checks.");
  $("#question").html("How do software supply chain solutions help?");
  $("#next").data().button = 3; 
  $("#next").hide();

}

// chart globals

var margin = 0;
var width, height;

var box_hgutter = 20;
var box_vgutter = 5;

var suppliers, versions, debts; 
var box_width, box_height;

var vis = d3.selectAll("#vis").append("svg");

function reset_numbers(up_speed) {

  $("#row3").slideUp(up_speed);
  $("#row2").slideUp(up_speed, resize_container);

  resize_container();

  $("#step").html("Step 1 of 3: Supplier ecosystem. <i>What's coming in to an organization?*</i>");
  $("#note").html("<sup>*</sup>Based on data collected about the practices of the largest technical and financial companies.");
  $("#question").html("How many end up in a typical software application?");
  $("#next").show();
  $("#next").data().button = 1; 

  update();

}

function next_row() {

  var next_step = $("#next").data().button + 1;

  if (next_step == 2) {
    $("#row2").slideDown(500, resize_container);
    $("#step").html("Step 2 of 3: Development process. <i>What ends up in applications?*</i>");
    $("#question").html("What is the technical/security debt costing you?");
    $("#note").html("<sup>*</sup>*Based on Sonatype analysis of Application Health Checks.");
    $("#next").data().button = 2; 
  }

  if (next_step == 3) {
    $("#row3").slideDown(500, resize_container);
    $("#step").html("Step 3 of 3: Technical/Security Debt. <i>What does this cost?*</i>");
    $("#note").html("<sup>*</sup>*Based on Sonatype analysis of Application Health Checks.");
    $("#question").html("How do software supply chain solutions help?");
    $("#next").data().button = 3; 
    $("#next").hide()
  }

}

function resize_container() {

  var ht = parseInt($(window.top).height());

  var base_add = 500 ;

  if (!$("#row3").is(":visible")) { base_add -= 95 ; }
  if (!$("#row2").is(":visible")) { base_add -= 95 ; }

  $("#viscontainer").height(ht - base_add);

  update();

}

function update() {

  width = parseInt($("#vis").width()) - margin*2,
  height = parseInt($("#vis").height()) - margin*2;

  vis.selectAll("rect").remove();
  vis.attr("width", width).attr("height", height);

  var suppliers       = +$("#suppliers").cleanval();
  var versions        = +$("#versions").cleanval();
  var vulnerabilities = +$("#vulnerabilities").cleanval();
  var licenses        = +$("#licenses").cleanval();

  var numapps         = +$("#numapps").cleanval();
  var perapp          = +$("#perapp").cleanval();
  var knownvuln       = +$("#knownvuln").cleanval();
  var knownlic        = +$("#knownlic").cleanval();

  var remediated      = +$("#remediated").cleanval();
  var unplanned       = +$("#unplanned").cleanval();
  var perhour         = +$("#perhour").cleanval();

  supplier_count = suppliers;
  
  version_count = versions;

  pct_vuln = vulnerabilities / 100;

  box_width = (width / 3) - box_hgutter * 3;
  box_height = (height / supplier_count) - box_vgutter ;

  // make the vis

  suppliers = make_suppliers(vis, supplier_count, width, height, box_width, box_height, box_hgutter, box_vgutter);

  versions = make_versions(vis, supplier_count, version_count, pct_vuln, width, height, box_width, box_height, box_hgutter, box_vgutter);

  debts = make_debts(vis, supplier_count, version_count, pct_vuln, width, height, box_width, box_height, box_hgutter, box_vgutter);

}

d3.select(window).on('resize', resize_container); 
reset_numbers(0);

$("#suppliers").val      (comma(7601));
$("#versions").val       (comma(2.44));
$("#vulnerabilities").val(percent(0.064));
$("#licenses").val       (percent(0.05));
$("#numapps").val        (comma(50));
$("#perapp").val         (comma(106));
$("#knownvuln").val      (percent(0.23));
$("#knownlic").val       (percent(0.08));
$("#remediated").val     (percent(0.15));
$("#unplanned").val      (comma(100));
$("#perhour").val        (currency(35));

row1();

resize_container();
