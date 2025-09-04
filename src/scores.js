(function(global){
  'use strict';
  function Scores(key, opts={}){
    const cmp = opts.cmp === 'asc' ? (a,b)=>a.score-b.score : (a,b)=>b.score-a.score;
    const format = typeof opts.format === 'function' ? opts.format : (s)=>s;
    function load(){
      try{ return JSON.parse(localStorage.getItem('scores_'+key)) || []; }
      catch(e){ return []; }
    }
    function save(list){
      localStorage.setItem('scores_'+key, JSON.stringify(list.slice(0,10)));
    }
    function add(score, name){
      const n = name || localStorage.getItem('profileNick') || 'Player';
      const list = load();
      list.push({name:n, score:score});
      list.sort(cmp);
      save(list);
    }
    function show(){
      const list = load();
      if(!list.length){ UI.alert('Пока нет рекордов'); return; }
      UI.alert(list.map((s,i)=>`${i+1}. ${s.name}: ${format(s.score)}`).join('\n'));
    }
    return {add, show, load};
  }
  global.Scores = Scores;
})(globalThis);
