/* window element */

class guiWindow
{
    constructor(px,py,wx,hy,wtitle,runFunc,romselCallback)
    {
        this.posx=px;
        this.posy=py;
        this.width=wx;
        this.height=hy;
        this.windowTitle=wtitle;
        this.titleHighlighted=false;

        this.dragging=false;
        this.deltax=0;
        this.deltay=0;

        this.listOfElements=[];

        var runBut=new guiButton(170,175,70,-1,"Run Emu",this.posx,this.posy,runFunc);
        this.listOfElements.push(runBut);
        var mediaDisk=new mediaLoader(12,35,this.posx,this.posy,0);
        this.listOfElements.push(mediaDisk);
        var mediaTape=new mediaLoader(12,75,this.posx,this.posy,1);
        this.listOfElements.push(mediaTape);
        var romSelector=new guiRadio(12,140,this.posx,this.posy,["Apple ][+","Apple ]["],romselCallback);
        this.listOfElements.push(romSelector);
    }

    draw(ctx)
    {
        // upper side of window
        var uprol=document.getElementById("windowUpperBarPrologue");
        var uepil=document.getElementById("windowUpperBarEpilogue");
        var ufiller=document.getElementById("windowUpperBarFiller");

        ctx.drawImage(uprol,this.posx,this.posy);

        var totalWidth=this.width;
        var prolw=uprol.width;
        var epilw=uepil.width;

        var p=0;
        for (p=0;p<(totalWidth-prolw-epilw);p++)
        {
            ctx.drawImage(ufiller,this.posx+prolw+p,this.posy);
        }

        ctx.drawImage(uepil,this.posx+prolw+p,this.posy);

        // intermediate filler
        var fillerl=document.getElementById("windowLFiller");
        var fillerr=document.getElementById("windowRFiller");

        for (var y=0;y<this.height;y++)
        {
            ctx.drawImage(fillerl,this.posx,this.posy+uprol.height+y);
            ctx.drawImage(fillerr,this.posx+prolw+p+uepil.width-fillerr.width,this.posy+uepil.height+y);
        }

        // lower side of window

        var dprol=document.getElementById("windowLowerPrologue");
        var depil=document.getElementById("windowLowerEpilogue");
        var dfill=document.getElementById("windowLowerFiller");

        ctx.drawImage(dprol,this.posx,this.posy+uprol.height+y);
        ctx.drawImage(depil,this.posx+this.width-depil.width,this.posy+uprol.height+y);
        
        for (var x=0;x<this.width-depil.width-dprol.width;x++)
        {
            ctx.drawImage(dfill,this.posx+dprol.width+x,this.posy+uprol.height+y);
        }

        // inner window fill

        ctx.globalAlpha = 192.0/255.0;
        ctx.fillStyle = "#051A44";
        ctx.fillRect(this.posx+fillerl.width+2,this.posy+uprol.height+0.7,this.width-11,this.height);
        ctx.globalAlpha = 1.0;

        // window title

        ctx.font         = '14px pixelsquare';
        if (this.titleHighlighted) ctx.fillStyle = '#3EE3B7';
        else ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText  (this.windowTitle,this.posx+15,this.posy+10);        
        
        // subtitle line

        ctx.fillStyle = "#12A0C7";
        ctx.fillRect(this.posx+fillerl.width+2,this.posy+uprol.height+10,this.width-10,1);

        // draw sub-elements
        this.listOfElements.forEach(element => 
            {
                element.draw(ctx);
                
            });
    }

    mouseMove(mx,my)
    {
        if (this.dragging)
        {
            this.posx=mx-this.deltax;
            this.posy=my-this.deltay;
            var thisInstance=this;
            this.listOfElements.forEach(element => 
            {
                element.setppos(thisInstance.posx,thisInstance.posy);
            });
        }
        else
        {
            if ((mx>=(this.posx+13))&&(mx<(this.posx+13+100))&&(my>=(this.posy+9))&&(my<(this.posy+23)))
            {
                this.titleHighlighted=true;
            }
            else
            {
                this.titleHighlighted=false;
            }
        }

        var thisInstance=this;
        this.listOfElements.forEach(element => 
        {
            element.mouseMove(mx,my);
        });
    }

    mouseClick(mx,my)
    {
        if ((mx>=(this.posx+13))&&(mx<(this.posx+13+100))&&(my>=(this.posy+9))&&(my<(this.posy+23)))
        {
            this.dragging=true;
            this.deltax=mx-this.posx;
            this.deltay=my-this.posy;
        }

        var thisInstance=this;
        this.listOfElements.forEach(element => 
        {
            element.mouseClick(mx,my);
        });
    }

    mouseUp(mx,my)
    {
        this.dragging=false;

        var thisInstance=this;
        this.listOfElements.forEach(element => 
        {
            element.mouseUp(mx,my);
        });
    }
}
