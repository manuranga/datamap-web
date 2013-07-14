$(function () {
    var $OUT = $('#out-div');
    var outEl = $('#code-out').get(0);
    var inEl = $('#code-in').get(0);
    var transEl = $('#code-trans').get(0);
    var $TRANSFORM_BTN = $('#trans-btn');
    var $ERR_MSG = $('#err-msg');


    var config = {
        lineNumbers: true,
        matchBrackets: true,
        continueComments: 'Enter',
        extraKeys: {'Ctrl-Q': 'toggleComment'}
    };
    var editorIn = CodeMirror.fromTextArea(inEl, config);
    var editorTrans = CodeMirror.fromTextArea(transEl, config);

    var displayOutput = function (str) {
        CodeMirror.runMode(str, 'text/javascript', outEl);
    };

    var setError = function (e) {
        $ERR_MSG.show();
        $ERR_MSG.append('<ul>' + e + '</ul>');
        $OUT.hide();
    };

    var resetError = function () {
        $OUT.show();
        $ERR_MSG.html('');
        $ERR_MSG.hide();
    };

    var fillValues = function (trans, obj, path) {
        path = path || 'TransformObj';
        for (var key in trans) {
            var value = trans[key];
            if (typeof value === 'object') {
                fillValues(value, obj, path + '.' + key)
            } else {
                try {
                    trans[key] = eval('(function ($){ return ' + value + '; })')(obj);
                } catch (e) {
                    setError('Evaluation error in ' + path + '.' + key);
                }
            }
        }
    };


    $TRANSFORM_BTN.on('click', function () {
        var inObj, transObj, jsonParse = true;
        resetError();

        try {
            inObj = JSON.parse(editorIn.getValue());
        } catch (e) {
            jsonParse = false;
            setError('JSON parse error in input object');
        }

        try {
            transObj = JSON.parse(editorTrans.getValue());
        } catch (e) {
            jsonParse = false;
            setError('JSON parse error in transform definition');
        }

        if (jsonParse) {
            fillValues(transObj, inObj);
            displayOutput(JSON.stringify(transObj, undefined, 2));
        }

    });


});
