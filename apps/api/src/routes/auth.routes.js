"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
var express_1 = require("express");
var jwt_routes_1 = require("./auth/jwt.routes");
var siwe_routes_1 = require("./auth/siwe.routes");
var protected_routes_1 = require("./auth/protected.routes");
var dev_routes_1 = require("./auth/dev.routes");
// Create router
var router = (0, express_1.Router)();
/**
 * JWT-based Authentication Routes
 * Traditional authentication flow with JWT tokens
 */
router.use('/jwt', jwt_routes_1.default);
/**
 * SIWE Authentication Routes
 * Sign-In With Ethereum authentication flow
 */
router.use('/siwe', siwe_routes_1.default);
/**
 * Protected Routes
 * These endpoints are accessible via any auth method
 */
router.use('/protected', protected_routes_1.default);
/**
 * Development/Admin Routes
 * These endpoints are only available in non-production environments
 */
if (process.env.NODE_ENV !== 'production') {
    router.use('/dev', dev_routes_1.default);
}
/**
 * Proxy route for Merkle.io API to avoid CORS issues
 * This acts as a middleware to forward requests to Merkle.io
 */
router.all('/proxy/merkle/*', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var path, url, response, contentType, data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                path = req.path.replace('/proxy/merkle', '') || '/';
                url = "https://eth.merkle.io".concat(path);
                console.log("Proxying request to: ".concat(url));
                return [4 /*yield*/, fetch(url, __assign({ method: req.method, headers: __assign({ 'Content-Type': 'application/json' }, (req.headers.authorization
                            ? { Authorization: req.headers.authorization }
                            : {})) }, (req.method !== 'GET' && { body: JSON.stringify(req.body) })))];
            case 1:
                response = _a.sent();
                contentType = response.headers.get('content-type') || '';
                data = void 0;
                if (!contentType.includes('application/json')) return [3 /*break*/, 3];
                return [4 /*yield*/, response.json()];
            case 2:
                data = _a.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, response.text()];
            case 4:
                data = _a.sent();
                _a.label = 5;
            case 5:
                // Forward the response status and data
                res.status(response.status).send(data);
                return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                console.error('Merkle proxy error:', error_1);
                res.status(500).json({ error: 'Error proxying request to Merkle.io' });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
/**
 * Proxy route for Ethereum RPC to avoid CORS issues
 */
router.all('/proxy/ethereum', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rpcUrl, response, data, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                rpcUrl = process.env.ETHEREUM_RPC_URL || 'http://localhost:8545';
                console.log("Proxying Ethereum RPC request to: ".concat(rpcUrl));
                return [4 /*yield*/, fetch(rpcUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(req.body)
                    })];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 2:
                data = _a.sent();
                res.status(response.status).json(data);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('Ethereum RPC proxy error:', error_2);
                res.status(500).json({ error: 'Error proxying request to Ethereum RPC' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Export the router
exports.authRouter = router;
