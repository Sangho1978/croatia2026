/* MIX26 · Firebase scheduled cleanup: keep location data for at most ~24h + schedule interval. */
const {onSchedule}=require('firebase-functions/v2/scheduler');
const {initializeApp}=require('firebase-admin/app');
const {getDatabase}=require('firebase-admin/database');
initializeApp();

const TRIP_CODE='SNU17-CRO-2026-A7K9P4';
const RETENTION_MS=24*60*60*1000;

exports.cleanupCroatiaLocations=onSchedule({
  schedule:'every 60 minutes',
  timeZone:'Asia/Seoul',
  region:'asia-southeast1',
  timeoutSeconds:300,
  memory:'256MiB'
},async()=>{
  const db=getDatabase();
  const cutoff=Date.now()-RETENTION_MS;
  const updates={};

  const currentSnap=await db.ref(`locations/${TRIP_CODE}`).get();
  currentSnap.forEach(child=>{
    const v=child.val()||{};
    if(Number(v.ts||0)>0&&Number(v.ts)<cutoff)updates[`locations/${TRIP_CODE}/${child.key}`]=null;
  });

  const ownersSnap=await db.ref(`locationHistory/${TRIP_CODE}`).get();
  const slots=[];ownersSnap.forEach(child=>slots.push(child.key));
  await Promise.all(slots.map(async slot=>{
    const snap=await db.ref(`locationHistory/${TRIP_CODE}/${slot}`).orderByKey().endAt(String(cutoff)).get();
    snap.forEach(point=>{
      const v=point.val()||{};
      if(/^\d{13}$/.test(point.key)&&Number(v.ts||point.key)<cutoff)updates[`locationHistory/${TRIP_CODE}/${slot}/${point.key}`]=null;
    });
  }));

  if(Object.keys(updates).length)await db.ref().update(updates);
  console.log(JSON.stringify({trip:TRIP_CODE,cutoff,removed:Object.keys(updates).length}));
});
