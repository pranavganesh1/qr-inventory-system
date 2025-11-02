const QRCode = require('qrcode');

exports.generateQRCode = async (data) => {
  try {
    const qrCode = await QRCode.toDataURL(JSON.stringify(data));
    return qrCode;
  } catch (err) {
    throw new Error('Failed to generate QR code');
  }
};