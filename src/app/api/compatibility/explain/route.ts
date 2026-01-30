import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { Build, CompatibilityReport, Issue } from '@/lib/compatibility';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CompatiblePart {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  specs: Record<string, unknown>;
  image_url?: string;
}

interface IssueExplanation {
  id: string;
  summary: string;
  why_it_matters: string;
  fixes: Array<{
    title: string;
    detail: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  compatible_parts?: CompatiblePart[];
}

interface ExplainResponse {
  issue_explanations: IssueExplanation[];
  overall_advice: {
    one_liner: string;
    top_3_actions: string[];
  };
}

async function fetchCompatibleParts(
  build: Build,
  issueId: string
): Promise<CompatiblePart[]> {
  try {
    switch (issueId) {
      case 'socket-mismatch': {
        // If CPU is selected, find compatible motherboards
        // If motherboard is selected, find compatible CPUs
        const cpuSocket = build.parts.cpu?.specs?.socket;
        const mbSocket = build.parts.motherboard?.specs?.socket;

        if (cpuSocket) {
          // Find motherboards that match CPU socket
          const { data } = await supabase
            .from('components')
            .select('*')
            .eq('category', 'motherboard')
            .limit(5);

          if (data) {
            return data
              .filter((mb) => {
                const socket = mb.specs?.socket?.toString().toLowerCase();
                return socket === cpuSocket.toString().toLowerCase();
              })
              .slice(0, 5)
              .map((p) => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                price: p.price,
                category: p.category,
                specs: p.specs,
                image_url: p.image_url,
              }));
          }
        } else if (mbSocket) {
          // Find CPUs that match motherboard socket
          const { data } = await supabase
            .from('components')
            .select('*')
            .eq('category', 'cpu')
            .limit(5);

          if (data) {
            return data
              .filter((cpu) => {
                const socket = cpu.specs?.socket?.toString().toLowerCase();
                return socket === mbSocket.toString().toLowerCase();
              })
              .slice(0, 5)
              .map((p) => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                price: p.price,
                category: p.category,
                specs: p.specs,
                image_url: p.image_url,
              }));
          }
        }
        break;
      }

      case 'ram-mismatch': {
        // Find RAM that matches motherboard type
        const mbRamType = build.parts.motherboard?.specs?.ram_type;
        if (mbRamType) {
          const { data } = await supabase
            .from('components')
            .select('*')
            .eq('category', 'ram')
            .limit(5);

          if (data) {
            return data
              .filter((ram) => {
                const ramType = ram.specs?.type?.toString().toLowerCase();
                return ramType === mbRamType.toString().toLowerCase();
              })
              .slice(0, 5)
              .map((p) => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                price: p.price,
                category: p.category,
                specs: p.specs,
                image_url: p.image_url,
              }));
          }
        }
        break;
      }

      case 'psu-insufficient':
      case 'psu-low-headroom': {
        // Find PSUs with higher wattage
        const currentWattage = build.parts.psu?.specs?.wattage || 0;
        const { data } = await supabase
          .from('components')
          .select('*')
          .eq('category', 'psu')
          .order('price', { ascending: true })
          .limit(10);

        if (data) {
          return data
            .filter((psu) => {
              const wattage = psu.specs?.wattage || 0;
              return wattage > currentWattage;
            })
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              name: p.name,
              brand: p.brand,
              price: p.price,
              category: p.category,
              specs: p.specs,
              image_url: p.image_url,
            }));
        }
        break;
      }

      case 'gpu-too-long': {
        // Find cases with more GPU clearance or smaller GPUs
        const gpuLength = build.parts.gpu?.specs?.length_mm || 0;
        const { data } = await supabase
          .from('components')
          .select('*')
          .eq('category', 'case')
          .limit(10);

        if (data) {
          return data
            .filter((c) => {
              const maxLength = c.specs?.max_gpu_length || c.specs?.max_gpu_length_mm || 0;
              return maxLength >= gpuLength;
            })
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              name: p.name,
              brand: p.brand,
              price: p.price,
              category: p.category,
              specs: p.specs,
              image_url: p.image_url,
            }));
        }
        break;
      }

      case 'cooler-weak': {
        // Find coolers with higher TDP rating
        const cpuTdp = build.parts.cpu?.specs?.tdp || 0;
        const { data } = await supabase
          .from('components')
          .select('*')
          .eq('category', 'cooling')
          .limit(10);

        if (data) {
          return data
            .filter((cooler) => {
              const tdpRating = cooler.specs?.tdp_rating || cooler.specs?.tdp_rating_watts || 0;
              return tdpRating >= cpuTdp;
            })
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              name: p.name,
              brand: p.brand,
              price: p.price,
              category: p.category,
              specs: p.specs,
              image_url: p.image_url,
            }));
        }
        break;
      }

      case 'no-graphics': {
        // Suggest GPUs
        const { data } = await supabase
          .from('components')
          .select('*')
          .eq('category', 'gpu')
          .order('price', { ascending: true })
          .limit(5);

        if (data) {
          return data.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: p.price,
            category: p.category,
            specs: p.specs,
            image_url: p.image_url,
          }));
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error fetching compatible parts:', error);
  }

  return [];
}

