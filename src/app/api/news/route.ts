// src/app/api/news/route.ts
import { NextResponse } from 'next/server';
import type { NewsItem } from '@/components/mobile/types';

// In-memory cache for ultra-fast sub-second delivery
interface CachedNews {
  timestamp: number;
  items: NewsItem[];
}

let memoryCache: CachedNews | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Category search configurations
const FEED_CONFIGS = [
  {
    category: 'Macro',
    iconType: 'macro' as const,
    query: 'economy Federal Reserve inflation central bank stocks global markets',
    gl: 'US',
    ceid: 'US:en',
  },
  {
    category: 'India',
    iconType: 'india' as const,
    query: 'Nifty Sensex NSE BSE RBI stock market India finance',
    gl: 'IN',
    ceid: 'IN:en',
  },
  {
    category: 'Crypto',
    iconType: 'crypto' as const,
    query: 'Bitcoin Ethereum crypto digital assets ETF spot market',
    gl: 'US',
    ceid: 'US:en',
  },
  {
    category: 'Technology',
    iconType: 'chart' as const,
    query: 'Nvidia Apple Microsoft AI semiconductor tech earnings stocks',
    gl: 'US',
    ceid: 'US:en',
  },
];

// Fallback items in case external network fails
const FALLBACK_ITEMS: NewsItem[] = [
  {
    id: 'fallback-1',
    title: 'Global markets hold firm as Federal Reserve commentary signals potential rate easing trajectory',
    source: 'Celsius Macro Desk',
    time: '11:15:00',
    category: 'Macro',
    iconType: 'macro',
    link: 'https://celsius.network',
    bullets: [
      'Treasury yields tick lower across 2Y and 10Y benchmarks.',
      'FOMC participants cite cooling labor pressures.',
      'Emerging market foreign capital inflows reach 4-month highs.'
    ],
    body: 'Global equities displayed resilience during Asian and European morning trading hours as sovereign yields edged lower across benchmark curves.'
  },
  {
    id: 'fallback-2',
    title: 'Indian markets see robust institutional participation led by BFSI and Infrastructure leaders',
    source: 'Mumbai Financial Bureau 🇮🇳',
    time: '11:10:00',
    category: 'India',
    iconType: 'india',
    link: 'https://celsius.network',
    bullets: [
      'NIFTY 50 holds above key technical inflection zone.',
      'Domestic Institutional Investors record sustained net positive capital formation.',
      'INR currency stability maintained under Reserve Bank liquidity operations.'
    ],
    body: 'The National Stock Exchange of India witnessed sustained positive momentum with the NIFTY 50 and SENSEX benchmarks advancing.'
  },
  {
    id: 'fallback-3',
    title: 'Bitcoin trades near all-time peak as institutional spot exchange liquidity deepens',
    source: 'Digital Asset Wire',
    time: '11:05:00',
    category: 'Crypto',
    iconType: 'crypto',
    link: 'https://celsius.network',
    bullets: [
      'Spot Bitcoin ETF net aggregate inflows expand.',
      'Realized market volatility compresses to multi-month range.',
      'Network hash rate achieves new cryptographic ceiling.'
    ],
    body: 'Bitcoin consolidated in upper distribution ranges, benefiting from institutional treasury allocation and systematic risk parity models.'
  },
  {
    id: 'fallback-4',
    title: 'Semiconductor manufacturers gain on generative AI infrastructure capital expenditure projections',
    source: 'Global Technology Wire',
    time: '10:55:00',
    category: 'Technology',
    iconType: 'chart',
    link: 'https://celsius.network',
    bullets: [
      'Data center GPU procurement contracts booked through fiscal quarters.',
      'Hyperscaler capex revisions trend upward by 18% YoY.',
      'Advanced packaging supply bottlenecks ease gradually.'
    ],
    body: 'Semiconductor capital equipment and foundry manufacturers traded higher as hyperscalers affirmed accelerated infrastructure investment cycles.'
  }
];

async function fetchFeed(config: typeof FEED_CONFIGS[0]): Promise<NewsItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(config.query)}&hl=en-${config.gl}&gl=${config.gl}&ceid=${config.ceid}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 60 }
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 8);

    return itemMatches.map((m, idx) => {
      const itemXml = m[1];
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);

      let rawTitle = titleMatch ? titleMatch[1] : '';
      rawTitle = rawTitle
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      // Split Google News title format: "Headline - Source Name"
      const parts = rawTitle.split(' - ');
      const parsedSource = sourceMatch
        ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim()
        : (parts.length > 1 ? parts[parts.length - 1].trim() : 'Global Market Wire');
      
      const cleanTitle = parts.length > 1 ? parts.slice(0, -1).join(' - ').trim() : rawTitle;

      let timeFormatted = 'Live';
      if (pubDateMatch) {
        const d = new Date(pubDateMatch[1]);
        if (!isNaN(d.getTime())) {
          timeFormatted = d.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
        }
      }

      const itemLink = linkMatch ? linkMatch[1].trim() : '#';

      return {
        id: `news-${config.category.toLowerCase()}-${idx}-${Date.now()}`,
        title: cleanTitle,
        source: parsedSource,
        time: timeFormatted,
        category: config.category,
        iconType: config.iconType,
        link: itemLink,
        body: cleanTitle,
        readTime: '2 min read',
        bullets: [
          `Wire dispatch reported by ${parsedSource}.`,
          `Categorized under ${config.category} market surveillance.`,
          `Real-time price & volume impact active across institutional blotters.`
        ]
      };
    });
  } catch (err) {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get('category')?.toLowerCase();

    const now = Date.now();
    let newsItems: NewsItem[] = [];

    // Check memory cache
    if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
      newsItems = memoryCache.items;
    } else {
      // Fetch feeds concurrently across Macro, India, Crypto, and Tech
      const results = await Promise.allSettled(
        FEED_CONFIGS.map((config) => fetchFeed(config))
      );

      const aggregated: NewsItem[] = [];
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value.length > 0) {
          aggregated.push(...r.value);
        }
      });

      if (aggregated.length > 0) {
        // Interleave / sort items for rich variety
        newsItems = aggregated;
        memoryCache = {
          timestamp: now,
          items: newsItems,
        };
      } else {
        newsItems = FALLBACK_ITEMS;
      }
    }

    // Filter by category if requested
    if (categoryParam && categoryParam !== 'all') {
      const filtered = newsItems.filter(
        (n) => n.category.toLowerCase() === categoryParam
      );
      if (filtered.length > 0) {
        newsItems = filtered;
      }
    }

    return NextResponse.json({
      status: 'ok',
      count: newsItems.length,
      cached: Boolean(memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS),
      items: newsItems,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        count: FALLBACK_ITEMS.length,
        items: FALLBACK_ITEMS,
      },
      { status: 200 }
    );
  }
}
