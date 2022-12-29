/* apple ][ display chip */

class apple2vdc
{
    constructor()
    {
        // apple ][ textmode font
        this.a2font=[
            [0,14,17,21,23,22,16,15],
            [0,4,10,17,17,31,17,17],
            [0,30,17,17,30,17,17,30],
            [0,14,17,16,16,16,17,14],
            [0,30,17,17,17,17,17,30],
            [0,31,16,16,30,16,16,31],
            [0,31,16,16,30,16,16,16],
            [0,15,16,16,16,19,17,15],
            [0,17,17,17,31,17,17,17],
            [0,14,4,4,4,4,4,14],
            [0,1,1,1,1,1,17,14],
            [0,17,18,20,24,20,18,17],
            [0,16,16,16,16,16,16,31],
            [0,17,27,21,21,17,17,17],
            [0,17,17,25,21,19,17,17],
            [0,14,17,17,17,17,17,14],
            [0,30,17,17,30,16,16,16],
            [0,14,17,17,17,21,18,13],
            [0,30,17,17,30,20,18,17],
            [0,14,17,16,14,1,17,14],
            [0,31,4,4,4,4,4,4],
            [0,17,17,17,17,17,17,14],
            [0,17,17,17,17,17,10,4],
            [0,17,17,17,21,21,27,17],
            [0,17,17,10,4,10,17,17],
            [0,17,17,10,4,4,4,4],
            [0,31,1,2,4,8,16,31],
            [0,31,24,24,24,24,24,31],
            [0,0,16,8,4,2,1,0],
            [0,31,3,3,3,3,3,31],
            [0,0,0,4,10,17,0,0],
            [0,0,0,0,0,0,0,31],
            [0,0,0,0,0,0,0,0],
            [0,4,4,4,4,4,0,4],
            [0,10,10,0,0,0,0,0],
            [0,10,10,31,10,31,10,10],
            [0,4,15,20,14,5,30,4],
            [0,24,25,2,4,8,19,3],
            [0,8,20,20,8,21,18,13],
            [0,4,4,0,0,0,0,0],
            [0,4,8,16,16,16,8,4],
            [0,4,2,1,1,1,2,4],
            [0,4,21,14,4,14,21,4],
            [0,0,4,4,31,4,4,0],
            [0,0,0,0,0,4,4,8],
            [0,0,0,0,31,0,0,0],
            [0,0,0,0,0,0,0,4],
            [0,0,1,2,4,8,16,0],
            [0,14,17,19,21,25,17,14],
            [0,4,12,4,4,4,4,14],
            [0,14,17,1,6,8,16,31],
            [0,31,1,2,6,1,17,14],
            [0,2,6,10,18,31,2,2],
            [0,31,16,30,1,1,17,14],
            [0,7,8,16,30,17,17,14],
            [0,31,1,2,4,8,8,8],
            [0,14,17,17,14,17,17,14],
            [0,14,17,17,15,1,2,28],
            [0,0,0,4,0,4,0,0],
            [0,0,0,4,0,4,4,8],
            [0,2,4,8,16,8,4,2],
            [0,0,0,31,0,31,0,0],
            [0,8,4,2,1,2,4,8],
            [0,14,17,2,4,4,0,4]    
        ];

        this.loresPalette = [
            [0, 0, 0],
            [208, 0, 48],
            [0, 0, 128],
            [255, 0, 255],
            [0, 128, 0],
            [128, 128, 128],
            [0, 0, 255],
            [96, 160, 255],
            [128, 80, 0],
            [255, 128, 0],
            [192, 192, 192],
            [255, 144, 128],
            [0, 255, 0],
            [255, 255, 0],
            [64, 255, 144],
            [255, 255, 255]
        ];        

        this.glbFrameNum=0;
        this.glbFrameBuffer;
        this.glbImgData=undefined;
        this.glbCanvasRenderer=undefined;
        this.glbResolutionX=280;
        this.glbResolutionY=192;

        this.mode=0; // text mode, 1=graphics
        this.mixedGraph=false; 
        this.hires=false;

        this.glbFrameBuffer=new Uint8ClampedArray(this.glbResolutionX*this.glbResolutionY*4);
        for (var i=0;i<(this.glbResolutionX*this.glbResolutionY*4);i++)
        {
            this.glbFrameBuffer[i]=0;
        }        

        var canvas = document.getElementById("a2display");
        this.ctx = canvas.getContext("2d");
    }

