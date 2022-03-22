"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequests = void 0;
function getRequests(stateRequests) {
    if (stateRequests.size === 0) {
        return null;
    }
    const result = [];
    stateRequests.forEach((value, key) => {
        result.push({ jobId: value.job_id.toString(), data: value.data.toString(), accountAndRequestId: key.toString() });
    });
    return result;
}
exports.getRequests = getRequests;
