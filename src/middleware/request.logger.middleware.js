const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, originalUrl, ip } = req;

  console.log(`[${timestamp}] ${method} ${originalUrl} - IP: ${ip}`);

  // Log response when it's sent
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - Status: ${res.statusCode}`);
    originalSend.call(this, data);
  };

  next();
};

module.exports = { requestLogger };