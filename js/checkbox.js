/* gui - checkbox */

class guiCheckbox
{
    constructor(px,py,pposx,pposy,state,text,selCback)
    {
        this.posx=px;
        this.posy=py;
        this.pposx=pposx;
        this.pposy=pposy;
        this.state=state;
        this.text=text;
        this.highlighted=false;
        this.callback=selCback;
    }

    draw(ctx)
    {
        const cbon=document.getElementById("checkboxOn");
        const cboff=document.getElementById("checkboxOff");

        if (this.state)
        {
            ctx.drawImage(cbon,this.posx+this.pposx,this.posy+this.pposy);
        }
        else
        {
            ctx.drawImage(cboff,this.posx+this.pposx,this.posy+this.pposy);
        }

        ctx.font         = '14px pixelsquare';
        if (this.highlighted) ctx.fillStyle = '#3EE3B7';
        else ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText  (this.text,this.posx+this.pposx+cbon.width+6,this.posy+this.pposy+4);        
    }

    mouseMove(mx,my)
    {
        var x0=this.pposx+this.posx;
        var y0=this.pposy+this.posy+2;
        var x1=this.pposx+this.posx+90;
        var y1=this.pposy+this.posy+16;

        if ((mx>=x0)&&(mx<x1)&&(my>=y0)&&(my<y1))
        {
            this.highlighted=true;
        }
        else
        {
            this.highlighted=false;
        }
    }

    mouseClick(mx,my)
    {
    }

    mouseUp(mx,my)
    {
        var x0=this.pposx+this.posx;
        var y0=this.pposy+this.posy+2;
        var x1=this.pposx+this.posx+90;
        var y1=this.pposy+this.posy+16;

        if ((mx>=x0)&&(mx<x1)&&(my>=y0)&&(my<y1))
        {
            this.state=!this.state;
            this.callback(this.state);
        }
    }

    setppos(ppx,ppy)
    {
        this.pposx=ppx;
        this.pposy=ppy;
    }

}
