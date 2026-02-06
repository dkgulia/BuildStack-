import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import OpenAI from 'openai';

interface BuildPart {
  id: string;
  name: string;
  brand: string;
  specs: Record<string, unknown>;
}

interface SuggestRequest {
  build: Record<string, BuildPart | null>;
  target_category: string;
}

interface Suggestion {
  id: string;
  name: string;
  brand: string;
  specs: Record<string, unknown>;
  reason: string;
}

async function getCandidates(
  build: Record<string, BuildPart | null>,
  targetCategory: string
) {
  let query = supabase
    .from('components')
    .select('id, name, brand, specs, image_url, price, type, model, created_at')
    .eq('type', targetCategory)
    .limit(50);

  // Apply compatibility filters based on existing build
  const cpu = build.cpu;
  const motherboard = build.motherboard;

  if (targetCategory === 'motherboard' && cpu?.specs?.socket) {
    query = query.eq('specs->>socket', cpu.specs.socket as string);
  }
  if (targetCategory === 'cpu' && motherboard?.specs?.socket) {
    query = query.eq('specs->>socket', motherboard.specs.socket as string);
  }
  if (targetCategory === 'ram' && motherboard?.specs?.ram_type) {
    query = query.eq('specs->>type', motherboard.specs.ram_type as string);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

function heuristicRank(
  candidates: Array<Record<string, unknown>>,
  targetCategory: string
): Suggestion[] {
  const scored = candidates.map((c) => {
    let score = 0;
    const specs = c.specs as Record<string, unknown>;

    switch (targetCategory) {
      case 'cpu':
        score += ((specs.cores as number) || 0) * 10;
        score += ((specs.boost_clock as number) || 0) * 5;
        break;
      case 'gpu':
        score += ((specs.vram as number) || 0) * 15;
        score += ((specs.tdp as number) || 0) * 2;
        break;
      case 'motherboard':
        score += ((specs.m2_slots as number) || 0) * 10;
        score += ((specs.ram_slots as number) || 0) * 5;
        break;
      case 'ram':
        score += ((specs.capacity_gb as number) || 0) * 5;
        score += ((specs.speed_mhz as number) || 0) / 100;
        break;
      case 'storage':
        score += ((specs.capacity_gb as number) || 0) / 10;
        score += ((specs.read_speed as number) || 0) / 100;
        break;
      case 'psu':
        score += ((specs.wattage as number) || 0) / 10;
        break;
      case 'cooling':
        score += ((specs.tdp_rating as number) || 0) / 5;
        break;
      default:
        break;
    }

    return { candidate: c, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map(({ candidate }) => ({
    id: candidate.id as string,
    name: candidate.name as string,
    brand: candidate.brand as string,
    specs: candidate.specs as Record<string, unknown>,
    reason: 'Highest specs in this category among compatible options.',
  }));
}

async function aiRank(
  build: Record<string, BuildPart | null>,
  candidates: Array<Record<string, unknown>>,
  targetCategory: string
): Promise<Suggestion[] | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey === 'your-deepseek-api-key-here') return null;

  const openai = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  // Summarize build context
  const buildSummary = Object.entries(build)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v!.brand} ${v!.name}`)
    .join('\n');

  // Summarize candidates (top 10 by heuristic to keep token count low)
  const top10 = candidates.slice(0, 10);
  const candidateSummary = top10
    .map((c, i) => `${i + 1}. ${c.brand} ${c.name} | specs: ${JSON.stringify(c.specs)}`)
    .join('\n');

  const systemPrompt = `You are a PC building expert. Given a partial build and candidate parts, pick the top 3 best ${targetCategory} options and explain why in 1 sentence each.
Respond with ONLY valid JSON:
{ "picks": [ { "index": 1, "reason": "..." }, { "index": 2, "reason": "..." }, { "index": 3, "reason": "..." } ] }
index is the 1-based position from the candidates list.`;

  const userPrompt = `Current build:\n${buildSummary || '(empty)'}\n\nCandidate ${targetCategory} parts:\n${candidateSummary}\n\nPick the best 3.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) return null;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      picks: { index: number; reason: string }[];
    };

    if (!parsed.picks?.length) return null;

    return parsed.picks
      .filter((p) => p.index >= 1 && p.index <= top10.length)
      .slice(0, 3)
      .map((pick) => {
        const c = top10[pick.index - 1];
        return {
          id: c.id as string,
          name: c.name as string,
          brand: c.brand as string,
          specs: c.specs as Record<string, unknown>,
          reason: pick.reason,
        };
      });
  } catch (err) {
    console.error('DeepSeek suggest call failed:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SuggestRequest;
    const { build, target_category } = body;

    if (!target_category) {
      return NextResponse.json(
        { error: 'target_category is required' },
        { status: 400 }
      );
    }

    const candidates = await getCandidates(build || {}, target_category);

    if (candidates.length === 0) {
      return NextResponse.json({
        success: true,
        source: 'none',
        suggestions: [],
      });
    }

    // Try AI ranking first, fall back to heuristic
    let suggestions = await aiRank(build || {}, candidates, target_category);
    const source = suggestions ? 'deepseek' : 'heuristic';

    if (!suggestions) {
      suggestions = heuristicRank(candidates, target_category);
    }

    // Enrich suggestions with full component data for the frontend
    const enriched = await Promise.all(
      suggestions.map(async (s) => {
        const { data } = await supabase
          .from('components')
          .select('*')
          .eq('id', s.id)
          .maybeSingle();
        return {
          ...s,
          part: data,
        };
      })
    );

    return NextResponse.json({
      success: true,
      source,
      suggestions: enriched,
    });
  } catch (error) {
    console.error('Error in AI suggest:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
