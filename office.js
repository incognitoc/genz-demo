(function(){
  'use strict';
  var current=null, sequence=0, animations=[];
  var rooms={"login": ["00", "抵達大廳", "ARRIVAL LOBBY", "歡迎抵達，新的工作日。", "從這裡進入你的空中辦公室。", "arrival"], "home": ["01", "空中接待廳", "SKY LOUNGE", "從容，開始今天。", "掌握今天的工作與本月成果。", "lounge"], "workbench": ["02", "專案辦公室", "PROJECT STUDIO", "專注，讓想法落地。", "推進工作、交付成果，領取你的努力回報。", "studio"], "browse": ["03", "派工中心", "PROJECT EXCHANGE", "下一個機會，在這裡。", "找到適合你的專長，認領下一份挑戰。", "dispatch"], "taskdetail": ["04", "專案簡報室", "BRIEFING ROOM", "先看清目標，再開始。", "確認需求、交付格式與驗收標準。", "briefing"], "deliver": ["05", "成果審閱室", "REVIEW STUDIO", "讓成果，準備好被看見。", "整理交付內容，記錄每一次改進。", "review"], "submitted": ["06", "休憩交誼廳", "REFLECTION LOUNGE", "告一段落，稍作停留。", "成果已送出，接下來交給審核流程。", "reflection"], "mywork": ["07", "個人營運室", "OPERATIONS SUITE", "把每一件事，安排妥當。", "集中掌握本薪工作與加值工作的進度。", "operations"], "history": ["08", "典藏檔案室", "THE ARCHIVE", "每一步，都有跡可循。", "回看已完成的工作與每一筆結算紀錄。", "archive"], "points": ["09", "成就展示廳", "ACHIEVEMENT GALLERY", "努力，值得被記得。", "檢視累積點數，了解每一份獎勵的來源。", "gallery"], "metric": ["10", "策略會議室", "THE BOARDROOM", "一起，看向更遠的目標。", "掌握部門達成率與團隊的前進方向。", "boardroom"], "notifications": ["11", "訊息聯絡室", "COMMUNICATIONS", "重要消息，準時抵達。", "留意工作提醒、驗收結果與最新機會。", "communications"], "skills": ["12", "學習研修室", "LEARNING ACADEMY", "讓專長，開啟更多可能。", "盤點已驗證能力，找出下一步成長方向。", "academy"], "skillapply": ["13", "能力評鑑室", "ASSESSMENT SUITE", "為你的實力，留下證明。", "整理作品與經驗，申請專業技能驗證。", "assessment"], "settings": ["14", "個人管家室", "PERSONAL CONCIERGE", "讓工作，配合你的節奏。", "設定工作時段、負載上限與個人偏好。", "concierge"], "help": ["15", "知識閱覽室", "RESOURCE LIBRARY", "需要答案時，來這裡。", "查閱點數規則、工作流程與常見問題。", "library"]};
  var backgrounds={},labels={};
  Object.keys(rooms).forEach(function(id){backgrounds[id]="assets/rooms/"+id+".png";labels[id]="38F / "+rooms[id][1];});
  backgrounds.home="assets/lounge.png";backgrounds.workbench="assets/studio.png";
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  var loaded={}, displayed=backgrounds.home;
  function loadRoom(src){
    if(loaded[src])return loaded[src];
    loaded[src]=new Promise(function(resolve){
      var img=new Image(),done=false;
      var timer=setTimeout(function(){finish(false);},12000);
      function finish(ok){if(done)return;done=true;clearTimeout(timer);if(!ok)delete loaded[src];resolve(ok);}
      img.onload=function(){finish(true);};img.onerror=function(){finish(false);};img.src=src;
      if(img.complete&&img.naturalWidth)finish(true);
    });
    return loaded[src];
  }
  loadRoom(backgrounds.home);loadRoom(backgrounds.workbench);
  window.officeNavigate=function(id){
    if(!rooms[id])id='home';
    var previous=current;current=id;
    var bg=document.getElementById('officeBackground');
    var stage=document.getElementById('roomTravel');
    var oldImage=displayed,newImage=backgrounds[id];
    document.body.dataset.officeRoom=id;
    document.getElementById('roomLocation').textContent=labels[id];
    sequence++;var run=sequence;
    animations.forEach(function(a){a.cancel();});animations=[];
    stage.replaceChildren();stage.classList.remove('is-travelling','is-loading');
    if(previous===id)return;
    var shouldAnimate=!!previous&&!reduced.matches;
    var outgoing,incoming;
    if(shouldAnimate){
      stage.classList.add('is-travelling','is-loading');
      outgoing=document.createElement('div');outgoing.className='travel-room';outgoing.style.backgroundImage='url("'+oldImage+'")';stage.append(outgoing);
      var label=document.createElement('div');label.className='travel-label';label.textContent=labels[id];stage.append(label);
    }
    loadRoom(newImage).then(function(ok){
      if(run!==sequence)return;
      stage.classList.remove('is-loading');
      if(ok){bg.style.backgroundImage='url("'+newImage+'")';displayed=newImage;}
      if(!shouldAnimate||reduced.matches||!ok){stage.replaceChildren();stage.classList.remove('is-travelling');return;}
      var direction=Number(rooms[id][0])<Number(rooms[previous][0])?-1:1;
      incoming=document.createElement('div');incoming.className='travel-room';incoming.style.backgroundImage='url("'+newImage+'")';stage.insertBefore(incoming,stage.lastChild);
      var timing={duration:1250,easing:'cubic-bezier(.65,0,.25,1)',fill:'both'};
      var depart=outgoing.animate([{transform:'translateZ(0) rotateY(0deg)',opacity:1,filter:'brightness(1)'},{transform:'translateZ(450px) translateX('+(-direction*45)+'%) rotateY('+(direction*48)+'deg)',opacity:0,filter:'brightness(.45)'}],timing);
      depart.finished.catch(function(){});animations.push(depart);
      var arrive=incoming.animate([{transform:'translateX('+(direction*65)+'%) translateZ(-850px) rotateY('+(-direction*65)+'deg)',opacity:.15,filter:'brightness(.45)'},{transform:'translateX(0) translateZ(0) rotateY(0deg)',opacity:1,filter:'brightness(1)'}],timing);animations.push(arrive);
      arrive.finished.then(function(){
        if(run!==sequence)return;
        stage.replaceChildren();stage.classList.remove('is-travelling');
        var panel=document.querySelector('[data-view-panel="'+id+'"]');
        if(panel){
          var enter=panel.animate([{opacity:0,transform:'translateZ(-100px) translateY(20px)'},{opacity:1,transform:'translateZ(0) translateY(0)'}],{duration:450,easing:'ease-out'});
          enter.finished.catch(function(){});animations.push(enter);
          var heading=panel.querySelector('.suite-heading h2, .studio-heading h1, .room-intro h1, .login-arrival h2, h1');
          if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
        }
      }).catch(function(){});
    });
  };
  document.addEventListener('DOMContentLoaded',function(){
    var dialog=document.getElementById('roomDirectory');
    var directory=document.querySelector('.directory-grid');
    ['home','workbench','browse','mywork','history','points','metric','notifications','skills','settings','help'].forEach(function(id){
      var r=rooms[id],a=document.createElement('a');a.dataset.view=id;a.href='#'+id;a.className='directory-room';a.classList.toggle('is-active',id===current);
      var number=document.createElement('span');number.className='directory-number';number.textContent=r[0];
      var name=document.createElement('strong');name.textContent=r[1];
      var detail=document.createElement('small');detail.textContent=r[2];
      a.append(number,name,detail);directory.append(a);
    });
    document.getElementById('openDirectory').addEventListener('click',function(){dialog.showModal();});
    document.getElementById('closeDirectory').addEventListener('click',function(){dialog.close();});
    dialog.addEventListener('click',function(e){if(e.target.closest('[data-view]'))dialog.close();if(e.target===dialog){var rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});
    document.querySelectorAll('div[data-view]').forEach(function(card){card.setAttribute('role','link');card.setAttribute('tabindex','0');card.addEventListener('keydown',function(e){if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();card.click();}});});
    document.querySelectorAll('a[data-view]').forEach(function(a){a.href='#'+a.dataset.view;});
    document.querySelectorAll('.nav__item[data-view]').forEach(function(a){var r=rooms[a.dataset.view];if(r){var n=document.createElement('span');n.className='nav-room-number';n.textContent=r[0];a.append(n);a.title=r[1];}});
    document.addEventListener('pointerover',function(e){var link=e.target.closest('[data-view]');if(link&&backgrounds[link.dataset.view]){loadRoom(backgrounds[link.dataset.view]);}},{passive:true});
  });
})();
