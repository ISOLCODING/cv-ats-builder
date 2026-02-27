/**
 * gas/drive.gs
 * ============================================================
 * Google Drive operations untuk menyimpan CV & Surat Lamaran.
 * ============================================================
 */

var DriveDB = (function() {
  
  var ROOT_FOLDER_NAME = 'CV_ATS_BUILDER_STORAGE';

  /**
   * Mendapatkan atau membuat root folder aplikasi
   */
  function _getOrCreateRootFolder() {
    var folders = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder(ROOT_FOLDER_NAME);
  }

  /**
   * Mendapatkan atau membuat folder khusus untuk user (berdasarkan nama/email)
   */
  function _getUserFolder(userName) {
    var root = _getOrCreateRootFolder();
    var folderName = userName || 'Unknown_User';
    var folders = root.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    }
    return root.createFolder(folderName);
  }

  /**
   * Simpan file ke Google Drive
   * @param {string} fileName - Nama file (misal: "CV_Budi_Setiawan.pdf")
   * @param {string} contentType - MimeType
   * @param {string} blobData - Data dalam base64
   * @param {string} userName - Folder tujuan
   */
  function saveFile(fileName, contentType, blobData, userName) {
    try {
      var folder = _getUserFolder(userName);
      var decodedData = Utilities.base64Decode(blobData);
      var blob = Utilities.newBlob(decodedData, contentType, fileName);
      
      var file = folder.createFile(blob);
      
      return {
        id: file.getId(),
        name: file.getName(),
        url: file.getUrl(),
        downloadUrl: file.getDownloadUrl()
      };
    } catch (e) {
      Utils.log('DriveDB.saveFile Error: ' + e.message);
      throw e;
    }
  }

  return {
    saveFile: saveFile
  };

})();
