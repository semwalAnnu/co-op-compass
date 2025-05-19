import { NextRequest, NextResponse } from 'next/server';
// import { JobData } from '@/types/User'; // Commented out as unused

interface RequestBody {
  url: string;
}

/*
interface JobData { // Commenting out local JobData as it's unused and causing build errors
  jobTitle: string;
  company: string;
}
*/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RequestBody;
    
    if (!body.url || !isValidUrl(body.url)) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    const microlinkResponse = await fetch(`https://api.microlink.io?url=${encodeURIComponent(body.url)}`);
    
    if (!microlinkResponse.ok) {
      throw new Error('Failed to fetch URL data');
    }

    const { data } = await microlinkResponse.json();
    
    // Try to extract from JSON-LD first
    const jsonLd = data.jsonld?.[0];
    if (jsonLd && jsonLd['@type'] === 'JobPosting') {
      return NextResponse.json({
        jobTitle: jsonLd.title,
        company: jsonLd.hiringOrganization?.name,
      });
    }

    // Fallback to DOM scraping
    return NextResponse.json({
      jobTitle: data.title || data.og?.title || 'Unknown Position',
      company: data.author || data.publisher || extractCompanyFromUrl(body.url),
    });

  } catch (error) {
    console.error('Error processing URL:', error);
    return NextResponse.json(
      { error: 'Failed to process URL' },
      { status: 500 }
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function extractCompanyFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split('.')[0];
  } catch {
    return 'Unknown Company';
  }
}