function generateFallbackExplanation(report: CompatibilityReport): ExplainResponse {
  const explanations: IssueExplanation[] = report.issues
    .filter((issue) => issue.severity !== 'pass')
    .map((issue) => ({
      id: issue.id,
      summary: issue.detail,
      why_it_matters: getWhyItMatters(issue),
      fixes: [
        {
          title: 'Recommended Fix',
          detail: issue.suggestedFix,
          impact: issue.severity === 'fail' ? 'high' : ('medium' as const),
        },
      ],
    }));

  const failCount = report.issues.filter((i) => i.severity === 'fail').length;
  const warnCount = report.issues.filter((i) => i.severity === 'warn').length;

  let oneLiner = 'Your build looks good!';
  if (failCount > 0) {
    oneLiner = `Critical: ${failCount} compatibility issue(s) must be resolved before building.`;
  } else if (warnCount > 0) {
    oneLiner = `${warnCount} warning(s) to consider for optimal performance.`;
  }

  const topActions: string[] = [];
  report.issues
    .filter((i) => i.severity === 'fail')
    .slice(0, 2)
    .forEach((i) => topActions.push(i.suggestedFix));
  report.issues
    .filter((i) => i.severity === 'warn')
    .slice(0, 3 - topActions.length)
    .forEach((i) => topActions.push(i.suggestedFix));

  if (topActions.length === 0) {
    topActions.push('Your build is compatible - proceed with confidence!');
  }

  return {
    issue_explanations: explanations,
    overall_advice: {
      one_liner: oneLiner,
      top_3_actions: topActions.slice(0, 3),
    },
  };
}

function getWhyItMatters(issue: Issue): string {
  switch (issue.id) {
    case 'socket-mismatch':
      return 'The CPU physically cannot be installed in an incompatible motherboard socket. This will prevent your system from working entirely.';
    case 'ram-mismatch':
      return 'DDR4 and DDR5 RAM have different physical connectors and voltages. Using the wrong type will prevent the system from booting.';
    case 'psu-insufficient':
      return 'An underpowered PSU can cause system instability, random shutdowns, or permanent damage to components under load.';
    case 'psu-low-headroom':
      return 'While technically functional, low PSU headroom reduces efficiency and leaves no room for future upgrades or power spikes.';
    case 'no-graphics':
      return 'Without integrated or discrete graphics, you will have no video output and cannot use the system.';
    case 'gpu-too-long':
      return 'A GPU that exceeds case clearance will not physically fit, requiring case modification or component replacement.';
    case 'cooler-weak':
      return 'An inadequate cooler may cause thermal throttling, reducing performance and potentially shortening CPU lifespan.';
    default:
      return 'This affects the compatibility or performance of your build.';
  }
}

async function callDeepSeek(
  build: Build,
  report: CompatibilityReport
): Promise<ExplainResponse | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey || apiKey === 'your-deepseek-api-key-here') {
    console.log('DeepSeek API key not configured');
    return null;
  }

  // Initialize OpenAI client with DeepSeek base URL
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  const systemPrompt = `You are a PC building expert. Analyze the compatibility report and provide detailed explanations.
You MUST respond with ONLY valid JSON matching this exact schema:
{
  "issue_explanations": [
    {
      "id": "string (issue id)",
      "summary": "string (1-2 sentence summary)",
      "why_it_matters": "string (explain impact on build)",
      "fixes": [
        {
          "title": "string (short fix name)",
          "detail": "string (detailed fix instructions)",
          "impact": "low|medium|high"
        }
      ]
    }
  ],
  "overall_advice": {
    "one_liner": "string (brief overall assessment)",
    "top_3_actions": ["string", "string", "string"]
  }
}`;

  const userPrompt = `Analyze this PC build compatibility report:

Build Parts:
${JSON.stringify(build.parts, null, 2)}

Compatibility Report:
- Estimated Wattage: ${report.estimatedWattage}W
- Recommended PSU: ${report.recommendedPSU}W
- Score: ${report.score}/100
- Issues: ${JSON.stringify(report.issues, null, 2)}

Provide detailed explanations for each issue and overall advice.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      console.error('DeepSeek returned empty content');
      return null;
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse JSON from DeepSeek response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as ExplainResponse;

    if (!parsed.issue_explanations || !parsed.overall_advice) {
      console.error('Invalid response structure from DeepSeek');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('DeepSeek API call failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { build, report } = body as { build: Build; report: CompatibilityReport };

    if (!build || !report) {
      return NextResponse.json(
        { error: 'Build and report are required' },
        { status: 400 }
      );
    }

    // Get AI explanation
    let explanation = await callDeepSeek(build, report);
    const source = explanation ? 'deepseek' : 'fallback';

    if (!explanation) {
      explanation = generateFallbackExplanation(report);
    }

    // Fetch compatible parts for each issue
    const issuesWithParts = await Promise.all(
      explanation.issue_explanations.map(async (issueExp) => {
        const compatibleParts = await fetchCompatibleParts(build, issueExp.id);
        return {
          ...issueExp,
          compatible_parts: compatibleParts,
        };
      })
    );

    return NextResponse.json({
      success: true,
      source,
      explanation: {
        ...explanation,
        issue_explanations: issuesWithParts,
      },
    });
  } catch (error) {
    console.error('Error generating explanation:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
