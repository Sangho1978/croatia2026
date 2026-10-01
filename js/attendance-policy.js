/* MIX53 shared attendance policy: one behavior across trips, trip-specific admins only. */
(function(){
  'use strict';
  const tripId=window.GSPA_TRIP_ID||window.GSPA_TRIP?.id||'croatia';
  const fallback={croatia:['한상호'],turkiye1:['남상모','김수정','김수연']};
  const configured=Array.isArray(window.GSPA_TRIP?.attendanceAdmins)?window.GSPA_TRIP.attendanceAdmins:[];
  const base=configured.length?configured:(fallback[tripId]||[window.GSPA_TRIP?.attendanceOperator||'한상호']);
  const admins=[...new Set(base.map(x=>String(x||'').trim()).filter(Boolean))];
  window.GSPA_AttendancePolicy={
    tripId,
    admins,
    label:admins.join(' · '),
    isAdmin(user){return !!user&&admins.includes(String(user.name||'').trim())}
  };
})();
