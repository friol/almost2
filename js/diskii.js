
/* 
    Apple Disk II (or Disk ][) 

    from Wikipedia: DiskII was designed by Steve Wozniak at the recommendation of Mike Markkula, and manufactured by Apple Computer, Inc. 
    It went on sale in June 1978 at a retail price of US$495 for pre-order; it was later sold for $595 (equivalent to $2,470 in 2021) 
    including the controller card (which can control up to two drives) and cable
    
*/

// very simple and understandable DiskII emulation
// https://github.com/ArthurFerreira2/reinette-II-plus/blob/master/reinetteII%2B.c
// also https://porkrind.org/a2/

class disk2
{
    constructor()
    {
        this.romsLoaded=false;
        this.diskiirom=[];
        this.diskPtr=undefined;

        this.readOnly=true;
        this.motorOn=false;
        this.writeMode=false;
        this.track=0;
        this.nibble=0;
        this.driveLatch=0;

        // load disk ii 256 byte rom
        var thisInstance=this;
        var oReq = new XMLHttpRequest();
        oReq.open("GET", "roms/diskII.rom", true);
        oReq.responseType = "arraybuffer";
        oReq.onload = function(oEvent) 
        {
          var arrayBuffer = oReq.response;
          var uint8ArrayNew  = new Uint8Array(arrayBuffer);

          for (var c=0;c<256;c++)
          {
              thisInstance.diskiirom.push(uint8ArrayNew[c]);
          }

          thisInstance.romsLoaded=true;
        };
        oReq.send();

        //

        this.phases = [false,false,false,false]; // phases states
        this.phasesB = [false,false,false,false]; // phase states before
        this.phasesBB = [false,false,false,false]; // phase states before before
        this.pIdx=0; // phase index
        this.pIdxB=0; // phase index before
        this.halfTrackPos=0;
    }

    setDisk(dsk)
    {
        this.diskPtr=dsk;
    }

    stepMotor(address)
    {
        address&=7;
        var phase=address>>1;
    
        this.phasesBB[this.pIdxB]=this.phasesB[this.pIdxB];
        this.phasesB[this.pIdx]=this.phases[this.pIdx];
        this.pIdxB=this.pIdx;
        this.pIdx=phase;
    
        if (!(address&1)) 
        {
            // head not moving (PHASE x OFF)
            this.phases[phase]=false;
            return;
        }
    
        // track is decreasing
        if (this.phasesBB[(phase + 1) & 3])
        {
            if (this.halfTrackPos>0)
            {
                this.halfTrackPos--;
                document.getElementById("trackSpan").innerHTML="Track "+Math.floor((this.halfTrackPos+1)/2);
                document.getElementById("trackSpan").style.display="block";
            }
        }
    
        // track is increasing
        if (this.phasesBB[(phase - 1) & 3])
        {
            if (this.halfTrackPos<69)
            {
                this.halfTrackPos++;
                document.getElementById("trackSpan").innerHTML="Track "+Math.floor((this.halfTrackPos+1)/2);
                document.getElementById("trackSpan").style.display="block";
            }
        }
    
        this.phases[phase] = true;
        this.track = Math.floor((this.halfTrackPos+1)/2);
    }

    diskRead(addr)
    {
		if ((addr>=0xc0e0)&&(addr<=0xc0e7))
        {
            // move drive head
            this.stepMotor(addr); 
        }
        else if (addr==0xc0e8)
        {
            //console.log("DiskII::motor off");
            this.motorOn=false;            
        }
        else if (addr==0xc0e9)
        {
            //console.log("DiskII::motor on");
            this.motorOn=true;            
        }
        else if (addr==0xc0ea)
        {
            //console.log("DiskII::selecting drive 1");
        }
        else if (addr==0xc0eb)
        {
            //console.log("DiskII::selecting drive 2");
            alert("DiskII::warning: software is selecting drive 2");
        }
        else if (addr==0xc0ec)
        {
            //console.log("DiskII::reading from disk track "+this.track.toString());
            if (this.writeMode)
            {
                // todo
            }
            else                                                               
            {
                if (this.diskPtr!=undefined)
                {
                    var diskOffset=(this.track*0x1A00)+this.nibble;
                    if (diskOffset>=232960)
                    {
                        alert("DiskII::warning: software is trying to read beyond the end of the disk");
                        return 0;
                    }
                    this.driveLatch=this.diskPtr[diskOffset];
                }
            }
            this.nibble = (this.nibble + 1) % 0x1A00;
            return this.driveLatch;        
        }
        else if (addr==0xc0ee)
        {
            this.writeMode=false;
            return 0x80; // assume disk is read-only            
        }
        else if (addr==0xc0ef)
        {
            this.writeMode=true;
        }
        else
        {
            console.log("%cDiskII::Unmapped read from ["+addr.toString(16)+"]","color:#E3823D");
        }

        return 0;
    }

    diskWrite(addr,value)
    {
        if (addr==0xc0ed)
        {
            this.driveLatch=value;
        }
        else
        {
            console.log("%cDiskII::Unmapped write to ["+addr.toString(16)+"]",'color: #E3823D');
        }
    }
}
