/* apple ][ mmu */

class a2mmu
{
    constructor()
    {
        this.ram48k=new Array(0xc000);
        for (var i=0;i<0xc000;i++)
        {
            // not the correct init pattern, but it gives a blank screen at the beginning
            this.ram48k[i]=32|0x80;
        }

        // language/expansion ram card 16k
        this.lgcRam=new Array(0x3000);
        for (var i=0;i<0x3000;i++)
        {
            this.lgcRam[i]=0x0;
        }

        this.lgcRamBk2=new Array(0x1000);
        for (var i=0;i<0x1000;i++)
        {
            this.lgcRamBk2[i]=0x0;
        }

        // Language Card 16k ram expansion
        this.lgcEnabled=true;
        this.lcardReadable  = false; // Language Card readable
        this.lcardBank2Enable = true; // Language Card bank 2 enabled
        this.lcardWrite=false;
        this.prewriteFlipFlop=false;

        //

        this.a2rom=new Array();
        this.cassetteMedia=undefined;
        this.diskii=undefined;
        this.vdc=undefined;
        this.speaker=undefined;
        this.curCycles=0;
        this.cyclesWithoutCassetteRead=0;
        this.cyclesWithoutDiskRead=0;

        this.kbd=0;
        this.pb0=0;
        this.pb1=0;
        this.pb2=0;

        this.gcPos = [ 127.0, 127.0 ];
        this.gcCountdown = [ 0.0,0.0 ];
        this.gcDirection = [0,0];
        this.gcActive = [0,0];
        this.GCActionSpeed = 8;
        this.GCReleaseSpeed = 2;
        this.gcResetCycle=0;

        this.romsLoaded=false;
    }

    resetPaddles()
    {
        this.gcCountdown[0] = this.gcPos[0] * this.gcPos[0];
        this.gcCountdown[1] = this.gcPos[1] * this.gcPos[1];
        this.gcResetCycle = this.curCycles;        
    }

    readPaddle(pdlNum) 
    {
        const GCFreq = 5.6;
    
        this.gcCountdown[pdlNum]-=(this.curCycles - this.gcResetCycle) / GCFreq;
        if (this.gcCountdown[pdlNum] <= 0)
        {
            this.gcCountdown[pdlNum] = 0;
            return 0;
        }

        return 0x80;
    }    

    joyLeft()
    {
        this.gcDirection[0] = -1; 
        this.gcActive[0] = 1;
    }

    joyRight()
    {
        this.gcDirection[0] = 1; 
        this.gcActive[0] = 1;
    }

    joyLeftRelease()
    {
        this.gcDirection[0] = -1; 
        this.gcActive[0] = 0;
    }

    joyRightRelease()
    {
        this.gcDirection[0] = 1; 
        this.gcActive[0] = 0;
    }


    joyUp()
    {
        this.gcDirection[1] = -1; 
        this.gcActive[1] = 1;
    }

    joyDown()
    {
        this.gcDirection[1] = 1; 
        this.gcActive[1] = 1;
    }

    joyUpRelease()
    {
        this.gcDirection[1] = -1; 
        this.gcActive[1] = 0;
    }

    joyDownRelease()
    {
        this.gcDirection[1] = 1; 
        this.gcActive[1] = 0;
    }

    update()
    {
        for (var pdl = 0; pdl < 2; pdl++) 
        {
			if (this.gcActive[pdl]) 
            {                                         
				this.gcPos[pdl] += this.gcDirection[pdl] * this.GCActionSpeed;
				if (this.gcPos[pdl] > 255) this.gcPos[pdl] = 255;
				if (this.gcPos[pdl] < 0)   this.gcPos[pdl] = 0;
			} 
            else 
            {
				this.gcPos[pdl] += this.gcDirection[pdl] * this.GCReleaseSpeed;
				if ((this.gcDirection[pdl] == 1)  && (this.gcPos[pdl] > 127)) this.gcPos[pdl] = 127;
				if ((this.gcDirection[pdl] == -1) && (this.gcPos[pdl] < 127)) this.gcPos[pdl] = 127;
			}
		}        
    }

    setLgc(onoff)
    {
        this.lgcEnabled=onoff;
    }

