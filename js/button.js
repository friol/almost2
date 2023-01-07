/* button element (gui) */

class guiButton
{
    constructor(px,py,wx,hy,text,parentposx,parentposy,runFunc)
    {
        this.posx=px;
        this.posy=py;
        this.width=wx;
        this.height=hy;
        this.caption=text;
        this.pposx=parentposx;
        this.pposy=parentposy;
        this.execFunc=runFunc;

        this.state=0; // 0=low, 1=high (mouseover), 2=pressed
    }

    setppos(ppx,ppy)
    {
        this.pposx=ppx;
        this.pposy=ppy;
    }

    draw(ctx)
    {
        var imgProl;
        var imgFill;
        var imgEpil;

        if (this.state==0)
        {
            imgProl=document.getElementById("buttonLowPrologue");
            imgFill=document.getElementById("buttonLowFiller");
            imgEpil=document.getElementById("buttonLowEpilogue");
        }
        else if (this.state==1)
        {
            imgProl=document.getElementById("buttonHighPrologue");
            imgFill=document.getElementById("buttonHighFiller");
            imgEpil=document.getElementById("buttonHighEpilogue");
        }
        else if (this.state==2)
        {
            imgProl=document.getElementById("buttonPressedPrologue");
            imgFill=document.getElementById("buttonPressedFiller");
            imgEpil=document.getElementById("buttonPressedEpilogue");
        }

        ctx.drawImage(imgProl,this.pposx+this.posx,this.pposy+this.posy);

        for (var p=0;p<this.width;p++)
        {
            ctx.drawImage(imgFill,this.pposx+this.posx+imgProl.width+p,this.pposy+this.posy);
        }

        ctx.drawImage(imgEpil,this.pposx+this.posx+imgProl.width+this.width,this.pposy+this.posy);

        ctx.font         = '14px pixelsquare';

        if (this.state==2) ctx.fillStyle="#161B66";
        else ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText  (this.caption,this.pposx+this.posx+15,this.pposy+this.posy+8);        
    }

    mouseMove(mx,my)
    {
        var x0=this.pposx+this.posx;
        var y0=this.pposy+this.posy;
        var x1=this.pposx+this.posx+this.width+28;
        var y1=this.pposy+this.posy+32;

        if ((mx>=x0)&&(mx<x1)&&(my>=y0)&&(my<y1))
        {
            this.state=1;
        }
        else
        {
            this.state=0;
        }
    }

    mouseClick(mx,my)
    {
        var x0=this.pposx+this.posx;
        var y0=this.pposy+this.posy;
        var x1=this.pposx+this.posx+this.width+28;
        var y1=this.pposy+this.posy+32;

        if ((mx>=x0)&&(mx<x1)&&(my>=y0)&&(my<y1))
        {
            this.state=2;
        }
    }

    mouseUp(mx,my)
    {
        var x0=this.pposx+this.posx;
        var y0=this.pposy+this.posy;
        var x1=this.pposx+this.posx+this.width+28;
        var y1=this.pposy+this.posy+32;

        if ((mx>=x0)&&(mx<x1)&&(my>=y0)&&(my<y1))
        {
            this.state=1;
            this.execFunc();
        }
        else
        {
            this.state=0;
        }
    }
}
