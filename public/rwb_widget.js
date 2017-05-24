function RwbWidget(selector, rwbDef, data, changed) {
    var parent = $("#" + selector);
    parent.append('<span class="rwb-title">' + rwbDef.label + '</span>');
    
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
    this.saveButt = $('<button/>', {'text':'Save'});
    this.saveButt.click(function() {thisWidget.changed(thisWidget.getState());});
    parent.append(this.saveButt);
    
    
    
    
    function RwbField(parentElement, def, data, listener) {

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
  this.name = def.name;
  this.label = def.label;
  this.instructions = def.instructions;
  this.longtext = def.longtext;
  this.data = data;
  this.listener = listener || function() {};
  var elem = $('<div class="rwb-field"></div>');
  parentElement.append(elem);
  this.element = elem;
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
    instructoid.append(createHints(this.hints));
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
    };
    var field = $('<input>');
    dataDiv.append(field);
    var butt = $('<button type="button">Add</button>');
    butt.click(function() {
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
  }
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
  
  
  function createHints(hints) {
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
                  hintLink.click(function() {
                      var description = $('<div class="description"></div>');
                      description.html(hints[hintIndex].description+'<div style="text-align:right">[X]</div>');
                      description.click(function() {this.remove();table[0].scrollIntoView()});
                      element.append(description);
                      description[0].scrollIntoView();
                      //alert(hints[hintIndex].description);
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
      return element
  }
}

}



function RwbStatic(selector, def, data) {
    var parent = $("#" + selector);
    parent.append('<span class="rwb-title">' + def.label + '</span>');
    
    var i;
    for (i = 0; i < def.fields.length; i++) {
        if (def.fields[i].isarrayfield) {
            drawArrayField(parent, def.fields[i], data[def.fields[i].name]);
        } else {
            drawField(parent, def.fields[i], data[def.fields[i].name]);
        }
    }
    
    function drawArrayField(parent, def, data) {
        if (!Array.isArray(data)) {
            data = [];
        }
        var element = $('<div class="rwb-field"></div>');
        parent.append(element);
        element.append('<div class="rwb-field-label">' + def.label + '</div>');
        var thingData = $('<div class="rwb-field-data"></div>');
        if (data.length) {
            data.forEach(function(x, index) {
                var item = $('<div></div>').addClass('rwb-field-data-arrayitem').html(x);
                thingData.append(item);
            });
        };
        element.append(thingData);
    }
    
    function drawField(parent, def, data) {
        var element = $('<div class="rwb-field"></div>');
        parent.append(element);
        element.append('<div class="rwb-field-label">' + def.label + '</div>');
        var rwbData = $('<div class="rwb-field-data"></div>');
        rwbData.text(data);
        element.append(rwbData);
    }
}



