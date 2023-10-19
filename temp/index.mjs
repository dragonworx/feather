// https://beebom.com/how-change-video-thumbnails-file-explorer-windows-10-11/

import { exec } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('f', {
    type: 'string',
    default: './',
    description: 'Folder path'
  })
  .option('s', {
    type: 'number',
    default: 0.75,
    description: 'Snapshot point'
  })
  .argv;

const folderPath = argv.f;
const snapshotPoint = argv.s;

const videoExtensions = ['.mp4', '.mkv', '.avi', '.flv', '.mov'];

const files = readdirSync(folderPath);

files.forEach((file) => {
  const fileExt = file.slice(file.lastIndexOf('.'));
  if (videoExtensions.includes(fileExt)) {
    const filePath = join(folderPath, file);
    const outputThumbnailPath = join(folderPath, `${file}.png`);
    const outputVideoPath = join(folderPath, `output_${file}`);
    
    exec(`ffmpeg -i ${filePath} 2>&1 | grep 'Duration' | cut -d ' ' -f 4 | sed s/,//`, (error, stdout) => {
      const duration = stdout.trim();
      const timeParts = duration.split(':').map(Number);
      const totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      const snapshotTime = totalSeconds * snapshotPoint;

      exec(`ffmpeg -ss ${snapshotTime} -i ${filePath} -vframes 1 ${outputThumbnailPath}`, (error) => {
        if (error) {
          console.error(`Error generating thumbnail for ${file}: ${error}`);
        } else {
          console.log(`Thumbnail generated for ${file}`);
          
          // Embed the thumbnail into the video file as metadata
          exec(`ffmpeg -i ${filePath} -i ${outputThumbnailPath} -map 0 -map 1 -c copy -disposition:v:1 attached_pic ${outputVideoPath}`, (error) => {
            if (error) {
              console.error(`Error embedding thumbnail into ${file}: ${error}`);
            } else {
              console.log(`Thumbnail embedded into ${file}`);
            }
          });
        }
      });
    });
  }
});
