/*jslint browser this */
/*global _, player */

var technique1 =  [[0,0,0,0,1,1,1,1,3,3,3,3,4,4,4,4,
    5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9],
    [1,4,6,8,1,4,6,8,1,4,6,8,1,4,6,8,1,4,6,8,
        1,4,6,8,1,4,6,8,1,4,6,8,1,4,6,8,1,4,6,8]];
var technique2 =  [[1,1,1,1,1,1,1,1,1,1,
    2,2,2,2,2,2,2,2,2,2,2,1,1,1,1],
    [0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
        0,1,2,3,4,5,6,7,8,9]];
//var technique2 =  [[0,1,3,4,5,6,7,8,9, 0,1,3,4,5,6,7,8,9,
// 0,1,3,4,5,6,7,8,9,0,1,3,4,5,6,7,8,9, 0,1,3,4,5,6,7,8,9,
// 0,1,3,4,5,6,7,8,9, , 0,1,3,4,5,6,7,8,9],
// [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3
// ,4,4,4,4,4,4,4,4,4,4, 6,6,6,6,6,6,6,6,6,6,
// 7,7,7,7,7,7,7,7,7,7,9,9,9,9,9,9,9,9,9,9]];
var technique3 =  [[1,1,1,1,1,3,3,3,3,3,5,5,5,5,5,7,7,7,7,7,9,9,9,9,9],
    [1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5]];
var technique4 = [[5,5,8,6,6,5,8,7,7,5,8,8,8,5,8,9,5], [0,2,3,9,0,3,4,9,0,4,5,9,0,5,6,0,6]]
var tableau = [technique4];

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        i: _.sample(tableau),
        m: -1,
        play: function () {
          this.m = this.m+1;
          var hello = this.m;
          var tab = this.i;
          console.log(tab);
        var x = tab[0];
        var y = tab[1];
            var self = this;
            setTimeout(function () {
                self.game.fire(this, x[hello], y[hello], function (hasSucced) {
                    self.tries[0][0] = hasSucced;
                });
            }, 200);
        },
        areShipsOk: function (callback){
          var tab = ["vertical", "horizontal"];
          var tab_y = _.range(10);
          var tab_x = _.range(10);
          var i = 0;
            var j = 0;
            var h = 0;
            var v = 0;
            var ship = this.fleet[i];
            var reset = false;
            var direction = _.sample(tab);
            var y = _.sample(tab_y);
            var x = _.sample(tab_x);
            var cel = "";
            while (i < this.fleet.length) {
           j = 0;
           h = 0;
           v = 0;
            ship = this.fleet[i];
            reset = false;
            direction = _.sample(tab);
            y = _.sample(tab_y);
            x = _.sample(tab_x);
            console.log("creat" + ship.name +", direction: "
                + direction + " y: " +y + " x: " + x);
              while (j < ship.life && reset == false) {
              if (this.grid[y + v]) {
                cel = this.grid[y + v][x + h];
                //alert('value = '+ cel)
                if (cel !== 0) {
                  reset = true;
                  if ((direction == "vertical" && v !== 0) ||
                      (direction == "horizontal" && h !== 0)) {
                    if (direction == "vertical") {
                      v--;
                    }
                    else {
                      h--;
                    }
                    while (j >= 0) {
                      if (this.grid[y + v]) {
                        this.grid[y + v][x + h] = 0;
                        if (direction == "vertical") {
                          v--;
                        }
                        else {
                          h--;
                        }
                        j--;
                      }
                    }
                  }
                }
                else {
                  this.grid[y + v][x + h] = ship.getId();
                  //alert(this.grid)
                  if (direction == "vertical") {
                    v++;
                  }
                  else {
                    h++;
                  }
                  j++;
                }
              }
              else {
                reset = true;
                if (direction == "vertical") {
                  v--;
                }
                else {
                  h--;
                }
                while (j >= 0) {
                  this.grid[y + v][x + h] = 0;
                  if (direction == "vertical") {
                    v--;
                  }
                  else {
                    h--;
                  }
                  j--;
                }
              }
            }
            if (reset) {
              console.log("i = " + i + " " + ship.name + " fail");
              i = i;
            }
            else {
              console.log("i = " + i + " " +ship.name +" reussite");
              console.log("-----(-) -> ___________________");
              for (var test = 0; test < this.grid.length; test++) {
                console.log("ligne("+test+") ->|" +this.grid[test])
              }
              i++;
            }
          }
          setTimeout(function () {
              callback();
          }, 500);
        }
    });

    global.computer = computer;

}(this));
