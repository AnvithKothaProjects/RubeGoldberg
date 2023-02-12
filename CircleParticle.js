function CircleParticle(x, y, w, h, res, stat, color){
    var options = {
      restitution: res,
      isStatic: stat,
      mass: 0.8
    }
      this.body = Bodies.rectangle(x,y,w,h,options);
      this.w = w;
      this.h = h;
      this.shouldShow = true;
      World.add(myWorld, this.body);
      this.show = function(){
        if (this.shouldShow) {
            var pos = this.body.position;
            var angle = this.body.angle;
            push();
            fill(color);
            translate(pos.x,pos.y);
            rotate(angle);
            rectMode(CENTER);
            var x = Math.random
            ellipse(0,0, this.w, this.h);
            pop(); 
        }
     }
  }