const express = require('express');
const app = express();
const port = 8888;

app.use(express.static(__dirname));

app.get('/api', async (req, res) => {
    const id = req.query.id;
    const url = `http://152.32.218.226:9999/news_server/api/getShowNews?id=${id}`;
    try {
        // 动态导入 node-fetch
        const { default: fetch } = await import('node-fetch');

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const data = await response.json();

        const title = data.title;
        const pic_set = data.pic_set;
        const content = data.content;
        const href = data.href;

        console.log({ title, pic_set, content, href });
        res.json({ title, pic_set, content, href });
        
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

