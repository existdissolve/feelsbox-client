/*global Promise */
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import {decode} from 'base64-arraybuffer';

import {subscribeToPush} from '-/graphql/user';
import client from '-/graphql/client';

const vapidKey = 'BLS9qge0D7-AJ94qMmote6rDuZkKzyPND7rG6wW_0nQu_IIjtah4MdzwDqWBaMS6kbOGgSa2wDiHt2kWwy0ESKs';

const saveSubscription = subscription => {
    return client.mutate({
        mutation: subscribeToPush,
        variables: {
            push: subscription
        }
    });
};

const configurePushSub = async() => {
    const sw = await navigator.serviceWorker.ready;
    const key = decode(vapidKey);
    let subscription = await sw.pushManager.getSubscription();

    if (subscription) {
        await subscription.unsubscribe();
    }

    console.log(key)

    subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key
    });

    console.log(subscription)
    await saveSubscription(subscription);
};

const initPush = async() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        // register service worker
        await runtime.register();
        // request notification/push permissions
        Notification.requestPermission(async result => {
            if (result === 'granted') {
                await configurePushSub();
            }
        });
    }
};

export default initPush;
