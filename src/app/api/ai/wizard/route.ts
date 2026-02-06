import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import OpenAI from 'openai';

interface WizardRequest {
  use_case: string;
  platform: string;
  budget?: number | null;
}

const CATEGORIES = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling'] as const;

// Budget allocation percentages per use case
const BUDGET_ALLOCATION: Record<string, Record<string, number>> = {
  gaming: { cpu: 0.18, gpu: 0.35, motherboard: 0.12, ram: 0.08, storage: 0.10, psu: 0.07, case: 0.06, cooling: 0.04 },
  editing: { cpu: 0.25, gpu: 0.25, motherboard: 0.12, ram: 0.12, storage: 0.10, psu: 0.07, case: 0.05, cooling: 0.04 },
  coding: { cpu: 0.25, gpu: 0.15, motherboard: 0.12, ram: 0.15, storage: 0.12, psu: 0.07, case: 0.08, cooling: 0.06 },
  office: { cpu: 0.22, gpu: 0.15, motherboard: 0.15, ram: 0.12, storage: 0.12, psu: 0.08, case: 0.10, cooling: 0.06 },
};

// AMD and Intel socket patterns
const AMD_SOCKETS = ['AM5', 'AM4'];
const INTEL_SOCKETS = ['LGA1700', 'LGA1200', 'LGA1151'];

