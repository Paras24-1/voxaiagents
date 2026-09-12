const waba_id = '1802103960924146';
const token = 'EAAOK0jKSPSMBSWwtGsWKdveSfqLTE0T4h4lxJRK16lM90VHYftxBBtHwndOJ9rQGJLFEPGf3jTcu5BzBoymZB3HtbVCRtsHtFXHRv8oBg80NKgGgJkhAYQYQR55VmiexKfge9faCSviHAOUtnZAmrNP1tlV7Gx5yxZAnweKl73mO43XpaeQ6ZADbF4uiuXcIUAZDZD';

async function check() {
  const res = await fetch(`https://graph.facebook.com/v20.0/${waba_id}/subscribed_apps`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!res.ok) {
    console.error('Error:', await res.text());
    return;
  }
  
  const data = await res.json();
  console.log('Subscribed Apps:', JSON.stringify(data, null, 2));
  
  if (data.data && data.data.length > 1) {
    console.log('\n⚠️ WARNING: Multiple apps are subscribed to this WABA. This will cause duplicate webhooks!');
  } else {
    console.log('\n✅ Only one app is subscribed to this WABA.');
  }
}

check();
