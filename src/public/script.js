'use strict';

const URL = 'http://localhost:3000';

(async _=> {

  const button  = document.querySelector( '.execute' ),
        input   = document.querySelector( '.input' ),
        output  = document.querySelector( '.output' ),
        inputEditor = CodeMirror.fromTextArea( input, {
          theme: 'the-matrix',
          mode: 'text/x-plsql',
          lineNumbers: true,
        }),
        outputEditor = CodeMirror.fromTextArea( output, {
          mode: {name: "javascript", json: true},
          theme: 'the-matrix',
          // cursorBlinkRate: -1,
          // readOnly: true,
          // mode: 'application/ld+json',
          // mode: 'application/json',
          // mode: 'text/javascript',
          lineNumbers: true,
          lineWrapping: true,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
          extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
          foldOptions: {
            widget: (from, to) => {
              var count = undefined;

              // Get open / close token
              var startToken = '{', endToken = '}';
              var prevLine = outputEditor.getLine(from.line);
              if (prevLine.lastIndexOf('[') > prevLine.lastIndexOf('{')) {
                startToken = '[', endToken = ']';
              }

              // Get json content
              var internal = outputEditor.getRange(from, to);
              var toParse = startToken + internal + endToken;

              // Get key count
              try {
                var parsed = JSON.parse(toParse);
                count = Object.keys(parsed).length;
              } catch(e) { }

              return count ? `\u21A4${count}\u21A6` : '\u2194';
            }
          },
        });

  button.addEventListener( 'click', async e => {

    let result = await execute( input.value );

    result = format( result );

    outputEditor.getDoc().setValue( result );
  });
})();


/**
 * Execute query
 * @param  {string} query
 * @return {undefined}
 **/
async function execute( query ) {

  try {

    const response = await fetch( URL, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' }
    });

    const result = await response.json();

    return result;
  }
  catch( error ) {

    console.error( 'Ошибка:', error );
  }

  return undefined;
}

/**
 * Format result
 * @param  {array} arr
 * @return {string} Return formated result
 **/
function format( arr ) {

  let str = '';

  const queryPlan = Boolean( arr[ 0 ][ 'QUERY PLAN' ]);

  if( queryPlan && arr.length > 1 ) {

    for( let i = 0; i < arr.length; i++ ) {

      str += ( arr[ i ][ 'QUERY PLAN' ] + '\n' );
    }
  }
  else {

    str = JSON.stringify( arr[ 0 ], null, 3);
  }

  return str;
}
