const express = require('express');
const app = express();
const port = 3000;

app.get('/data', (req, res) => {
    res.json({ message: "Hello from VmRetroApp server!" });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
