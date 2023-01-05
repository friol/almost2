/* apple's ii sound beeper */

class soundBeeper
{
    constructor(cpuspeed,fps)
    {
        this.bufferLen=16384;//Math.floor(cpuspeed/fps);
        this.bufferPos=0;

        this.audioBufSize=1024;

        this.audioBuffer=new Array(this.bufferLen*64);
        for (var s=0;s<this.bufferLen*64;s++)
        {
            this.audioBuffer[s]=0.0;
        }

        this.speakerState=0; // 0 low, 1 high

        try 
        {
            this.audioEnabled=true;
            //this.audioEnabled=false;
            //return;

            var self=this;
            this.webAudioAPIsupported=true;
    
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
            this.context = new AudioContext();
    
            this.jsNode = this.context.createScriptProcessor(this.audioBufSize, 0, 1);
            this.jsNode.onaudioprocess = function(e)
            {
                self.mixFunction(e);
            }
    
            this.jsNode.connect(this.context.destination);

            this.audioInitialized=true;
        }
        catch(e) 
        {
            alert('Error: Web Audio API is not supported in this browser. Buy a new one ['+e.toString()+']');
            this.webAudioAPIsupported=false;
        }        
    }

    feed(numCycles)
    {
        for (var s=0;s<numCycles;s++)
        {
            this.audioBuffer[this.bufferPos]=this.speakerState;
            this.bufferPos+=1;
        }        
    }

    toggleSpeaker(cycles)
    {
        if (this.speakerState==0) this.speakerState=1;
        else this.speakerState=0;
    }

    mixFunction(e)
    {
        if (!this.audioEnabled) return;
        if (!this.audioInitialized) return;

        var data = e.outputBuffer.getChannelData(0);

        // resample

        var realPos=0;
        var realStep;
        realStep=this.bufferLen/data.length;

        for (var s=0;s<data.length;s++)
        {
            data[s]=this.audioBuffer[parseInt(realPos.toFixed(0),10)];
            realPos+=realStep;
        }

        this.bufferPos=0;
    }
}
