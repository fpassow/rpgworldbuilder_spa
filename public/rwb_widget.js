/*
 * Widget for editing campaigns based on a definition object and starting data
 *
 * selector    jQuery selector for the container to put this widget into
 * rwbDef      Object defining the form and its labels, hints, etc.
 * data        Data to be displayed and edited
 * changed     Callback called with updated version of the data when it changes
 *
 * Call getState() to get the current state of the campaign being edited.
 */
 
 /*
     function showHint(hintlabel, hintcontent) {
        $("#hintbox-label").text(hintlabel);
        $("#hintbox-content").html(hintcontent);
        $("#hintbox").css("display", "block");
    }
    showHint("LLLLLLL", "CCCCCCCCCCCCCCCCCc"); console.log('hi');
    function hideHint() {
        $("#hintbox").css("display", "none");
    }
    $("#hintbox-close").on('click', hideHint);
    */

function RwbWidget(selector, rwbDef, data, changed) {
    var parent = $("#" + selector);
    parent.append('<h2 class="rwb-title">' + rwbDef.label + '</h2>');
    parent.append('<div class="rwb-top-instructions">' + rwbDef.instructions + '</div>');
    
    this.changed = changed || function() {};
    this.fieldArray = [];
    
    this.getState = function() {
        var rv = {};
        var j;
        for (j = 0; j < this.fieldArray.length; j++) {
            rv[this.fieldArray[j].getName()] = this.fieldArray[j].getFieldValue();
        }
        return rv;
    };

    //Loop over the def's fields array, creating and populating our field objects
    var field, i;
    var thisWidget = this;
    for (i = 0; i < rwbDef.fields.length; i++) {
        if (rwbDef.fields[i].isarrayfield) {
            field = new RwbArrayField(parent, rwbDef.fields[i], data[rwbDef.fields[i].name], function(x) {
                thisWidget.changed(thisWidget.getState());
            });
        } else {
            field = new RwbField(parent, rwbDef.fields[i], data[rwbDef.fields[i].name], function(x) {
                thisWidget.changed(thisWidget.getState());
            });
        }
        this.fieldArray.push(field);
    }

    //Constructor for non-array field objects
    function RwbField(parentElement, def, data, listener) {
        this.name = def.name;
        this.label = def.label;
        this.instructions = def.instructions;
        this.longtext = def.longtext; //Text entered can be long. i.e. a textarea
        this.data = data;
        this.listener = listener || function() {};
        this.element = $('<div class="rwb-field"></div>');
        parentElement.append(this.element);
        
        RwbField.prototype.draw = function() {
            var target = this.element;
            var lab = this.label;
            var data = this.data;
            var instructions = this.instructions;
            target.append('<div class="rwb-field-label">' + lab + '</div>');
            target.append('<div class="rwb-field-docblock"><div class="rwb-field-docblock-instructions">' + instructions + '</div></div>');
            var thingData = $('<div class="rwb-field-data"></div>');
            var item;
            if (this.longtext) {
                item = $('<textarea></textarea>');
            } else {
                item = $('<input>');
            }
            item.val(this.data);
            thingData.append(item);
            target.append(thingData);
            this.item = item;
        };

        RwbField.prototype.getFieldValue = function() {
            return this.item.val();
        };
        
        RwbField.prototype.getName = function() {
            return this.name;
        }
        //And draw myself.
        this.draw();
    }

    function RwbArrayField(parentElement, def, arr, listener) {

        RwbArrayField.prototype.draw = function() {
            var thisField = this;
            var target = this.element;
            var lab = this.label;
            var arr = this.array;
            target.append('<div class="rwb-field-label">' + lab + '</div>');
            var instructoid = $('<div class="rwb-field-docblock"></div>');
    
            instructoid.append('<div class="rwb-field-docblock-instructions">' + this.instructions + '</div>');
            instructoid.append(_createHints(this.hints));
            target.append(instructoid);
            var dataDiv = $('<div class="rwb-field-data"></div>');
            if (arr.length) {
                arr.forEach(function(x, index) {
                    var item = $('<div></div>').addClass('rwb-field-data-arrayitem').html(x);
                    item.click(function() {
                        thisField.removeItem(index);
                    });
                    dataDiv.append(item);
                });
            }
            var field = $('<input>');
            dataDiv.append(field);
            var butt = $('<button type="button">Add</button>');
            butt.on('click', function() {
                thisField.addItem(field.val());
            });
            dataDiv.append(butt);
            target.append(dataDiv);
        };

        RwbArrayField.prototype.redraw = function() {
            this.element.empty();
            this.draw();
        };

        RwbArrayField.prototype.addItem = function(item) {
            this.array.push(item);
            this.redraw();
            this.listener(this);
        };

        RwbArrayField.prototype.removeItem = function(index) {
            this.array.splice(index, 1);
            this.redraw();
            this.listener(this);
        };

        RwbArrayField.prototype.getItemArray = function() {
            return this.array.slice(); //Don't give away the originial!!
        };
        RwbArrayField.prototype.getFieldValue = function() {
            return this.getItemArray();
        };

        RwbArrayField.prototype.setItemArray = function(arr) {
            this.array = arr || [];
            this.redraw();
        };
        RwbArrayField.prototype.getName = function() {
            return this.name;
        };
        this.name = def.name;
        this.label = def.label;
        this.instructions = def.instructions;
        this.hints = def.hints;
        this.array = arr || [];
        this.listener = listener || function() {};
        var elem = $('<div class="rwb-field"></div>');
        parentElement.append(elem);
        this.element = elem;
        this.draw();
    }
    //Build and return a jQuery element. (Don't dispay it in this function.)
    function _createHints(hints) {
        var element = $('<div class="rwb-field-docblock-hints"></div>');
        var table = $('<table></table>');
        element.append(table);
        var tr = $('<tr></tr>');
        var rowCount = 0;
        var ROW_MAX = 3;
        var td, hintLink;
        for (var i = 0; i < hints.length; i++) {
            td = $('<td></td>');
            if (hints[i].description && hints[i].description.length) {
                hintLink = $('<a >' + hints[i].label + '</a>');
                (function() {
                    var hintIndex = i;
                    hintLink.on('click', function() {
                        var description = $('<div class="description"></div>');
                        description.html(hints[hintIndex].description+'<div style="text-align:right">[X]</div>');
                        description.click(function() {this.remove();table[0].scrollIntoView()});
                        element.append(description);
                        description[0].scrollIntoView();
                    });
                })();
                td.append(hintLink);
            } else {
                td.append(hints[i].label);
            }
            tr.append(td);
            if (rowCount++ >= ROW_MAX) {
                table.append(tr);
                tr = $('<tr></tr>');
                rowCount = 0;
            }
        }
        if (rowCount != 0) {
            table.append(tr);
        }
        return element;
    }

} //Close RwbWidget


