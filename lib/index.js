'use strict'

// Load required modules
const FirebaseAdminSdk = require('firebase-admin');
const Package = require('../package');
const Unauthorized = require('boom').unauthorized;

// Export plugin
exports.plugin = {
  name: Package.name,
  version: Package.version,
  Package,
  register(server, options) {
    server.auth.scheme('firebase', firebaseAuthScheme)
  }
}

function firebaseAuthScheme(server, options) {
  return {

    /**
     * Hapi's authenticate method. This is where the magic happens
     *
     * @param {*} request Request object created by the server
     * @param {*} h Standard hapi response toolkit
     */
    authenticate(request, h) {

      // Get token from header
      const token = getToken(request);

      // If token not found, return an 'unauthorized' response
      if (token === null) {
        throw Unauthorized('token_not_provided');
      }

      // This variable will hold Firebase's instance
      let firebaseInstance;

      try {

        if (options.instance) {

          // Great! We can just use this instance ready to go
          firebaseInstance = options.instance;

        } else {

          // Initialize Firebase instance
          firebaseInstance = FirebaseAdminSdk.initializeApp({
            credential: FirebaseAdminSdk.credential.cert({
              projectId: options.credential.projectId,
              clientEmail: options.credential.clientEmail,
              privateKey: options.credential.privateKey
            }),
            databaseURL: options.credential.databaseURL
          })
        }

        // Check if Firebase is initialized
        const instance = firebaseInstance.instanceId();

      } catch (error) {

        // Firebase not initialized
        throw Unauthorized('auth_provider_not_initialized');
      }

      // Validate token
      return validateToken(token, firebaseInstance, h);
    }
  }
}

/**
 * Gets the token from the request header
 * This function looks for the property 'authorization' in the
 * header and gets whatever is appended after the word 'Bearer'
 *
 * @param {*} request Request object created by the server
 */
function getToken(request) {

  // Get authorization property from request header
  const requestAuthorization = request.headers.authorization;
  if (!requestAuthorization) return null;

  // Define a regular expression to match the case we want and test it
  const matchRegex = new RegExp(/(bearer)[ ]+(.*)/i);
  const resultMatch = requestAuthorization.match(matchRegex);

  // If no matches found, there is no token available
  if (!resultMatch) return null;

  // Match found! Return token
  return resultMatch[2] || null;
}

/**
 * Validate the provided token using Firebase Admin SDK
 *
 * @param {*} token Access token provided by Firebase Auth
 * @param {*} firebaseInstance Initialized Firebase App instance
 * @param {*} h Standard hapi response toolkit
 */
function validateToken(token, firebaseInstance, h) {

  // Verify token using Firebase's credentials
  return firebaseInstance.auth().verifyIdToken(token)
  .then(function(credentials) {

    // Valid token!
    return h.authenticated({ credentials })

  }).catch(function(error) {

    console.log(error)

    // Invalid token
    throw Unauthorized('invalid_token')
  });
}
