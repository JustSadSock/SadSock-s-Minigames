(function(){
  'use strict';
  const S=3;
  const cache={};              // кэш готовых кадров для оптимизации

  function baseFromPattern(pattern,palette){
    const rows=pattern.trim().split('\n');
    const pts=[];
    rows.forEach((row,y)=>{
      row.split('').forEach((ch,x)=>{
        const col=palette[ch];
        if(col) pts.push({c:col,x:x+8,y:y+8});
      });
    });
    return pts;
  }

  function makeFrames(pattern,palette,hlColor,highlights){
    const base=baseFromPattern(pattern,palette);
    return highlights.map(([hx,hy])=> base.concat({c:hlColor,x:hx+8,y:hy+8}));
  }

  const heart1=[
    {c:'#ff9eb8',x:15,y:8},
    {c:'#ff9eb8',x:16,y:8},
    {c:'#ff9eb8',x:17,y:8},
    {c:'#ff9eb8',x:18,y:8},
    {c:'#ff9eb8',x:14,y:9},
    {c:'#ff9eb8',x:19,y:9},
    {c:'#ff9eb8',x:13,y:10},
    {c:'#ff9eb8',x:20,y:10},
    {c:'#ff9eb8',x:12,y:11},
    {c:'#ff9eb8',x:21,y:11},
    {c:'#ff9eb8',x:12,y:12},
    {c:'#ff9eb8',x:21,y:12},
    {c:'#ff9eb8',x:13,y:13},
    {c:'#ff9eb8',x:20,y:13},
    {c:'#ff9eb8',x:14,y:14},
    {c:'#ff9eb8',x:19,y:14},
    {c:'#ff9eb8',x:15,y:15},
    {c:'#ff9eb8',x:18,y:15},
    {c:'#ff9eb8',x:16,y:16},
    {c:'#ff9eb8',x:17,y:16},
    {c:'#ffe4ef',x:17,y:10},
    {c:'#ffe4ef',x:18,y:11},
    {c:'#ffe4ef',x:16,y:11},
    {c:'#ff5f9c',x:15,y:9},
    {c:'#ff5f9c',x:18,y:9}
  ];

  const heart2=[
    {c:'#ff9eb8',x:15,y:7},
    {c:'#ff9eb8',x:16,y:7},
    {c:'#ff9eb8',x:17,y:7},
    {c:'#ff9eb8',x:18,y:7},
    {c:'#ff9eb8',x:14,y:8},
    {c:'#ff9eb8',x:19,y:8},
    {c:'#ff9eb8',x:13,y:9},
    {c:'#ff9eb8',x:20,y:9},
    {c:'#ff9eb8',x:12,y:10},
    {c:'#ff9eb8',x:21,y:10},
    {c:'#ff9eb8',x:11,y:11},
    {c:'#ff9eb8',x:22,y:11},
    {c:'#ff9eb8',x:11,y:12},
    {c:'#ff9eb8',x:22,y:12},
    {c:'#ff9eb8',x:12,y:13},
    {c:'#ff9eb8',x:21,y:13},
    {c:'#ff9eb8',x:13,y:14},
    {c:'#ff9eb8',x:20,y:14},
    {c:'#ff9eb8',x:14,y:15},
    {c:'#ff9eb8',x:19,y:15},
    {c:'#ff9eb8',x:15,y:16},
    {c:'#ff9eb8',x:18,y:16},
    {c:'#ffe4ef',x:18,y:8},
    {c:'#ffe4ef',x:16,y:8},
    {c:'#ff5f9c',x:17,y:9}
  ];

  const heart3=[
    {c:'#ff9eb8',x:15,y:8},
    {c:'#ff9eb8',x:16,y:8},
    {c:'#ff9eb8',x:17,y:8},
    {c:'#ff9eb8',x:18,y:8},
    {c:'#ff9eb8',x:14,y:9},
    {c:'#ff9eb8',x:19,y:9},
    {c:'#ff9eb8',x:13,y:10},
    {c:'#ff9eb8',x:20,y:10},
    {c:'#ff9eb8',x:12,y:11},
    {c:'#ff9eb8',x:21,y:11},
    {c:'#ff9eb8',x:12,y:12},
    {c:'#ff9eb8',x:21,y:12},
    {c:'#ff9eb8',x:13,y:13},
    {c:'#ff9eb8',x:20,y:13},
    {c:'#ff9eb8',x:14,y:14},
    {c:'#ff9eb8',x:19,y:14},
    {c:'#ff9eb8',x:15,y:15},
    {c:'#ff9eb8',x:18,y:15},
    {c:'#ff9eb8',x:16,y:16},
    {c:'#ff9eb8',x:17,y:16},
    {c:'#ffe4ef',x:17,y:10},
    {c:'#ffe4ef',x:18,y:11},
    {c:'#ffe4ef',x:16,y:11},
    {c:'#ff5f9c',x:15,y:9},
    {c:'#ff5f9c',x:18,y:9}
  ];

  const heart4=[
    {c:'#ff9eb8',x:15,y:7},
    {c:'#ff9eb8',x:16,y:7},
    {c:'#ff9eb8',x:17,y:7},
    {c:'#ff9eb8',x:18,y:7},
    {c:'#ff9eb8',x:14,y:8},
    {c:'#ff9eb8',x:19,y:8},
    {c:'#ff9eb8',x:13,y:9},
    {c:'#ff9eb8',x:20,y:9},
    {c:'#ff9eb8',x:12,y:10},
    {c:'#ff9eb8',x:21,y:10},
    {c:'#ff9eb8',x:11,y:11},
    {c:'#ff9eb8',x:22,y:11},
    {c:'#ff9eb8',x:11,y:12},
    {c:'#ff9eb8',x:22,y:12},
    {c:'#ff9eb8',x:12,y:13},
    {c:'#ff9eb8',x:21,y:13},
    {c:'#ff9eb8',x:13,y:14},
    {c:'#ff9eb8',x:20,y:14},
    {c:'#ff9eb8',x:14,y:15},
    {c:'#ff9eb8',x:19,y:15},
    {c:'#ff9eb8',x:15,y:16},
    {c:'#ff9eb8',x:18,y:16},
    {c:'#ffe4ef',x:18,y:8},
    {c:'#ffe4ef',x:16,y:8},
    {c:'#ff5f9c',x:17,y:9}
  ];

  const heart5=[
    {c:'#ff9eb8',x:15,y:8},
    {c:'#ff9eb8',x:16,y:8},
    {c:'#ff9eb8',x:17,y:8},
    {c:'#ff9eb8',x:18,y:8},
    {c:'#ff9eb8',x:14,y:9},
    {c:'#ff9eb8',x:19,y:9},
    {c:'#ff9eb8',x:13,y:10},
    {c:'#ff9eb8',x:20,y:10},
    {c:'#ff9eb8',x:12,y:11},
    {c:'#ff9eb8',x:21,y:11},
    {c:'#ff9eb8',x:12,y:12},
    {c:'#ff9eb8',x:21,y:12},
    {c:'#ff9eb8',x:13,y:13},
    {c:'#ff9eb8',x:20,y:13},
    {c:'#ff9eb8',x:14,y:14},
    {c:'#ff9eb8',x:19,y:14},
    {c:'#ff9eb8',x:15,y:15},
    {c:'#ff9eb8',x:18,y:15},
    {c:'#ff9eb8',x:16,y:16},
    {c:'#ff9eb8',x:17,y:16},
    {c:'#ffe4ef',x:17,y:10},
    {c:'#ffe4ef',x:18,y:11},
    {c:'#ffe4ef',x:16,y:11},
    {c:'#ff5f9c',x:15,y:9},
    {c:'#ff5f9c',x:18,y:9}
  ];

  const bomb1=[
    {c:'#353535',x:16,y:12},
    {c:'#353535',x:15,y:13},
    {c:'#353535',x:16,y:13},
    {c:'#353535',x:17,y:13},
    {c:'#353535',x:14,y:14},
    {c:'#353535',x:15,y:14},
    {c:'#353535',x:16,y:14},
    {c:'#353535',x:17,y:14},
    {c:'#353535',x:18,y:14},
    {c:'#353535',x:14,y:15},
    {c:'#353535',x:15,y:15},
    {c:'#353535',x:16,y:15},
    {c:'#353535',x:17,y:15},
    {c:'#353535',x:18,y:15},
    {c:'#353535',x:15,y:16},
    {c:'#353535',x:16,y:16},
    {c:'#353535',x:17,y:16},
    {c:'#353535',x:16,y:17},
    {c:'#ff5f9c',x:19,y:13},
    {c:'#ff5f9c',x:20,y:12},
    {c:'#ff5f9c',x:21,y:11},
    {c:'#ffca3a',x:21,y:10},
    {c:'#ff595e',x:22,y:9},
    {c:'#ffca3a',x:23,y:10},
    {c:'#ffca3a',x:22,y:10}
  ];

  const bomb2=[
    {c:'#353535',x:16,y:12},
    {c:'#353535',x:15,y:13},
    {c:'#353535',x:16,y:13},
    {c:'#353535',x:17,y:13},
    {c:'#353535',x:14,y:14},
    {c:'#353535',x:15,y:14},
    {c:'#353535',x:16,y:14},
    {c:'#353535',x:17,y:14},
    {c:'#353535',x:18,y:14},
    {c:'#353535',x:14,y:15},
    {c:'#353535',x:15,y:15},
    {c:'#353535',x:16,y:15},
    {c:'#353535',x:17,y:15},
    {c:'#353535',x:18,y:15},
    {c:'#353535',x:15,y:16},
    {c:'#353535',x:16,y:16},
    {c:'#353535',x:17,y:16},
    {c:'#353535',x:16,y:17},
    {c:'#ff5f9c',x:19,y:13},
    {c:'#ff5f9c',x:20,y:12},
    {c:'#ff5f9c',x:21,y:11},
    {c:'#ffca3a',x:21,y:10},
    {c:'#ffca3a',x:22,y:9},
    {c:'#ff595e',x:23,y:10},
    {c:'#ffca3a',x:22,y:10}
  ];

  const bomb3=[
    {c:'#353535',x:16,y:12},
    {c:'#353535',x:15,y:13},
    {c:'#353535',x:16,y:13},
    {c:'#353535',x:17,y:13},
    {c:'#353535',x:14,y:14},
    {c:'#353535',x:15,y:14},
    {c:'#353535',x:16,y:14},
    {c:'#353535',x:17,y:14},
    {c:'#353535',x:18,y:14},
    {c:'#353535',x:14,y:15},
    {c:'#353535',x:15,y:15},
    {c:'#353535',x:16,y:15},
    {c:'#353535',x:17,y:15},
    {c:'#353535',x:18,y:15},
    {c:'#353535',x:15,y:16},
    {c:'#353535',x:16,y:16},
    {c:'#353535',x:17,y:16},
    {c:'#353535',x:16,y:17},
    {c:'#ff5f9c',x:19,y:13},
    {c:'#ff5f9c',x:20,y:12},
    {c:'#ff5f9c',x:21,y:11},
    {c:'#ffca3a',x:21,y:10},
    {c:'#ff595e',x:22,y:9},
    {c:'#ffca3a',x:23,y:10},
    {c:'#ffca3a',x:22,y:10}
  ];

  const bomb4=[
    {c:'#353535',x:16,y:12},
    {c:'#353535',x:15,y:13},
    {c:'#353535',x:16,y:13},
    {c:'#353535',x:17,y:13},
    {c:'#353535',x:14,y:14},
    {c:'#353535',x:15,y:14},
    {c:'#353535',x:16,y:14},
    {c:'#353535',x:17,y:14},
    {c:'#353535',x:18,y:14},
    {c:'#353535',x:14,y:15},
    {c:'#353535',x:15,y:15},
    {c:'#353535',x:16,y:15},
    {c:'#353535',x:17,y:15},
    {c:'#353535',x:18,y:15},
    {c:'#353535',x:15,y:16},
    {c:'#353535',x:16,y:16},
    {c:'#353535',x:17,y:16},
    {c:'#353535',x:16,y:17},
    {c:'#ff5f9c',x:19,y:13},
    {c:'#ff5f9c',x:20,y:12},
    {c:'#ff5f9c',x:21,y:11},
    {c:'#ffca3a',x:21,y:10},
    {c:'#ffca3a',x:22,y:9},
    {c:'#ff595e',x:23,y:10},
    {c:'#ffca3a',x:22,y:10}
  ];

  const bomb5=[
    {c:'#353535',x:16,y:12},
    {c:'#353535',x:15,y:13},
    {c:'#353535',x:16,y:13},
    {c:'#353535',x:17,y:13},
    {c:'#353535',x:14,y:14},
    {c:'#353535',x:15,y:14},
    {c:'#353535',x:16,y:14},
    {c:'#353535',x:17,y:14},
    {c:'#353535',x:18,y:14},
    {c:'#353535',x:14,y:15},
    {c:'#353535',x:15,y:15},
    {c:'#353535',x:16,y:15},
    {c:'#353535',x:17,y:15},
    {c:'#353535',x:18,y:15},
    {c:'#353535',x:15,y:16},
    {c:'#353535',x:16,y:16},
    {c:'#353535',x:17,y:16},
    {c:'#353535',x:16,y:17},
    {c:'#ff5f9c',x:19,y:13},
    {c:'#ff5f9c',x:20,y:12},
    {c:'#ff5f9c',x:21,y:11},
    {c:'#ffca3a',x:21,y:10},
    {c:'#ff595e',x:22,y:9},
    {c:'#ffca3a',x:23,y:10},
    {c:'#ffca3a',x:22,y:10}
  ];

  const key1=[
    {c:'#ffcf86',x:12,y:16},
    {c:'#ffcf86',x:13,y:16},
    {c:'#ffcf86',x:14,y:16},
    {c:'#ffcf86',x:15,y:16},
    {c:'#ffcf86',x:16,y:16},
    {c:'#ffcf86',x:17,y:16},
    {c:'#ffcf86',x:18,y:16},
    {c:'#ffcf86',x:19,y:16},
    {c:'#ffcf86',x:20,y:16},
    {c:'#ffcf86',x:21,y:16},
    {c:'#ffbd69',x:12,y:15},
    {c:'#ffbd69',x:12,y:14},
    {c:'#ffbd69',x:13,y:13},
    {c:'#ffbd69',x:14,y:12},
    {c:'#ffbd69',x:15,y:11},
    {c:'#ffbd69',x:16,y:11},
    {c:'#ffbd69',x:17,y:12},
    {c:'#ffbd69',x:18,y:13},
    {c:'#ffbd69',x:19,y:14},
    {c:'#ffbd69',x:20,y:15},
    {c:'#ffca3a',x:21,y:15},
    {c:'#ffca3a',x:22,y:15},
    {c:'#ffca3a',x:23,y:15},
    {c:'#ffca3a',x:22,y:16},
    {c:'#ffca3a',x:23,y:16}
  ];

  const key2=[
    {c:'#ffcf86',x:12,y:16},
    {c:'#ffcf86',x:13,y:16},
    {c:'#ffcf86',x:14,y:16},
    {c:'#ffcf86',x:15,y:16},
    {c:'#ffcf86',x:16,y:16},
    {c:'#ffcf86',x:17,y:16},
    {c:'#ffcf86',x:18,y:16},
    {c:'#ffcf86',x:19,y:16},
    {c:'#ffcf86',x:20,y:16},
    {c:'#ffcf86',x:21,y:16},
    {c:'#ffbd69',x:12,y:15},
    {c:'#ffbd69',x:12,y:14},
    {c:'#ffbd69',x:13,y:13},
    {c:'#ffbd69',x:14,y:12},
    {c:'#ffbd69',x:15,y:11},
    {c:'#ffbd69',x:16,y:11},
    {c:'#ffbd69',x:17,y:12},
    {c:'#ffbd69',x:18,y:13},
    {c:'#ffbd69',x:19,y:14},
    {c:'#ffbd69',x:20,y:15},
    {c:'#ffca3a',x:21,y:15},
    {c:'#ffca3a',x:22,y:15},
    {c:'#ffca3a',x:23,y:15},
    {c:'#ffca3a',x:23,y:16},
    {c:'#ffca3a',x:24,y:16}
  ];

  const key3=[
    {c:'#ffcf86',x:12,y:16},
    {c:'#ffcf86',x:13,y:16},
    {c:'#ffcf86',x:14,y:16},
    {c:'#ffcf86',x:15,y:16},
    {c:'#ffcf86',x:16,y:16},
    {c:'#ffcf86',x:17,y:16},
    {c:'#ffcf86',x:18,y:16},
    {c:'#ffcf86',x:19,y:16},
    {c:'#ffcf86',x:20,y:16},
    {c:'#ffcf86',x:21,y:16},
    {c:'#ffbd69',x:12,y:15},
    {c:'#ffbd69',x:12,y:14},
    {c:'#ffbd69',x:13,y:13},
    {c:'#ffbd69',x:14,y:12},
    {c:'#ffbd69',x:15,y:11},
    {c:'#ffbd69',x:16,y:11},
    {c:'#ffbd69',x:17,y:12},
    {c:'#ffbd69',x:18,y:13},
    {c:'#ffbd69',x:19,y:14},
    {c:'#ffbd69',x:20,y:15},
    {c:'#ffca3a',x:21,y:15},
    {c:'#ffca3a',x:22,y:15},
    {c:'#ffca3a',x:23,y:15},
    {c:'#ffca3a',x:22,y:16},
    {c:'#ffca3a',x:23,y:16}
  ];

  const key4=[
    {c:'#ffcf86',x:12,y:16},
    {c:'#ffcf86',x:13,y:16},
    {c:'#ffcf86',x:14,y:16},
    {c:'#ffcf86',x:15,y:16},
    {c:'#ffcf86',x:16,y:16},
    {c:'#ffcf86',x:17,y:16},
    {c:'#ffcf86',x:18,y:16},
    {c:'#ffcf86',x:19,y:16},
    {c:'#ffcf86',x:20,y:16},
    {c:'#ffcf86',x:21,y:16},
    {c:'#ffbd69',x:12,y:15},
    {c:'#ffbd69',x:12,y:14},
    {c:'#ffbd69',x:13,y:13},
    {c:'#ffbd69',x:14,y:12},
    {c:'#ffbd69',x:15,y:11},
    {c:'#ffbd69',x:16,y:11},
    {c:'#ffbd69',x:17,y:12},
    {c:'#ffbd69',x:18,y:13},
    {c:'#ffbd69',x:19,y:14},
    {c:'#ffbd69',x:20,y:15},
    {c:'#ffca3a',x:21,y:15},
    {c:'#ffca3a',x:22,y:15},
    {c:'#ffca3a',x:23,y:15},
    {c:'#ffca3a',x:23,y:16},
    {c:'#ffca3a',x:24,y:16}
  ];

  const key5=[
    {c:'#ffcf86',x:12,y:16},
    {c:'#ffcf86',x:13,y:16},
    {c:'#ffcf86',x:14,y:16},
    {c:'#ffcf86',x:15,y:16},
    {c:'#ffcf86',x:16,y:16},
    {c:'#ffcf86',x:17,y:16},
    {c:'#ffcf86',x:18,y:16},
    {c:'#ffcf86',x:19,y:16},
    {c:'#ffcf86',x:20,y:16},
    {c:'#ffcf86',x:21,y:16},
    {c:'#ffbd69',x:12,y:15},
    {c:'#ffbd69',x:12,y:14},
    {c:'#ffbd69',x:13,y:13},
    {c:'#ffbd69',x:14,y:12},
    {c:'#ffbd69',x:15,y:11},
    {c:'#ffbd69',x:16,y:11},
    {c:'#ffbd69',x:17,y:12},
    {c:'#ffbd69',x:18,y:13},
    {c:'#ffbd69',x:19,y:14},
    {c:'#ffbd69',x:20,y:15},
    {c:'#ffca3a',x:21,y:15},
    {c:'#ffca3a',x:22,y:15},
    {c:'#ffca3a',x:23,y:15},
    {c:'#ffca3a',x:22,y:16},
    {c:'#ffca3a',x:23,y:16}
  ];

  const space1=[
    {c:'#46a0ff',x:10,y:20},
    {c:'#46a0ff',x:11,y:20},
    {c:'#46a0ff',x:12,y:20},
    {c:'#46a0ff',x:13,y:20},
    {c:'#46a0ff',x:14,y:20},
    {c:'#00d9b8',x:16,y:15},
    {c:'#00d9b8',x:16,y:16},
    {c:'#00d9b8',x:15,y:17},
    {c:'#00d9b8',x:16,y:17},
    {c:'#00d9b8',x:17,y:17},
    {c:'#00d9b8',x:15,y:18},
    {c:'#00d9b8',x:16,y:18},
    {c:'#00d9b8',x:17,y:18},
    {c:'#00d9b8',x:16,y:19},
    {c:'#ffca3a',x:16,y:20},
    {c:'#ffca3a',x:16,y:21},
    {c:'#ff595e',x:16,y:22},
    {c:'#ffffff',x:5,y:5},
    {c:'#ffffff',x:24,y:6},
    {c:'#ffffff',x:8,y:12},
    {c:'#ffffff',x:27,y:14},
    {c:'#ffffff',x:4,y:18},
    {c:'#ffffff',x:28,y:22},
    {c:'#ffffff',x:2,y:8},
    {c:'#ffffff',x:30,y:10}
  ];

  const space2=[
    {c:'#46a0ff',x:10,y:20},
    {c:'#46a0ff',x:11,y:20},
    {c:'#46a0ff',x:12,y:20},
    {c:'#46a0ff',x:13,y:20},
    {c:'#46a0ff',x:14,y:20},
    {c:'#00d9b8',x:16,y:15},
    {c:'#00d9b8',x:16,y:16},
    {c:'#00d9b8',x:15,y:17},
    {c:'#00d9b8',x:16,y:17},
    {c:'#00d9b8',x:17,y:17},
    {c:'#00d9b8',x:15,y:18},
    {c:'#00d9b8',x:16,y:18},
    {c:'#00d9b8',x:17,y:18},
    {c:'#00d9b8',x:16,y:19},
    {c:'#ff595e',x:16,y:20},
    {c:'#ffca3a',x:16,y:21},
    {c:'#ffca3a',x:16,y:22},
    {c:'#ffffff',x:5,y:5},
    {c:'#ffffff',x:24,y:6},
    {c:'#ffffff',x:8,y:12},
    {c:'#ffffff',x:27,y:14},
    {c:'#ffffff',x:4,y:18},
    {c:'#ffffff',x:28,y:22},
    {c:'#ffffff',x:2,y:8},
    {c:'#ffffff',x:30,y:10}
  ];

  const space3=[
    {c:'#46a0ff',x:10,y:20},
    {c:'#46a0ff',x:11,y:20},
    {c:'#46a0ff',x:12,y:20},
    {c:'#46a0ff',x:13,y:20},
    {c:'#46a0ff',x:14,y:20},
    {c:'#00d9b8',x:16,y:15},
    {c:'#00d9b8',x:16,y:16},
    {c:'#00d9b8',x:15,y:17},
    {c:'#00d9b8',x:16,y:17},
    {c:'#00d9b8',x:17,y:17},
    {c:'#00d9b8',x:15,y:18},
    {c:'#00d9b8',x:16,y:18},
    {c:'#00d9b8',x:17,y:18},
    {c:'#00d9b8',x:16,y:19},
    {c:'#ffca3a',x:16,y:20},
    {c:'#ffca3a',x:16,y:21},
    {c:'#ff595e',x:16,y:22},
    {c:'#ffffff',x:5,y:5},
    {c:'#ffffff',x:24,y:6},
    {c:'#ffffff',x:8,y:12},
    {c:'#ffffff',x:27,y:14},
    {c:'#ffffff',x:4,y:18},
    {c:'#ffffff',x:28,y:22},
    {c:'#ffffff',x:2,y:8},
    {c:'#ffffff',x:30,y:10}
  ];

  const space4=[
    {c:'#46a0ff',x:10,y:20},
    {c:'#46a0ff',x:11,y:20},
    {c:'#46a0ff',x:12,y:20},
    {c:'#46a0ff',x:13,y:20},
    {c:'#46a0ff',x:14,y:20},
    {c:'#00d9b8',x:16,y:15},
    {c:'#00d9b8',x:16,y:16},
    {c:'#00d9b8',x:15,y:17},
    {c:'#00d9b8',x:16,y:17},
    {c:'#00d9b8',x:17,y:17},
    {c:'#00d9b8',x:15,y:18},
    {c:'#00d9b8',x:16,y:18},
    {c:'#00d9b8',x:17,y:18},
    {c:'#00d9b8',x:16,y:19},
    {c:'#ff595e',x:16,y:20},
    {c:'#ffca3a',x:16,y:21},
    {c:'#ffca3a',x:16,y:22},
    {c:'#ffffff',x:5,y:5},
    {c:'#ffffff',x:24,y:6},
    {c:'#ffffff',x:8,y:12},
    {c:'#ffffff',x:27,y:14},
    {c:'#ffffff',x:4,y:18},
    {c:'#ffffff',x:28,y:22},
    {c:'#ffffff',x:2,y:8},
    {c:'#ffffff',x:30,y:10}
  ];

  const space5=[
    {c:'#46a0ff',x:10,y:20},
    {c:'#46a0ff',x:11,y:20},
    {c:'#46a0ff',x:12,y:20},
    {c:'#46a0ff',x:13,y:20},
    {c:'#46a0ff',x:14,y:20},
    {c:'#00d9b8',x:16,y:15},
    {c:'#00d9b8',x:16,y:16},
    {c:'#00d9b8',x:15,y:17},
    {c:'#00d9b8',x:16,y:17},
    {c:'#00d9b8',x:17,y:17},
    {c:'#00d9b8',x:15,y:18},
    {c:'#00d9b8',x:16,y:18},
    {c:'#00d9b8',x:17,y:18},
    {c:'#00d9b8',x:16,y:19},
    {c:'#ffca3a',x:16,y:20},
    {c:'#ffca3a',x:16,y:21},
    {c:'#ff595e',x:16,y:22},
    {c:'#ffffff',x:5,y:5},
    {c:'#ffffff',x:24,y:6},
    {c:'#ffffff',x:8,y:12},
    {c:'#ffffff',x:27,y:14},
    {c:'#ffffff',x:4,y:18},
    {c:'#ffffff',x:28,y:22},
    {c:'#ffffff',x:2,y:8},
    {c:'#ffffff',x:30,y:10}
  ];

  const starFrames = makeFrames(`
..X..
.XXX.
XXXXX
.XXX.
..X..
`, {X:'#ffca3a'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [star1,star2,star3,star4,star5] = starFrames;
  const shipFrames = makeFrames(`
..X..
.XXX.
XXXXX
.XXX.
X...X
`, {X:'#46a0ff'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [ship1,ship2,ship3,ship4,ship5] = shipFrames;
  const ghostFrames = makeFrames(`
.XOX.
XXXXX
XXXXX
XXXXX
X.X.X
`, {X:'#46a0ff',O:'#000'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [ghost1,ghost2,ghost3,ghost4,ghost5] = ghostFrames;
  const appleFrames = makeFrames(`
..S..
.XXX.
XXXXX
.XXX.
..X..
`, {X:'#ff595e',S:'#7b3f00'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [apple1,apple2,apple3,apple4,apple5] = appleFrames;
  const carFrames = makeFrames(`
XXXXX
XXXXX
X...X
XXXXX
O...O
`, {X:'#ff6b6b',O:'#000'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [car1,car2,car3,car4,car5] = carFrames;
  const swordFrames = makeFrames(`
..X..
..X..
BBBBB
..X..
..X..
..X..
`, {X:'#c0c0c0',B:'#8b4513'}, '#fff', [[2,0],[2,1],[2,3],[2,4],[2,5]]);
  const [sword1,sword2,sword3,sword4,sword5] = swordFrames;
  const shieldFrames = makeFrames(`
..X..
.XXX.
XXXXX
.XXX.
..X..
`, {X:'#46a0ff'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [shield1,shield2,shield3,shield4,shield5] = shieldFrames;
  const coinFrames = makeFrames(`
..X..
.XXX.
XXXXX
.XXX.
..X..
`, {X:'#ffdd00'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [coin1,coin2,coin3,coin4,coin5] = coinFrames;

  const potionFrames = makeFrames(`
..X..
.XSX.
.XXX.
.XXX.
..X..
`, {X:'#00bbf9',S:'#7b3f00'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [potion1,potion2,potion3,potion4,potion5] = potionFrames;
  const crownFrames = makeFrames(`
X.X.X
XXXXX
XXXXX
.XXX.
..X..
`, {X:'#ffdd00'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [crown1,crown2,crown3,crown4,crown5] = crownFrames;
  const treeFrames = makeFrames(`
..X..
.XXX.
XXXXX
..X..
..T..
`, {X:'#00d97e',T:'#7b3f00'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [tree1,tree2,tree3,tree4,tree5] = treeFrames;
  const skullFrames = makeFrames(`
.XXX.
XOXOX
XXXXX
.X.X.
.X.X.
`, {X:'#ffcf86',O:'#000'}, '#fff', [[2,0],[4,2],[2,4],[0,2],[2,2]]);
  const [skull1,skull2,skull3,skull4,skull5] = skullFrames;

  const frames={
    heart:[heart1,heart2,heart3,heart4,heart5],
    bomb:[bomb1,bomb2,bomb3,bomb4,bomb5],
    key:[key1,key2,key3,key4,key5],
    space:[space1,space2,space3,space4,space5],
    star:[star1,star2,star3,star4,star5],
    ship:[ship1,ship2,ship3,ship4,ship5],
    ghost:[ghost1,ghost2,ghost3,ghost4,ghost5],
    apple:[apple1,apple2,apple3,apple4,apple5],
    car:[car1,car2,car3,car4,car5],
    sword:[sword1,sword2,sword3,sword4,sword5],
    shield:[shield1,shield2,shield3,shield4,shield5],
    coin:[coin1,coin2,coin3,coin4,coin5],
    potion:[potion1,potion2,potion3,potion4,potion5],
    crown:[crown1,crown2,crown3,crown4,crown5],
    tree:[tree1,tree2,tree3,tree4,tree5],
    skull:[skull1,skull2,skull3,skull4,skull5]
  };
  Object.keys(frames).forEach(name=>{
    cache[name]=frames[name].map(data=>{
      const cv=document.createElement('canvas');
      cv.width=120; cv.height=120;
      const ctx=cv.getContext('2d',{alpha:false});
      ctx.imageSmoothingEnabled=false;
      data.forEach(p=>{ ctx.fillStyle=p.c; ctx.fillRect(p.x*S,p.y*S,S,S); });
      return cv;
    });
  });

  function draw(ctx,name,frame){
    const set=cache[name];
    if(!set) return;
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.drawImage(set[frame%set.length],0,0);
  }

  window.Icons={draw};
})();

