(function(){
  "use strict";

  /* ---- Sticky header: solid once scrolled ---- */
  var header = document.querySelector('.site-header');
  function onScroll(){
    if(!header) return;
    if(window.scrollY > 40){ header.classList.add('scrolled'); }
    else { header.classList.remove('scrolled'); }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        links.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && reveals.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.14, rootMargin:'0px 0px -60px 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(function(item){
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-a');
    if(!btn || !panel) return;
    btn.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item.open').forEach(function(other){
        if(other !== item){
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
          other.querySelector('.faq-q').setAttribute('aria-expanded','false');
        }
      });
      if(isOpen){
        item.classList.remove('open');
        panel.style.maxHeight = null;
        btn.setAttribute('aria-expanded','false');
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded','true');
      }
    });
  });

  /* ---- Portfolio filters ---- */
  var filters = document.querySelectorAll('.pf-filter');
  var cards = document.querySelectorAll('[data-category]');
  if(filters.length){
    filters.forEach(function(f){
      f.addEventListener('click', function(){
        filters.forEach(function(x){ x.classList.remove('active'); });
        f.classList.add('active');
        var cat = f.getAttribute('data-filter');
        cards.forEach(function(c){
          var show = cat === 'all' || c.getAttribute('data-category') === cat;
          c.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---- Contact form (no backend: client-side acknowledgement only) ---- */
  var form = document.querySelector('.contact-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var note = form.querySelector('.form-note');
      var btn = form.querySelector('button[type="submit"]');
      if(btn){ btn.setAttribute('disabled','disabled'); }
      if(note){
        note.textContent = 'Message pret a etre envoye. Merci de nous ecrire directement a contact@comm109.com en attendant la mise en ligne du formulaire.';
        note.classList.add('ok');
      }
    });
  }

  /* ---- Copy to clipboard (email / phone) ---- */
  document.querySelectorAll('.copy-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var value = btn.getAttribute('data-copy') || '';
      var done = function(){
        var original = btn.textContent;
        btn.textContent = 'Copie';
        setTimeout(function(){ btn.textContent = original; }, 1600);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(value).then(done).catch(function(){
          fallbackCopy(value); done();
        });
      } else {
        fallbackCopy(value); done();
      }
    });
  });
  function fallbackCopy(text){
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta);
  }

  /* ---- Current year in footer ---- */
  document.querySelectorAll('[data-year]').forEach(function(el){
    el.textContent = new Date().getFullYear();
  });

  /* ---- Intro sequence (homepage only, mobile/tablette uniquement): logo puis teaser ---- */
  var introOverlay = document.getElementById('introOverlay');
  if(introOverlay){
    var alreadySeen = false;
    try{ alreadySeen = sessionStorage.getItem('comm109IntroSeen') === '1'; }catch(e){}

    if(alreadySeen){
      introOverlay.remove();
    } else {
      var logoStage = document.getElementById('introLogoStage');
      var videoStage = document.getElementById('introVideoStage');
      var skipBtn = document.getElementById('introSkip');
      var videoFrame = document.getElementById('introVideoFrame');
      var logoVideo = document.getElementById('introLogoVideo');
      var finished = false;
      var fallbackTimer, logoFallbackTimer, movedToVideo = false;

      document.body.classList.add('intro-active');

      function markSeen(){
        try{ sessionStorage.setItem('comm109IntroSeen', '1'); }catch(e){}
      }

      function finishIntro(){
        if(finished) return;
        finished = true;
        markSeen();
        clearTimeout(fallbackTimer);
        clearTimeout(logoFallbackTimer);
        introOverlay.classList.add('intro-hidden');
        document.body.classList.remove('intro-active');
        setTimeout(function(){
          if(introOverlay && introOverlay.parentNode){ introOverlay.remove(); }
        }, 1000);
      }

      function goToVideoStage(){
        if(finished || movedToVideo) return;
        movedToVideo = true;
        clearTimeout(logoFallbackTimer);
        logoStage.classList.add('stage-out');
        videoStage.classList.add('stage-in');
        fallbackTimer = setTimeout(finishIntro, 45000);
      }

      if(logoVideo){
        logoVideo.addEventListener('ended', goToVideoStage);
      }
      /* filet de securite si la video du logo ne demarre pas (autoplay bloque, etc.) */
      logoFallbackTimer = setTimeout(goToVideoStage, 11000);

      if(skipBtn){ skipBtn.addEventListener('click', finishIntro); }

      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape') finishIntro();
      });

      window.addEventListener('message', function(e){
        if(typeof e.data !== 'string') return;
        try{
          var data = JSON.parse(e.data);
          if(data.event === 'onStateChange' && data.info === 0){
            finishIntro();
          }
        }catch(err){ /* not a YouTube API message */ }
      });

      if(videoFrame){
        videoFrame.addEventListener('load', function(){
          try{
            videoFrame.contentWindow.postMessage(JSON.stringify({event:'listening', id:1}), '*');
          }catch(e){}
        });
      }
    }
  }

})();
