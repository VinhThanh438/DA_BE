import { NODE_ENV } from '@common/environment';
import { compareSync, hashSync } from 'bcryptjs';

const HASH_ROUNDS = NODE_ENV === 'development' ? 1 : 10;

export class PasswordHelper {
    /**
     * Generate password hash
     *
     * @param {string} password
     * @returns {string}
     * @memberOf PasswordHelper
     */
    static generateHash(password: string): string {
        return hashSync(password, HASH_ROUNDS);
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
    static compareHash(password: string, hash: string): boolean {
        return compareSync(password, hash);
    }

    /**
     * generate strong password
     * @returns
     */
    static generateStrongPassword(): string {
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
