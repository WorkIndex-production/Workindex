  function loadAllActions() {
    var srch = g('acSrch').value, role = g('acRole').value;
    _pages['actions'] = 1;
    setT('acTbl', spin());
    api('users' + qs({ role: role || 'all', search: srch })).then(function(d) {
      _pageData['actions'] = d.users || [];
      renderActTblPage();
    }).catch(function() { setT('acTbl', ''); });
  }

  function searchActions() {
    loadAllActions();
  }

  function renderActTblPage() {
    var existing = document.getElementById('pag-actions');
    if (existing) existing.remove();
    var page = pagSlice('actions', _pageData['actions'] || []);
    renderActTbl(page);
    pagHTML('actions', 'acTbl');
  }

  function doAct(uid, act, reason) {
    api('users/' + uid + '/action', 'POST', { action: act, reason: reason || '' }).then(function(d) {
      if (d.success) { toast(d.message); searchActions(); }
      else toast(d.message || 'Failed', 'e');
    }).catch(function() { toast('Error', 'e'); });
  }

  function goActId(uid) {
    goTo('actions');
    setTimeout(function() {
      // Load all users and highlight the one we want
      g('acSrch').value = '';
      g('acRole').value = 'all';
      setT('acTbl', spin());
      api('users' + qs({ search: uid.slice(-8) })).then(function(d) {
        if (!d.success || !(d.users||[]).length) {
          return api('users' + qs({})).then(function(d2) { _pageData['actions'] = d2.users||[]; renderActTblPage(); });
        }
        _pageData['actions'] = d.users||[]; renderActTblPage();
      }).catch(function() { setT('acTbl', ''); });
    }, 200);
  }

  function renderActTbl(users) {
    // Bulk toolbar
    var acTbl = document.getElementById('acTbl');
    var acParent = acTbl ? acTbl.closest('table') : null;
    var acToolbar = document.getElementById('acBulkToolbar');
    if (!acToolbar && acParent) {
      acToolbar = document.createElement('div');
      acToolbar.id = 'acBulkToolbar';
      acToolbar.style.cssText = 'display:none;align-items:center;gap:10px;padding:10px 0;margin-bottom:8px;';
      acToolbar.innerHTML =
        '<span id="acSelCount" style="font-size:13px;color:#a0a0b8;">0 selected</span>' +
        '<button class="btn brdn" style="font-size:12px;padding:6px 14px;" onclick="bulkDeleteActions()">🗑 Delete Selected</button>' +
        '<button class="btn bgho" style="font-size:12px;padding:6px 14px;" onclick="clearActSelection()">Clear</button>';
      acParent.parentNode.insertBefore(acToolbar, acParent);
    }

    // Select-all in thead
    var acThead = acTbl ? acTbl.closest('table').querySelector('thead tr') : null;
    if (acThead && !acThead.querySelector('.ac-chk-all')) {
      var acTh = document.createElement('th');
      acTh.innerHTML = '<input type="checkbox" class="ac-chk-all" onchange="toggleAllActions(this)" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;" title="Select all">';
      acThead.insertBefore(acTh, acThead.firstChild);
    }

    setT('acTbl', users.map(function(u) {
      var bb = u.isBanned ? '<button class="btn bgrn" data-act="unban" data-uid="' + u._id + '" data-nm="' + esc(u.name) + '">Unban</button>' : '<button class="btn brdn" data-act="ban" data-uid="' + u._id + '" data-nm="' + esc(u.name) + '">Ban</button>';
      var delb = '<button class="btn brdn" style="background:rgba(139,0,0,0.25);border-color:rgba(139,0,0,0.6)" data-act="delete" data-uid="' + u._id + '" data-nm="' + esc(u.name) + '">🗑 Delete</button>';
      var fb = u.isFlagged ? '<button class="btn bgho" data-act="unflag" data-uid="' + u._id + '" data-nm="' + esc(u.name) + '">Unflag</button>' : '<button class="btn bgho" data-act="flag" data-uid="' + u._id + '" data-nm="' + esc(u.name) + '">Flag</button>';
      var rb = u.isRestricted
        ? '<button class="btn bgrn" data-act="unrestrict" data-uid="' + u._id + '" data-nm="' + esc(u.name) + '">Unrestrict</button>'
        : '<button class="btn bywn" style="background:rgba(239,68,68,.15);color:#fca5a5;border-color:rgba(239,68,68,.3)" data-act="restrict" data-uid="' + u._id + '" data-nm="' + esc(u.name) + '">Restrict</button>';      var warnBadge = (u.warnings||0) > 0 ? '<span style="color:' + ((u.warnings||0)>=3?'#ef4444':'#f59e0b') + ';font-weight:700">' + (u.warnings||0) + '/3</span>' : '0';
      return '<tr>' +
        '<td><input type="checkbox" class="ac-chk" data-uid="' + esc(u._id) + '" data-nm="' + esc(u.name) + '" onchange="onActCheck()" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;"></td>' +
        '<td><strong>' + esc(u.name) + '</strong></td>' +
        '<td>' + bdg(u.role) + '</td>' +
        '<td style="font-size:12px;color:#a0a0b8">' + esc(u.email) + '</td>' +
        '<td>' + ust(u) + (u.isRestricted ? ' <span class="badge brd">Restricted</span>' : '') + '</td>' +
        '<td>' + warnBadge + '</td>' +
        '<td><div style="display:flex;gap:4px;flex-wrap:wrap">' + bb + '<button class="btn bywn" data-act="warn" data-uid="' + u._id + '" data-nm="' + esc(u.name) + '">Warn</button>' + fb + rb + '<span class="btn bgho" data-uid="' + u._id + '">View</span>' + delb + '</div></td>' +
      '</tr>';
    }).join(''));
  }

  window.onActCheck = function() {
    var checked = document.querySelectorAll('.ac-chk:checked').length;
    var toolbar = document.getElementById('acBulkToolbar');
    var countEl = document.getElementById('acSelCount');
    if (toolbar) toolbar.style.display = checked > 0 ? 'flex' : 'none';
    if (countEl) countEl.textContent = checked + ' selected';
    var all = document.querySelectorAll('.ac-chk').length;
    var allChk = document.querySelector('.ac-chk-all');
    if (allChk) allChk.checked = checked > 0 && checked === all;
  };

  window.toggleAllActions = function(masterChk) {
    document.querySelectorAll('.ac-chk').forEach(function(chk) { chk.checked = masterChk.checked; });
    onActCheck();
  };

  window.clearActSelection = function() {
    document.querySelectorAll('.ac-chk').forEach(function(chk) { chk.checked = false; });
    var allChk = document.querySelector('.ac-chk-all');
    if (allChk) allChk.checked = false;
    onActCheck();
  };

  window.bulkDeleteActions = function() {
    var selected = Array.from(document.querySelectorAll('.ac-chk:checked'));
    if (!selected.length) { toast('Nothing selected', 'i'); return; }
    var names = selected.map(function(c) { return c.dataset.nm; }).join(', ');
    if (!confirm('PERMANENTLY DELETE ' + selected.length + ' user(s)?\n\n' + names + '\n\nThis cannot be undone.')) return;
    var confirmText = prompt('Type DELETE to confirm bulk deletion of ' + selected.length + ' users:');
    if (confirmText !== 'DELETE') { toast('Cancelled — text did not match', 'e'); return; }
    var ids = selected.map(function(c) { return { uid: c.dataset.uid, nm: c.dataset.nm }; });
    var done = 0, failed = 0;
    var next = function() {
      if (!ids.length) {
        toast('Deleted ' + done + (failed ? ', ' + failed + ' failed' : '') + ' users');
        searchActions();
        return;
      }
      var item = ids.shift();
      api('users/' + item.uid, 'DELETE').then(function(d) {
        if (d.success) done++; else failed++;
        next();
      }).catch(function() { failed++; next(); });
    };
    next();
  };

  /* ═══ HEATMAP ════════════════════════════════════════════════════════════ */
  var _hmData = {}, _hmState = null;
  // Indian states with rough SVG positions for bar chart (no external map needed)
  var IN_STATES = ['Maharashtra','Delhi','Karnataka','Tamil Nadu','Uttar Pradesh','Gujarat','Rajasthan','West Bengal','Telangana','Andhra Pradesh','Kerala','Madhya Pradesh','Punjab','Haryana','Bihar','Odisha','Jharkhand','Assam','Chhattisgarh','Uttarakhand','Himachal Pradesh','Goa','Tripura','Manipur','Meghalaya','Nagaland','Arunachal Pradesh','Mizoram','Sikkim','Chandigarh','Puducherry','Jammu and Kashmir','Ladakh'];

  function loadHeatmap() {
    var role = g('hmRole').value;
    g('hmMapArea').innerHTML = '<div style="text-align:center;padding:30px"><div class="spin"></div><div style="margin-top:8px;font-size:12px;color:#606078">Loading location data...</div></div>';
    g('hmBars').innerHTML = '';
    _hmState = null;
    g('hmCrumbs').innerHTML = '<span class="hm-crumb" data-level="country">India</span>';

    // Load users for heatmap - try up to 500 at a time
    var hmRole = role === 'all' ? '' : role;
    var hmQs = '?limit=500' + (hmRole ? '&role=' + hmRole : '') + (dF ? '&from=' + dF : '') + (dT ? '&to=' + dT : '');
    fetch(API + '/users' + hmQs, { headers: { Authorization: 'Bearer ' + tok } })
      .then(function(r) { return r.json(); })
      .then(function(d) {
      var users = d.users || [];
      // ── Location field mapping from index.html questionnaire: ──
      // Expert registration saves to profile.city (plain string e.g. "Bengaluru")
      //   + profile.pincode (6-digit) + profile.serviceLocationType
      // Client questionnaire saves fullAddress: {city,state,pincode,...} 
      //   stored as profile.fullAddress.city / profile.fullAddress.state
      // We use city as the top-level grouping since experts don't have state
      var byState = {};
      users.forEach(function(u) {
  var pr = u.profile || {};
  var city = null;
  var state = null;

  // 1. profile.fullAddress (client — in-person service)
  if (pr.fullAddress) {
    city  = (pr.fullAddress.city  || '').trim() || null;
    state = (pr.fullAddress.state || '').trim() || null;
  }

  // 2. profile.clientLocation (client — online service)
  if (!city && pr.clientLocation) {
    city  = (pr.clientLocation.city  || '').trim() || null;
    state = (pr.clientLocation.state || '').trim() || null;
  }

  // 3. profile.address (another client address variant)
  if (!city && pr.address) {
    city  = (pr.address.city  || '').trim() || null;
    state = (pr.address.state || '').trim() || null;
  }

  // 4. profile.city + profile.state (expert AND client)
  if (!city) {
    city = (pr.city || '').trim() || null;
  }
  if (!state) {
    state = (pr.state || '').trim() || null;
  }

  // 4b. expert_location_details (new pincode-autofill address object)
  if (pr.expert_location_details && typeof pr.expert_location_details === 'object') {
    if (!city)  city  = (pr.expert_location_details.city  || '').trim() || null;
    if (!state) state = (pr.expert_location_details.state || '').trim() || null;
  }

  // 4c. expert_city / expert_state flat keys (legacy individual questions)
  if (!city)  city  = (pr.expert_city  || '').trim() || null;
  if (!state) state = (pr.expert_state || '').trim() || null;

  // 5. top-level user location field (fallback)
  if (!city && u.location) {
    city  = (u.location.city  || '').trim() || null;
    state = (u.location.state || '').trim() || null;
  }

  // 6. try to derive state from city for old client records
  // that only have fullAddress without state filled
  if (city && !state) {
    var cityStateMap = {
      'Bengaluru': 'Karnataka', 'Bangalore': 'Karnataka',
      'Mumbai': 'Maharashtra', 'Pune': 'Maharashtra',
      'Nagpur': 'Maharashtra', 'Nashik': 'Maharashtra',
      'Delhi': 'Delhi', 'New Delhi': 'Delhi',
      'Noida': 'Uttar Pradesh', 'Agra': 'Uttar Pradesh',
      'Lucknow': 'Uttar Pradesh', 'Varanasi': 'Uttar Pradesh',
      'Meerut': 'Uttar Pradesh', 'Kanpur': 'Uttar Pradesh',
      'Gurgaon': 'Haryana', 'Gurugram': 'Haryana',
      'Faridabad': 'Haryana', 'Chandigarh': 'Chandigarh',
      'Hyderabad': 'Telangana',
      'Chennai': 'Tamil Nadu', 'Coimbatore': 'Tamil Nadu',
      'Madurai': 'Tamil Nadu',
      'Kolkata': 'West Bengal',
      'Ahmedabad': 'Gujarat', 'Surat': 'Gujarat',
      'Vadodara': 'Gujarat', 'Rajkot': 'Gujarat',
      'Jaipur': 'Rajasthan', 'Jodhpur': 'Rajasthan',
      'Kochi': 'Kerala', 'Kozhikode': 'Kerala',
      'Thiruvananthapuram': 'Kerala',
      'Bhopal': 'Madhya Pradesh', 'Indore': 'Madhya Pradesh',
      'Patna': 'Bihar',
      'Bhubaneswar': 'Odisha',
      'Raipur': 'Chhattisgarh',
      'Dehradun': 'Uttarakhand',
      'Guwahati': 'Assam',
      'Mysuru': 'Karnataka', 'Mysore': 'Karnataka',
      'Visakhapatnam': 'Andhra Pradesh',
      'Amritsar': 'Punjab', 'Ludhiana': 'Punjab',
      'Thane': 'Maharashtra', 'Aurangabad': 'Maharashtra'
    };
    state = cityStateMap[city] || null;
  }

  var groupKey = state || city || 'Unknown';
  var subKey   = city  || 'Unknown';
  if (!byState[groupKey]) byState[groupKey] = { count: 0, cities: {} };
  byState[groupKey].count++;
  byState[groupKey].cities[subKey] = (byState[groupKey].cities[subKey] || 0) + 1;
});
      _hmData = { byState: byState, total: users.length, role: role };
      renderHeatmapIndia(byState, users.length);
      renderHmBars(byState, null);
      }).catch(function(err) {
        console.error('Heatmap load error:', err);
        g('hmMapArea').innerHTML = '<div style="text-align:center;padding:30px;color:#606078;font-size:13px">Failed to load data</div>';
      });
  }

  // ── Leaflet map instance (kept so we can destroy/recreate on refresh) ──
  var _leafletMap = null;

  // ── City lat/lng lookup for heatmap dots ──
  var CITY_LL = {
    'Bengaluru':[12.972,77.594],'Bangalore':[12.972,77.594],'Delhi':[28.613,77.209],
    'New Delhi':[28.613,77.209],'Mumbai':[19.076,72.877],'Pune':[18.520,73.856],
    'Hyderabad':[17.385,78.487],'Chennai':[13.083,80.270],'Kolkata':[22.573,88.364],
    'Ahmedabad':[23.023,72.571],'Jaipur':[26.912,75.787],'Surat':[21.170,72.831],
    'Lucknow':[26.847,80.947],'Chandigarh':[30.733,76.779],'Kochi':[9.931,76.267],
    'Bhopal':[23.260,77.413],'Nagpur':[21.145,79.082],'Coimbatore':[11.016,76.956],
    'Mysuru':[12.296,76.644],'Mysore':[12.296,76.644],'Indore':[22.719,75.857],
    'Patna':[25.594,85.137],'Vadodara':[22.307,73.181],'Visakhapatnam':[17.686,83.218],
    'Gurgaon':[28.459,77.026],'Gurugram':[28.459,77.026],'Noida':[28.535,77.391],
    'Agra':[27.176,78.008],'Varanasi':[25.320,82.974],'Thane':[19.218,72.978],
    'Meerut':[28.984,77.706],'Nashik':[19.998,73.789],'Aurangabad':[19.877,75.343],
    'Faridabad':[28.408,77.313],'Rajkot':[22.303,70.802],'Ludhiana':[30.901,75.857],
    'Amritsar':[31.634,74.872],'Jodhpur':[26.300,73.017],'Madurai':[9.939,78.121],
    'Raipur':[21.251,81.629],'Kozhikode':[11.258,75.780],'Bhubaneswar':[20.296,85.825],
    'Dehradun':[30.316,78.032],'Thiruvananthapuram':[8.524,76.936],'Guwahati':[26.144,91.736]
  };

  function renderHeatmapIndia(byState, total) {
    var container = g('hmMapArea');
    // Destroy existing Leaflet map cleanly
    if (_leafletMap) {
      try { _leafletMap.off(); _leafletMap.remove(); } catch(e) {}
      _leafletMap = null;
    }
    container.innerHTML = '<div id="indiaLeafletMap" style="width:100%;height:470px;border-radius:10px;background:#0d0d14"></div>';

    function normName(s) { return (s || '').toLowerCase().replace(/[^a-z]/g, ''); }

    function matchStateData(geoName) {
      // exact match
      if (byState[geoName]) return byState[geoName];
      var n = normName(geoName);
      for (var k in byState) {
        if (normName(k) === n) return byState[k];
      }
      // partial match
      for (var k in byState) {
        var kn = normName(k);
        if (n.indexOf(kn) >= 0 || kn.indexOf(n) >= 0) return byState[k];
      }
      return null;
    }

    function getStateColor(count, maxVal) {
      if (!count || !maxVal) return '#1a1a2e';
      var pct = count / maxVal;
      // dark background → bright orange
      var r = Math.round(26 + pct * 226);
      var gv = Math.round(26 + pct * 102);
      var b  = Math.round(36 + pct * -11);
      return 'rgb(' + r + ',' + gv + ',' + Math.max(0,b) + ')';
    }

    function initMap() {
      var L = window.L;
      if (!L) { fallbackTiles(byState, total, container); return; }

      var map = L.map('indiaLeafletMap', {
        center: [22.5, 80.5],
        zoom: 4,
        minZoom: 3,
        maxZoom: 10,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false
      });
      _leafletMap = map;

      // Dark tile base layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        opacity: 0.6
      }).addTo(map);

      var maxCount = 0;
      Object.keys(byState).forEach(function(s) {
        if (byState[s].count > maxCount) maxCount = byState[s].count;
      });

      // India state GeoJSON — well-known public CDN
      var GEO_URL = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson';

      fetch(GEO_URL)
        .then(function(r) { return r.ok ? r.json() : Promise.reject('geo-fail'); })
        .then(function(geo) {
          var geoLayer = L.geoJSON(geo, {
            style: function(feat) {
              var name = feat.properties.NAME_1 || feat.properties.st_nm || feat.properties.name || '';
              var data = matchStateData(name);
              var cnt  = data ? data.count : 0;
              return {
                fillColor:   getStateColor(cnt, maxCount),
                fillOpacity: cnt > 0 ? 0.80 : 0.20,
                color:       '#FC8019',
                weight:      0.8,
                opacity:     0.7
              };
            },
            onEachFeature: function(feat, layer) {
              var stName = feat.properties.NAME_1 || feat.properties.st_nm || feat.properties.name || '';
              var data   = matchStateData(stName);
              var cnt    = data ? data.count : 0;

              // Tooltip
              var cities = data && data.cities ? Object.keys(data.cities)
                .sort(function(a,b){ return data.cities[b]-data.cities[a]; })
                .slice(0,4).map(function(c){ return c + ' (' + data.cities[c] + ')'; }).join(', ') : '';
              layer.bindTooltip(
                '<div style="font-weight:700;color:#FC8019;font-size:13px">' + stName + '</div>' +
                '<div style="color:#f0f0f4;margin-top:2px">' + cnt + ' user' + (cnt!==1?'s':'') + '</div>' +
                (cities ? '<div style="color:#a0a0b8;font-size:11px;margin-top:3px">' + cities + '</div>' : ''),
                { sticky: true, className: 'hm-lf-tip', opacity: 1 }
              );

              // State abbreviation label
              try {
                var center = layer.getBounds().getCenter();
                var abbr = stName.split(' ').map(function(w){ return w[0]; }).join('').substring(0,3);
                L.marker(center, {
                  icon: L.divIcon({
                    className:'',
                    html: '<div class="hm-state-lbl">' + abbr +
                      (cnt > 0 ? '<br><span class="hm-state-cnt">' + cnt + '</span>' : '') + '</div>',
                    iconSize: [44, 26],
                    iconAnchor: [22, 13]
                  }),
                  interactive: false
                }).addTo(map);
              } catch(e) {}

              // Click → drill to cities
              layer.on('click', function() {
                if (data && data.cities && Object.keys(data.cities).length) {
                  drillHeatmapState(stName);
                } else {
                  toast('No city data for ' + stName, 'i');
                }
              });

              // Hover highlight
              layer.on('mouseover', function() {
                this.setStyle({ weight: 2, color: '#ffffff', opacity: 1 });
              });
              layer.on('mouseout', function() {
                geoLayer.resetStyle(this);
              });
            }
          }).addTo(map);

          // Fit to India bounds
          try { map.fitBounds(geoLayer.getBounds(), { padding: [10,10] }); } catch(e){}

          // ── Heat dots: circle markers for cities with known coords ──
          Object.keys(byState).forEach(function(stKey) {
            var stData = byState[stKey];
            if (!stData.cities) return;
            Object.keys(stData.cities).forEach(function(city) {
              var cnt = stData.cities[city];
              var ll  = CITY_LL[city];
              if (!ll) return;
              var radius = Math.max(5, Math.min(26, 5 + cnt * 3));
              L.circleMarker(ll, {
                radius:      radius,
                fillColor:   '#FC8019',
                color:       '#fff',
                weight:      1.5,
                opacity:     0.9,
                fillOpacity: 0.75
              })
                .bindTooltip('<strong style="color:#FC8019">' + city + '</strong><br>' + cnt + ' user' + (cnt!==1?'s':''),
                  { sticky:true, className:'hm-lf-tip' })
                .addTo(map);
            });
          });

          // Legend
          g('hmLegend').innerHTML =
            '<div class="hm-lswatch" style="background:#1a1a2e;border:1px solid rgba(252,128,25,.3)"></div><span>0</span>' +
            '<div class="hm-lswatch" style="background:rgb(80,40,10)"></div><span>Low</span>' +
            '<div class="hm-lswatch" style="background:rgb(170,80,15)"></div><span>Mid</span>' +
            '<div class="hm-lswatch" style="background:rgb(252,128,25)"></div><span>High</span>';
          g('hmBarTitle').textContent = 'Top States';
        })
        .catch(function() {
          // GeoJSON CDN blocked — fall back to tile grid
          fallbackTiles(byState, total, container);
        });
    }

 // Load Leaflet JS + CSS on demand
    function loadLeaflet(cb) {
      if (window.L) { cb(); return; }
      if (!document.querySelector('link[href*="leaflet"]')) {
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }
      if (!document.querySelector('script[src*="leaflet"]')) {
        var sc = document.createElement('script');
        sc.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        sc.onload  = cb;
        sc.onerror = function() { fallbackTiles(byState, total, container); };
        document.head.appendChild(sc);
      } else {
        // script already in DOM but may still be loading
        var t = setInterval(function() {
          if (window.L) { clearInterval(t); cb(); }
        }, 50);
      }
    }

    loadLeaflet(initMap);
  }

  // ── Tile-grid fallback (used when Leaflet / GeoJSON CDN is blocked) ──
  function fallbackTiles(byState, total, container) {
    var maxVal = 0;
    Object.keys(byState).forEach(function(s) { if (byState[s].count>maxVal) maxVal=byState[s].count; });
    var states = Object.keys(byState).filter(function(s){return s!=='Unknown';}).sort(function(a,b){return byState[b].count-byState[a].count;});
    if (!states.length) {
      container.innerHTML = '<div style="text-align:center;padding:30px;color:#606078">No location data — users need a city/state in their profile.</div>';
      return;
    }
    var html = '<div style="display:flex;flex-wrap:wrap;gap:5px;padding:8px">';
    states.forEach(function(st) {
      var c = byState[st].count, pct = maxVal>0?c/maxVal:0;
      var r=Math.round(50+pct*202), gv=Math.round(20+pct*108), b=Math.round(0+pct*25);
      html += '<div data-hm-state="' + esc(st) + '" style="background:rgb('+r+','+gv+','+b+');border-radius:6px;padding:6px 10px;cursor:pointer;min-width:55px;flex-shrink:0" title="' + esc(st)+': '+c+'">' +
        '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.9);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(st.substring(0,13))+'</div>' +
        '<div style="font-size:15px;font-weight:800;color:#fff">'+c+'</div></div>';
    });
    var unk = byState['Unknown'] ? byState['Unknown'].count : 0;
    html += '</div>' + (unk?'<div style="font-size:11px;color:#606078;padding:4px 8px">'+unk+' without location</div>':'') +
      '<div style="font-size:11px;color:#606078;padding:2px 8px">Total: <strong style="color:#f0f0f4">'+total+'</strong> · Click to drill</div>';
    container.innerHTML = html;
    g('hmLegend').innerHTML = '<div class="hm-lswatch" style="background:rgb(50,20,0)"></div><span>Low</span><div class="hm-lswatch" style="background:rgb(252,128,25)"></div><span>High</span>';
    g('hmBarTitle').textContent = 'Top States';
    return;
    /*
    /*
    var maxVal = 0;
    Object.keys(byState).forEach(function(s) { if (byState[s].count > maxVal) maxVal = byState[s].count; });

    // Build a simple visual grid of states as colored rectangles (no external SVG needed)
    var states = Object.keys(byState).filter(function(s) { return s !== 'Unknown'; }).sort(function(a,b) { return byState[b].count - byState[a].count; });
    var unknownCount = byState['Unknown'] ? byState['Unknown'].count : 0;

    var html = '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:4px">';
    states.forEach(function(state) {
      var cnt = byState[state].count;
      var pct = maxVal > 0 ? cnt / maxVal : 0;
      // Color intensity: dark orange to bright orange
      var r = Math.round(50 + pct * 202), g2 = Math.round(20 + pct * 108), b = Math.round(0 + pct * 25);
      var bg = 'rgb(' + r + ',' + g2 + ',' + b + ')';
      var w = Math.max(50, Math.round(40 + pct * 120));
      html += '<div data-hm-state="' + esc(state) + '" style="background:' + bg + ';border-radius:5px;padding:5px 8px;cursor:pointer;width:' + w + 'px;min-width:50px;flex-shrink:0;transition:opacity .2s;position:relative" title="' + esc(state) + ': ' + cnt + '">';
      html += '<div style="font-size:9px;font-weight:700;color:rgba(255,255,255,.9);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(state.substring(0,14)) + '</div>';
      html += '<div style="font-size:13px;font-weight:800;color:#fff">' + cnt + '</div>';
      html += '</div>';
    });
    html += '</div>';
    if (unknownCount) html += '<div style="font-size:11px;color:#606078;margin-top:6px;padding:0 4px">' + unknownCount + ' users without location data</div>';
    html += '<div style="font-size:11px;color:#606078;margin-top:4px;padding:0 4px">Total: <strong style="color:#f0f0f4">' + total + '</strong> &bull; Click a state to drill down</div>';

    g('hmMapArea').innerHTML = html;
    // Legend
    g('hmLegend').innerHTML = '<div class="hm-lswatch" style="background:rgb(50,20,0)"></div><span>Low</span><div class="hm-lswatch" style="background:rgb(150,64,12)"></div><span>Medium</span><div class="hm-lswatch" style="background:rgb(252,128,25)"></div><span>High</span>';
    g('hmBarTitle').textContent = 'Top States';
  }


  */ }

  function drillHeatmap(state) {
    drillHeatmapState(state); return;
    if (!_hmData.byState || !_hmData.byState[state]) return;
    _hmState = state;
    var cities = _hmData.byState[state].cities;
    var maxVal = 0;
    Object.keys(cities).forEach(function(c) { if (cities[c] > maxVal) maxVal = cities[c]; });

    g('hmCrumbs').innerHTML = '<span class="hm-crumb" data-level="country" style="cursor:pointer">India</span><span class="hm-crumb">' + esc(state) + '</span>';
    g('hmCrumbs').querySelector('[data-level="country"]').onclick = function() {
      _hmState = null;
      g('hmCrumbs').innerHTML = '<span class="hm-crumb" data-level="country">India</span>';
      renderHeatmapIndia(_hmData.byState, _hmData.total);
      renderHmBars(_hmData.byState, null);
    };

    var sorted = Object.keys(cities).filter(function(c) { return c !== 'Unknown'; }).sort(function(a,b) { return cities[b] - cities[a]; });
    var html = '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:4px">';
    sorted.forEach(function(city) {
      var cnt = cities[city];
      var pct = maxVal > 0 ? cnt / maxVal : 0;
      var r = Math.round(50 + pct * 202), g2 = Math.round(20 + pct * 108), b = Math.round(0 + pct * 25);
      var bg = 'rgb(' + r + ',' + g2 + ',' + b + ')';
      html += '<div style="background:' + bg + ';border-radius:5px;padding:5px 8px;min-width:60px;flex-shrink:0">';
      html += '<div style="font-size:9px;font-weight:700;color:rgba(255,255,255,.9);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(city.substring(0,12)) + '</div>';
      html += '<div style="font-size:13px;font-weight:800;color:#fff">' + cnt + '</div>';
      html += '</div>';
    });
    if (cities['Unknown']) html += '<div style="background:#1a1a24;border-radius:5px;padding:5px 8px"><div style="font-size:9px;color:#606078">Unknown</div><div style="font-size:13px;font-weight:800;color:#606078">' + cities['Unknown'] + '</div></div>';
    html += '</div>';
    html += '<div style="font-size:11px;color:#606078;margin-top:6px;padding:0 4px">Total in ' + esc(state) + ': <strong style="color:#f0f0f4">' + _hmData.byState[state].count + '</strong></div>';
    g('hmMapArea').innerHTML = html;
    g('hmBarTitle').textContent = 'Cities in ' + state;
    renderHmBars(null, cities);
  }

  function renderHmBars(byState, byCities) {
    var data = byState || byCities;
    if (!data) { g('hmBars').innerHTML = ''; return; }
    var sorted = Object.keys(data).filter(function(k) { return k !== 'Unknown'; }).sort(function(a,b) {
      var va = byState ? data[a].count : data[a];
      var vb = byState ? data[b].count : data[b];
      return vb - va;
    }).slice(0, 15);
    var maxVal = 0;
    sorted.forEach(function(k) { var v = byState ? data[k].count : data[k]; if (v > maxVal) maxVal = v; });
    g('hmBars').innerHTML = sorted.map(function(k) {
      var v = byState ? data[k].count : data[k];
      var pct = maxVal > 0 ? (v / maxVal * 100) : 0;
      return '<div class="hm-bar-row"><div class="hm-bar-label" title="' + esc(k) + '">' + esc(k) + '</div>' +
        '<div style="flex:1;background:#18181d;border-radius:4px;overflow:hidden"><div class="hm-bar" style="width:' + pct + '%;background:linear-gradient(90deg,#FC8019,#e06b0a)"></div></div>' +
        '<div class="hm-bar-val">' + v + '</div></div>';
    }).join('') || '<div style="color:#606078;font-size:13px;padding:10px">No data</div>';
  }

  /* ═══ DM (DIRECT MESSAGE) ════════════════════════════════════════════════ */
  var _dmUid = null;

  function openDmModal(uid, name) {
    _dmUid = uid;
    g('dmModalInfo').innerHTML = '<strong>' + esc(name) + '</strong><br><span style="color:#a0a0b8;font-size:12px">Message will appear in their chat inbox</span>';
    g('dmText').value = '';
    openModal('dmModal');
  }

  function submitDm() {
    if (!_dmUid) return;
    var text = g('dmText').value.trim();
    if (!text) { toast('Enter a message', 'e'); return; }
    g('dmSubmit').textContent = 'Sending...';
    api('users/' + _dmUid + '/dm', 'POST', { message: text })
      .then(function(d) {
        g('dmSubmit').textContent = '\u2708 Send Message';
        if (d.success) { toast('Message sent!'); closeModal('dmModal'); }
        else toast(d.message || 'Failed to send', 'e');
      }).catch(function() { g('dmSubmit').textContent = '\u2708 Send Message'; toast('Connection error', 'e'); });
  }

  /* ═══ KYC VIEWER ═════════════════════════════════════════════════════════ */
  var _kycUid = null;

  function openKycModal(uid, name) {
    _kycUid = uid;
    g('kycModalTitle').textContent = '\ud83d\udcc4 KYC Documents — ' + name;
    g('kycModalBody').innerHTML = '<div style="text-align:center;padding:24px"><div class="spin"></div></div>';
    openModal('kycModal');
    api('users/' + uid).then(function(d) {
      if (!d.success) { g('kycModalBody').innerHTML = '<p style="color:#606078;padding:16px">Failed to load</p>'; return; }
      var u = d.user;
      var pr = u.profile || {};
      // Collect all possible doc fields
        var docs = [
  { label: 'Aadhar Card', url: u.aadharDoc || pr.aadhar || pr.aadharUrl || pr.aadharDoc || null, icon: '💳' },
  { label: 'PAN Card', url: u.panDoc || pr.pan || pr.panUrl || pr.panDoc || null, icon: '📋' },
  { label: 'Certificate / Degree', url: u.certificateDoc || pr.certificate || pr.certificateUrl || pr.certDoc || null, icon: '🎓' },
  { label: 'KYC Document', url: u.kycDocument || pr.kycDocument || pr.kyc || null, icon: '📜' },
  { label: 'Profile Photo', url: u.profilePhoto || null, icon: '🖼️' }
];

// Extra docs array
var extraDocs = u.documents || pr.documents || [];
extraDocs.forEach(function(doc, i) {
  var url = typeof doc === 'string' ? doc : (doc.url || doc.path || null);
  var label = typeof doc === 'object' ? (doc.name || doc.label || 'Document ' + (i+1)) : 'Document ' + (i+1);
  docs.push({ label: label, url: url, icon: '📎' });
});

// NEW KYC system — inject AFTER docs is declared
if (u.kyc && u.kyc.docBase64) {
  docs.unshift({
    label: (u.kyc.docType || 'KYC Document') + ' (Submitted)',
    url: u.kyc.docBase64,
    icon: '🛡️'
  });
}

      var realDocs = docs.filter(function(d) { return d.url; });
      var html = '';
      if (!realDocs.length) {
        html = '<div class="empty" style="padding:30px"><h3>No documents uploaded</h3><p style="font-size:13px;color:#606078;margin-top:4px">Expert has not uploaded any KYC documents yet</p></div>';
      } else {
        html = '<div style="margin-bottom:14px;font-size:12px;color:#606078">' + realDocs.length + ' document' + (realDocs.length>1?'s':'') + ' found</div>';
        realDocs.forEach(function(doc) {
          var isImg = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(doc.url);
          var isPdf = /\.pdf(\?|$)/i.test(doc.url);
          html += '<div class="kyc-doc">';
          html += '<div class="kyc-doc-icon">' + doc.icon + '</div>';
          html += '<div class="kyc-doc-info"><strong>' + esc(doc.label) + '</strong><small>' + esc(doc.url.substring(0, 60)) + (doc.url.length > 60 ? '...' : '') + '</small></div>';
          html += '<div class="kyc-doc-actions">';
          var isBase64Img = doc.url && doc.url.startsWith('data:image');
var isBase64Pdf = doc.url && doc.url.startsWith('data:application/pdf');
if (isImg || isBase64Img) html += '<button class="btn bgho kyc-view-btn">View</button>';
else if (isPdf || isBase64Pdf) html += '<button class="btn bgho kyc-view-btn">Open PDF</button>';
else html += '<a class="btn bgho" href="' + esc(doc.url) + '" target="_blank">Download</a>';
          html += '</div></div>';
          if (isImg) html += '<div id="kp-' + esc(doc.label.replace(/\s/g,'')) + '" style="display:none;margin-bottom:8px"><img src="' + esc(doc.url) + '" class="kyc-img-preview" onerror="this.style.display=\'none\'"></div>';
        });
      }
      // Basic info strip
      html += '<div style="margin-top:16px;padding:12px;background:#18181d;border-radius:8px;font-size:12px;color:#a0a0b8">';
      html += '<strong style="color:#f0f0f4">' + esc(u.name) + '</strong> &bull; ' + esc(u.email) + ' &bull; ' + (u.phone||'-');
      html += '<br>Status: ' + (u.isApproved ? '<span style="color:#22c55e">Approved</span>' : u.isBanned ? '<span style="color:#ef4444">Rejected</span>' : '<span style="color:#f59e0b">Pending</span>');
      html += '</div>';
            g('kycModalBody').innerHTML = html;
      // Wire up view buttons with stored URLs (avoids base64 in onclick attribute)
      var viewBtns = g('kycModalBody').querySelectorAll('.kyc-view-btn');
      viewBtns.forEach(function(btn, i) {
        btn.addEventListener('click', function() {
          showKycPreview(realDocs[i].url, realDocs[i].label);
        });
      });
      // Show/hide approve reject based on status
      g('kycApproveBtn').style.display = u.isApproved ? 'none' : 'inline-flex';
      g('kycRejectBtn').style.display = u.isBanned ? 'none' : 'inline-flex';
    }).catch(function() { g('kycModalBody').innerHTML = '<p style="color:#606078;padding:16px">Error loading</p>'; });
  }

    function showKycPreview(url, label) {
    var w = window.open('', '_blank');
    if (!w) { alert('Allow popups to view documents'); return; }
    w.document.write(
      '<html><head><title>' + label + '</title>' +
      '<style>body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh}' +
      'img{max-width:100%;max-height:100vh;object-fit:contain}</style></head>' +
      '<body><img src="' + url + '" onerror="document.body.innerHTML=\'<p style=color:red;padding:20px>Failed to load image</p>\'"></body></html>'
    );
    w.document.close();
  }

    function processKyc(action) {
  if (!_kycUid) return;
  if (action === 'reject') {
    var reason = prompt('Rejection reason:') || 'Document unclear or invalid';
    api('kyc/' + _kycUid + '/reject', 'POST', { reason: reason })
      .then(function(d) {
        if (d.success) { toast('KYC rejected'); closeModal('kycModal'); loadKycRequests(); loadRegistrations(); }
        else toast(d.message || 'Failed', 'e');
      }).catch(function() { toast('Error', 'e'); });
  } else {
    if (!confirm('Approve KYC?')) return;
    api('kyc/' + _kycUid + '/approve', 'POST', {})
      .then(function(d) {
        if (d.success) { toast('KYC approved ✅'); closeModal('kycModal'); loadKycRequests(); loadRegistrations(); }
        else toast(d.message || 'Failed', 'e');
      }).catch(function() { toast('Error', 'e'); });
  }
}
  /* ═══ KYC REQUESTS TAB ══════════════════════════════════════════════════ */
  function loadKycRequests() {
    setT('kycTbl', spin());
    var st = g('kycSt') ? g('kycSt').value : 'pending';

    // Fetch all experts and filter those with kyc.status matching
    api('users' + qs({ role: 'expert' })).then(function(d) {
      var users = d.users || [];
      var filtered = users.filter(function(u) {
        var kycStatus = (u.kyc && u.kyc.status) || 'not_submitted';
        return kycStatus === st;
      });

      // Update badge count for pending
      if (st === 'pending') {
        var badge = g('kycbadge');
        if (badge) {
          badge.textContent = filtered.length;
          badge.style.display = filtered.length > 0 ? 'inline-block' : 'none';
        }
      }

      if (!filtered.length) {
        setT('kycTbl', '<tr><td colspan="8" style="text-align:center;padding:30px;color:#606078">No ' + st + ' KYC requests</td></tr>');
        return;
      }

      pagSlice('kyc', filtered);
      renderKycPage(filtered);
    }).catch(function() { setT('kycTbl', ''); });
  }

  function renderKycPage(arr) {
    if (arr) pagSlice('kyc', arr);
    var page = pagSlice('kyc', _pageData['kyc'] || []);
    var existing = document.getElementById('pag-kyc');
    if (existing) existing.remove();
    setT('kycTbl', page.map(function(u) {
        var kyc = u.kyc || {};
        var regStatus = u.isApproved
          ? '<span class="badge bgr">Approved</span>'
          : u.isBanned
          ? '<span class="badge brd">Rejected</span>'
          : '<span class="badge byw">Pending</span>';

        var kycStatusMap = {
          pending:  '<span class="badge byw">⏳ Under Review</span>',
          approved: '<span class="badge bgr">✅ Verified</span>',
          rejected: '<span class="badge brd">❌ Rejected</span>',
          not_submitted: '<span class="badge bgy">Not Submitted</span>'
        };
        var kycBadge = kycStatusMap[kyc.status || 'not_submitted'];

        var actions = '';
        if (kyc.status === 'pending') {
          actions += '<button class="btn bgrn" onclick="processKycDirect(\'' + u._id + '\',\'approve\')">✅ Approve</button> ';
          actions += '<button class="btn brdn" onclick="processKycDirect(\'' + u._id + '\',\'reject\')">❌ Reject</button> ';
        }
        actions += '<button class="btn bgho" data-kyc-uid="' + u._id + '" data-kyc-name="' + esc(u.name) + '">View Doc</button>';

        return '<tr>' +
          '<td>' + uLnk(u._id, u.name) + '</td>' +
          '<td style="font-size:12px;color:#a0a0b8">' + esc(u.email) + '</td>' +
          '<td style="font-size:12px">' + (u.phone || '-') + '</td>' +
          '<td style="font-size:13px;font-weight:600;color:#f0f0f4">' + esc(kyc.docType || '—') + '</td>' +
          '<td style="font-size:12px;color:#a0a0b8">' + fmt(kyc.submittedAt) + '</td>' +
          '<td>' + kycBadge + '</td>' +
          '<td>' + regStatus + '</td>' +
          '<td><div style="display:flex;gap:4px;flex-wrap:wrap">' + actions + '</div></td>' +
          '</tr>';
      }).join(''));
    pagHTML('kyc', 'kycTbl');
  }

  function processKycDirect(uid, action) {
    var confirmMsg = action === 'approve'
      ? 'Approve KYC for this expert?'
      : 'Reject KYC? Enter rejection reason:';

    if (action === 'reject') {
      var reason = prompt(confirmMsg);
      if (reason === null) return; // cancelled
      api('kyc/' + uid + '/reject', 'POST', { reason: reason || 'Document unclear or invalid' })
        .then(function(d) {
          if (d.success) { toast('KYC rejected'); loadKycRequests(); }
          else toast(d.message || 'Failed', 'e');
        }).catch(function() { toast('Error', 'e'); });
    } else {
      if (!confirm('Approve KYC for this expert?')) return;
      api('kyc/' + uid + '/approve', 'POST', {})
        .then(function(d) {
          if (d.success) { toast('KYC approved! Expert is now verified ✅'); loadKycRequests(); }
          else toast(d.message || 'Failed', 'e');
        }).catch(function() { toast('Error', 'e'); });
    }
  }

  /* ═══ ANNOUNCEMENT ═══════════════════════════════════════════════════════ */
  function sendAnnouncement() {
    var target = g('annTarget').value;
    var title = g('annTitle').value.trim();
    var msg = g('annMsg').value.trim();
    if (!title || !msg) { toast('Title and message required', 'e'); return; }
    g('annStatus').textContent = 'Sending...';
    g('annStatus').style.color = '#a0a0b8';
    api('communications/announce', 'POST', { target: target, title: title, message: msg })
      .then(function(d) {
        if (d.success) {
          g('annStatus').textContent = 'Sent to ' + (d.recipientCount||'?') + ' users!';
          g('annStatus').style.color = '#22c55e';
          g('annTitle').value = ''; g('annMsg').value = '';
          loadCommHistory();
        } else {
          g('annStatus').textContent = 'Failed: ' + (d.message||'Unknown error');
          g('annStatus').style.color = '#ef4444';
        }
      }).catch(function() { g('annStatus').textContent = 'Connection error'; g('annStatus').style.color = '#ef4444'; });
  }


  /* ═══════════════════════════════════════════════════════════
     TICKET CREATE (admin creates on behalf of user)
  ═══════════════════════════════════════════════════════════ */
  var _tkCreateUid = null, _tkCreateRole = null, _tkSelectedIssue = null;

  var TICKET_CATEGORIES = [
    { group: '🧾 Account & Login Issues', items: [
      'Unable to login', 'Forgot password / OTP not received',
      'Account locked / suspended', 'Change phone/email',
      'Delete account request', 'Profile update issue'
    ]},
    { group: '📋 Request / Job Issues', items: [
      'Unable to post request', 'Edit request issue',
      'Request not visible to experts', 'Wrong category selected',
      'Duplicate request created', 'Want to cancel request',
      'Request marked completed incorrectly', 'Spam responses received'
    ]},
    { group: '💬 Expert Interaction Issues', items: [
      'Expert not responding', 'Received too many responses',
      'Harassment / inappropriate behavior 🚨', 'Expert asking payment outside platform',
      'Expert details incorrect', 'Fake expert suspected'
    ]},
    { group: '💰 Payment & Refund Issues', items: [
      'Payment failed but amount deducted', 'Refund not received',
      'Wrong charge applied', 'Payment confirmation not received',
      'Need invoice / receipt', 'Payment method issue'
    ]},
    { group: '⭐ Review & Rating Issues', items: [
      'Unable to submit review', 'Want to edit/remove review',
      'Fake review posted about me', 'Rating incorrect'
    ]},
    { group: '🛡️ Safety & Abuse', items: [
      'Report fraud/scam 🚨', 'Threatening behavior',
      'Privacy concern', 'Unauthorized use of my data'
    ]},
    { group: '⚙️ Technical Issues', items: [
      'App/website not working', 'Page loading error',
      'Feature not functioning', 'Bug report', 'Mobile app issue'
    ]},
    { group: '❓ General Support', items: [
      'Need help using platform', 'Feature request',
      'Feedback / suggestions', 'Other issue'
    ]}
  ];

  function openCreateTicketModal(uid, name, role) {
    _tkCreateUid = uid; _tkCreateRole = role; _tkSelectedIssue = null;
    g('tkCreateFor').innerHTML = 'Creating ticket for: <strong style="color:#FC8019">' + esc(name) + '</strong> <span class="badge bgy">' + esc(role||'user') + '</span>';
    var html = '';
    TICKET_CATEGORIES.forEach(function(cat) {
      html += '<div class="tk-cat-group">' + esc(cat.group) + '</div>';
      cat.items.forEach(function(item) {
        html += '<div class="tk-cat-item" data-issue="' + esc(item) + '">' + esc(item) + '</div>';
      });
    });
    g('tkCatList').innerHTML = html;
    g('tkStep1').style.display = 'block';
    g('tkStep2').style.display = 'none';
    g('tkCreateSubmit').style.display = 'none';
    g('tkCatList').onclick = function(ev) {
      var item = ev.target.closest('.tk-cat-item');
      if (!item) return;
      document.querySelectorAll('.tk-cat-item').forEach(function(el) { el.classList.remove('sel'); });
      item.classList.add('sel');
      _tkSelectedIssue = item.dataset.issue;
      g('tkSelectedCat').textContent = _tkSelectedIssue;
      g('tkDescription').placeholder = 'Describe the issue in detail for: ' + _tkSelectedIssue;
      g('tkStep1').style.display = 'none';
      g('tkStep2').style.display = 'block';
      g('tkCreateSubmit').style.display = 'inline-flex';
    };
    g('tkCreateSubmit').onclick = submitCreateTicket;
    openModal('tkCreateModal');
  }

  function tkGoBack() {
    g('tkStep1').style.display = 'block';
    g('tkStep2').style.display = 'none';
    g('tkCreateSubmit').style.display = 'none';
    _tkSelectedIssue = null;
    // Re-attach listener
    openCreateTicketModal(_tkCreateUid, g('tkCreateFor').querySelector('strong').textContent, _tkCreateRole);
    closeModal('tkCreateModal'); openModal('tkCreateModal');
  }

  function submitCreateTicket() {
    if (!_tkCreateUid || !_tkSelectedIssue) { toast('Select an issue first', 'e'); return; }
    var payload = {
      userId: _tkCreateUid,
      subject: _tkSelectedIssue,
      description: g('tkDescription').value || _tkSelectedIssue,
      priority: g('tkPriority').value,
      adminNote: g('tkAdminNote').value,
      createdByAdmin: true
    };
    var btn = g('tkCreateSubmit');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating...'; }
    api('tickets/create-for-user', 'POST', payload).then(function(d) {
      if (btn) { btn.disabled = false; btn.innerHTML = '🎫 Create Ticket'; }
      if (d.success) {
        var tid = (d.ticket && d.ticket._id) ? '#' + d.ticket._id.slice(-6).toUpperCase() : '';
        toast('Ticket ' + tid + ' created!');
        closeModal('tkCreateModal');
        goTo('tickets');   // ← navigate to Tickets main tab
      } else {
        toast(d.message || 'Failed to create ticket', 'e');
      }
    }).catch(function(err) {
      if (btn) { btn.disabled = false; btn.innerHTML = '🎫 Create Ticket'; }
      toast('Connection error — ticket not created', 'e');
    });
  }
