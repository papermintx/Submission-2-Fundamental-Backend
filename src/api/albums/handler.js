const AlbumsValidator = require('../../validator/albums');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

class AlbumsHandler {
  constructor(service) {
    this._service = service;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.deleteAlbumLikeHandler = this.deleteAlbumLikeHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    AlbumsValidator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request, h) {
    AlbumsValidator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album updated successfully',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album deleted successfully',
    };
  }

  async postAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    // Validasi: pastikan album exists
    await this._service.getAlbumById(id);

    // Validasi file
    if (!cover) {
      const response = h.response({
        status: 'fail',
        message: 'Cover file is required',
      });
      response.code(400);
      return response;
    }

    // Validasi MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(cover.hapi.headers['content-type'])) {
      const response = h.response({
        status: 'fail',
        message: 'Cover must be an image file',
      });
      response.code(400);
      return response;
    }

    // Validasi ukuran file (max 500KB)
    const maxSize = 512000; // 500KB in bytes
    if (cover._data.length > maxSize) {
      const response = h.response({
        status: 'fail',
        message: 'Cover file size must not exceed 500KB',
      });
      response.code(400);
      return response;
    }

    // Hapus cover lama jika ada
    const oldCoverUrl = await this._service.getAlbumCoverUrl(id);
    if (oldCoverUrl) {
      const oldFilename = oldCoverUrl.split('/').pop();
      const oldFilePath = path.resolve(__dirname, '../../../uploads', oldFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Generate nama file unik
    const fileExtension = cover.hapi.filename.split('.').pop();
    const filename = `${id}-${nanoid(16)}.${fileExtension}`;
    const filePath = path.resolve(__dirname, '../../../uploads', filename);

    // Simpan file ke disk
    const fileStream = fs.createWriteStream(filePath);

    await new Promise((resolve, reject) => {
      cover.pipe(fileStream);
      cover.on('end', resolve);
      cover.on('error', reject);
    });

    // Generate URL publik
    const protocol = request.server.info.protocol;
    const host = request.info.host;
    const coverUrl = `${protocol}://${host}/uploads/${filename}`;

    // Simpan URL ke database
    await this._service.updateAlbumCover(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.addAlbumLike(id, userId);

    const response = h.response({
      status: 'success',
      message: 'Album liked successfully',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.removeAlbumLike(id, userId);

    return {
      status: 'success',
      message: 'Album unliked successfully',
    };
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const likes = await this._service.getAlbumLikesCount(id);

    return {
      status: 'success',
      data: {
        likes,
      },
    };
  }
}

module.exports = AlbumsHandler;
