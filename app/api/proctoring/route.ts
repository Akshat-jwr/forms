import { NextResponse } from 'next/server';

interface ProctoringEvent {
  formId: string;
  violation: {
    type: string;
    timestamp: string;
    message: string;
    confidence?: number;
  };
}

// In-memory store for demo purposes (use a database in production)
const violationLogs: ProctoringEvent[] = [];

export async function POST(request: Request) {
  try {
    const data: ProctoringEvent = await request.json();

    // Validate required fields
    if (!data.formId || !data.violation) {
      return NextResponse.json(
        { success: false, message: 'Missing formId or violation data.' },
        { status: 400 }
      );
    }

    // Log the violation
    violationLogs.push({
      ...data,
      violation: {
        ...data.violation,
        timestamp: data.violation.timestamp || new Date().toISOString(),
      },
    });

    console.log(
      `[PROCTORING] Form: ${data.formId} | Type: ${data.violation.type} | ${data.violation.message}` +
      (data.violation.confidence ? ` | Confidence: ${(data.violation.confidence * 100).toFixed(1)}%` : '')
    );

    return NextResponse.json({
      success: true,
      message: 'Violation logged.',
      totalViolations: violationLogs.filter(v => v.formId === data.formId).length,
    });
  } catch (error) {
    console.error('Error processing proctoring data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process proctoring data.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve violations for a form
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');

  if (!formId) {
    return NextResponse.json(
      { success: false, message: 'formId query parameter is required.' },
      { status: 400 }
    );
  }

  const formViolations = violationLogs.filter(v => v.formId === formId);

  return NextResponse.json({
    success: true,
    formId,
    violations: formViolations,
    totalViolations: formViolations.length,
  });
}