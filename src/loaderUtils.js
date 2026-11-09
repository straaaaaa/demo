// 【修正】JSONはPhaserを通さず、直接fetchで取得してキャッシュに入れる
export async function loadAndGetJson(scene, key, url) {
    if (scene.cache.json.exists(key)) {
        return scene.cache.json.get(key);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`File not found: ${url}`);
            return null;
        }
        const data = await response.json();
        
        // Phaserのキャッシュに手動で追加する
        scene.cache.json.add(key, data);
        return data;
    } catch (error) {
        console.error(`Failed to load JSON from ${url}:`, error);
        return null;
    }
}

// 画像などのロード用（元のままでOK、ただしtotalToLoadを使う）
export function waitUntilLoaded(scene) {
    return new Promise((resolve) => {
        if (scene.load.list.size === 0 && !scene.load.isLoading()) {
            resolve();
            return;
        }
        scene.load.once('complete', () => {
            resolve();
        });
        if (!scene.load.isLoading()) {
            scene.load.start();
        }
    });
}


export async function checkFileExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('通信エラーが発生しました:', error);
    return false;
  }
}

export async function newAssetsExist(basePath,files) {
    const formatPath = basePath.endsWith('/') ? basePath : `${basePath}/`;

    const promises = files.map(async (file) => {
        const fileUrl = `${formatPath}${file}`;
        try {
            const response = await fetch(fileUrl,{method: "HEAD"});
            return [file,response.ok];
        } catch (error) {
            return [file,false];
        }
    });

    const results = await Promise.all(promises);

    return Object.fromEntries(results);
}