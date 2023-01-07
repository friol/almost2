/* radio buttons */

class guiRadio
{
    constructor(px,py,ppx,ppy,listOfEntries,selCallback)
    {
        this.posx=px;
        this.posy=py;
        this.parentposx=ppx;
        this.parentposy=ppy;

        this.selCback=selCallback;
        this.highlighted=[];
        this.entries=[];
        var thisInstance=this;
        var num=0;
        listOfEntries.forEach(element => 
        {
            if (num==0)
            {
                thisInstance.entries.push([true,listOfEntries[num]]);
            }
            else
            {
                thisInstance.entries.push([false,listOfEntries[num]]);
            }

            thisInstance.highlighted.push(false);

            num++;
        });
    }

    draw(ctx)
    {
        var checkedImg=document.getElementById("radioChecked");
        var uncheckedImg=document.getElementById("radioUnChecked");

        var idx=0;
        var ypos=this.posy+this.parentposy;
        this.entries.forEach(element => 
        {
            if (element[0]==true)            
            {
                ctx.drawImage(checkedImg,this.posx+this.parentposx,ypos);
            }
            else
            {
                ctx.drawImage(uncheckedImg,this.posx+this.parentposx,ypos);
            }

            ctx.font='14px pixelsquare';
            if (this.highlighted[idx]) ctx.fillStyle = '#3EE3B7';
            else ctx.fillStyle = 'white';
            ctx.textBaseline = 'top';
            ctx.fillText(element[1],this.parentposx+this.posx+20,ypos+2);        

            ypos+=30;
            idx+=1;
        });
    }

    setppos(ppx,ppy)
    {
        this.parentposx=ppx;
        this.parentposy=ppy;
    }

    mouseMove(mx,my)
    {
        var ybase=this.posy+this.parentposy;
        for (var el=0;el<this.entries.length;el++)
        {
            var x0=this.parentposx+this.posx;
            var y0=ybase+6;
            var x1=this.parentposx+this.posx+90;
            var y1=ybase+18;
    
            if ((mx>=x0)&&(mx<x1)&&(my>=y0)&&(my<y1))
            {
                this.highlighted[el]=true;
            }
            else
            {
                this.highlighted[el]=false;
            }
    
            ybase+=30;
        }
    }

    mouseClick(mx,my)
    {
    }

    mouseUp(mx,my)
    {
        var idxhi=-1;
        var idxsel=-1;

        for (var el=0;el<this.entries.length;el++)
        {
            if (this.highlighted[el]==true)
            {
                idxhi=el;                
            }
        }

        if (idxhi==-1)
        {
            return ;
        }

        for (var el=0;el<this.entries.length;el++)
        {
            if (this.entries[el][0]==true)
            {
                idxsel=el;
            }
        }

        if (idxhi!=idxsel)
        {
            this.entries[idxsel][0]=false;
            this.entries[idxhi][0]=true;
            this.selCback(this.entries[idxhi][1]);
        }

    }
}
