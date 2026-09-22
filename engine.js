/* MeetFair engine - pure functions for fair cross-timezone meeting slots. */
(function (root) {
  'use strict';

  function localHour(utcHour, offset) {
    var h = (utcHour + offset) % 24;
    return h < 0 ? h + 24 : h;
  }

  // participant: {name, offset (hours from UTC, may be fractional), earliest, latest}
  // acceptable local window [earliest, latest), no wrapping
  function makeParticipant(name, offset, earliest, latest) {
    name = (name || '').trim();
    if (!name) throw new Error('participant needs a name');
    offset = Number(offset);
    earliest = earliest === undefined ? 8 : Number(earliest);
    latest = latest === undefined ? 22 : Number(latest);
    if (!isFinite(offset) || offset < -12 || offset > 14) throw new Error('offset must be -12..14');
    if (!isFinite(earliest) || !isFinite(latest) || earliest < 0 || latest > 24 || earliest >= latest) {
      throw new Error('window must be 0 <= earliest < latest <= 24');
    }
    return { name: name, offset: offset, earliest: earliest, latest: latest };
  }

  function fits(p, utcHour) {
    var l = localHour(utcHour, p.offset);
    return l >= p.earliest && l < p.latest;
  }

  // pain: 0 inside core 9..18, otherwise hours outside the nearest edge
  function pain(local) {
    if (local >= 9 && local < 18) return 0;
    if (local < 9) return 9 - local;
    return local - 17;
  }

  // score one UTC hour for a group; null when anyone falls outside their window
  function scoreSlot(participants, utcHour) {
    var locals = [], totalPain = 0, worstPain = 0;
    for (var i = 0; i < participants.length; i++) {
      var p = participants[i];
      if (!fits(p, utcHour)) return null;
      var l = localHour(utcHour, p.offset);
      var pn = pain(l);
      locals.push(l);
      totalPain += pn;
      if (pn > worstPain) worstPain = pn;
    }
    return { utc: utcHour, locals: locals, pain: totalPain, worst: worstPain };
  }

  // all workable slots, fairest first (total pain, then worst pain, then hour)
  function bestSlots(participants) {
    if (!participants.length) throw new Error('need at least one participant');
    var out = [];
    for (var h = 0; h < 24; h++) {
      var s = scoreSlot(participants, h);
      if (s) out.push(s);
    }
    out.sort(function (a, b) {
      if (a.pain !== b.pain) return a.pain - b.pain;
      if (a.worst !== b.worst) return a.worst - b.worst;
      return a.utc - b.utc;
    });
    return out;
  }

  // fairness check for a recurring meeting already scheduled: pain per participant
  function fairness(participants, utcHour) {
    return participants.map(function (p) {
      var l = localHour(utcHour, p.offset);
      return { name: p.name, local: l, pain: pain(l), fits: fits(p, utcHour) };
    });
  }

  var api = { localHour: localHour, makeParticipant: makeParticipant, fits: fits, pain: pain, scoreSlot: scoreSlot, bestSlots: bestSlots, fairness: fairness };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MeetFair = api;
})(typeof window !== 'undefined' ? window : this);
