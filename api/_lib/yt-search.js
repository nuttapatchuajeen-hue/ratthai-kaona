const https = require('https');

const cache = new Map();

function fetchHttps(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      ...options,
      timeout: options.timeout || 8000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHttps(res.headers.location, options).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function searchInnertube(query) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      context: {
        client: {
          hl: 'th',
          gl: 'TH',
          clientName: 'WEB',
          clientVersion: '2.20240101.00.00'
        }
      },
      query: query
    });

    const req = https.request('https://www.youtube.com/youtubei/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      },
      timeout: 7000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const sections = json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
          const results = [];
          for (const sec of sections) {
            const items = sec?.itemSectionRenderer?.contents || [];
            for (const item of items) {
              const vr = item.videoRenderer;
              if (vr && vr.videoId) {
                const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText || '';
                const channel = vr.ownerText?.runs?.[0]?.text || vr.shortBylineText?.runs?.[0]?.text || 'YouTube';
                const thumb = vr.thumbnail?.thumbnails?.[0]?.url || ('https://i.ytimg.com/vi/' + vr.videoId + '/hqdefault.jpg');
                results.push({
                  id: vr.videoId,
                  title,
                  channel,
                  category: 'search',
                  categoryLabel: 'YouTube',
                  thumb
                });
              }
            }
          }
          resolve(results);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(postData);
    req.end();
  });
}

async function searchYouTube(query) {
  const cached = cache.get(query);
  if (cached && Date.now() - cached.time < 3600000) {
    return cached.results;
  }

  let results = [];

  // 1. YouTube Innertube API (Primary - high reliability on serverless)
  try {
    results = await searchInnertube(query);
  } catch (e) {
    results = [];
  }

  // 2. Direct YouTube search scrape (Secondary fallback)
  if (results.length === 0) {
    const q = encodeURIComponent(query);
    try {
    const ytRes = await fetchHttps('https://www.youtube.com/results?search_query=' + q, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8'
      }
    });

    const data = ytRes.body;
    const jsonMatch = data.match(/var ytInitialData = ({.*?});<\/script>/s) ||
                      data.match(/ytInitialData\s*=\s*({.+?});/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        const contents = parsed?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
        if (contents && Array.isArray(contents)) {
          for (const sec of contents) {
            const itemSection = sec?.itemSectionRenderer?.contents;
            if (itemSection && Array.isArray(itemSection)) {
              for (const item of itemSection) {
                const vr = item.videoRenderer;
                if (vr && vr.videoId) {
                  const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText || '';
                  const channel = vr.ownerText?.runs?.[0]?.text || '';
                  const thumb = vr.thumbnail?.thumbnails?.[0]?.url || ('https://i.ytimg.com/vi/' + vr.videoId + '/hqdefault.jpg');
                  results.push({
                    id: vr.videoId,
                    title,
                    channel,
                    category: 'search',
                    categoryLabel: 'YouTube',
                    thumb
                  });
                }
              }
            }
          }
        }
      } catch (e) {}
    }

    if (results.length === 0) {
      const regex = /"videoId":"([a-zA-Z0-9_-]{11})".+?"title":\{"runs":\[\{"text":"([^"]+)"\}\].+?"ownerText":\{"runs":\[\{"text":"([^"]+)"/g;
      let m;
      const seen = new Set();
      while ((m = regex.exec(data)) !== null && results.length < 15) {
        if (!seen.has(m[1])) {
          seen.add(m[1]);
          results.push({
            id: m[1],
            title: m[2],
            channel: m[3],
            category: 'search',
            categoryLabel: 'YouTube',
            thumb: 'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg'
          });
        }
      }
    }
  } catch (err) {
    // Primary search failed, proceed to fallback
  }
}

  // 3. Fallback to public Invidious instances if direct scrape returned empty
  if (results.length === 0) {
    const invidiousInstances = [
      'https://inv.tux.pizza',
      'https://vid.puffyan.us',
      'https://invidious.nerdvpn.de',
      'https://yt.artemislena.eu'
    ];
    for (const inst of invidiousInstances) {
      try {
        const invRes = await fetchHttps(inst + '/api/v1/search?q=' + q + '&type=video', { timeout: 4000 });
        if (invRes.statusCode === 200) {
          const invList = JSON.parse(invRes.body);
          if (Array.isArray(invList) && invList.length > 0) {
            for (const item of invList.slice(0, 15)) {
              if (item.videoId) {
                results.push({
                  id: item.videoId,
                  title: item.title || '',
                  channel: item.author || '',
                  category: 'search',
                  categoryLabel: 'YouTube',
                  thumb: item.videoThumbnails?.[0]?.url || ('https://i.ytimg.com/vi/' + item.videoId + '/hqdefault.jpg')
                });
              }
            }
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
  }

  const finalResults = results.slice(0, 15);
  if (finalResults.length > 0) {
    cache.set(query, { time: Date.now(), results: finalResults });
  }
  return finalResults;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  let query = '';
  if (req.query && req.query.q) {
    query = req.query.q;
  } else if (req.url) {
    try {
      const u = new URL(req.url, 'http://localhost');
      query = u.searchParams.get('q') || '';
    } catch (e) {}
  }

  query = (query || '').trim();
  if (!query) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    res.end(JSON.stringify([]));
    return;
  }

  try {
    const results = await searchYouTube(query);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
    res.statusCode = 200;
    res.end(JSON.stringify(results));
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    res.end(JSON.stringify([]));
  }
};
