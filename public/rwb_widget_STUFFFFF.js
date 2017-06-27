
function DRAWWZIE(rwbDef, model, controller) {
    var data = model.campaign;
    var parent = $("#campaign-thecampaign");
    parent.append('<h2 class="rwb-title">' + rwbDef.label + '</h2>');
    parent.append('<div class="rwb-top-instructions">' + rwbDef.instructions + '</div>');
    
    //Loop over the def's fields array, creating and populating our field objects
    for (i = 0; i < rwbDef.fields.length; i++) {
        if (rwbDef.fields[i].isarrayfield) {
            drawArrayField(parent, rwbDef.fields[i], data[rwbDef.fields[i].name]);
        } else {
            drawSimpleField(parent, rwbDef.fields[i], data[rwbDef.fields[i].name]);
        }
    }

    //Text inputs and textarea's
    function drawSimpleField(parentElement, def, data) {
        var name = def.name;
        var target = $('<div class="rwb-field"></div>');
        parentElement.append(target);
        target.append('<div class="rwb-field-label">' + def.label + '</div>');
        target.append('<div class="rwb-field-docblock"><div class="rwb-field-docblock-instructions">' + def.instructions + '</div></div>');
        var thingData = $('<div class="rwb-field-data"></div>');
        var item;
        if (def.longtext) {
            item = $('<textarea></textarea>').attr('id', 'campedit-' + name + '-field');
        } else {
            item = $('<input>').attr('id', 'campedit-' + name + '-input');
        }
        item.val(data);
        thingData.append(item);
        target.append(thingData);
    }

    function drawArrayField(parentElement, def, arr) {
        var target = $('<div class="rwb-arrayfield"></div>');
        parentElement.append(target);
        target.append('<div class="rwb-field-label">' + def.label + '</div>');
        var instructoid = $('<div class="rwb-field-docblock"></div>');
        instructoid.append('<div class="rwb-field-docblock-instructions">' + def.instructions + '</div>');
        instructoid.append(_createHints(this.hints));
        target.append(instructoid);
        var dataDiv = $('<div class="rwb-field-data"></div>');
        if (arr.length) {
            arr.forEach(function(x, index) {
                var item = $('<div></div>').addClass('rwb-field-data-arrayitem').html(escapeHtml(x));
                var deleteItem = $("<span></span>");
                deleteItem.addClass('rwb-field-data-arrayitem-delete').html('[x]');
                deleteItem.on('click',function() {
                    controller.deleteArrayFieldItem(def.name, index, _collectInputs());
                });
                item.append(deleteItem);
                dataDiv.append(item);
            });
        }
        var field = $('<input>').attr('id', 'campedit-' + def.name + '-input');;
        dataDiv.append(field);
        var butt = $('<button type="button">Add</button>');
        butt.on('click', function() {
            controller.saveInputs(_collectInputs());
        });
        //You can add an item by hitting return in the input.
        field.on('keyup', function(e) {
            if (e.keyCode === 13) {
                controller.saveInputs(_collectInputs());
            }
        });
        dataDiv.append(butt);
        target.append(dataDiv);
    }




    //Build and return a hints table as a jQuery element. (Don't dispay it in this function.)
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
                hintLink = $('<a class="hintlink">' + hints[i].label + '</a>');
                (function() {
                    var hintIndex = i;
                    hintLink.on('click', function() {
                        _showHint(hints[hintIndex].label, hints[hintIndex].description);
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
    
    function _showHint(hintlabel, hintcontent) {
        $("#hintbox-label").text(hintlabel);
        $("#hintbox-content").html(hintcontent);
        $("#hintbox").css("display", "block");
    }
    function _hideHint() {
        $("#hintbox").css("display", "none");
    }
    $("#hintbox-close").on('click', _hideHint);
    
} 


