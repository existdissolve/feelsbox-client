/*global Promise */
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

import {subscribeToPush} from '-/graphql/user';
import client from '-/graphql/client';

const vapidKey = 'BN2FR0tXnjc4twlzmxAunsspOqjfB2n140ggTXTMOxhFHJJL-sW6ijc2K2ji3WbncJ81nfVxbzHLc1asz5WIQAE';

const urlBase64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

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
    const key = urlBase64ToUint8Array(vapidKey);
    let subscription = await sw.pushManager.getSubscription();

    if (subscription) {
        await subscription.unsubscribe();
    }

    subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key
    });

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
