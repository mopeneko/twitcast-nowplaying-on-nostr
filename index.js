// ==UserScript==
// @name         TwitCast NowPlaying on Nostr
// @namespace    http://tampermonkey.net/
// @version      0.0.3
// @description  Post TwitCast URL on load Twitcast videos
// @author       https://github.com/mopeneko
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// @match        https://twitcasting.tv/*
// @require      https://cdn.jsdelivr.net/npm/nostr-tools@2.7.1/lib/nostr.bundle.min.js
// ==/UserScript==

(async () => {
    'use strict';

    console.info('TwitCast NowPlaying on Nostr v0.0.1');

    const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

    await sleep(500);

    if (typeof window.nostr === 'undefined') {
        console.error('Install a NIP-07 browser extension to use');
        return;
    }

    const videoElement = window.document.querySelector('.tw-stream-player-video');
    const offlineElement = window.document.querySelector('.tw-player-offline-splash-bg.tw-splash-offline-animation--visible');
    const isPlayable = !!videoElement && !offlineElement;
    if (!isPlayable) {
        console.info('The page is not playable');
        return;
    }

    const url = new URL(window.location.href);
    url.search = '';

    const event = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: `Now Playing: ${url}\n#TwitCastNowPlaying`,
    };

    const signedEvent = await window.nostr.signEvent(event);

    const relay = await NostrTools.Relay.connect('wss://relay-jp.nostr.wirednet.jp');
    try {
        await relay.publish(signedEvent);
        console.info('Published event', signedEvent);
    } catch (e) {
        console.error(e);
    } finally {
        relay.close();
    }
})();