async function fetchCandidates(
  category: string,
  platform: string,
  maxPrice?: number
) {
  let query = supabase
    .from('components')
    .select('id, name, brand, specs, type, model, image_url, price, created_at')
    .eq('type', category)
    .limit(30);

  // Platform-specific socket filter for CPU and motherboard
  if (platform !== 'any') {
    const sockets = platform === 'amd' ? AMD_SOCKETS : INTEL_SOCKETS;
    if (category === 'cpu' || category === 'motherboard') {
      query = query.in('specs->>socket', sockets);
    }
  }

  // Budget ceiling per category
  if (maxPrice) {
    query = query.lte('price', maxPrice);
  }

  // Sort by performance-relevant spec
  switch (category) {
    case 'cpu':
      query = query.order('specs->>cores', { ascending: false });
      break;
    case 'gpu':
      query = query.order('specs->>vram', { ascending: false });
      break;
    case 'ram':
      query = query.order('specs->>capacity_gb', { ascending: false });
      break;
    case 'storage':
      query = query.order('specs->>capacity_gb', { ascending: false });
      break;
    case 'psu':
      query = query.order('specs->>wattage', { ascending: false });
      break;
    default:
      query = query.order('price', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

function heuristicScore(
  candidate: Record<string, unknown>,
  category: string,
  useCase: string
): number {
  const specs = candidate.specs as Record<string, unknown>;
  let score = 0;

  switch (category) {
    case 'cpu':
      score += ((specs.cores as number) || 0) * 10;
      score += ((specs.boost_clock as number) || 0) * 5;
      score += ((specs.threads as number) || 0) * 3;
      if (useCase === 'gaming') score += ((specs.boost_clock as number) || 0) * 10;
      if (useCase === 'editing' || useCase === 'coding') score += ((specs.cores as number) || 0) * 5;
      break;
    case 'gpu':
      score += ((specs.vram as number) || 0) * 15;
      score += ((specs.tdp as number) || 0) * 2;
      if (useCase === 'gaming') score *= 1.5;
      break;
    case 'motherboard':
      score += ((specs.m2_slots as number) || 0) * 10;
      score += ((specs.ram_slots as number) || 0) * 5;
      break;
    case 'ram':
      score += ((specs.capacity_gb as number) || 0) * 5;
      score += ((specs.speed_mhz as number) || 0) / 100;
      if (useCase === 'editing') score += ((specs.capacity_gb as number) || 0) * 3;
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
  }

  return score;
}

function heuristicBuild(
  candidatesMap: Record<string, Array<Record<string, unknown>>>,
  useCase: string
): Record<string, { part: Record<string, unknown>; reason: string }> {
  const build: Record<string, { part: Record<string, unknown>; reason: string }> = {};

  // Pick CPU first for socket compatibility
  const cpuCandidates = candidatesMap.cpu || [];
  const cpuScored = cpuCandidates
    .map((c) => ({ candidate: c, score: heuristicScore(c, 'cpu', useCase) }))
    .sort((a, b) => b.score - a.score);

  if (cpuScored.length > 0) {
    const cpu = cpuScored[0].candidate;
    build.cpu = { part: cpu, reason: 'Best performance in this category.' };

    // Filter motherboard by matching socket
    const cpuSocket = (cpu.specs as Record<string, unknown>).socket as string;
    if (cpuSocket && candidatesMap.motherboard) {
      candidatesMap.motherboard = candidatesMap.motherboard.filter((m) => {
        const mbSocket = (m.specs as Record<string, unknown>).socket as string;
        return !mbSocket || mbSocket === cpuSocket;
      });
    }
  }

  // Pick motherboard next
  const mbCandidates = candidatesMap.motherboard || [];
  const mbScored = mbCandidates
    .map((c) => ({ candidate: c, score: heuristicScore(c, 'motherboard', useCase) }))
    .sort((a, b) => b.score - a.score);

  if (mbScored.length > 0) {
    const mb = mbScored[0].candidate;
    build.motherboard = { part: mb, reason: 'Compatible with CPU and feature-rich.' };

    // Filter RAM by matching ram_type
    const mbRamType = (mb.specs as Record<string, unknown>).ram_type as string;
    if (mbRamType && candidatesMap.ram) {
      candidatesMap.ram = candidatesMap.ram.filter((r) => {
        const ramType = (r.specs as Record<string, unknown>).type as string;
        return !ramType || ramType === mbRamType;
      });
    }
  }

  // Pick remaining categories
  for (const category of CATEGORIES) {
    if (build[category]) continue;
    const candidates = candidatesMap[category] || [];
    const scored = candidates
      .map((c) => ({ candidate: c, score: heuristicScore(c, category, useCase) }))
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      build[category] = {
        part: scored[0].candidate,
        reason: 'Best option for this category.',
      };
    }
  }

  return build;
}

async function aiPickBuild(
  candidatesMap: Record<string, Array<Record<string, unknown>>>,
  useCase: string,
  platform: string,
  budget: number | null
): Promise<Record<string, { part: Record<string, unknown>; reason: string }> | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey === 'your-deepseek-api-key-here') return null;

  const openai = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  // Build candidate summary (top 5 per category to keep tokens low)
  const candidateSummary = CATEGORIES.map((cat) => {
    const candidates = (candidatesMap[cat] || []).slice(0, 5);
    const list = candidates
      .map((c, i) => `  ${i + 1}. ${c.brand} ${c.name} | ${JSON.stringify(c.specs)}`)
      .join('\n');
    return `${cat.toUpperCase()}:\n${list}`;
  }).join('\n\n');

  const budgetNote = budget ? `Budget: ₹${budget.toLocaleString('en-IN')}` : 'No budget limit';

  const systemPrompt = `You are a PC building expert. Given candidates per category, pick the best combo for a ${useCase} build on ${platform} platform. ${budgetNote}.
CRITICAL: Ensure CPU socket matches motherboard socket. Ensure RAM type matches motherboard RAM type.
Respond with ONLY valid JSON:
{
  "picks": {
    "cpu": { "index": 1, "reason": "..." },
    "gpu": { "index": 1, "reason": "..." },
    "motherboard": { "index": 1, "reason": "..." },
    "ram": { "index": 1, "reason": "..." },
    "storage": { "index": 1, "reason": "..." },
    "psu": { "index": 1, "reason": "..." },
    "case": { "index": 1, "reason": "..." },
    "cooling": { "index": 1, "reason": "..." }
  }
}
index is the 1-based position from each category's candidates list.`;

  const userPrompt = `Build a ${useCase} PC${platform !== 'any' ? ` (${platform} platform)` : ''}.\n${budgetNote}\n\nCandidate parts:\n${candidateSummary}\n\nPick the best part from each category.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) return null;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      picks: Record<string, { index: number; reason: string }>;
    };

    if (!parsed.picks) return null;

    const build: Record<string, { part: Record<string, unknown>; reason: string }> = {};

    for (const category of CATEGORIES) {
      const pick = parsed.picks[category];
      if (!pick) continue;
      const candidates = (candidatesMap[category] || []).slice(0, 5);
      const idx = pick.index - 1;
      if (idx >= 0 && idx < candidates.length) {
        build[category] = {
          part: candidates[idx],
          reason: pick.reason,
        };
      }
    }

    return Object.keys(build).length >= 4 ? build : null;
  } catch (err) {
    console.error('DeepSeek wizard call failed:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WizardRequest;
    const { use_case, platform, budget } = body;

    if (!use_case || !platform) {
      return NextResponse.json(
        { error: 'use_case and platform are required' },
        { status: 400 }
      );
    }

    const allocation = BUDGET_ALLOCATION[use_case] || BUDGET_ALLOCATION.gaming;

    // Fetch candidates for all categories in parallel
    const candidateEntries = await Promise.all(
      CATEGORIES.map(async (category) => {
        const maxPrice = budget ? Math.round(budget * (allocation[category] || 0.1)) : undefined;
        const candidates = await fetchCandidates(category, platform, maxPrice);
        return [category, candidates] as const;
      })
    );

    const candidatesMap: Record<string, Array<Record<string, unknown>>> = {};
    for (const [category, candidates] of candidateEntries) {
      candidatesMap[category] = candidates;
    }

    // Try AI-powered build first, fall back to heuristic
    let build = await aiPickBuild(candidatesMap, use_case, platform, budget ?? null);
    const source = build ? 'deepseek' : 'heuristic';

    if (!build) {
      build = heuristicBuild(candidatesMap, use_case);
    }

    return NextResponse.json({
      success: true,
      source,
      build,
    });
  } catch (error) {
    console.error('Error in wizard API:', error);
    return NextResponse.json(
      { error: 'Failed to generate build' },
      { status: 500 }
    );
  }
}
