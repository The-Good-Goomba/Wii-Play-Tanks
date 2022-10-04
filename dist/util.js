"use strict";
// Load a text resource from a file over the network
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function loadTextResource(url) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        var request = yield fetch(url);
        if (request.status < 200 || request.status > 299) {
            reject('Error: HTTP Status ' + request.status + ' on resource ' + url);
        }
        else {
            resolve(request.text());
        }
    }));
}
// Load a JSON resource from a file over the network
function loadJSONResource(url) {
    return __awaiter(this, void 0, void 0, function* () {
        var json = yield loadTextResource(url);
        return JSON.parse(json);
    });
}
// Load an image resource from a file over the network
function loadImageResource(url) {
    return new Promise((resolve) => {
        var image = new Image();
        image.onload = function () {
            resolve(image);
        };
        image.src = url;
    });
}
