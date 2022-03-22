"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("assert/strict"));
const dotenv_1 = require("dotenv");
function checkEnv(envName) {
    const env = process.env[envName];
    strict_1.default.notStrictEqual(env, undefined);
    return env;
}
(0, dotenv_1.config)();
exports.default = {
    gear: {
        ws: process.env.GEAR_WS_ADDRESS || 'ws://localhost:9944',
        oracle: checkEnv('ORACLE_ADDRESS'),
        pathToMeta: checkEnv('PATH_TO_ORACLE_META'),
    },
    chainlink: {
        url: checkEnv('CL_URL'),
        inAccessKey: checkEnv('CL_IN_ACCESS_KEY'),
        inSecret: checkEnv('CL_IN_SECRET'),
        outAccessKey: checkEnv('CL_OUT_ACCESS_KEY'),
        outSecret: checkEnv('CL_OUT_SECRET'),
    },
};
