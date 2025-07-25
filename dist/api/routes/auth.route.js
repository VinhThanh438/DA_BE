"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_validator_1 = require("../validation/auth.validator");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/login', (0, validate_middleware_1.validateRequest)(auth_validator_1.logIn), auth_controller_1.AuthController.login);
router.use(auth_middleware_1.AuthMiddleware.authenticate);
router.get('/info', auth_controller_1.AuthController.getInfo);
router.post('/logout', auth_controller_1.AuthController.logout);
exports.default = router;
