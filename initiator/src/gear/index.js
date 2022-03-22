"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const api_1 = require("@gear-js/api");
const fs_1 = require("fs");
const path_1 = require("path");
const chainlink_1 = require("../chainlink");
const config_1 = __importDefault(require("../config"));
const oracle_requests_1 = require("./oracle-requests");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const api = yield api_1.GearApi.create({ providerAddress: config_1.default.gear.ws });
    const oracleAddress = config_1.default.gear.oracle;
    const meta = (0, fs_1.readFileSync)((0, path_1.resolve)(config_1.default.gear.pathToMeta));
    while (true) {
        yield Promise.all([
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                const state = (yield api.programState.read(oracleAddress, meta));
                const requests = (0, oracle_requests_1.getRequests)(state.requests);
                if (requests !== null) {
                    (0, chainlink_1.sendRequests)(requests);
                }
            }), 10000),
        ]);
    }
});
exports.main = main;
