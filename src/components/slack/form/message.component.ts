import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms'; // tslint:disable-line
import * as $ from 'jquery';
import '../../../jquery.textcomplete.js';
import { EmojiService } from '../../../services/slack/slack.service';

@Component({
    selector: 'ss-messageform',
    templateUrl: './message.component.html',
    styles: [require('./message.component.css').toString()],
})
export class MessageFormComponent implements OnInit {
    @Output() submit = new EventEmitter<string>();
    @Output() close = new EventEmitter();

    @Input() channelName: string = '';
    @Input() channelID: string = '';
    @Input() teamID: string = '';
    @Input() initialText: string = '';
    @Input() extraInfo: string = '';
    @Input() emoji: EmojiService;

    ngOnInit(): void {
        const emojis = this.emoji.allEmojis;
        $('#slack_message_input').textcomplete([
            { // emojis
                match: /\B:([\-+\w]*)$/,
                search: function (term, callback) {
                    callback($.map(emojis, function (emoji) {
                        return emoji.indexOf(term) !== -1 ? emoji : null;
                    }));
                },
                template: function (value) {
                    return ':' + value + ': ';
                },
                replace: function (value) {
                    return ':' + value + ': ';
                },
                index: 1
            }]);
    }

    onClose(): void {
        this.close.emit();
    }

    onSubmit(value: string): void {
        this.submit.emit(value);
    }

    onKeyPress(event: KeyboardEvent, textArea: any): void {
        if (event.key === 'Enter') {
            if (!event.altKey) {
                this.onSubmit(textArea.value);
                event.preventDefault();
            } else {
                textArea.value += '\n';
            }
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.which === 27) {
            this.close.emit();
        }
    }
}
