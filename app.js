let WebSocket = require('ws');
let sites = require('./sites.json');
let {log} = console;
let refresh_time = 5;

(async function waker() {
	console.log('Waking Procedure Starts');

	for(let each of sites) {
		await reload(each+".glitch.me");
	}
	console.log('Ready for next one')
	await wait(refresh_time);
	waker();
})();

function wait(t) {
	return new Promise(res=>setTimeout(res, t*1000));
}

function reload(site) {
	log("Waking ", site);
	return new Promise((res,rej)=>{
		console.log('\tConnecting ',site)
		var ws = new WebSocket("wss://" + site + "/___glitch_loading_status___", {
			headers: {
				"Origin": `https://${site}`,
				"Connection": "Upgrade",
				"User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36",
				"Upgrade": "websocket",
				"Accept-Encoding": "gzip, deflate, br",
				"Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
				"Cache-Control": "no-cache"
			}
		});
		console.log('\tConnection Req sent')
		ws.onmessage = (d)=>{
			console.log('\tGot message')
			if(updateStatus(d)){
				ws.close();
				res();
			}
		};
		ws.onerror = updateError;
		ws.onopen = function () {
			console.log('\tConnected');
		  setInterval(function () {
		    ws.send("keepalive");
		  }, 15000);
		};
		ws.onclose = function () {
		  res();
		  console.log('\tClosed');
		};
	});
};

function updateStatus(o) {
	let data = JSON.parse(o.data);
	console.log('\t', data.text);
	if(data.text === 'listening') {
		return true;
	}
	return false;
};

function updateError(er) {
	if(er.message == "Unexpected server response: 502") {
		console.log('\tApp already Started');
		return;
	}
	console.log("error error:")
	console.log(er);
}