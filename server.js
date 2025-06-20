const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8888;

function createFolderIfNotExists(folderPath) {
    try {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
            console.log(`文件夹 ${folderPath} 创建成功`);
        } else {
            console.log(`文件夹 ${folderPath} 已存在`);
        }
    } catch (error) {
        console.error(`创建文件夹时出错: ${error.message}`);
    }
}

function downloadImage(url, savePath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(savePath);

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`图片已成功下载到 ${savePath}`);
                    resolve();
                }).on('error', (err) => {
                    fs.unlink(savePath, () => {});
                    console.error(`写入文件时出错: ${err.message}`);
                    reject(err);
                });
            } else {
                console.error(`请求失败，状态码: ${response.statusCode}`);
                reject(new Error(`请求失败，状态码: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            console.error(`下载图片时出错: ${err.message}`);
            reject(err);
        });
    });
}

app.use(express.static(__dirname));

app.get('/api', async (req, res) => {
    const id = req.query.id;
    const url = `http://127.0.0.1:9999/news_server/api/getShowNews?id=${id}`;
    try {
        // 动态导入 node-fetch
        const { default: fetch } = await import('node-fetch');

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, { signal: controller.signal});
        clearTimeout(id);
        
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const data = await response.json();

        const title = data.title;
        const pic_set = data.pic_set;
        const content = data.content;
        const href = data.href;

        // 新建文件夹
        const folderPath = path.join(__dirname, 'image');
        createFolderIfNotExists(folderPath);

        // 下载图片
        try {
            save_path_output = pic_set.split("_")[1]
            save_path = path.join(__dirname, save_path_output);
        } catch{
            save_path_output = "";
            save_path = null;
        }

        
        if (save_path){
            const exists = fs.existsSync(save_path);
            if (exists) {
                save_path_output = "http://150.158.25.36:8888/".concat(save_path_output)
            } else {
                await downloadImage(pic_set, save_path);
                save_path_output = "http://150.158.25.36:8888/".concat(save_path_output)
            }
        }

        console.log({ title, save_path_output, content, href });
        res.json({ title, save_path_output, content, href });
        
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

