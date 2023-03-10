/* wooot, tape! */

class cassette
{
    constructor()
    {
        this.mediaLoaded=false;
        this.initialCycle=0;
        this.rawData=undefined;
        this.maxSignal=-100;
        this.minSignal=100;
        this.sampleRate=44100;
    }

    loadMedia(abuf)
    {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        var audioCtx = new AudioContext({sampleRate: this.sampleRate});
        var audioFile = audioCtx.decodeAudioData(abuf).then(buffer => 
        {
            this.rawData = buffer.getChannelData(0);
            this.rawData.forEach(element => {
                if (element>this.maxSignal) this.maxSignal=element;
                if (element<this.minSignal) this.minSignal=element;
            });
        });
    }

    readByte(curCycle)
    {
        if (this.initialCycle==0)        
        {
            this.initialCycle=curCycle;
        }

        var audioPos=(((curCycle-this.initialCycle)*this.sampleRate)/1000000);
        audioPos=parseInt(audioPos.toFixed());
        if (audioPos<this.rawData.length)        
        {
            var curSig=this.rawData[audioPos]+Math.abs(this.minSignal);
            curSig/=Math.abs(this.minSignal)+this.maxSignal;
            curSig*=255.0;
            var finalByte=parseInt(curSig.toFixed());
            return finalByte&0x80;
        }

        return 0x80;
    }
}
