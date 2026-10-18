export function waitUntilLoaded(scene) {
    return new Promise((resolve) => {

        if (!scene.load.isLoading() && scene.load.totalToLoad === 0) {
            alert("resolve");
            resolve();
            return;
        }

        scene.load.once('complete', () => {
            resolve();
        });

        if (!scene.load.isLoading()) {
            alert("loadStart")
            scene.load.start();
        }
    });
}

export async function loadAndGetJson(scene, key, url) {
    if (scene.cache.json.exists(key)) {
        alert(key);
        return scene.cache.json.get(key);
    }

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