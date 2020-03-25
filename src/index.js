'use strict';

const config = require( './config' ),
      f      = require( 'fastify' )({ logger: true }),
      path   = require( 'path' ),
      { Pool, Client } = require( 'pg' ),
      pool             = new Pool({ connectionString: config.DB_CONN });

f.register( require( 'fastify-static' ), { root: path.join( __dirname, 'public' ),});

f.get( '/', async ( req, rep ) => rep.sendFile( 'index.html' ));

f.post( '/', async ( req, rep ) => {

  try {

    const query  = req.body,
          result = await pool.query( query );

    return rep.send( result.rows );
  }
  catch( e ) {

    console.log( e );

    return rep.send( e );
  }
});

f.listen( 3000, ( err, address ) => {

  if( err ) {

    throw err;
  };
});