    loadRoms(romType)
    {
        // load Apple ][ rom
        var thisInstance=this;
        var oReq = new XMLHttpRequest();

        const romVer=(romType=="Apple ][")?"apple2":"apple2p";
        var romName="apple2p.bin";
        if (romVer=="apple2") romName="A2ROM.BIN";

        oReq.open("GET", "roms/"+romName, true);
        oReq.responseType = "arraybuffer";
        oReq.onload = function(oEvent) 
        {
          var arrayBuffer = oReq.response;
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
        this.cyclesWithoutDiskRead++;
    }

    setCassette(c)
    {
        this.cassetteMedia=c;
    }

    setVDC(vdc)
    {
        this.vdc=vdc;
    }

    setSpeaker(s)
    {
        this.speaker=s;
    }

    setDiskII(d2)
    {
        this.diskii=d2;
    }

    pressKey(chcode)
    {
        this.kbd=0x80|chcode;
    }

    pushbutton0()
    {
        this.pb0=0xff;
    }

    lgcSwitches(addr,writeFlag)
    {
        if (addr&8) this.lcardBank2Enable = true; 
        else this.lcardBank2Enable = false; 

        if (!(((addr&2) >> 1) ^ (addr&1))) this.lcardReadable = true;
        else this.lcardReadable = false;

        if (this.prewriteFlipFlop && (!writeFlag) && (addr&1)) this.lcardWrite = false;        

        if (!(addr&1)) this.lcardWrite = true;

        this.prewriteFlipFlop = (!writeFlag) ? ((addr&1)==1) : false;        
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
            return this.ram48k[addr];
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
            return this.kbd;
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
            this.speaker.toggleSpeaker(this.curCycles);
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
                //document.getElementById("tapeImg").style.display="block";
                return this.cassetteMedia.readByte(this.curCycles);
            }
            return 0;
        }
        else if (addr==0xc061)
        {
            // pushbutton0
            if (this.pb0==0xff)
            {
                this.pb0=0;
                return 0xff;
            }
            else
            {
                return 0;
            }
        }
        else if (addr==0xc064)
        {
            return this.readPaddle(0);
        }
        else if (addr==0xc065)
        {
            return this.readPaddle(1);
        }
        else if (addr==0xc070)
        {
            this.resetPaddles();
            return 0;
        }
        else if ((addr>=0xc080)&&(addr<=0xc08f))
        {
            if (!this.lgcEnabled) return 0;

            // language card/16k card switches
            this.lgcSwitches(addr,false);
            return 0;
        }
        else if ((addr>=0xc0e0)&&(addr<=0xc0ef))
        {
            // disk drive read (slot 6)

            if (addr==0xc0ec)
            {
                this.cyclesWithoutDiskRead=0;
                //document.getElementById("diskImg").style.display="block";
            }

            return this.diskii.diskRead(addr);
        }
        else if ((addr>=0xc600)&&(addr<=0xc6ff))
        {
            // we assume disk drive interface is in slot 6
            return this.diskii.diskiirom[addr-0xc600];
        }
        else if ((!this.lgcEnabled)&&(addr>=0xd000))
        {
            return this.a2rom[addr-0xd000];
        }
        else if ((addr>=0xd000)&&(addr<=0xffff))
        {
            if (!this.lcardReadable)
            {
                return this.a2rom[addr-0xd000];
            }

            if (this.lcardBank2Enable && (addr < 0xE000))
            {
                return this.lgcRamBk2[addr - 0xd000];
            }
    
            return this.lgcRam[addr-0xd000];
        }
        else
        {
            console.log("%cUnmapped read from ["+addr.toString(16)+"]","color:#E3823D");
        }

        return 0;
    }

    readAddr16bit(addr)
    {
        if (addr<=0xff) return (this.readAddr(addr)+(this.readAddr((addr+1)&0xff)<<8));
        return (this.readAddr(addr&0xffff)|(((this.readAddr((addr+1)&0xffff)&0xff)<<8)))&0xffff;
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
            this.ram48k[addr]=value;
        }
        else if (addr==0xc010)
        {
            // kbd latch reset
            this.kbd&=0x7f;
        }
        else if (addr==0xc030)
        {
            // click the speaker
            this.speaker.toggleSpeaker(this.curCycles);
        }
        else if (addr==0xc050)
        {
            // set graphics mode
            this.vdc.setGraphicsMode();
        }
        else if (addr==0xc051)
        {
            // set text mode
            this.vdc.setTextMode();
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
        else if (addr==0xc054)
        {
            // set page1
            this.vdc.setPage(0);
        }
        else if (addr==0xc055)
        {
            // set page2
            this.vdc.setPage(1);
        }
        else if (addr==0xc056)
        {
            // set lores graphics
            this.vdc.setHires(false);
        }
        else if (addr==0xc057)
        {
            // set hires graphics
            this.vdc.setHires(true);
        }
        else if (addr==0xc070)
        {
            this.resetPaddles();
        }
        else if ((addr>=0xc080)&&(addr<=0xc08f))
        {
            if (!this.lgcEnabled) return;

            // language card/16k card switches
            this.lgcSwitches(addr,true);
        }
        else if ((addr>=0xc0e0)&&(addr<=0xc0ef))
        {
            // disk drive write (slot 6)
            this.diskii.diskWrite(addr,value);
        }
        else if ((this.lcardWrite==false) && (addr >= 0xd000)) 
        {
            if (this.lcardBank2Enable && (addr < 0xE000)) 
            {
                this.lgcRamBk2[addr-0xd000]=value;
                return;
            }

            this.lgcRam[addr-0xd000]=value;
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
