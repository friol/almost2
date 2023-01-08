/* media loader */

class mediaLoader
{
    constructor(px,py,pposx,pposy,type)
    {
        this.posx=px;
        this.posy=py;
        this.pposx=pposx;
        this.pposy=pposy;
        this.type=type;
        this.highlighted=false;
    }

    draw(ctx)
    {
        if (this.type==0)
        {
            var diskImg=document.getElementById("mediaLoaderDisk");
            ctx.drawImage(diskImg,this.pposx+this.posx,this.pposy+this.posy);

            ctx.font='14px pixelsquare';
            if (this.highlighted) ctx.fillStyle = '#3EE3B7';
            else ctx.fillStyle = 'white';
            ctx.textBaseline = 'top';
            ctx.fillText("Load disk image (.nib)",this.pposx+this.posx+40,this.pposy+this.posy+12);        
        }
        else
        {
            var tapeImg=document.getElementById("mediaLoaderTape");
            ctx.drawImage(tapeImg,this.pposx+this.posx,this.pposy+this.posy);

            ctx.font='14px pixelsquare';
            if (this.highlighted) ctx.fillStyle = '#3EE3B7';
            else ctx.fillStyle = 'white';
            ctx.textBaseline = 'top';
            ctx.fillText("Load tape image (.wav)",this.pposx+this.posx+40,this.pposy+this.posy+6);        
        }
        
    }

    setppos(ppx,ppy)
    {
        this.pposx=ppx;
        this.pposy=ppy;
    }

    mouseMove(mx,my)
    {
        var x0=this.pposx+this.posx;
        var y0=this.pposy+this.posy+12;
        var x1=this.pposx+this.posx+230;
        var y1=this.pposy+this.posy+28;

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
        var y0=this.pposy+this.posy+12;
        var x1=this.pposx+this.posx+230;
        var y1=this.pposy+this.posy+28;

        if ((mx>=x0)&&(mx<x1)&&(my>=y0)&&(my<y1))
        {
            this.highlighted=true;
        }
        else
        {
            this.highlighted=false;
        }
        
        if (this.highlighted)
        {
            if (this.type==0)
            {
                document.getElementById("diskSelector").click();
            }
            else
            {
                document.getElementById("tapeSelector").click();
            }
        }
    }
}
