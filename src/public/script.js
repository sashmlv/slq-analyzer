'use strict';

const URL = 'http://localhost:3000';

(async _=> {

  let inputContent = localStorage.getItem( 'input' );

  const button  = document.querySelector( '.execute' ),
        inputEditor = CodeMirror.fromTextArea( document.querySelector( '.input' ), {

          theme: 'the-matrix',
          mode: 'text/x-plsql',
          lineNumbers: true,
        }),
        outputEditor = CodeMirror.fromTextArea( document.querySelector( '.output' ), {

          // mode: 'application/ld+json',
          // mode: 'application/json',
          // mode: 'text/javascript',
          mode: {

            name: 'javascript',
            json: true
          },
          theme: 'the-matrix',
          // cursorBlinkRate: -1,
          // readOnly: true,
          lineNumbers: true,
          lineWrapping: true,
          foldGutter: true,
          gutters: [

            'CodeMirror-linenumbers',
            'CodeMirror-foldgutter'
          ],
          extraKeys: {

            'Ctrl-Q': function( cm ) {

              cm.foldCode( cm.getCursor());
            }
          },
          foldOptions: {

            widget: ( from, to ) => {

              let count      = undefined,
                  startToken = '{',
                  endToken   = '}',
                  prevLine   = outputEditor.getLine( from.line );

              if( prevLine.lastIndexOf( '[' ) > prevLine.lastIndexOf( '{' )) {

                startToken = '[',
                endToken   = ']';
              }

              let internal = outputEditor.getRange( from, to ),
                  toParse  = startToken + internal + endToken;

              try {

                var parsed = JSON.parse( toParse );
                count = Object.keys( parsed ).length;
              }
              catch( e ) {

                console.log( e );
              }

              return count ? `\u21A4${ count }\u21A6` : '\u2194';
            }
          },
        });

  inputEditor.getDoc().setValue( inputContent );

  inputEditor.on( 'change', editor => {

    localStorage.setItem( 'input', editor.getValue());
  });

  button.addEventListener( 'click', async e => {

    let result = await execute( inputEditor.getDoc().getValue() );

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

  const queryPlan = arr && arr[ 0 ] && arr[ 0 ][ 'QUERY PLAN' ];

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
