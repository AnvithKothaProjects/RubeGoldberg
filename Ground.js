function Ground(x , y, w, h, a, color){
    var options = {
      isStatic:true,
      angle: a,
      friction : 0.3,
      // restitution: 0.3
    }
    this.body = Bodies.rectangle(x,y,w,h,options);
    this.w = w;
    this.h = h;
    this.a = a;
    this.shouldShow = true; 
    World.add(myWorld, this.body);
    this.show = function(){
      if (this.shouldShow) {
        var pos = this.body.position;
        var angle = a;
        push();
        translate(pos.x,pos.y);
        noStroke();
        rotate(angle);
        fill(color);
        rectMode(CENTER)
        rect(0,0, this.w, this.h);
        pop();
      }
    }
  }