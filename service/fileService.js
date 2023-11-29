const fs = require('fs');
const path = require('path');
const ApiError = require('../error/ApiError');

class FileService {
  async downloadEva(zipfolder) {
    console.log('zipfolder in FileService: ', zipfolder);
    const zipFolderPath = path.join(__dirname, '..', 'static', zipfolder);
    console.log('zipFolderPath in FileService: ', zipFolderPath);

    try {
      // Получаем список файлов в папке
      const files = fs.readdirSync(zipFolderPath);

      // Проверяем, есть ли хотя бы один файл в папке
      if (files.length === 0) {
        throw new ApiError(404, 'В папке нет файлов для скачивания');
      }

      // Выбираем первый файл из папки
      const zipFileName = files[0];
      const zipPath = path.join(zipFolderPath, zipFileName);
      console.log('zipFileName: ', zipFileName);
      console.log('zipPath: ', zipPath);
      return { zipPath, zipFileName };
    } catch (error) {
      throw new ApiError(404, 'В папке нет файлов для скачивания');
    }
  }
}

module.exports = new FileService();
