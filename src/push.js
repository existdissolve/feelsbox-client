/*global Promise */
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import {decode} from 'base64-arraybuffer';

import {subscribeToPush} from '-/graphql/user';
import client from '-/graphql/client';

const vapidKey = 'BN2FR0tXnjc4twlzmxAunsspOqjfB2n140ggTXTMOxhFHJJL-sW6ijc2K2ji3WbncJ81nfVxbzHLc1asz5WIQAE';

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
