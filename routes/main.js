module.exports = function(app) {
app.get('/api', function (req, res) {
  res.send('Sommarcamp API is running');
});
};