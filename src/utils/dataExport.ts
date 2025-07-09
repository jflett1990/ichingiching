import type { ReadingEntry, UserProfile } from '../store/AppStateProvider';
import hexagramsData from '../data/hexagrams.json';

export interface ExportOptions {
  format: 'json' | 'csv';
  includeNotes?: boolean;
  includeFollowUps?: boolean;
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  selectedIds?: string[];
}

export interface ExportData {
  metadata: {
    exportDate: string;
    totalReadings: number;
    exportedReadings: number;
    user: {
      id: string;
      created: string;
      totalReadings: number;
      subscriptionTier: string;
    };
    format: string;
    options: ExportOptions;
  };
  readings: ExportReading[];
}

export interface ExportReading {
  id: string;
  timestamp: string;
  question: string;
  hexagram: {
    primaryNumber: number;
    primaryName: string;
    primaryChinese?: string;
    changingLines: number[];
    secondaryNumber?: number;
    secondaryName?: string;
    secondaryChinese?: string;
  };
  interpretation: string;
  tags: string[];
  favorite: boolean;
  notes?: string;
  followUps?: Array<{
    id: string;
    timestamp: string;
    question: string;
    response: string;
  }>;
}

/**
 * Get hexagram data by number
 */
function getHexagramData(number: number): { name: string; chinese: string } | null {
  const hexagramKey = number.toString();
  const hexagram = (hexagramsData as any)[hexagramKey];
  return hexagram ? { name: hexagram.name, chinese: hexagram.chinese } : null;
}

/**
 * Export user readings data in the specified format
 */
export async function exportReadings(
  readings: ReadingEntry[],
  user: UserProfile | null,
  options: ExportOptions
): Promise<void> {
  try {
    // Filter readings based on options
    let filteredReadings = [...readings];

    // Filter by selected IDs if provided
    if (options.selectedIds && options.selectedIds.length > 0) {
      filteredReadings = filteredReadings.filter(reading => 
        options.selectedIds!.includes(reading.id)
      );
    }

    // Filter by date range if provided
    if (options.dateRange) {
      filteredReadings = filteredReadings.filter(reading => {
        const readingDate = new Date(reading.timestamp);
        return readingDate >= options.dateRange!.start && 
               readingDate <= options.dateRange!.end;
      });
    }

    // Convert to export format
    const exportReadings: ExportReading[] = filteredReadings.map(reading => {
      const primaryHexagram = getHexagramData(reading.hexagram.primaryNumber);
      const secondaryHexagram = reading.hexagram.secondaryNumber 
        ? getHexagramData(reading.hexagram.secondaryNumber) 
        : null;

      return {
        id: reading.id,
        timestamp: new Date(reading.timestamp).toISOString(),
        question: reading.question,
        hexagram: {
          primaryNumber: reading.hexagram.primaryNumber,
          primaryName: primaryHexagram?.name || `Hexagram ${reading.hexagram.primaryNumber}`,
          primaryChinese: primaryHexagram?.chinese,
          changingLines: reading.hexagram.changingLines,
          secondaryNumber: reading.hexagram.secondaryNumber,
          secondaryName: secondaryHexagram?.name,
          secondaryChinese: secondaryHexagram?.chinese,
        },
        interpretation: reading.interpretation,
        tags: reading.tags,
        favorite: reading.favorite,
        ...(options.includeNotes && reading.notes && { notes: reading.notes }),
        ...(options.includeFollowUps && reading.followUps && { 
          followUps: reading.followUps.map(followUp => ({
            id: followUp.id,
            timestamp: new Date(followUp.timestamp).toISOString(),
            question: followUp.question,
            response: followUp.response,
          }))
        }),
      };
    });

    // Create export data structure
    const exportData: ExportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalReadings: readings.length,
        exportedReadings: exportReadings.length,
        user: {
          id: user?.id || 'anonymous',
          created: user?.created ? new Date(user.created).toISOString() : '',
          totalReadings: user?.stats?.totalReadings || 0,
          subscriptionTier: user?.subscriptionTier || 'free',
        },
        format: options.format,
        options,
      },
      readings: exportReadings,
    };

    // Export based on format
    if (options.format === 'json') {
      await downloadJSON(exportData);
    } else if (options.format === 'csv') {
      await downloadCSV(exportReadings, exportData.metadata);
    }

  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data. Please try again.');
  }
}

