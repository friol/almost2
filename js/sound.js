/* apple's ii sound beeper */

class soundBeeper
{
    constructor(cpuspeed,fps,sndOn)
    {
        this.speakerState=0; // 0 low, 1 high

        try 
        {
            this.audioEnabled=sndOn;

            var self=this;
            this.webAudioAPIsupported=true;
    
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
            this.context = new AudioContext();
    
            this.audioBufSize=1024;
            this.jsNode = this.context.createScriptProcessor(this.audioBufSize, 0, 1);
            this.jsNode.onaudioprocess = function(e)
            {
                self.mixFunction(e);
            }
            this.jsNode.connect(this.context.destination);

            this.callFreq=this.context.sampleRate/this.audioBufSize;
            this.bufferLen=Math.floor(cpuspeed/this.callFreq);
            this.audioQueue=[];
            this.audioqpos=0;

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
            this.audioQueue.push(this.speakerState);
        }        
    }

    toggleSpeaker(cycles)
    {
        if (this.speakerState==0) this.speakerState=1;
        else this.speakerState=0;
    }

    mixFunction(e)
    {
        if (!this.audioEnabled) 
        {
            this.audioQueue=[];
            return;
        }

        if (!this.audioInitialized) return;

        var data = e.outputBuffer.getChannelData(0);

        if ((this.audioQueue.length-this.audioqpos)<this.bufferLen) 
        {
            //console.log("Skipping mix because audio queue is not full yet");
            /*for (var s=0;s<data.length;s++)
            {
                data[s]=0;
            }*/
            return;
        }

        // resample

        var realPos=0;
        var realStep;
        realStep=this.bufferLen/data.length;

        //console.log("Audio queue size "+this.audioQueue.length);
        for (var s=0;s<data.length;s++)
        {
            data[s]=this.audioQueue[this.audioqpos+parseInt(realPos.toFixed(0),10)];
            realPos+=realStep;
        }
        this.audioqpos+=parseInt(realPos.toFixed(0),10);

        this.audioQueue=this.audioQueue.slice(this.audioqpos);
        this.audioqpos=0;

        //console.log(this.audioQueue.length);
    }
}
