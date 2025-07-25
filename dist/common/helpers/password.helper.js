"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHelper = void 0;
const environment_1 = require("../environment");
const bcryptjs_1 = require("bcryptjs");
const HASH_ROUNDS = environment_1.NODE_ENV === 'development' ? 1 : 10;
class PasswordHelper {
    /**
     * Generate password hash
     *
     * @param {string} password
     * @returns {string}
     * @memberOf PasswordHelper
     */
    static generateHash(password) {
        return (0, bcryptjs_1.hashSync)(password, HASH_ROUNDS);
    }
    /**
     * Check password
     *
     * @static
     * @param {string} password
     * @param {string} hash
     * @returns {boolean}
     * @memberOf PasswordHelper
     */
    static compareHash(password, hash) {
        return (0, bcryptjs_1.compareSync)(password, hash);
    }
    /**
     * generate strong password
     * @returns
     */
    static generateStrongPassword() {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$^&*ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const passwordLength = 10;
        let password = '';
        for (let i = 0; i <= passwordLength; i++) {
            const randomNumber = Math.floor(Math.random() * chars.length);
            password += chars.substring(randomNumber, randomNumber + 1);
        }
        return password;
    }
}
exports.PasswordHelper = PasswordHelper;
