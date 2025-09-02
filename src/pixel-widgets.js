class PixelInput extends HTMLElement{
  connectedCallback(){
    if(this._init) return; this._init=true;
    const inp=this.querySelector('input')||document.createElement('input');
    this.appendChild(inp);
  }
}
customElements.define('pixel-input', PixelInput);

class PixelSelect extends HTMLElement{
  connectedCallback(){
    if(this._init) return; this._init=true;
    const sel=this.querySelector('select');
    if(!sel) return;
    const txt=document.createElement('span'); txt.className='text';
    txt.textContent=sel.options[sel.selectedIndex]?.textContent||'';
    this.appendChild(txt);
    const arr=document.createElement('span'); arr.className='arrow'; this.appendChild(arr);
    sel.addEventListener('change',()=>{
      txt.textContent=sel.options[sel.selectedIndex]?.textContent||'';
    });
  }
}
customElements.define('pixel-select', PixelSelect);

class PixelRange extends HTMLElement{
  connectedCallback(){
    if(this._init) return; this._init=true;
    const inp=this.querySelector('input[type=range]');
    if(!inp) return; this._input=inp;
    const track=document.createElement('div'); track.className='track';
    const fill=document.createElement('div'); fill.className='fill'; track.appendChild(fill);
    const thumb=document.createElement('div'); thumb.className='thumb';
    this.append(track, thumb);
    inp.addEventListener('input',()=>this._update());
    const ro=new ResizeObserver(()=>this._update()); ro.observe(this);
    this._update();
  }
  _update(){
    const inp=this._input; const min=parseFloat(inp.min)||0; const max=parseFloat(inp.max)||100;
    const val=(parseFloat(inp.value)-min)/(max-min);
    const w=this.clientWidth-16; // padding left+right
    const x=8+val*w;
    const fill=this.querySelector('.fill'); const thumb=this.querySelector('.thumb');
    if(fill) fill.style.width=(val*w)+'px';
    if(thumb) thumb.style.left=x+'px';
  }
}
customElements.define('pixel-range', PixelRange);

export {PixelInput, PixelSelect, PixelRange};
