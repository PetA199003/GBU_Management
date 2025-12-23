import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/projects - Liste aller Projekte
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            participants: true,
            projectHazards: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Neues Projekt erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.location) {
      return NextResponse.json(
        { error: 'Title and location are required' },
        { status: 400 }
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        title: body.title,
        location: body.location,
        description: body.description || '',
        isOutdoor: body.isOutdoor || false,
        buildUpStart: body.buildUpStart ? new Date(body.buildUpStart) : new Date(),
        buildUpEnd: body.buildUpEnd ? new Date(body.buildUpEnd) : new Date(),
        eventStart: body.eventStart ? new Date(body.eventStart) : new Date(),
        eventEnd: body.eventEnd ? new Date(body.eventEnd) : new Date(),
        hasElectricity: body.hasElectricity || false,
        hasGenerator: body.hasGenerator || false,
        hasHazardousMaterials: body.hasHazardousMaterials || false,
        hasWorkAbove2m: body.hasWorkAbove2m || false,
        hasPublicAccess: body.hasPublicAccess || false,
        hasNightWork: body.hasNightWork || false,
        hasTrafficArea: body.hasTrafficArea || false,
        status: 'ENTWURF',
        createdByUserId: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
