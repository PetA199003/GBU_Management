import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id] - Ein spezifisches Projekt abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        projectHazards: {
          include: {
            hazard: true,
          },
        },
        participants: true,
        briefings: {
          include: {
            trainer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            signatures: true,
          },
        },
        attachments: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Ein Projekt aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Update project
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        title: body.title,
        location: body.location,
        description: body.description,
        isOutdoor: body.isOutdoor,
        buildUpStart: body.buildUpStart ? new Date(body.buildUpStart) : undefined,
        buildUpEnd: body.buildUpEnd ? new Date(body.buildUpEnd) : undefined,
        eventStart: body.eventStart ? new Date(body.eventStart) : undefined,
        eventEnd: body.eventEnd ? new Date(body.eventEnd) : undefined,
        hasElectricity: body.hasElectricity,
        hasGenerator: body.hasGenerator,
        hasHazardousMaterials: body.hasHazardousMaterials,
        hasWorkAbove2m: body.hasWorkAbove2m,
        hasPublicAccess: body.hasPublicAccess,
        hasNightWork: body.hasNightWork,
        hasTrafficArea: body.hasTrafficArea,
        status: body.status,
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

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Ein Projekt löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
