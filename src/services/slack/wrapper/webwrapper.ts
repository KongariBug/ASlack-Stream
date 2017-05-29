import { WebClient } from '@slack/client';

export class WebClientWrapper {
    client: any;

    constructor(private token: string) {
        this.client = new WebClient(token);
    }

    async postMessage(channel: string, text: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.chat.postMessage(channel, text, { 'as_user': true, 'link_names': 1 }, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info);
                }
            })
        });
    }

    async deleteMessage(channel: string, timestamp: string) {
        return new Promise<void>((resolve, reject) => {
            this.client.chat.delete(timestamp, channel, { 'as_user': true }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async getEmoji(): Promise<{ string: string }> {
        return new Promise<{ string: string }>((resolve, reject) => {
            this.client.emoji.list((err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info.emoji as { string: string });
                }
            })
        });
    }

    async markRead(channel: string, timestamp: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.channels.mark(channel, timestamp, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        });
    }

    async addReaction(reaction: string, channel: string, ts: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.reactions.add(reaction, { 'timestamp': ts, 'channel': channel }, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async removeReaction(reaction: string, channel: string, ts: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.reactions.remove(reaction, { 'timestamp': ts, 'channel': channel }, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
