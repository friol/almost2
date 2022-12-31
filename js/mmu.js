/* apple ][ mmu */

class a2mmu
{
    constructor()
    {
        this.ram64k=new Array(65536);
        for (var i=0;i<65536;i++)
        {
            // not the correct init pattern, but it gives a blank screen at the beginning
            this.ram64k[i]=32|0x80;
        }

        this.a2rom=new Array();
        this.cassetteMedia=undefined;
        this.vdc=undefined;
        this.curCycles=0;
        this.cyclesWithoutCassetteRead=0;

        this.kbd=0;

        // load Apple ][ rom
        this.romsLoaded=false;

        var thisInstance=this;
        var oReq = new XMLHttpRequest();

        const romVer=document.getElementById("romversionSelect").value;
        var romName="apple2p.bin";
        if (romVer=="apple2") romName="A2ROM.BIN";

        oReq.open("GET", "roms/"+romName, true);
        oReq.responseType = "arraybuffer";
        
        oReq.onload = function(oEvent) 
        {
          var arrayBuffer = oReq.response;
          var byteArray = new Uint8Array(arrayBuffer);
          var uint8ArrayNew  = new Uint8Array(arrayBuffer);

          for (var c=0;c<12288;c++)
          {
              thisInstance.a2rom.push(uint8ArrayNew[c]);
          }

          thisInstance.romsLoaded=true;
        };
        oReq.send();
    }

    setCycles(c)
    {
        this.curCycles=c;
        this.cyclesWithoutCassetteRead++;
    }

    setCassette(c)
    {
        this.cassetteMedia=c;
    }

    setVDC(vdc)
    {
        this.vdc=vdc;
    }

    pressKey(chcode)
    {
        this.kbd=0x80|chcode;
    }

    readAddr(addr)
    {
        /*if (
            (addr !== addr) // is NaN?
            || (typeof addr !== "number")
            || (addr !== Math.floor(addr))
            || (addr < 0)
            || (addr > 0xffff)
          ) 
        {
            alert("readAddr::Bad address ["+addr+"]");
        }

        addr&=0xffff;*/

        if ((addr>=0)&&(addr<=0xbfff))
        {
            // RAM
            return this.ram64k[addr];
        }
        else if (addr==0xc000)
        {
            // keyboard buffer
            return this.kbd;
        }
        else if (addr==0xc010)
        {
            // kbd latch reset
            this.kbd&=0x7f;
            return 0;
        }
        else if (addr==0xc020)
        {
            // someone explain me what is this doing
            // documentation says "Toggle Cassette Tape Output"
            return 0;
        }
        else if (addr==0xc030)
        {
            // click the speaker
            return 0;
        }
        else if (addr==0xc050)
        {
            // set graphics mode
            this.vdc.setGraphicsMode();
            return 0;
        }
        else if (addr==0xc051)
        {
            // set text mode
            this.vdc.setTextMode();
            return 0;
        }
        else if (addr==0xc052)
        {
            // set fullscreen mode
            this.vdc.setMixedGraphics(false);
            return 0;
        }
        else if (addr==0xc053)
        {
            // set mixed mode
            this.vdc.setMixedGraphics(true);
            return 0;
        }
        else if (addr==0xc054)
        {
            // set page1
            this.vdc.setPage(0);
            return 0;
        }
        else if (addr==0xc055)
        {
            // set page2
            this.vdc.setPage(1);
            return 0;
        }
        else if (addr==0xc056)
        {
            // set lores graphics
            this.vdc.setHires(false);
            return 0;
        }
        else if (addr==0xc057)
        {
            // set hires graphics
            this.vdc.setHires(true);
            return 0;
        }
        else if (addr==0xc060)
        {
            // cassette read
            if (this.cassetteMedia!=undefined)
            {
                this.cyclesWithoutCassetteRead=0;
                document.getElementById("tapeImg").style.display="block";
                return this.cassetteMedia.readByte(this.curCycles);
            }
            return 0;
        }
        else if ((addr>=0xd000)&&(addr<=0xffff))
        {
            return this.a2rom[addr-0xd000];
        }
        else
        {
            console.log("%cUnmapped read from ["+addr.toString(16)+"]","color:#E3823D");
        }

        return 0;
    }

    readAddr16bit(addr)
    {
        //console.log("Warning: 16bit CPU read");
        //if (addr<=0xff) return (this.readAddr(addr)+(this.readAddr((addr+1)&0xff)<<8));
        return (this.readAddr(addr)|((this.readAddr(addr+1)<<8)))&0xffff;
    }

    getWrappedAddr(addr)
    {
        if ((addr & 0xff) == 0xff)
        {
            return ((this.readAddr(addr&0xff00)) << 8) | (this.readAddr(addr));
        }
        else
        {
            return ((this.readAddr(addr + 1)) << 8) | (this.readAddr(addr));
        }
    }    

    writeAddr(addr,value)
    {
        /*if (
            (addr !== addr) // is NaN?
            || (typeof addr !== "number")
            || (addr !== Math.floor(addr))
            || (addr < 0)
            || (addr > 0xffff)
          ) 
        {
            alert("writeAddr::Bad address ["+addr+"]");
        }
        addr&=0xffff;*/

        if ((addr>=0)&&(addr<=0xbfff))
        {
            // RAM
            this.ram64k[addr]=value;
        }
        else if (addr==0xc050)
        {
            // set graphics mode
            this.vdc.setGraphicsMode();
        }
        else if (addr==0xc052)
        {
            // set fullscreen mode
            this.vdc.setMixedGraphics(false);
        }
        else if (addr==0xc053)
        {
            // set mixed mode
            this.vdc.setMixedGraphics(true);
        }
        else if (addr==0xc057)
        {
            // set hires graphics
            this.vdc.setHires(true);
        }
        else
        {
            console.log("%cUnmapped write to ["+addr.toString(16)+"]",'color: #E3823D');
        }
    }

    writeAddr16bit(addr,value)
    {
        console.log("%cWarning: unhandled write 16 bit to MMU","color:#E3823D");    
    }
}