    drawTextmodeChar(col,row,chnum,ctx)
    {
        const fontxsize=7;
        const fontysize=8;
    
        var inverted=false;
        if ((chnum>>6)==1)
        {
            if ((this.glbFrameNum%32)<16)
            {
                inverted=true;
            }
        }
    
        if ((chnum>>6)==0)
        {
            inverted=true;
        }
    
        chnum%=0x40;
    
        for (var r=0;r<fontysize;r++)
        {
            var currow=this.a2font[chnum][r];
            var charcol=0;
            for (var c=0;c<7;c++)
            {
                if (((currow>>(7-c-1))&1)==1)
                {
                    charcol=1;
                }
                else
                {
                    charcol=0;
                }
                if (inverted)
                {
                    if (charcol==0) charcol=1;
                    else charcol=0;
                } 
    
                var posx=(col*(fontxsize)+c)*4;
                var posy=((row*(fontysize))+r)*this.glbResolutionX*4;
                var pozz=posx+posy;
                if (charcol==0) 
                {
                    this.glbFrameBuffer[pozz]=0;
                    this.glbFrameBuffer[pozz+1]=0;
                    this.glbFrameBuffer[pozz+2]=0;
                    this.glbFrameBuffer[pozz+3]=255;
                }
                else
                {
                    this.glbFrameBuffer[pozz]=0x8a;
                    this.glbFrameBuffer[pozz+1]=0xe2;
                    this.glbFrameBuffer[pozz+2]=0x34;
                    this.glbFrameBuffer[pozz+3]=255;
                }
            }
        }
    }

    drawLoresQuads(col,row,curChar,ctx)
    {
        var loCol=curChar&0x0f;
        var hiCol=(curChar&0xf0)>>4;

        const fontxsize=7;
        const fontysize=8;

        for (var r=0;r<fontysize;r++)
        {
            for (var c=0;c<7;c++)
            {
                var posx=(col*(fontxsize)+c)*4;
                var posy=((row*(fontysize))+r)*this.glbResolutionX*4;
                var pozz=posx+posy;

                if (r<(fontysize/2))
                {
                    this.glbFrameBuffer[pozz]=this.loresPalette[loCol][0];
                    this.glbFrameBuffer[pozz+1]=this.loresPalette[loCol][1];
                    this.glbFrameBuffer[pozz+2]=this.loresPalette[loCol][2];
                    this.glbFrameBuffer[pozz+3]=255;
                }
                else
                {
                    this.glbFrameBuffer[pozz]=this.loresPalette[hiCol][0];
                    this.glbFrameBuffer[pozz+1]=this.loresPalette[hiCol][1];
                    this.glbFrameBuffer[pozz+2]=this.loresPalette[hiCol][2];
                    this.glbFrameBuffer[pozz+3]=255;
                }
            }
        }
    }
    
    drawTextMode(theMMU,ctx)
    {
        // The 64 characters can be displayed in INVERSE in the range $00 to $3F, FLASHing in the range $40 to $7F, 
        // and NORMAL mode in the range $80 to $FF. Normal mode characters are repeated in the $80 to $FF range.
        // https://retrocomputing.stackexchange.com/questions/2534/what-are-the-screen-holes-in-apple-ii-graphics
    
        var baseAddr=0x400;
        for (var row=0;row<24/3;row++)
        {
            var realRow=row;
            for (var col=0;col<40;col++)
            {
                var curChar=theMMU.readAddr(baseAddr);
                this.drawTextmodeChar(col,realRow,curChar,ctx);
                baseAddr++;
            }
    
            realRow+=8;
            for (var col=0;col<40;col++)
            {
                var curChar=theMMU.readAddr(baseAddr);
                this.drawTextmodeChar(col,realRow,curChar,ctx);
                baseAddr++;
            }
    
            realRow+=8;
            for (var col=0;col<40;col++)
            {
                var curChar=theMMU.readAddr(baseAddr);
                this.drawTextmodeChar(col,realRow,curChar,ctx);
                baseAddr++;
            }
    
            baseAddr+=8; // "screen holes"
        }
    }

