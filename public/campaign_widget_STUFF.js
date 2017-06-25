
    function _showSaveWindow() {
        drawStatic("savebox-content", def, thiz.campaign);
        $("#savebox").css("display", "block");
    }
    function _hideSaveWindow() {
        $("#savebox").css("display", "none");
    }
    $("#savebox-print").on('click', function() {window.print();});
    $("#savebox-close").on('click', _hideSaveWindow);

    
    
    function drawStatic(selector, rwbDef, data) {
        var parent = $("#" + selector);
        var titleElement = $("<h2></h2>");
        titleElement.html(escapeHtml(data['title']));
        parent.append(titleElement);
    
        //def.fields[0]  is the title
        var field, i;
        var div;
        for (i = 1; i < rwbDef.fields.length; i++) {
            parent.append('<h3>' + rwbDef.fields[i].label + '</h3>');
            if (rwbDef.fields[i].isarrayfield) {
                var arr = data[rwbDef.fields[i].name];
                if (arr.length) {
                    arr.forEach(function(x, index) {
                        div = $("<div></div>");
                        div.html(escapeHtml(x));
                        parent.append(div)
                    });
                }
            } else {
                div = $("<div></div>");
                div.html(escapeHtml(data[rwbDef.fields[i].name]));
                parent.append(div);
            }
        }
    }
