const token = PropertiesService.getScriptProperties().getProperty("SLACK_TOKEN");

function doPost(e) {
  if (e["parameter"]["payload"]) {
    const json = JSON.parse(e["parameter"]["payload"]);
    Logger.log(e["parameter"]["payload"]);
    if (json["type"] == "block_actions" && json["message"]) {
      Logger.log("update");
      updateVote(json);
    } else if (json["type"] == "shortcut") {
      Logger.log("shortcut");
      postModal(json);
    } else if (json["type"] == "view_submission") {
      Logger.log("view_submission");
      postFromModal(json);
    }
  } else {
    Logger.log("slash command");
    postVote(e["parameter"]);
  }
  return ContentService.createTextOutput("");
}

function postVote(json) {
  const url = "https://slack.com/api/chat.postMessage";
  const channelId = json["channel_id"];
  const user = json["user_id"];

  const textArray = json["text"].split(",");
  let blocks = "";
  if (textArray[0] == "") {
    blocks = createDefaultBlocks(user);
  } else {
    blocks = createCustomBlocks(user, textArray);
  }

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Bearer " + token
  };
  const payload = {
    "channel": channelId,
    "blocks": blocks
  };
  const params = {
    "method": "POST",
    "headers": headers,
    "payload": JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, params);
}

function updateVote(json) {
  const url = "https://slack.com/api/chat.update";
  const user = json["user"]["id"];
  const actionIdx = Number(json["actions"][0]["action_id"]);
  const channelId = json["channel"]["id"];
  const ts = json["message"]["ts"];
  let blocks = json["message"]["blocks"];

  // 投票人数を取得
  const userNumber = blocks[actionIdx]["text"]["text"].match(/\d+/)[0];
  if (blocks[actionIdx]["text"]["text"].indexOf(user) != -1) {
    // 既に投票されている場合、ユーザを削除して投票人数を減らす
    const reg = ", <@" + user + ">";
    blocks[actionIdx]["text"]["text"] = blocks[actionIdx]["text"]["text"].replace(new RegExp(reg, "g"), "");
    blocks[actionIdx]["text"]["text"] = blocks[actionIdx]["text"]["text"].replace(/\d+/, Number(userNumber) - 1);
  } else {
    // まだ投票されていない場合、ユーザを追加し投票人数を増やす
    blocks[actionIdx]["text"]["text"] += ", <@" + user + ">";
    blocks[actionIdx]["text"]["text"] = blocks[actionIdx]["text"]["text"].replace(/\d+/, Number(userNumber) + 1);
  }

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Bearer " + token
  };
  const payload = {
    "channel": channelId,
    "ts": ts,
    "blocks": blocks
  };
  const params = {
    "method": "POST",
    "headers": headers,
    "payload": JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, params);
}

function createDefaultBlocks(user) {
  const blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Title here"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 月"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "1",
          "emoji": true
        },
        "action_id": "1"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 火"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "2",
          "emoji": true
        },
        "action_id": "2"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 水"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "3",
          "emoji": true
        },
        "action_id": "3"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 木"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "4",
          "emoji": true
        },
        "action_id": "4"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 金"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "5",
          "emoji": true
        },
        "action_id": "5"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 欠席"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "6",
          "emoji": true
        },
        "action_id": "6"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "create by <@" + user + ">"
        }
      ]
    }
  ];

  return blocks;
}

function createCustomBlocks(user, textArray) {
  let blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Title here"
      }
    }
  ];
  const footer = {
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "create by <@" + user + ">"
      }
    ]
  };
  let option = {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "`0` option"
    },
    "accessory": {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": "1",
        "emoji": true
      },
      "action_id": "1"
    }
  };

  textArray.forEach((value, i) => {
    if (i == 0) {
      blocks[i]["text"]["text"] = value;
      return;
    }
    option["text"]["text"] = "`0` " + value;
    option["accessory"]["text"]["text"] = String(i);
    option["accessory"]["action_id"] = String(i);
    let deep = JSON.parse(JSON.stringify(option));
    blocks.push(deep);
  });

  blocks.push(footer);

  return blocks;
}

function postModal(json) {
  const url = "https://slack.com/api/views.open";
  const triggerId = json["trigger_id"];
  const modal = {
    "type": "modal",
    "callback_id": "modal",
    "title": {
      "type": "plain_text",
      "text": "Vote",
      "emoji": true
    },
    "submit": {
      "type": "plain_text",
      "text": "送信",
      "emoji": true
    },
    "close": {
      "type": "plain_text",
      "text": "キャンセル",
      "emoji": true
    },
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*チャンネル*"
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "conversations_select",
            "placeholder": {
              "type": "plain_text",
              "text": "チャンネルを選ぶ",
              "emoji": true
            },
            "action_id": "select_channel"
          }
        ]
      },
      {
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "action_id": "title"
        },
        "label": {
          "type": "plain_text",
          "text": "タイトル",
          "emoji": true
        }
      },
      {
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "action_id": "options"
        },
        "label": {
          "type": "plain_text",
          "text": "選択肢",
          "emoji": true
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "選択肢を増やす",
              "emoji": true
            },
            "value": "click_me_123",
            "action_id": "add_option"
          }
        ]
      }
    ]
  };

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Bearer " + token
  };
  const payload = {
    "trigger_id": triggerId,
    "view": modal
  };
  const params = {
    "method": "POST",
    "headers": headers,
    "payload": JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, params);
}

function postFromModal(json) {
  const url = "https://slack.com/api/chat.postMessage";
  const user = json["user"]["id"];
  const blocksLength = Object.keys(json["view"]["blocks"]).length;
  let blockIdArray = [];
  // 最初と最後はいらない
  for (let i = 1; i < blocksLength - 1; i++) {
    blockIdArray.push(json["view"]["blocks"][i]["block_id"]);
  }
  const channelId = json["view"]["state"]["values"][blockIdArray[0]]["select_channel"]["selected_conversation"];
  const title = json["view"]["state"]["values"][blockIdArray[1]]["title"]["value"];
  let textArray = [title];
  blockIdArray.forEach((blockId, i) => {
    if (i < 2) {
      return
    }
    textArray.push(json["view"]["state"]["values"][blockId]["options"]["value"]);
  });
  const blocks = createCustomBlocks(user, textArray);
  
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Bearer " + token
  };
  const payload = {
    "channel": channelId,
    "blocks": blocks
  };
  const params = {
    "method": "POST",
    "headers": headers,
    "payload": JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, params);
}
