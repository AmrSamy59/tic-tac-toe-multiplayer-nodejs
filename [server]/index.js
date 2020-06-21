const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })
var servers = {}
wss.on('connection', ws => {
    console.log('User connected')
    ws.on('message', d => {
        let data = JSON.parse(d);
        let event = data.event;
        if(event == "createServer") {
            if(servers[data.server] !== undefined && typeof servers[data.server] == "object") {
                ws.send(JSON.stringify({event:"serverCreate", msg:"This room was already registed, choose another name."}));
            }
            else {
                servers[data.server] = {};
                servers[data.server]["players"] = {};
                servers[data.server]["__options"] = {};
                servers[data.server]["__options"]["name"] = data.server;
                servers[data.server]["__options"]["password"] = data.password;
                ws.send(JSON.stringify({event:"serverCreate", attr:"created", stickyAlert:true, myName:data.uname, rname:data.server, msg:"Room Registered Successfully"}));
                servers[data.server]["players"][data.uname] = {client:ws, name:data.uname, player:"x"};
                servers[data.server]["__options"]["owner"] = {client:ws, name:data.uname, player:"x"};
                ws.send(JSON.stringify({event:"setPlayer", player:"x"}))
            }
        }
        else if(event == "joinServer") {
            if(servers[data.server] !== undefined && typeof servers[data.server] == "object") {
                if(servers[data.server]["players"][data.uname] !== undefined && servers[data.server]["players"][data.uname].client == ws) {
                    ws.send(JSON.stringify({event:"serverJoin", msg:"You're already in this room"}));
                }
                else{
                    let serverOwner = getServerOwner(servers[data.server]);
                    if(data.password != servers[data.server]["__options"]["password"]) {
                        ws.send(JSON.stringify({event:"serverJoin", msg:"Invalid password..."}));
                    }
                    else if(data.uname == serverOwner.name) {
                        ws.send(JSON.stringify({event:"serverJoin", msg:"The other player uses the same name please choose another!.."}));
                    }
                    else {
                        servers[data.server]["players"][data.uname] = {client:ws, name:data.uname, player:"o"}
                        ws.send(JSON.stringify({event:"setPlayer", player:"o"}))
                        ws.send(JSON.stringify({event:"serverJoin", attr:"joined", to:"player", mySym:"o", oppoSym:"x", msg:"Joined Successfully"}));
                        serverOwner.client.send(JSON.stringify({event:"serverJoin", attr:"joined", to:"owner", mySym:"x", oppoSym:"o"}));
                    }
                }
            }
            else{
                ws.send(JSON.stringify({event:"serverJoin", msg:"Specified room doesn't exist"}));
                return;
            }
        }
        else if(event == "sendAction") {
            let co = getClientOpponent(ws);
            if(co !== undefined)
                co.client.send(JSON.stringify({event:"performAction", pos:data.pos, player:getClientPlayer(ws)}))
        }
        else if(event == "invertPlayers") {
            let cs = getClientServer(ws);
            if(cs !== undefined)
                invertPlayers(cs);
        }
        else if(event == "win") {
            let co = getClientOpponent(ws);
            if(co !== undefined)
                co.client.send(JSON.stringify({event:"win", pattern:data.pattern, name:getClientName(ws)}))
        }
        else if(event == "resetGame") {
            let co = getClientOpponent(ws);
            if(co !== undefined)
                co.client.send(JSON.stringify({event:"resetGame", onlyCursor:data.onlyCursor}));
        }
    });
    ws.on('close', () => {
        let cs = getClientServer(ws);
        if(cs !== undefined) {
            let serverN = getServerName(cs);
            let oppo = getClientOpponent(ws);
            if(oppo !== undefined) {
                oppo.client.send(JSON.stringify({event:"resetGame", attr:"disconnect"}));
            }
            delete servers[serverN];
            console.log(`Deleted room: ${serverN}`)
        }
    });
})

getClientServer = w => { 
    for (const [serverName, v] of Object.entries(servers)) {
        for(const [i, info] of Object.entries(v["players"])) {
            if(info.client == w) {
                return v;
            }
        }
    };
}

getClientName = w => { 
    for (const [serverName, v] of Object.entries(servers)) {
        for(const [i, info] of Object.entries(v["players"])) {
            if(info.client == w) {
                return info.name;
            }
        }
    };
}
getClientOpponent = w => {
    for(const [i, info] of Object.entries(getClientServer(w)["players"])) {
        if(info.client != w) {
            return info;
        }
    };
}
getClientPlayer = w => {
    let cserver = getServerName(getClientServer(w));
    let cname = getClientName(w);
    return servers[cserver]["players"][cname].player;
}
getServerName = s => {
    return s["__options"]["name"];
}
getServerOwner = s => {
    return s["__options"]["owner"];
}
invertPlayers = s => {
    let cserver = getServerName(s);
    for(const [i, info] of Object.entries(s["players"])) {
        if(info.client != undefined && info.player != undefined) {
            if(info.player == "x") {
                let cname = getClientName(info.client);
                servers[cserver]["players"][cname].player = "o";
                info.client.send(JSON.stringify({event:"setPlayer", player:"o", player2:"x"}))
            }
            else if(info.player == "o") {
                let cname = getClientName(info.client);
                servers[cserver]["players"][cname].player = "x";
                info.client.send(JSON.stringify({event:"setPlayer", player:"x", player2:"o"}))
            }
        }
    };
}