// Load a text resource from a file over the network

async function loadTextResource(url) {
    return new Promise<string>(async (resolve, reject) => {
        var request = await fetch(url);
        if (request.status < 200 || request.status > 299) {
            reject('Error: HTTP Status ' + request.status + ' on resource ' + url);
        } else {
            resolve(request.text());
        }
    });
}

// Load a JSON resource from a file over the network
async function loadJSONResource(url) {
    var json = await loadTextResource(url);
    return JSON.parse(json);
}

// Load an image resource from a file over the network
function loadImageResource(url) {
    return new Promise<TexImageSource>((resolve) => {
        var image = new Image();
        image.onload = function() {
            resolve(image);
        };
        image.src = url;
    });
    
}