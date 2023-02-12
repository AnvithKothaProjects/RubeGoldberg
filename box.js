function Box(x,y,w,h,fixed,d){
    var options={
        friction: 0.6,
        restitution: 0,
        isStatic: fixed,
        density: d
    }
    this.body = Bodies.rectangle(x, y, w,h,options);
    this.w=w;
    this.h=h;
    this.shouldShow = true;
    World.add(myWorld,this.body);

    this.show =function(){
        if (this.shouldShow) {
            var pos =this.body.position;
            var angle= this.body.angle;

            push();
            translate(pos.x,pos.y);
            rect(0,0,w,h)
            pop();
        }
    }
}