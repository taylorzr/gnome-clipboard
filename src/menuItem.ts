// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as utils from 'utils';

const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const GObject = imports.gi.GObject;
const Clutter = imports.gi.Clutter;


export class ClipboardInfo {
  text: string;
  usage: number;
  pinned: boolean;
  copied_at: number;
  used_at: number;

  constructor(text: string, usage: number, pinned: boolean, copied_at: number, used_at: number) {
    this.text = text;
    this.usage = usage;
    this.pinned = pinned;
    this.copied_at = copied_at;
    this.used_at = used_at;
  }

  id(): number {
    return utils.hashCode(this.text);
  }

  display(): string {
    return utils.truncate(this.text, 32);
  }

  updateLastUsed() {
    this.used_at = Date.now();
  }
}

export var MenuItem = GObject.registerClass(
  class MenuItem extends PopupMenu.PopupBaseMenuItem {
    protected _init(
      cbInfo: ClipboardInfo,
      onActivate: (item: MenuItem) => void,
      onRemove: (item: MenuItem) => void,
      onPin: (item: MenuItem) => void) {

      super._init()

      this.cbInfo = cbInfo;

      let label = new St.Label({ text: cbInfo.display() });
      this.add_child(label);
      this.connect('activate', () => {
        onActivate(this);
      });

      // pin button
      let pinIcon = new St.Icon({
        icon_name: "",
        reactive: true,
        track_hover: true,
        style_class: "popup-menu-icon pin-icon",
      });

      if (this.cbInfo.pinned) {
        pinIcon.icon_name = "view-pin-symbolic";
      } else {
        pinIcon.icon_name = "";
      }

      pinIcon.connect("enter-event", (self: any) => {
        self.icon_name = "view-pin-symbolic";
      });

      pinIcon.connect("leave-event", (self: any) => {
        if (this.cbInfo.pinned) {
          self.icon_name = "view-pin-symbolic";
        } else {
          self.icon_name = "";
        }
      });


      let pinBtn = new St.Button({
        style_class: 'action-btn',
        reactive: true,
        track_hover: true,
        child: pinIcon
      });

      pinBtn.set_x_align(Clutter.ActorAlign.END);
      pinBtn.set_x_expand(true);
      pinBtn.set_y_expand(true);

      this.actor.add_child(pinBtn);
      pinBtn.connect('button-press-event',
        () => {
          onPin(this);
        }
      );

      // remove button
      let removeIcon = new St.Icon({
        icon_name: "edit-delete-symbolic",
        style_class: 'popup-menu-icon'
      });

      let removeBtn = new St.Button({
        style_class: 'action-btn',
        child: removeIcon
      });

      removeBtn.set_x_align(Clutter.ActorAlign.END);
      removeBtn.set_x_expand(false);
      removeBtn.set_y_expand(true);

      this.actor.add_child(removeBtn);
      removeBtn.connect('button-press-event',
        () => {
          onRemove(this);
        }
      );
    }

    text(): string {
      return this.cbInfo.text;
    }

  }
);