import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { loadAllData } from '@/lib/dataLoader';
import { getCrosstabAnalysis } from '@/lib/analytics';
import type { StudentMember } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dimension1 = searchParams.get('dimension1') || 'Meal_Plan_Type';
    const dimension2 = searchParams.get('dimension2') || 'Housing_Status';

    // Get D1 database from Cloudflare context
    const { env } = getCloudflareContext();
    const db = env.DB;
    if (!db) {
      console.error('D1 database not available. env:', env);
      throw new Error('D1 database not available');
    }

    // Load all data from D1 database
    const { students, allTransactions } = await loadAllData(db);

    // Get crosstab analysis
    const crosstab = getCrosstabAnalysis(
      students,
      allTransactions,
      dimension1 as keyof StudentMember,
      dimension2 as keyof StudentMember
    );

    return NextResponse.json({
      dimension1,
      dimension2,
      crosstab,
    });
  } catch (error) {
    console.error('Error loading crosstab data:', error);
    return NextResponse.json(
      { error: 'Failed to load crosstab data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
