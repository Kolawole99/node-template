import { promisify } from 'util';
import { genSalt, hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

const { SALT, SIGNATURE } = process.env;

/**
 * Hashes and the returns the hash of the object passed in as parameter.
 */
async function hashObject(objectToHash) {
    const salt = await genSalt(Number(SALT));
    return await hash(objectToHash, salt);
}

/**
 * Compares two object sentObject (what you want to verify) and the accurateObject (the single source of truth).
 * Returns a boolean or error.
 */
async function verifyObject({ sentObject, accurateObject }) {
    return await compare(sentObject, accurateObject);
}

const signJWT = promisify(sign);
/**
 * Generates and returns a JWT using the payload and expirationTime, the expirationTime has a default of 6 hours.
 */
async function generateToken({ payload, expirationTime = '6h' }) {
    return await signJWT(payload, SIGNATURE, { expiresIn: expirationTime });
}

const verifyJWT = promisify(verify);
/**
 * Checks the validity of a JWT. Returns a boolean or error if any.
 */
async function verifyToken(tokenToVerify) {
    return await verifyJWT(tokenToVerify, SIGNATURE);
}

global.hashObject = hashObject;
global.verifyObject = verifyObject;
global.generateToken = generateToken;
global.verifyToken = verifyToken;