    drawLoresScreen(theMMU,ctx)
    {
        var baseAddr=0x400;
        for (var row=0;row<24/3;row++)
        {
            var realRow=row;
            for (var col=0;col<40;col++)
            {
                var curByte=theMMU.readAddr(baseAddr);
                if (realRow<20) this.drawLoresQuads(col,realRow,curByte,ctx);
                else this.drawTextmodeChar(col,realRow,curByte,ctx);
                baseAddr++;
            }
    
            realRow+=8;
            for (var col=0;col<40;col++)
            {
                var curByte=theMMU.readAddr(baseAddr);
                if (realRow<20) this.drawLoresQuads(col,realRow,curByte,ctx);
                else this.drawTextmodeChar(col,realRow,curByte,ctx);
                baseAddr++;
            }
    
            realRow+=8;
            for (var col=0;col<40;col++)
            {
                var curByte=theMMU.readAddr(baseAddr);
                if (realRow<20) this.drawLoresQuads(col,realRow,curByte,ctx);
                else this.drawTextmodeChar(col,realRow,curByte,ctx);
                baseAddr++;
            }
    
            baseAddr+=8; // "screen holes"
        }
    }

    drawGraphicsPixel(x,y,curByte)
    {
        for (var bit=0;bit<7;bit++)
        {
            var bitcol=((curByte>>bit)&0x01);
            if (bitcol==0)
            {
                this.glbFrameBuffer[(x+bit+(y*this.glbResolutionX))*4]=0;
                this.glbFrameBuffer[((x+bit+(y*this.glbResolutionX))*4)+1]=0;
                this.glbFrameBuffer[((x+bit+(y*this.glbResolutionX))*4)+2]=0;
                this.glbFrameBuffer[((x+bit+(y*this.glbResolutionX))*4)+3]=255;
            }
            else
            {
                this.glbFrameBuffer[(x+bit+(y*this.glbResolutionX))*4]=255;
                this.glbFrameBuffer[((x+bit+(y*this.glbResolutionX))*4)+1]=255;
                this.glbFrameBuffer[((x+bit+(y*this.glbResolutionX))*4)+2]=255;
                this.glbFrameBuffer[((x+bit+(y*this.glbResolutionX))*4)+3]=255;
            }
        }
    }

    // great doc on how the high resolution works here: https://www.xtof.info/hires-graphics-apple-ii.html
    drawHiresScreen(theMMU,ctx)
    {
        var curAddr=0x2000;

        // the 'Woz' sequence to save a couple of chips :)
        var addrArray=[
            0x2000,0x2080,0x2100,0x2180,0x2200,0x2280,0x2300,0x2380,
            0x2028,0x20a8,0x2128,0x21a8,0x2228,0x22a8,0x2328,0x23a8,
            0x2050,0x20d0,0x2150,0x21d0,0x2250,0x22d0,0x2350,0x23d0
        ];

        var acounter=0;
        var y=0;
        for (var r=0;r<192/8;r++)
        {
            var addrAdder=0;
            for (var rb=0;rb<8;rb++)
            {
                var x=0;
                for (var b=0;b<40;b++)
                {
                    var curByte=theMMU.readAddr(addrArray[acounter]+addrAdder+b);
                    this.drawGraphicsPixel(x,y,curByte);
                    x+=7;
                }

                addrAdder+=0x400;
                y+=1;
            }
            
            acounter+=1;
        }        
    }

    hyperBlit(ctx)
    {
        if (this.glbImgData==undefined) this.glbImgData = ctx.getImageData(0, 0, this.glbResolutionX, this.glbResolutionY);
        this.glbImgData.data.set(this.glbFrameBuffer);
    
        if (this.glbCanvasRenderer==undefined)
        {
            this.glbCanvasRenderer = document.createElement('canvas');
            this.glbCanvasRenderer.width = this.glbImgData.width;
            this.glbCanvasRenderer.height = this.glbImgData.height;
        }
        this.glbCanvasRenderer.getContext('2d').putImageData(this.glbImgData, 0, 0);
        ctx.drawImage(this.glbCanvasRenderer,0,0,this.glbResolutionX,this.glbResolutionY);
    }

    setTextMode()
    {
        console.log("setting text mode");
        this.mode=0;
    }

    setMixedGraphics(v)
    {
        console.log("setting mixed mode to "+v);
        this.mixedGraph=v;        
    }

    setGraphicsMode()
    {
        console.log("setting gfx mode");
        this.mode=1;
    }

    setHires(h)
    {
        console.log("setting hires mode to "+h);
        this.hires=h;
    }

    draw(theMMU)
    {
        if (this.mode==0)
        {
            this.drawTextMode(theMMU,this.ctx);
        }
        else
        {
            if (this.hires==false)
            {
                this.drawLoresScreen(theMMU,this.ctx);
            }
            else
            {
                this.drawHiresScreen(theMMU,this.ctx);
            }
        }

        this.hyperBlit(this.ctx);
    
        // next frame, please
        this.glbFrameNum+=1;
    }
}