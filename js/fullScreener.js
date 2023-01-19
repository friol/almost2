/* full-screener */

class fullScreener
{
    constructor(px,py)
    {
        this.posx=px;
        this.posy=py;
        this.hover=false;
        this.elname="fullScreener";
        this.disappearCounter=0;
        this.maxCounter=180;
    }

    draw(ctx)
    {
        if (this.disappearCounter>=this.maxCounter) return;

        ctx.shadowBlur=0;
        ctx.shadowColor="black";

        if (!this.hover) ctx.strokeStyle = 'gray';
        else ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(this.posx,this.posy+8);
        ctx.lineTo(this.posx,this.posy);
        ctx.lineTo(this.posx+8,this.posy);
        ctx.stroke();        
        ctx.beginPath();
        ctx.moveTo(this.posx+24,this.posy+16);
        ctx.lineTo(this.posx+24,this.posy+16+8);
        ctx.lineTo(this.posx+24-8,this.posy+16+8);
        ctx.stroke();        

        this.disappearCounter++;
    }

    mouseMove(mx,my)
    {
        var x0=this.posx;
        var y0=this.posy;
        var x1=this.posx+24;
        var y1=this.posy+16+8;

        if ((mx>=x0)&&(mx<x1)&&(my>=y0)&&(my<y1))
        {
            this.hover=true;
            this.disappearCounter=0;
        }
        else
        {
            this.hover=false;
        }
    }

    mouseClick(mx,my)
    {
    }

    mouseUp(mx,my)
    {
        if (this.hover)
        {
            if (!document.fullscreenElement) 
            {
                document.getElementById("titleDiv").style.display="none";
                document.getElementById("taglineDiv").style.display="none";
                document.documentElement.requestFullscreen();
                document.getElementById("a2display").style.position="fixed";
                document.getElementById("a2display").style.left=0;
                document.getElementById("a2display").style.top=0;
                document.getElementById("a2display").style.width="100%";
                document.getElementById("a2display").style.height="100%";
            }
        }
    }

    setppos(ppx,ppy)
    {
    }
}
