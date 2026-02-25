const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Orders endpoint',
  });
});

module.exports = router;