/**
 * Download data as JSON file
 */
async function downloadJSON(data: ExportData): Promise<void> {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `iching-readings-${timestamp}.json`;
  
  downloadFile(url, filename);
}

/**
 * Download data as CSV file
 */
async function downloadCSV(readings: ExportReading[], metadata: any): Promise<void> {
  // CSV headers
  const headers = [
    'ID',
    'Date',
    'Time', 
    'Question',
    'Primary Hexagram Number',
    'Primary Hexagram Name',
    'Primary Chinese',
    'Changing Lines',
    'Secondary Hexagram Number',
    'Secondary Hexagram Name',
    'Secondary Chinese',
    'Interpretation',
    'Tags',
    'Favorite',
    'Notes',
    'Follow-up Count'
  ];

  // Convert readings to CSV rows
  const rows = readings.map(reading => [
    reading.id,
    new Date(reading.timestamp).toLocaleDateString(),
    new Date(reading.timestamp).toLocaleTimeString(),
    `"${reading.question.replace(/"/g, '""')}"`, // Escape quotes
    reading.hexagram.primaryNumber,
    `"${reading.hexagram.primaryName}"`,
    reading.hexagram.primaryChinese || '',
    reading.hexagram.changingLines.join(';'),
    reading.hexagram.secondaryNumber || '',
    reading.hexagram.secondaryName ? `"${reading.hexagram.secondaryName}"` : '',
    reading.hexagram.secondaryChinese || '',
    `"${reading.interpretation.replace(/"/g, '""')}"`, // Escape quotes
    reading.tags.join(';'),
    reading.favorite ? 'Yes' : 'No',
    reading.notes ? `"${reading.notes.replace(/"/g, '""')}"` : '',
    reading.followUps?.length || 0
  ]);

  // Add metadata as comments at the top
  const metadataLines = [
    `# I Ching Readings Export`,
    `# Export Date: ${metadata.exportDate}`,
    `# Total Readings: ${metadata.totalReadings}`,
    `# Exported Readings: ${metadata.exportedReadings}`,
    `# User: ${metadata.user.id}`,
    `# Subscription: ${metadata.user.subscriptionTier}`,
    `#`,
  ];

  const csvContent = [
    ...metadataLines,
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `iching-readings-${timestamp}.csv`;
  
  downloadFile(url, filename);
}

/**
 * Trigger file download
 */
function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export selected readings from history
 */
export async function exportSelectedReadings(
  allReadings: ReadingEntry[],
  selectedIds: string[],
  user: UserProfile | null,
  format: 'json' | 'csv' = 'json'
): Promise<void> {
  const options: ExportOptions = {
    format,
    selectedIds,
    includeNotes: true,
    includeFollowUps: true,
    includeMetadata: true,
  };

  await exportReadings(allReadings, user, options);
}

/**
 * Export all user data
 */
export async function exportAllData(
  readings: ReadingEntry[],
  user: UserProfile | null,
  format: 'json' | 'csv' = 'json'
): Promise<void> {
  const options: ExportOptions = {
    format,
    includeNotes: true,
    includeFollowUps: true,
    includeMetadata: true,
  };

  await exportReadings(readings, user, options);
}

/**
 * Export readings within a date range
 */
export async function exportDateRange(
  readings: ReadingEntry[],
  user: UserProfile | null,
  startDate: Date,
  endDate: Date,
  format: 'json' | 'csv' = 'json'
): Promise<void> {
  const options: ExportOptions = {
    format,
    dateRange: { start: startDate, end: endDate },
    includeNotes: true,
    includeFollowUps: true,
    includeMetadata: true,
  };

  await exportReadings(readings, user, options);
}