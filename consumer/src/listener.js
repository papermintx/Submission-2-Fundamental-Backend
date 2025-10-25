class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      console.log(`Processing export for playlist: ${playlistId} to ${targetEmail}`);

      const playlist = await this._playlistsService.getPlaylistWithSongs(playlistId);
      const result = await this._mailSender.sendEmail(
        targetEmail,
        JSON.stringify(playlist)
      );

      console.log('✅ Email sent successfully:', result.messageId);
    } catch (error) {
      console.error('❌ Error processing message:', error.message);
    }
  }
}

module.exports = Listener;
