import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import {
    SlackServiceCollection,
    SlackMessage,
    SlackService,
    SlackReactionAdded,
    SlackReactionRemoved
} from '../../../services/slack/slack.service';

import {
    SlackParser,
    ComposedParser,
    LinkParser,
    EmojiParser,
    NewLineParser
} from '../../../services/slack/slack-parser.service';

import { Attachment } from '../../../services/slack/slack.types';

class DisplaySlackReactionInfo {
}

class DisplaySlackMessageInfo {
    edited: boolean = false;
    reactions: DisplaySlackReactionInfo[] = [];

    constructor(
        public message: SlackMessage,
        public parser: SlackParser,
        public client: SlackService
    ) {
    }

    get text(): string {
        return this.parser.parse(this.message.text, this.message.dataStore);
    }

    get attachments(): Attachment[] {
        return this.message.rawMessage.attachments
            ? this.message.rawMessage.attachments
            : [];
    }
}

interface SubmitContext {
    channelName: string;
    channelID: string;
    teamID: string;

    submit(text: string): Promise<any>;
}

class PostMessageContext implements SubmitContext {
    constructor(
        public client: SlackService,
        public channelName: string,
        public channelID: string,
        public teamID: string
    ) {
    }

    async submit(text: string): Promise<any> {
        return this.client.postMessage(this.channelID, text);
    }
}

@Component({
  selector: 'ss-list',
  templateUrl: './slacklist.component.html',
  styles: [ require('./slacklist.component.css').toString() ],
})
export class SlackListComponent implements OnInit, OnDestroy {
  messages: DisplaySlackMessageInfo[] = [];
  slackServices: SlackService[];
  submitContext: SubmitContext = null;

  get doesHaveMultipleTeams(): boolean {
    return this.slackServices.length >= 2;
  }

  get showTeamName(): boolean {
    return false;
  }

  constructor(
    private services: SlackServiceCollection,
    private detector: ChangeDetectorRef
  ) {
    this.slackServices = services.slacks;
  }

  ngOnInit(): void {
    for (const slack of this.slackServices) {
        const parser = new ComposedParser([
            new LinkParser (),
            new NewLineParser (),
            new EmojiParser (slack)
        ]);

        slack.messages.subscribe(message => this.onReceiveMessage(message, parser, slack));
        slack.reactionAdded.subscribe(reaction => this.onReactionAdded(reaction, parser, slack));
        slack.reactionRemoved.subscribe(reaction => this.onReactionRemoved(reaction, parser, slack));
        slack.start();
    }
  }

  ngOnDestroy(): void {
      for (const slack of this.slackServices) {
          slack.stop();
      }
  }

  async onReactionAdded(reaction: SlackReactionAdded, parser: SlackParser, client: SlackService): Promise<void> {
    // TODO
    console.log(reaction.reaction);
  }

  async onReactionRemoved(reaction: SlackReactionAdded, parser: SlackParser, client: SlackService): Promise<void> {
    // TODO
    console.log(reaction.reaction);
  }

  async onReceiveMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    console.log(message.rawMessage);

    switch (message.rawMessage.subtype) {
      case 'message_deleted':
        await this.deleteMessage(message, parser, client);
        break;
      case 'message_changed':
        await this.changeMessage(message, parser, client);
        break;
      case 'message_replied':
        await this.replyMessage(message, parser, client);
        break;
      default:
        await this.addMessage(message, parser, client);
        break;
    }

    this.detector.detectChanges();
  }

  async addMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    if (message.message) {
        this.messages.unshift(new DisplaySlackMessageInfo(message, parser, client));
    }
  }

  async replyMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
      // TODO
  }

  async deleteMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    this.messages = this.messages.filter (m => message.rawMessage.deleted_ts !== m.message.rawMessage.ts);
  }

  async changeMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    const edited = this.messages.find(m => m.message.rawMessage.ts === message.rawMessage.message.ts);
    if (edited) {
        edited.edited = true;
        edited.message.text = message.rawMessage.message.text;
        edited.message.rawMessage.attachments = message.rawMessage.message.attachments;
    }
  }

  get showForm(): boolean {
      return this.submitContext != null;
  }

  onClickWrite(info: DisplaySlackMessageInfo) {
      this.submitContext = new PostMessageContext(
          info.client,
          info.message.channelName,
          info.message.channelID,
          info.message.teamID
      );
      this.detector.detectChanges();
  }

  async submitForm(text: string) {
      if (this.submitContext != null) {
          await this.submitContext.submit (text);
          this.submitContext = null;
          this.detector.detectChanges();
      }
  }

  closeForm() {
      this.submitContext = null;
      this.detector.detectChanges();
  }
}
