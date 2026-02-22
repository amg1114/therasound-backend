import { SongProcessingService } from '@modules/songs/application/services/song-processing.service';
import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import pLimit from 'p-limit';
import { join } from 'path';

export interface ISeedTrack {
  'Unnamed: 0': string;
  'duration (ms)': string;
  danceability: number;
  energy: number;
  loudness: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  spec_rate: number;
  labels: string;
  uri: string;
}

@Injectable()
export class SeedFromLocalUseCase {
  private readonly logger = new Logger(SeedFromLocalUseCase.name);

  constructor(private readonly songProcessingService: SongProcessingService) {}

  async execute(
    limit?: number,
    label?: string,
  ): Promise<{ processed: number; total: number }> {
    const csvPath = join(
      process.cwd(),
      'src/modules/admin/infrastructure/seeds/278k_labelled_uri.csv',
    );

    this.logger.log(`Reading CSV from: ${csvPath}`);

    const records: ISeedTrack[] = await this.parseCsv(csvPath);

    this.logger.log(`Parsed ${records.length} records from CSV`);

    let recordsToProcess = records;

    // If a label is provided, filter records by that label
    if (label) {
      this.logger.log(`Filtering records by label: ${label}`);
      recordsToProcess = recordsToProcess.filter(
        (record) => record.labels === label,
      );
      this.logger.log(`Filtered to ${recordsToProcess.length} records`);
    }

    if (limit && limit > 0) {
      this.logger.log(`Applying limit: ${limit}`);
      recordsToProcess = recordsToProcess.slice(0, limit);
      this.logger.log(`Limited to ${recordsToProcess.length} records`);
    }

    this.logger.log(`Processing ${recordsToProcess.length} records...`);

    const batchSize = 100;
    const batches = this.chunkArray(recordsToProcess, batchSize);
    const parallelLimit = pLimit(30);
    let processed = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      const results = await Promise.all(
        batch.map((record) =>
          parallelLimit(async () => {
            try {
              const song =
                await this.songProcessingService.processSeedTrack(record);
              if (song) processed++;
              return 'ok';
            } catch (error) {
              this.logger.error(
                `Error processing: ${record.uri}, error: ${error.message}`,
              );
              return 'error';
            }
          }),
        ),
      );

      const failures = results.filter((r) => r === 'error').length;
      this.logger.log(
        `Batch ${i + 1}/${batches.length} done. Processed: ${processed}, Failures: ${failures}`,
      );

      if (failures === batch.length) {
        throw new Error(`Batch ${i + 1} failed completely, stopping.`);
      }
    }

    return {
      processed,
      total: records.length,
    };
  }

  private async parseCsv(filePath: string): Promise<ISeedTrack[]> {
    return new Promise((resolve, reject) => {
      const records: ISeedTrack[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      createReadStream(filePath)
        .pipe(parser)
        .on('data', (row: Record<keyof ISeedTrack, string>) => {
          const parsedRow: ISeedTrack = {
            ...row,
            danceability: parseFloat(row.danceability),
            energy: parseFloat(row.energy),
            loudness: parseFloat(row.loudness),
            speechiness: parseFloat(row.speechiness),
            acousticness: parseFloat(row.acousticness),
            instrumentalness: parseFloat(row.instrumentalness),
            liveness: parseFloat(row.liveness),
            valence: parseFloat(row.valence),
            tempo: parseFloat(row.tempo),
            spec_rate: parseFloat(row.spec_rate),
          };
          records.push(parsedRow);
        })
        .on('error', (error) => {
          this.logger.error('Error parsing CSV', error);
          reject(error);
        })
        .on('end', () => {
          this.logger.log(`CSV parsing completed: ${records.length} records`);
          resolve(records);
        });
    });
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
