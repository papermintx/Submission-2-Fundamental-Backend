const { nanoid } = require('nanoid');
const DatabaseService = require('./DatabaseService');

class ActivitiesService extends DatabaseService {
  constructor() {
    super();
  }

  async addActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, NOW()) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    };

    const result = await this.query(query.text, query.values);

    return result.rows[0].id;
  }

  async getActivitiesByPlaylistId(playlistId) {
    const query = {
      text: `SELECT 
        u.username, 
        s.title, 
        pa.action, 
        pa.time
      FROM playlist_activities pa
      INNER JOIN users u ON pa.user_id = u.id
      INNER JOIN songs s ON pa.song_id = s.id
      WHERE pa.playlist_id = $1
      ORDER BY pa.time ASC`,
      values: [playlistId],
    };

    const result = await this.query(query.text, query.values);

    return result.rows;
  }
}

module.exports = ActivitiesService;