/* ═══ CANNED RESPONSE ═══════════════════════════════════════════════════ */
  window.sendCannedResponse = function(tid, cannedType, btn) {
    var note = g('tkNote') ? g('tkNote').value : '';
    var labels = { refund_approved:'Approve refund?', not_eligible:'Mark as not eligible?', under_investigation:'Mark as under investigation?', resolved_no_action:'Mark as resolved?', contact_support:'Send contact support response?' };
    if (!confirm(labels[cannedType] || 'Send this canned response?')) return;
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    api('tickets/' + tid + '/canned', 'POST', { cannedType: cannedType, note: note })
      .then(function(d) {
        if (btn) { btn.disabled = false; }
        if (d.success) {
          toast('Canned response sent!');
          closeModal('ticketModal');
          loadTickets();
        } else toast(d.message || 'Failed', 'e');
      }).catch(function() {
        if (btn) { btn.disabled = false; }
        toast('Error', 'e');
      });
  };

  /* ═══ CLIENT ACTIVITY ════════════════════════════════════════════════════ */
  window.loadClientActivity = function(uid, name) {
    if (!uid) { toast('No user ID', 'e'); return; }
    g('ov1').classList.add('on'); g('dr1').classList.add('on');
    g('drT').textContent = '📋 Activity — ' + name;
    g('drTabs').innerHTML = '';
    g('drB').innerHTML = '<div style="text-align:center;padding:40px"><div class="spin"></div></div>';

    // Fetch both: logs where user is actor AND logs where user is target
    Promise.all([
      api('audit/user/' + uid),
      api('audit/target/' + uid)
    ]).then(function(results) {
      var actorLogs  = (results[0].logs || []).map(function(l) { return Object.assign({}, l, { _side: 'actor' }); });
      var targetLogs = (results[1].logs || []).map(function(l) { return Object.assign({}, l, { _side: 'target' }); });

      // Merge + deduplicate by _id + sort by date desc
      var seen = {};
      var all = actorLogs.concat(targetLogs).filter(function(l) {
        if (seen[l._id]) return false;
        seen[l._id] = true;
        return true;
      }).sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

      if (!all.length) {
        g('drB').innerHTML = '<div class="empty"><h3>No activity found</h3><p style="font-size:13px;color:#606078">No audit events recorded for this user yet</p></div>';
        return;
      }

      var actionColors = {
  login: '#22c55e', signup: '#10b981', request_created: '#3b82f6',
  approach_submitted: '#FC8019', approach_accepted: '#22c55e',
  approach_rejected: '#ef4444', service_completed: '#a855f7',
  ticket_followup: '#f59e0b', ticket_canned_response: '#06b6d4',
  expert_profile_viewed: '#3b82f6', service_received: '#22c55e',
  client_hired_expert: '#f59e0b', expert_accepted_hire: '#22c55e',
  profile_updated: '#a0a0b8' ,admin_credit_adjusted: '#f59e0b',
admin_password_reset:  '#a0a0b8',
admin_user_action:     '#ef4444',
admin_post_edited:     '#3b82f6',
admin_post_deleted:    '#ef4444',
admin_review_deleted:  '#ef4444',
admin_approach_deleted:'#ef4444'
};
       
      // Labels to show when the user is the TARGET (someone else did this TO them)
      var targetLabels = {
        expert_profile_viewed: '👁 Profile viewed by client',
        approach_accepted:     '✅ Approach accepted by client',
        approach_rejected:     '❌ Approach rejected by client',
        client_hired_expert:   '🎯 Hired by client',
        service_received:      '✔ Service marked received by client'
      };

      var html = '<div style="font-size:12px;color:#606078;margin-bottom:14px">' + all.length + ' events recorded</div>';
      html += all.map(function(l) {
        var color = actionColors[l.action] || '#a0a0b8';
        var isTarget = l._side === 'target';

        // Label: use target-specific label if this user was the target, else normal action name
        var label = isTarget && targetLabels[l.action]
          ? targetLabels[l.action]
          : l.action.replace(/_/g, ' ');

        // Meta line: show who did the action if user is the target
        var meta = '';
        if (isTarget) {
          meta = 'by ' + esc(l.actorName || 'Unknown');
          if (l.metadata && l.metadata.requestTitle) meta += ' · ' + esc(l.metadata.requestTitle);
        } else {
          if (l.targetName) meta = esc(l.targetName);
          if (l.metadata && l.metadata.ip) meta += (meta ? ' · ' : '') + 'IP: ' + l.metadata.ip;
          if (l.metadata && l.metadata.requestTitle) meta += (meta ? ' · ' : '') + esc(l.metadata.requestTitle);
        }

        // Dim border for target events so they're visually distinct
        var borderStyle = isTarget ? 'border-bottom:1px solid #18181d;opacity:0.85' : 'border-bottom:1px solid #18181d';

        return '<div style="display:flex;gap:10px;padding:10px 0;' + borderStyle + ';align-items:flex-start">' +
          '<div style="width:8px;height:8px;border-radius:50%;background:' + color + ';margin-top:5px;flex-shrink:0' + (isTarget ? ';outline:2px solid rgba(255,255,255,.15);outline-offset:1px' : '') + '"></div>' +
          '<div style="flex:1">' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<span style="font-size:13px;font-weight:600;color:#f0f0f4">' + esc(label) + '</span>' +
              (isTarget ? '<span style="font-size:10px;background:rgba(255,255,255,.08);color:#a0a0b8;padding:2px 6px;border-radius:4px">incoming</span>' : '') +
            '</div>' +
            (meta ? '<div style="font-size:11px;color:#606078;margin-top:2px">' + meta + '</div>' : '') +
            '<div style="font-size:11px;color:#606078;margin-top:2px">' + fmtT(l.createdAt) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      g('drB').innerHTML = html;
    }).catch(function() {
      g('drB').innerHTML = '<div class="empty"><h3>Error loading activity</h3></div>';
    });
  };

  /* ═══ AUDIT LOG TAB ══════════════════════════════════════════════════════ */
