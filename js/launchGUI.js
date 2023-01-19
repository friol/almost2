/* 
    launch GUI 
    friol 2k23
    
*/

class launchGUI
{
    constructor(runFunc,testFunc,romselCallback,sndCback,expCback,hralgoCbak)
    {
        this.isActive=true;

        // list of gui elements (windows, etc.)
        this.listOfElements=[];

        var winposx=145;
        var winposy=80;
        var win=new guiWindow(winposx,winposy,270,210,"Emu window",runFunc,testFunc,romselCallback,sndCback,expCback,hralgoCbak);
        this.listOfElements.push(win);
        var fscr=new fullScreener(530,10);
        this.listOfElements.push(fscr);

        // mouse handler

        var cnvs = document.getElementById("a2display");
        var thisInstance=this;

        // on mouse move event
        cnvs.onmousemove = function(e)
        {
            const rect = cnvs.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;

            if (!thisInstance.isActive)
            {
                thisInstance.listOfElements.forEach(element => 
                {
                    if (element.elname=="fullScreener")
                    {
                        element.mouseMove(px,py);
                    }
                });        
            }
            else
            {
                thisInstance.listOfElements.forEach(element => 
                {
                    if (element.elname!="fullScreener")
                    {
                        element.mouseMove(px,py);
                    }
                });        
            }
        };

        // on mouse click event
        cnvs.onmousedown=function(e)
        {
            if (!thisInstance.isActive) return;
            const rect = cnvs.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;
            //console.log(px+" "+py);
            thisInstance.listOfElements.forEach(element => 
            {
                element.mouseClick(px,py);
            });        
        };

        // on mouse release click event
        cnvs.onmouseup=function(e)
        {
            const rect = cnvs.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;

            if (!thisInstance.isActive)
            {
                thisInstance.listOfElements.forEach(element => 
                {
                    if (element.elname=="fullScreener")
                    {
                        element.mouseUp(px,py);
                    }
                });        
            }
            else
            {
                thisInstance.listOfElements.forEach(element => 
                {
                    if (element.elname!="fullScreener")
                    {
                        element.mouseUp(px,py);
                    }
                });        
            }
        };
    }

    draw(cvs)
    {
        var ctx = cvs.getContext("2d", { willReadFrequently: true });
        
        if (this.isActive)
        {
            ctx.imageSmoothingEnabled= false
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, cvs.width, cvs.height);
            const splashImg=document.getElementById("splashImg");
            ctx.globalAlpha = 0.5;
            ctx.drawImage(splashImg,0,0);
            ctx.globalAlpha = 1.0;

            this.listOfElements.forEach(element => 
            {
                if (element.elname!="fullScreener")
                {
                    element.draw(ctx);
                }
            });
        }
        else
        {
            this.listOfElements.forEach(element => 
            {
                if (element.elname=="fullScreener")
                {
                    element.draw(ctx);
                }
            });
        }
    }
}
