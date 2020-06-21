var connected = false
var myName;
var oppoName;
var mySym;
var oppoSym;
var connectedServer;
var emit;
var playerS;
var turn = false;
var socket;
isOnline = () => {
  return connected;
}
sendAction = sq => {
  if(!isOnline())
    connectToSocket();
    emit({
      event:"sendAction",
      pos: sq
    })
}
performPlayer2Action = (pos, ps) => {
  if(!isOnline())
      return false;
  var player = `<div class='${ps}'></div>`;
  currentPattern[pos-1] = 2;
  $("#"+pos.toString()).html(player);
  $("#"+pos.toString()).attr("style", "pointer-events: none;");
  var winner = checkPattern();
  if(winner != false && winner !== undefined) {
    GameEnded = true;
    return true;
  }
}
invertPlayers = () => {
  emit({
    event:"invertPlayers"
  })
}
$(document).ready(()=>{
    $(".hide-on-begin").hide();
    $(".tab").hide();
    $(".disconnect").hide();
    connectToSocket = () => {
      socket = new WebSocket("ws://localhost:8080");
      emit = json => { // just a little warper to make it easier
          return socket.send(JSON.stringify(json));
      }
      socket.onopen = function(e) {
        console.log("connected to server");
        connected = true;
      };
      
      socket.onmessage = function(event) {
          var rdata = JSON.parse(event.data);
          console.log(`[SERVER]: ${event.data.toString()}`);
          if(rdata.event == "serverCreate") {
            if(rdata.msg !== undefined) {
              if(rdata.stickyAlert != true)
                sendAlert(rdata.msg);
            }
            if(rdata.attr !== undefined) {
              if(rdata.attr == "created") {
                mySym = rdata.mySym;
                $("#plr1_sym").html(myName);
                $(".tab").hide();
                $(".options").removeClass("full");
                $(".toggler").fadeIn("fast")
                sendAlert("Waiting for the opponent to join..<br>Refresh the tab to cancel", `Room: ${rdata.rname}`, false)
                resetGame();
                turn = true;
              }
            }
          }
          else if(rdata.event == "serverJoin") {
            console.log("TESTS")
            if(rdata.msg !== undefined) {
                sendAlert(rdata.msg);
            }
            if(rdata.attr !== undefined) {
              if(rdata.attr == "joined") {
                resetGame();
                $("button.disconnect").show();
                $("button.connect").hide();
                console.log("ttttttttt")
                if(rdata.to == "player") {
                  oppoSym = rdata.oppoSym;
                  mySym = rdata.mySym;
                  $("#plr1_sym").html(mySym);
                  $("#plr2_sym").html(oppoSym);
                  $(".tab").hide();
                  $(".options").removeClass("full");
                  $(".toggler:not(button)").fadeIn("fast")
                  turn = false;
                }
                else if(rdata.to == "owner") {
                  oppoSym = rdata.oppoSym;
                  $("#plr2_sym").html(oppoSym);
                  killAlert();
                }
              }
            }
          }
          else if(rdata.event == "performAction") {
            if(rdata.pos != undefined) {
              performPlayer2Action(rdata.pos, rdata.player)
              turn = true;
            }
          }
          else if(rdata.event == "setPlayer") {
            if(rdata.player != undefined) {
              playerS = rdata.player;
              $("#plr1_sym").html(rdata.player);
              $("#plr2_sym").html(rdata.player2);
            }
          }
          else if(rdata.event == "win") {
            colorPattern(rdata.pattern);
            GameEnded = true;
            sendMsg(`${rdata.name} won..`);
            $("#plr2_score").html((parseInt($("#plr2_score").text())+1).toString())
          }
          else if(rdata.event == "resetGame") {
            if(rdata.attr == "disconnect") {
              socket.close(1000, "player_left");
            }
            if(rdata.onlyCursor === true) {
              resetGame(false, true);
            }
            else
              resetGame();
          }
      };
      socket.onclose = function(event) {
        if(event.reason === "player_left")
          sendAlert("[DiSCONNECT] Your opponent left the game..");
        else if(event.reason === "left")
          sendAlert("[DiSCONNECT] You left the game..");
        else
          sendAlert("[DiSCONNECT] Connection was closed");
        connected = false;
        isOnline = false;
        resetGame(true);
      };
      socket.onerror = function(error) {
        sendAlert("[ERROR] Please check your connection..");
        connected = false;
        isOnline = false;
        resetGame(true);
      };
    }
    createServer = (serverName, pass, name) => {
      let waitingTime = 100;
      $(".confirm.create").attr("disabled", true);
      $(".confirm.create").html("Connecting..");
      if(!connected) {
        connectToSocket();
        waitingTime = 3000;
      }
      setTimeout(()=>{
        emit({
          event:"createServer",
          server:serverName,
          password:pass,
          uname:name,
        });
        $(".confirm.create").removeAttr("disabled");
        $(".confirm.create").html("Create");
      }, waitingTime)

    };
    joinServer = (serverName, pass, name) => {
      let waitingTime = 100;
      $(".confirm.join").attr("disabled", true);
      $(".confirm.join").html("Connecting..");
      if(!connected) {
        connectToSocket();
        waitingTime = 3000;
      }
      setTimeout(()=>{
        emit({
          event:"joinServer",
          server:serverName,
          password:pass,
          uname:name,
        });
        $(".confirm.join").removeAttr("disabled");
        $(".confirm.join").html("Join");
      }, waitingTime)

    }
    win = () => {
      emit({
        event:"win",
        pattern:checkPattern().pattern
      });
      $("#plr1_score").html((parseInt($("#plr1_score").text())+1).toString())
    }
    resetForOpponent = onlyCursor => {
      emit({
        event:"resetGame",
        onlyCursor:onlyCursor
      });
    }
    $(".connect").click(()=>{
      $(".toggler").fadeOut("fast", ()=>{
        $(".options").addClass("full");
      });
    });
    $(".disconnect").click(()=>{
      socket.close(1000, "left");
      resetGame(true);
    });
    $(".cancel").click(()=>{
      $(".tab").hide();
      $(".options").removeClass("full");
      $(".toggler").fadeIn("fast")
    });
    $(".goto").click((e)=>{
      let goto = $(e.target).attr("to");
      $(".tab").hide();
      $(".hide-on-begin").hide();
      $(`.tab.${goto}`).fadeIn("fast");
    });

    $(".confirm.create").click((e)=>{
      let myname = $(".tab.create .myname").val();
      let rname = $(".tab.create .rname").val();
      let rpassword = $(".tab.create .rpassword").val();
      if(!myname || myname == "" || !rname || rname == "" ||  !rpassword || rpassword == "")
        return sendAlert("Please fill all fields..");
      createServer(rname, rpassword, myname);
    });
    $(".confirm.join").click((e)=>{
      let myname = $(".tab.join .myname").val();
      let rname = $(".tab.join .rname").val();
      let rpassword = $(".tab.join .rpassword").val();
      if(!myname || myname == "" || !rname || rname == "" ||  !rpassword || rpassword == "")
        return sendAlert("Please fill all fields..");
      joinServer(rname, rpassword, myname);
    });

    $(".square").click((e) => {
      if(isOnline() && !turn && GameEnded) {
        resetGame(false, true);
        resetForOpponent(true);
      }
      if(!isOnline() || !turn)
          return false;
      if(GameEnded) {
          resetGame();
          resetForOpponent();
          return true;
      }
      let player = `<div class='${playerS}'></div>`;
      let sq = parseInt($(e.target).attr("id"));
      currentPattern[sq-1] = 1;
      $(e.target).html(player);
      $(e.target).attr("style", "pointer-events: none;");
      sendAction(sq);
      turn = false;
      if(checkWinner() == 1) {
        invertPlayers();
        win();
        GameEnded = true;
        return true
      }
    });
    $(".square").hover((e) => {
      if(!turn || GameEnded)
        return false;
      let player = `<div class='${playerS} noanim notreal' style='opacity:0.7;'></div>`;
      $(e.target).html(player);
    }, (e) => {
      $('.notreal').remove();
    });
});
