// src/core/AppState.js

import { EventManager } from "./EventManager";

import { DB } from "./db";
import { Player } from "./Player";
import { PlaylistManager } from "./PlaylistManager";
import { PlaylistBuilder } from "./PlaylistBuilder";

import { Logger } from "./Logger";

export class AppState {

    constructor() {

        this.log = new Logger("AppState", Logger.DEBUG);

        // Core
        this.events = new EventManager(
            this.log.child("EventManager")
        );

        // Services
        this.db = new DB(
            this,
            this.log.child("DB")
        );

        this.player = new Player(
            this,
            this.log.child("Player")
        );

        this.playlists = new PlaylistManager(
            this,
            this.log.child("PlaylistManager")
        );

        this.builder = new PlaylistBuilder(
            this,
            this.log.child("PlaylistBuilder")
        );

    }

    async init() {

        await this.db.init();

        if (this.player.init)
            await this.player.init();

        if (this.playlists.init)
            await this.playlists.init();

        if (this.builder.init)
            await this.builder.init();

        this.events.emit("app:ready");

    }

    destroy() {

        this.player.destroy?.();
        this.playlists.destroy?.();
        this.builder.destroy?.();

        this.events.clear?.();

    }

}