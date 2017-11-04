module.exports = {
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g)$/i,
        use: [
          {
            loader: 'image-trace-loader'
          }
        ]
      }
    ]
  }
}
