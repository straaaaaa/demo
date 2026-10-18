export function waitUntilLoaded(scene) {
    return new Promise((resolve) => {

        if (!scene.load.isLoading() && scene.load.queue.size === 0) {
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

export async function loadAndGetJson(scene, key, url) {
    if (scene.cache.json.exists(key)) {
        alert(key);
        return scene.cache.json.get(key);
    }

    const loadErrorListener = (file) => {
        if (file.key === key) {
            alert(`【ファイル読込失敗】\nKey: ${key}\nURL: ${url}\n\nパスが間違っているか、ファイルが存在しないか、JSONの構文が壊れています。`);
        }
    };
    scene.load.on('loaderror', loadErrorListener);

    scene.load.json(key, url);

    await waitUntilLoaded(scene);

    return scene.cache.json.get(key);
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