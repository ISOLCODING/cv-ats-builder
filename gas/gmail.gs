/**
 * gas/gmail.gs
 * ============================================================
 * Gmail Service untuk mengirim email lamaran kerja.
 * ============================================================
 */

var GmailDB = (function() {

  /**
   * Kirim email dengan lampiran
   * @param {Object} options - { to, nameHRD, subject, body, attachmentIds, senderName }
   */
  function sendJobApplication(options) {
    var to = options.to;
    var subject = options.subject;
    var body = options.body;
    var attachmentIds = options.attachmentIds || [];
    var senderName = options.senderName || 'Pelamar';

    try {
      var attachments = [];
      attachmentIds.forEach(function(id) {
        try {
          var file = DriveApp.getFileById(id);
          attachments.push(file.getAs(MimeType.PDF));
        } catch (err) {
          Utils.log('Gagal mengambil file attachment ID: ' + id);
        }
      });

      // Kirim email via GmailApp
      GmailApp.sendEmail(to, subject, body, {
        name: senderName,
        attachments: attachments
      });

      // Kirim konfirmasi ke pengirim sendiri
      var userEmail = Session.getActiveUser().getEmail();
      if (userEmail && userEmail !== to) {
        GmailApp.sendEmail(userEmail, 'Konfirmasi Pengiriman: ' + subject, 
          'Halo ' + senderName + ',\n\nEmail lamaran Anda ke ' + (options.nameHRD || to) + ' telah berhasil dikirim.\n\nSubjek: ' + subject + '\nStatus: Terkirim\n\nTerima kasih telah menggunakan CV ATS Builder.');
      }

      Utils.log('Email dikirim ke: ' + to);
      return { success: true, message: 'Email berhasil dikirim ke ' + to };
    } catch (e) {
      Utils.log('GmailDB.sendJobApplication Error: ' + e.message);
      return { success: false, message: 'Gagal mengirim email: ' + e.message };
    }
  }

  return {
    sendJobApplication: sendJobApplication
  };

})();
