const ApiError = require('../error/ApiError');
const path = require('path');
const fileService = require('../service/fileService');

class SendFileController {
  async getR23(req, res, next) {
    const zipPath = path.join(__dirname, '..', 'static', 'EVARevit23.zip');

    res.download(zipPath, 'EVARevit23.zip', (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Ошибка при скачивании архива');
      }
    });
  }

  async getTest(req, res, next) {
    try {
      const filename = 'Test.txt';
      const filepath = path.join(__dirname, '..', 'static', filename);
      res.set('Content-Type', 'application/octet-stream');
      return res.download(filepath, filename, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Ошибка при скачивании файла');
        }
      });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getZip(req, res,next) {
    try {
      const { zipfolder } = req.params; // Имя подпапки из запроса
      console.log(zipfolder)
      const fileDownload = await fileService.downloadEva(zipfolder)

      res.download(fileDownload.zipPath, fileDownload.zipFileName, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Ошибка при скачивании архива');
        }
      });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new SendFileController();
