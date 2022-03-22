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
exports.sendRequests = exports.makeRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
function makeRequest({ jobId, data, accountAndRequestId }) {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = `${config_1.default.chainlink.url}/v2/jobs/${jobId}/runs`;
        const headers = {
            'Content-Type': 'application/json',
            'X-Chainlink-EA-AccessKey': config_1.default.chainlink.inAccessKey,
            'X-Chainlink-EA-Secret': config_1.default.chainlink.inSecret,
        };
        const response = yield axios_1.default.post(uri, Object.assign(Object.assign({}, JSON.parse(data)), { accountAndRequestId }), { headers });
        return response.data;
    });
}
exports.makeRequest = makeRequest;
function sendRequests(requests) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let request of requests) {
            const responseData = makeRequest(request);
            console.log(responseData);
        }
    });
}
exports.sendRequests = sendRequests;
