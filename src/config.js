'use strict';

const path     = require( 'path' ),
      dotenv   = require( 'dotenv' ),
      config   = dotenv.config({ path: path.resolve( __dirname, '.env' )}).parsed,
      defaults = {

        DB_CONN: 'postgres://user:pass@localhost:port/dbname'
      };

module.exports = Object.assign( defaults, config );
