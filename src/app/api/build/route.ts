import { NextRequest, NextResponse } from 'next/server';
import { createBuild } from '@/lib/store';
import { Build } from '@/lib/compatibility';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.parts || typeof body.parts !== 'object') {
      return NextResponse.json(
        { error: 'Invalid build: parts object is required' },
        { status: 400 }
      );
    }

    const build: Omit<Build, 'id' | 'createdAt'> = {
      name: body.name || 'My PC Build',
      parts: {
        cpu: body.parts.cpu || null,
        gpu: body.parts.gpu || null,
        motherboard: body.parts.motherboard || null,
        ram: body.parts.ram || null,
        storage: body.parts.storage || null,
        psu: body.parts.psu || null,
        case: body.parts.case || null,
        cooling: body.parts.cooling || null,
        monitor: body.parts.monitor || null,
      },
      currency: 'INR',
    };

    const savedBuild = await createBuild(build);

    return NextResponse.json({
      success: true,
      id: savedBuild.id,
      build: savedBuild,
    });
  } catch (error) {
    console.error('Error creating build:', error);
    return NextResponse.json(
      { error: 'Failed to create build' },
      { status: 500 }
    );
  }
}
