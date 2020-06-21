var patterns = [
    [1,2,3],
    [4,5,6],
    [7,8,9],
    [2,5,8],
    [1,4,7],
    [3,6,9],
    [1,5,9],
    [3,5,7]
];
var GameEnded = false;
var PLR_1_NAME = 1
var PLR_2_NAME = 2
var currentPattern;
$(document).ready(()=> {
    currentPattern = [0,0,0,0,0,0,0,0,0];
    resetGame = (resetScore, onlyCursor) => {
        if(onlyCursor) {
            $(".square").removeAttr("style");
            return true;
        }
        $(".square").html("");
        $(".square").removeClass("o-colored");
        $(".square").removeClass("x-colored");
        $(".square").removeClass("win");
        $(".msgs span").html("");
        $(".square").removeAttr("style");
        currentPattern = [0,0,0,0,0,0,0,0,0];
        GameEnded = false;
        /*if(!isOnline) {
            $("#plr1_name").html("Player 1");
            $("#plr2_name").html("Player 2");
        }*/
        if(resetScore) {
            $("#plr1_score").html(0);
            $("#plr2_score").html(0);
            $("button.disconnect").hide();
            $("button.connect").show();
        }
    };
    doesArrayContainAnother = (a, an) => {
        var totalFound = 0;
        for(i=0; i < a.length; i++) {
            var item = a[i];
            for(var k=0; k < an.length; k++) {
                var item2 = an[k];
                if(item==item2) {
                    totalFound += 1;
                }
            }
        }
        if(totalFound != 0 && totalFound >= an.length)
            return true;
        else
            return false;
}
    checkPattern = () => {
        var p1p = [];
        var p2p = [];
        for (var i = 0; i < 9; i++) {
            if (currentPattern[i] != 0) {
                var pos = i+1;
                var player = currentPattern[i];
                if(player == PLR_1_NAME) {
                    p1p.push(pos);
                }
                else if(player == PLR_2_NAME) {
                    p2p.push(pos);
                }
            }
        }
        for(var i=0; i < patterns.length; i++) {
            var cpattern = patterns[i];
            if(doesArrayContainAnother(p1p, cpattern))
                return {plr:PLR_1_NAME, pattern:cpattern};
            else if(doesArrayContainAnother(p2p, cpattern))
                return {plr:PLR_2_NAME, pattern:cpattern};
        }
        return false
    };
    guessNextPosition = (player) => {
        for(var i=0; i < 9; i+=3) {
            var p1 = currentPattern[i];
            var p2 = currentPattern[i+1];
            var p3 = currentPattern[i+2];
            if(p1==p3 && p3==player && p2==0)
                return i+2;
            else if(p1==p2 && p2==player && p3==0) 
                return i+3;
            else if(p3==p2 && p2==player && p1==0)
                return i+1;
        }
        var p1 = currentPattern[0];
        var p2 = currentPattern[4];
        var p3 = currentPattern[8];
        if(p1==p3 && p3==player && p2==0)
            return 5;
        else if(p1==p2 && p2==player && p3==0) 
            return 9;
        else if(p3==p2 && p2==player && p1==0)
            return 1;
        
        var p1 = currentPattern[2];
        var p2 = currentPattern[4];
        var p3 = currentPattern[6];
        if(p1==p3 && p3==player && p2==0)
            return 5;
        else if(p1==p2 && p2==player && p3==0) 
            return 7;
        else if(p3==p2 && p2==player && p1==0)
            return 3;
        var p4 = patterns[3];
        var p5 = patterns[4];
        var p6 = patterns[5];
        if(currentPattern[p4[0]-1]==currentPattern[p4[2]-1] && currentPattern[p4[2]-1]==player && currentPattern[p4[1]-1]==0)
            return p4[1];
        else if(currentPattern[p4[0]-1]==currentPattern[p4[1]-1] && currentPattern[p4[1]-1]==player && currentPattern[p4[2]-1]==0) 
            return p4[2];
        else if(currentPattern[p4[1]-1]==currentPattern[p4[2]-1] && currentPattern[p4[2]-1]==player && currentPattern[p4[0]-1]==0) 
            return p4[0];
        
        if(currentPattern[p5[0]-1]==currentPattern[p5[2]-1] && currentPattern[p5[2]-1]==player && currentPattern[p5[1]-1]==0)
            return p5[1];
        else if(currentPattern[p5[0]-1]==currentPattern[p5[1]-1] && currentPattern[p5[1]-1]==player && currentPattern[p5[2]-1]==0) 
            return p5[2];
        else if(currentPattern[p5[1]-1]==currentPattern[p5[2]-1] && currentPattern[p5[2]-1]==player && currentPattern[p5[0]-1]==0) 
            return p5[0];

        if(currentPattern[p6[0]-1]==currentPattern[p6[2]-1] && currentPattern[p6[2]-1]==player && currentPattern[p6[1]-1]==0)
            return p6[1];
        else if(currentPattern[p6[0]-1]==currentPattern[p6[1]-1] && currentPattern[p6[1]-1]==player && currentPattern[p6[2]-1]==0) 
            return p6[2];
        else if(currentPattern[p6[1]-1]==currentPattern[p6[2]-1] && currentPattern[p6[2]-1]==player && currentPattern[p6[0]-1]==0) 
            return p6[0];
        return false;
    }
    performComputerAction = () => {
        if(isOnline())
            return false;
        var freePositions = []
        for(var i=0; i < 9; i++) {
            var p = currentPattern[i]
            if(p==0)
                freePositions.push(i+1);
        }
        var p1pos = guessNextPosition(PLR_1_NAME);
        var p2pos = guessNextPosition(PLR_2_NAME);
        var defend_or_random = Math.floor(Math.random() * 5)
        var usablepos = p2pos;
        if(p2pos == false && defend_or_random >= 1) // 0 > defend, 0 = random position
            usablepos = p1pos;
        if(p1pos == false || defend_or_random == 0)
            usablepos = freePositions[Math.floor(Math.random() * freePositions.length)];
        var player = "<div class='o'></div>";
        currentPattern[usablepos-1] = 2;
        $("#"+usablepos.toString()).html(player);
        $("#"+usablepos.toString()).attr("style", "pointer-events: none;");
        $("#"+usablepos.toString()).addClass("o-colored");
        checkWinner();
    }
    colorPattern = pattern => {
        for(var i=0; i<3; i++) {
            var id = pattern[i];
            $(".square#"+id).addClass("win");
        }
    }
    checkWinner = () => {
        var check = checkPattern();
        if(check != false && check !== undefined) {
            if(check.plr == 1)
                sendMsg("You won!!");
            else
                sendMsg("Player 2 won..");
            $(".square").removeAttr("style");
            colorPattern(check.pattern);
            GameEnded = true;
            $("#plr"+check.plr+"_score").html((parseInt($("#plr"+check.plr+"_score").text())+1).toString())
            return true;
        }
        else if(!currentPattern.includes(0)) {
            sendMsg("Draw..!");
            $(".square").removeAttr("style");
            return true;
        }
        else
            return false
    }
    $(".square").click((e) => {
        if(isOnline())
            return false;
        if(GameEnded) {
            resetGame();
            return true;
        }
        let player = "<div class='x'></div>";
        let sq = parseInt($(e.target).attr("id"));
        currentPattern[sq-1] = 1;
        $(e.target).html(player);
        $(e.target).attr("style", "pointer-events: none;");
        $(e.target).addClass("x-colored");
        if(checkWinner()) {
            GameEnded = true;
            return true
        }
        performComputerAction();
    });
    $(".square").hover((e) => {
        if(isOnline())
            return false;
        if(GameEnded) {
            return false;
        }
        let player = "<div class='x noanim notreal' style='opacity:0.7;'></div>";
        $(e.target).html(player);
    }, (e) => {
        $('.notreal').remove();
    });
});