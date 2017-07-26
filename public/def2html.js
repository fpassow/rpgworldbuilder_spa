var def = require('./campaign_form_def.json');

def.fields.forEach(function(field) {
	console.log('<div class="field">');
    console.log('    <h2>' + field.label + '</h2>');
    console.log('    <p>' + field.instructions + '</p>');
    field.hints.forEach(function(hint) {
    	console.log('    <div class="hint">');
    	console.log('        <h3>' + hint.label + '</h3>');
    	console.log('        ' + hint.description);
    	console.log('    </div>');
    });
    console.log('</div>');
});

